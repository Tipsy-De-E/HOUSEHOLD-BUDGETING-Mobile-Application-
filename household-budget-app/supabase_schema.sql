-- ================================================================
-- COMPLETE SUPABASE DATABASE SCHEMA FOR HOUSEHOLD BUDGETING APP
-- Copy and paste ALL of this into your Supabase SQL Editor and click RUN.
-- ================================================================

-- 1. Create Profiles Table (With Subscription / Income Cap Tier)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'mother' check (role in ('admin', 'mother')),
  full_name text default 'Mother / Household Budgeter',
  tier text not null default 'free' check (tier in ('free', 'starter_10k', 'plus_15k', 'unlimited')),
  income_cap numeric(12, 2) not null default 5000.00,
  tier_expires_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Alter table if columns don't exist yet
alter table public.profiles add column if not exists role text not null default 'mother';
alter table public.profiles add column if not exists full_name text default 'Household Budgeter';
alter table public.profiles add column if not exists tier text not null default 'free';
alter table public.profiles add column if not exists income_cap numeric(12, 2) not null default 5000.00;
alter table public.profiles add column if not exists tier_expires_at timestamp with time zone;
alter table public.profiles add column if not exists created_at timestamp with time zone default timezone('utc'::text, now());
alter table public.profiles add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now());

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Profiles Policies
drop policy if exists "Allow users to read profiles" on public.profiles;
create policy "Allow users to read profiles"
  on public.profiles for select
  using (true);

drop policy if exists "Allow users to insert their own profile" on public.profiles;
create policy "Allow users to insert their own profile"
  on public.profiles for insert
  with check (true);

drop policy if exists "Allow users to update their own profile" on public.profiles;
create policy "Allow users to update their own profile"
  on public.profiles for update
  using (
    auth.uid() = id
    or exists (
      select 1 from public.profiles admin_profile
      where admin_profile.id = auth.uid() and admin_profile.role = 'admin'
    )
  )
  with check (
    auth.uid() = id
    or exists (
      select 1 from public.profiles admin_profile
      where admin_profile.id = auth.uid() and admin_profile.role = 'admin'
    )
  );

drop policy if exists "Allow users to delete profiles" on public.profiles;
create policy "Allow users to delete profiles"
  on public.profiles for delete
  using (true);

-- Trigger to automatically create profile on Auth sign up
create or replace function public.handle_new_user()
returns trigger 
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    role,
    full_name,
    tier,
    income_cap,
    created_at,
    updated_at
  )
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(nullif(new.raw_user_meta_data->>'role', ''), 'mother'),
    coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), 'Household Budgeter'),
    'free',
    5000.00,
    now(),
    now()
  )
  on conflict (id) do update
  set email = coalesce(excluded.email, profiles.email),
      updated_at = now();
  return new;
exception
  when others then
    -- Never abort auth user creation if profile sync encounters any issue
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ================================================================
-- 2. Create Transactions Table (Income & Expenses)
-- ================================================================
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  type text not null check (type in ('expense', 'income')),
  amount numeric(12, 2) not null check (amount >= 0),
  category text not null default 'General',
  description text,
  receipt_url text,
  date date not null default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Alter table if receipt_url column doesn't exist yet
alter table public.transactions add column if not exists receipt_url text;

-- Enforce each user's cumulative income cap at the database boundary.
create or replace function public.enforce_income_cap()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  allowed_cap numeric(12, 2);
  existing_income numeric(12, 2);
begin
  if new.type <> 'income' or new.user_id is null then
    return new;
  end if;

  select coalesce(income_cap, 5000.00)
    into allowed_cap
    from public.profiles
    where id = new.user_id;

  allowed_cap := coalesce(allowed_cap, 5000.00);

  if tg_op = 'INSERT' then
    select coalesce(sum(amount), 0)
      into existing_income
      from public.transactions
      where user_id = new.user_id and type = 'income';
  else
    select coalesce(sum(amount), 0)
      into existing_income
      from public.transactions
      where user_id = new.user_id and type = 'income' and id <> old.id;
  end if;

  if existing_income + new.amount > allowed_cap then
    raise exception 'Income limit exceeded. Allowed cap: %, current total: %, attempted total: %',
      allowed_cap, existing_income, existing_income + new.amount
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_income_cap_before_write on public.transactions;
create trigger enforce_income_cap_before_write
  before insert or update of user_id, type, amount on public.transactions
  for each row execute function public.enforce_income_cap();

-- Enable RLS on transactions
alter table public.transactions enable row level security;

-- Transactions Policies
drop policy if exists "Transactions select policy" on public.transactions;
create policy "Transactions select policy"
  on public.transactions for select
  using (true);

drop policy if exists "Transactions insert policy" on public.transactions;
create policy "Transactions insert policy"
  on public.transactions for insert
  with check (true);

drop policy if exists "Transactions update policy" on public.transactions;
create policy "Transactions update policy"
  on public.transactions for update
  using (true);

drop policy if exists "Transactions delete policy" on public.transactions;
create policy "Transactions delete policy"
  on public.transactions for delete
  using (true);


-- ================================================================
-- 3. Create Budgets Table (Weekly & Monthly Limits)
-- ================================================================
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique,
  period text not null default 'monthly' check (period in ('weekly', 'monthly')),
  total_limit numeric(12, 2) not null default 38000,
  category_limits jsonb not null default '[]'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on budgets
alter table public.budgets enable row level security;

-- Budgets Policies
drop policy if exists "Budgets select policy" on public.budgets;
create policy "Budgets select policy"
  on public.budgets for select
  using (true);

drop policy if exists "Budgets insert policy" on public.budgets;
create policy "Budgets insert policy"
  on public.budgets for insert
  with check (true);

drop policy if exists "Budgets update policy" on public.budgets;
create policy "Budgets update policy"
  on public.budgets for update
  using (true);

drop policy if exists "Budgets delete policy" on public.budgets;
create policy "Budgets delete policy"
  on public.budgets for delete
  using (true);


-- ================================================================
-- 4. Create Bills Table (Payment Due-Date Reminders)
-- ================================================================
create table if not exists public.bills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  amount numeric(12, 2) not null check (amount >= 0),
  due_date date not null,
  category text not null default 'Utilities',
  is_paid boolean not null default false,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on bills
alter table public.bills enable row level security;

-- Bills Policies
drop policy if exists "Bills select policy" on public.bills;
create policy "Bills select policy"
  on public.bills for select
  using (true);

drop policy if exists "Bills insert policy" on public.bills;
create policy "Bills insert policy"
  on public.bills for insert
  with check (true);

drop policy if exists "Bills update policy" on public.bills;
create policy "Bills update policy"
  on public.bills for update
  using (true);

drop policy if exists "Bills delete policy" on public.bills;
create policy "Bills delete policy"
  on public.bills for delete
  using (true);


-- ================================================================
-- 5. Create Savings Goals Table
-- ================================================================
create table if not exists public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  target_amount numeric(12, 2) not null check (target_amount > 0),
  current_amount numeric(12, 2) not null default 0 check (current_amount >= 0),
  target_date date,
  category text not null default 'General Savings',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on savings_goals
alter table public.savings_goals enable row level security;

-- Savings Goals Policies
drop policy if exists "Savings goals select policy" on public.savings_goals;
create policy "Savings goals select policy"
  on public.savings_goals for select
  using (true);

drop policy if exists "Savings goals insert policy" on public.savings_goals;
create policy "Savings goals insert policy"
  on public.savings_goals for insert
  with check (true);

drop policy if exists "Savings goals update policy" on public.savings_goals;
create policy "Savings goals update policy"
  on public.savings_goals for update
  using (true);

-- ================================================================
-- 6. Create Subscriptions Table (Track Tier Purchases & Admin Revenue)
-- ================================================================
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  user_email text not null default 'mother@household.com',
  tier text not null check (tier in ('starter_10k', 'plus_15k', 'unlimited')),
  plan_name text not null,
  amount_paid numeric(12, 2) not null check (amount_paid >= 0),
  income_cap numeric(12, 2) not null,
  duration text not null,
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Alter table if columns don't exist yet
alter table public.subscriptions add column if not exists user_email text not null default 'mother@household.com';

-- Enable RLS on subscriptions
alter table public.subscriptions enable row level security;

-- Subscriptions Policies
drop policy if exists "Subscriptions select policy" on public.subscriptions;
create policy "Subscriptions select policy"
  on public.subscriptions for select
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.profiles admin_profile
      where admin_profile.id = auth.uid() and admin_profile.role = 'admin'
    )
  );

drop policy if exists "Subscriptions insert policy" on public.subscriptions;
create policy "Subscriptions insert policy"
  on public.subscriptions for insert
  with check (auth.uid() = user_id);

drop policy if exists "Subscriptions update policy" on public.subscriptions;
create policy "Subscriptions update policy"
  on public.subscriptions for update
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.profiles admin_profile
      where admin_profile.id = auth.uid() and admin_profile.role = 'admin'
    )
  )
  with check (
    auth.uid() = user_id
    or exists (
      select 1 from public.profiles admin_profile
      where admin_profile.id = auth.uid() and admin_profile.role = 'admin'
    )
  );

drop policy if exists "Subscriptions delete policy" on public.subscriptions;
create policy "Subscriptions delete policy"
  on public.subscriptions for delete
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.profiles admin_profile
      where admin_profile.id = auth.uid() and admin_profile.role = 'admin'
    )
  );


-- ================================================================
-- 7. Create System Settings Table (For Admin Configuration)
-- ================================================================
create table if not exists public.system_settings (
  id text primary key default 'global_settings',
  plan_configs jsonb not null default '[
    {
      "id": "starter_10k",
      "name": "Starter Income Booster",
      "price": 100,
      "capAmount": 10000,
      "duration": "6 Months Access",
      "durationMonths": 6,
      "popular": true,
      "features": ["Increased income cap to ₱ 10,000", "Priority financial reports export", "Valid for 6 full months", "Full bill reminders calendar"]
    },
    {
      "id": "plus_15k",
      "name": "Plus Household Growth",
      "price": 150,
      "capAmount": 15000,
      "duration": "1 Month Access",
      "durationMonths": 1,
      "popular": false,
      "features": ["Record income up to ₱ 15,000", "Advanced spending analytics & insights", "Export detailed monthly statements", "Dedicated priority sync"]
    },
    {
      "id": "unlimited",
      "name": "Unlimited Family Pro",
      "price": 300,
      "capAmount": 1000000,
      "duration": "2 Years Full Access",
      "durationMonths": 24,
      "popular": false,
      "features": ["No income limits (Unlimited)", "Full household & family sharing support", "Automatic monthly cloud backups", "VIP support for 2 full years"]
    }
  ]'::jsonb,
  admin_info jsonb not null default '{
    "name": "System Administrator",
    "email": "admin@household.com",
    "phone": "+63 912 345 6789",
    "role_title": "Lead Household Portal Admin"
  }'::jsonb,
  about_us text not null default 'The USTP Household Budgeting App is a comprehensive, multi-user financial management ecosystem tailored for modern Filipino households. It empowers mothers and families to monitor real-time income, plan weekly and monthly spending limits, track bill due dates with visual calendars, and build emergency savings funds with automated balance deductions.',
  rules text not null default '1. Accurate Data Entry: All household expenses and income sources must be recorded truthfully to ensure reliable financial forecasting.\n2. Income Tier Limits: Free accounts can record incomes up to ₱5,000 per transaction. To record higher transactions, an upgrade tier must be availed.\n3. Account Integrity: Users must keep credentials confidential. One primary household account per family unit.\n4. Admin Oversight: System administrators reserve the right to audit abnormal activity or manage inactive accounts.',
  how_to_use text not null default '1. Adding Incomes & Expenses: Tap the central (+) button on the navigation bar to log purchases or earnings. Attach receipts when applicable.\n2. Budget Planning: Navigate to the Budget tab to set monthly or weekly limits for food, groceries, utilities, and more.\n3. Bill & Savings Reminders: Open the Reminders tab to schedule upcoming bills or set target savings goals. Any goal deposit automatically updates household balance.\n4. Calendar Oversight: Tap the Calendar icon on any page to view heavy expense days and upcoming bill alerts.\n5. Availing Upgrades: If your income entry exceeds ₱5,000, open the sidebar or upgrade modal to avail a 6-month or 2-year cap expansion.',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on system_settings
alter table public.system_settings enable row level security;

-- System Settings Policies
drop policy if exists "System settings select policy" on public.system_settings;
create policy "System settings select policy"
  on public.system_settings for select
  using (true);

drop policy if exists "System settings insert policy" on public.system_settings;
create policy "System settings insert policy"
  on public.system_settings for insert
  with check (true);

drop policy if exists "System settings update policy" on public.system_settings;
create policy "System settings update policy"
  on public.system_settings for update
  using (true);

-- Ensure default row exists
insert into public.system_settings (id)
values ('global_settings')
on conflict (id) do nothing;

-- Add profile delete policy for Admin user management
drop policy if exists "Allow users to delete profiles" on public.profiles;
create policy "Allow users to delete profiles"
  on public.profiles for delete
  using (true);


-- ================================================================
-- 8. Create Notifications Table (Admin Alerts to Users)
-- ================================================================
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  user_email text,
  title text not null,
  message text not null,
  type text not null default 'reminder' check (type in ('info', 'reminder', 'warning', 'upgrade', 'system')),
  is_read boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on notifications
alter table public.notifications enable row level security;

-- Notifications Policies
drop policy if exists "Notifications select policy" on public.notifications;
create policy "Notifications select policy"
  on public.notifications for select
  using (true);

drop policy if exists "Notifications insert policy" on public.notifications;
create policy "Notifications insert policy"
  on public.notifications for insert
  with check (true);

drop policy if exists "Notifications update policy" on public.notifications;
create policy "Notifications update policy"
  on public.notifications for update
  using (true);

drop policy if exists "Notifications delete policy" on public.notifications;
create policy "Notifications delete policy"
  on public.notifications for delete
  using (true);

-- Sample initial notification from Admin
insert into public.notifications (user_email, title, message, type)
values 
  ('mother@household.com', 'Welcome to USTP Budgeting Portal!', 'Your account is active. Set your monthly grocery and utility limits in the Budget planner.', 'system'),
  ('mother@household.com', 'Income Limit Alert', 'Your free basic income limit is ₱5,000 per entry. You can upgrade anytime to increase your limit.', 'reminder');


-- ================================================================
-- 9. Seed Sample Initial Data (For Immediate Demonstration)
-- ================================================================

-- Sample transactions
insert into public.transactions (title, type, amount, category, description, date)
values
  ('Grocery Shopping (Cogon Public Market)', 'expense', 4250.00, 'Groceries', 'Weekly pantry restock, meat, rice, and fresh vegetables', current_date),
  ('Meralco Electricity Bill', 'expense', 3450.00, 'Utilities', 'Monthly electric consumption payment', current_date - 1),
  ('Tricycle & Jeepney Fare', 'expense', 180.00, 'Transportation', 'Commute to school & market', current_date - 2),
  ('Monthly Salary / Budget Allocation', 'income', 35000.00, 'Salary', 'Household monthly allowance and primary income', current_date - 3),
  ('School Supplies & Uniform', 'expense', 1200.00, 'Education', 'Notebooks, shoes, and art project materials', current_date - 4),
  ('Pharmacy & Vitamins', 'expense', 850.00, 'Healthcare', 'Vitamins for kids and prescription medicines', current_date - 5),
  ('Sari-Sari Store Net Sales', 'income', 6500.00, 'Business', 'Weekly small store earnings', current_date - 6);

-- Sample bills
insert into public.bills (title, amount, due_date, category, is_paid, notes)
values
  ('Electricity (Meralco / CEPALCO)', 3450.00, current_date + 4, 'Utilities', false, 'Account #10928374'),
  ('Water Bill (Manila Water / COWD)', 680.00, current_date + 6, 'Utilities', false, 'Meter reading due'),
  ('WiFi / Fiber Internet (PLDT)', 1699.00, current_date + 9, 'Utilities', false, 'Monthly plan'),
  ('Child School Tuition (Prelim)', 4500.00, current_date + 12, 'Education', true, 'Receipt #09812');

-- Sample savings goals
insert into public.savings_goals (title, target_amount, current_amount, category, target_date)
values
  ('Family Emergency Fund', 50000.00, 28500.00, 'Emergency', current_date + 120),
  ('Children College Fund', 100000.00, 42000.00, 'Education', current_date + 365),
  ('Home Appliance & Roof Repair', 20000.00, 15400.00, 'Home', current_date + 60);

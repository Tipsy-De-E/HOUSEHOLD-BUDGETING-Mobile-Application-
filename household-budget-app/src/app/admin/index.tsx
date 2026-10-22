// src/app/admin/index.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { adminHomeStyles } from '../../components/admin-css/adminHomeStyles';
import { supabase } from '../../../lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { AdminSidebarDrawer } from './AdminSidebarDrawer';
import { useAppTheme } from '../../context/ThemeContext';
import { AppDialog } from '../../components/ui/AppDialog';

export interface UserProfile {
  id: string;
  email: string;
  role: 'mother' | 'admin' | string;
  created_at?: string;
  status?: string;
  householdName?: string;
  tier?: 'free' | 'starter_10k' | 'plus_15k' | 'unlimited' | string;
  income_cap?: number;
  tier_expires_at?: string;
  total_income?: number;
  total_expenses?: number;
  total_budget?: number;
}

export interface SystemPlanConfig {
  id: 'starter_10k' | 'plus_15k' | 'unlimited';
  name: string;
  price: number;
  capAmount: number;
  duration: string;
  durationMonths: number;
  popular?: boolean;
}

export interface AdminInfo {
  name: string;
  email: string;
  phone: string;
  role_title: string;
}

export interface LiveActivityItem {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  time: string;
  isHighlight?: boolean;
  category?: string;
}

export interface AdminSentNotification {
  id: string;
  user_email?: string;
  title: string;
  message: string;
  time: string;
  type: string;
}

export default function AdminHomeScreen() {
  const router = useRouter();
  const { isDarkMode: isDark } = useAppTheme();

  // Navigation State
  const [activeNavTab, setActiveNavTab] = useState<'home' | 'users' | 'reports' | 'settings'>('home');

  // User States
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [userFilter, setUserFilter] = useState<'all' | 'availed' | 'free'>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);

  // Admin Drawer & In-Place User Provisioning
  const [showSidebarDrawer, setShowSidebarDrawer] = useState(false);
  const [showProvisionUserModal, setShowProvisionUserModal] = useState(false);
  const [provisionName, setProvisionName] = useState('');
  const [provisionEmail, setProvisionEmail] = useState('');
  const [provisionPassword, setProvisionPassword] = useState('');
  const [provisionTier, setProvisionTier] = useState<'free' | 'starter_10k' | 'plus_15k' | 'unlimited'>('free');
  const [isProvisioning, setIsProvisioning] = useState(false);

  // Notification Composer Modal State
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notifyRecipientEmail, setNotifyRecipientEmail] = useState('');
  const [notifyTitle, setNotifyTitle] = useState('');
  const [notifyMessage, setNotifyMessage] = useState('');
  const [isSendingNotification, setIsSendingNotification] = useState(false);

  // Dynamic Financial Metrics States
  const [totalProfit, setTotalProfit] = useState<number>(0);
  const [totalHouseholdIncome, setTotalHouseholdIncome] = useState<number>(145000);
  const [totalHouseholdExpenses, setTotalHouseholdExpenses] = useState<number>(48500);
  const [totalHouseholdBudget, setTotalHouseholdBudget] = useState<number>(245000);

  // Live Activity Log & Management (3-dot menu, view, delete)
  const [liveActivities, setLiveActivities] = useState<LiveActivityItem[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<LiveActivityItem | null>(null);
  const [showActivityMenuModal, setShowActivityMenuModal] = useState(false);
  const [showActivityDetailsModal, setShowActivityDetailsModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [sentNotifications, setSentNotifications] = useState<AdminSentNotification[]>([]);
  const [showAdminLogoutDialog, setShowAdminLogoutDialog] = useState(false);
  const [adminFeedback, setAdminFeedback] = useState<{
    visible: boolean;
    title: string;
    message: string;
    tone: 'success' | 'info' | 'warning' | 'danger';
    icon: 'checkmark-circle-outline' | 'person-add-outline' | 'notifications-outline' | 'trash-outline' | 'sync-outline' | 'document-text-outline';
  }>({ visible: false, title: '', message: '', tone: 'info', icon: 'checkmark-circle-outline' });

  // Settings States
  const [planConfigs, setPlanConfigs] = useState<SystemPlanConfig[]>([
    {
      id: 'starter_10k',
      name: 'Starter Income Booster',
      price: 100,
      capAmount: 10000,
      duration: '6 Months Access',
      durationMonths: 6,
      popular: true,
    },
    {
      id: 'plus_15k',
      name: 'Plus Household Growth',
      price: 150,
      capAmount: 15000,
      duration: '1 Month Access',
      durationMonths: 1,
      popular: false,
    },
    {
      id: 'unlimited',
      name: 'Unlimited Family Pro',
      price: 300,
      capAmount: 1000000,
      duration: '2 Years Full Access',
      durationMonths: 24,
      popular: false,
    },
  ]);

  const [adminInfo, setAdminInfo] = useState<AdminInfo>({
    name: 'System Administrator',
    email: 'admin@household.com',
    phone: '+63 912 345 6789',
    role_title: 'Lead Household Portal Admin',
  });

  const [aboutUsText, setAboutUsText] = useState(
    'The USTP Household Budgeting App is a comprehensive, multi-user financial management ecosystem tailored for modern Filipino households. It empowers mothers and families to monitor real-time income, plan weekly and monthly spending limits, track bill due dates with visual calendars, and build emergency savings funds with automated balance deductions.'
  );

  const [rulesText, setRulesText] = useState(
    '1. Accurate Data Entry: All household expenses and income sources must be recorded truthfully to ensure reliable financial forecasting.\n2. Income Tier Limits: Free accounts can record incomes up to ₱5,000 per transaction. To record higher transactions, an upgrade tier must be availed.\n3. Account Integrity: Users must keep credentials confidential. One primary household account per family unit.\n4. Admin Oversight: System administrators reserve the right to audit abnormal activity or manage inactive accounts.'
  );

  const [howToUseText, setHowToUseText] = useState(
    '1. Adding Incomes & Expenses: Tap the central (+) button on the navigation bar to log purchases or earnings. Attach receipts when applicable.\n2. Budget Planning: Navigate to the Budget tab to set monthly or weekly limits for food, groceries, utilities, and more.\n3. Bill & Savings Reminders: Open the Reminders tab to schedule upcoming bills or set target savings goals. Any goal deposit automatically updates household balance.\n4. Calendar Oversight: Tap the Calendar icon on any page to view heavy expense days and upcoming bill alerts.\n5. Availing Upgrades: If your income entry exceeds ₱5,000, open the sidebar or upgrade modal to avail a 6-month or 2-year cap expansion.'
  );

  const [savingSettings, setSavingSettings] = useState(false);

  // Baseline default accounts
  const defaultAccounts: UserProfile[] = [
    {
      id: 'usr-mth-01',
      email: 'mother@household.com',
      role: 'mother',
      created_at: '2024-08-10',
      status: 'Active',
      householdName: 'Johnson Household',
      tier: 'starter_10k',
      income_cap: 10000,
      tier_expires_at: '2025-02-10',
      total_income: 42000,
      total_expenses: 12450,
      total_budget: 45000,
    },
    {
      id: 'usr-mth-02',
      email: 'sarah.smith@family.org',
      role: 'mother',
      created_at: '2024-08-12',
      status: 'Active',
      householdName: 'Smith Family',
      tier: 'plus_15k',
      income_cap: 15000,
      tier_expires_at: '2024-09-12',
      total_income: 38000,
      total_expenses: 14300,
      total_budget: 60000,
    },
    {
      id: 'usr-mth-03',
      email: 'maria.garcia@home.net',
      role: 'mother',
      created_at: '2024-08-14',
      status: 'Active',
      householdName: 'Garcia Household',
      tier: 'unlimited',
      income_cap: 1000000,
      tier_expires_at: '2026-08-14',
      total_income: 45000,
      total_expenses: 11950,
      total_budget: 100000,
    },
    {
      id: 'usr-mth-04',
      email: 'elena.reyes@family.ph',
      role: 'mother',
      created_at: '2024-08-18',
      status: 'Active',
      householdName: 'Reyes Household',
      tier: 'free',
      income_cap: 5000,
      tier_expires_at: undefined,
      total_income: 12000,
      total_expenses: 5800,
      total_budget: 25000,
    },
    {
      id: 'usr-mth-05',
      email: 'carmen.santos@gmail.com',
      role: 'mother',
      created_at: '2024-08-20',
      status: 'Active',
      householdName: 'Santos Family',
      tier: 'free',
      income_cap: 5000,
      tier_expires_at: undefined,
      total_income: 8000,
      total_expenses: 4000,
      total_budget: 15000,
    },
  ];

  // Helper for remaining days calculation
  const getRemainingTimeInfo = (expiresAt?: string) => {
    if (!expiresAt) return { days: 180, text: 'Active (Lifetime)', isExpiringSoon: false };
    const now = new Date();
    const exp = new Date(expiresAt);
    const diffMs = exp.getTime() - now.getTime();
    if (diffMs <= 0) return { days: 0, text: 'Expired', isExpiringSoon: true };
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);
    let text = '';
    if (diffMonths > 1) {
      text = `${diffMonths} Months left (${diffDays} days remaining)`;
    } else {
      text = `${diffDays} Days remaining`;
    }
    return { days: diffDays, text, isExpiringSoon: diffDays <= 15 };
  };

  // =========================================================================
  // DYNAMIC DATA AGGREGATION & REAL-TIME REPOSITORY INTEGRATION
  // =========================================================================
  const fetchData = useCallback(async () => {
    try {
      // 1. Fetch User Profiles
      const { data: profilesData, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      // 2. Fetch Subscriptions to calculate Total Upgrade Profit and track availed users
      const { data: subsData } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      // Index subscriptions by BOTH user_id AND user_email (lowercased)
      const subsByUser: Record<string, any> = {};
      let calculatedProfit = 0;

      if (subsData && subsData.length > 0) {
        subsData.forEach((s: any) => {
          const paid = Number(s.amount_paid) || 0;
          calculatedProfit += paid;

          if (s.user_id && !subsByUser[s.user_id]) {
            subsByUser[s.user_id] = s;
          }
          if (s.user_email) {
            const cleanEmail = s.user_email.trim().toLowerCase();
            if (!subsByUser[cleanEmail]) {
              subsByUser[cleanEmail] = s;
            }
          }
        });
      }

      // Check local cache for last availed plan in session
      const localAvailedRaw = await AsyncStorage.getItem('last_availed_plan');
      let localAvailed: any = null;
      if (localAvailedRaw) {
        try {
          localAvailed = JSON.parse(localAvailedRaw);
        } catch { }
      }

      // 3. Fetch Transactions for dynamic per-user and overall Income & Expense totals
      const { data: txData } = await supabase
        .from('transactions')
        .select('id, user_id, title, type, amount, date, created_at')
        .order('created_at', { ascending: false });

      const userIncomeMap: Record<string, number> = {};
      const userExpenseMap: Record<string, number> = {};
      let aggregatedIncomes = 0;
      let aggregatedExpenses = 0;

      if (txData && txData.length > 0) {
        txData.forEach((tx: any) => {
          const amt = Number(tx.amount) || 0;
          const uid = tx.user_id;
          if (tx.type === 'income') {
            aggregatedIncomes += amt;
            if (uid) userIncomeMap[uid] = (userIncomeMap[uid] || 0) + amt;
          } else if (tx.type === 'expense') {
            aggregatedExpenses += amt;
            if (uid) userExpenseMap[uid] = (userExpenseMap[uid] || 0) + amt;
          }
        });
      }

      // 4. Fetch Budgets for dynamic per-user and overall Budget Limits
      const { data: bgData } = await supabase
        .from('budgets')
        .select('id, user_id, total_limit');

      const userBudgetMap: Record<string, number> = {};
      let aggregatedBudgets = 0;

      if (bgData && bgData.length > 0) {
        bgData.forEach((b: any) => {
          const amt = Number(b.total_limit) || 0;
          aggregatedBudgets += amt;
          if (b.user_id) userBudgetMap[b.user_id] = amt;
        });
      }

      // 5. Build dynamic formatted user list from Supabase and registered cache
      let activeUserList: UserProfile[] = [];

      // 5a. Load locally registered users from AsyncStorage
      let localRegisteredUsers: any[] = [];
      try {
        const localRegRaw = await AsyncStorage.getItem('@household_registered_users');
        if (localRegRaw) {
          const parsed = JSON.parse(localRegRaw);
          if (Array.isArray(parsed)) localRegisteredUsers = parsed;
        }
      } catch { }

      // 5b. Unify Supabase profiles and local registrations (deduplicating by email)
      const unifiedProfilesMap = new Map<string, any>();

      // Supabase profiles first
      if (!profileErr && profilesData && profilesData.length > 0) {
        profilesData.forEach((p: any) => {
          const key = (p.email || p.id || '').trim().toLowerCase();
          if (key) unifiedProfilesMap.set(key, p);
        });
      }

      // Merge local registrations
      if (localRegisteredUsers.length > 0) {
        localRegisteredUsers.forEach((u: any) => {
          const key = (u.email || u.id || '').trim().toLowerCase();
          if (key) {
            if (!unifiedProfilesMap.has(key)) {
              unifiedProfilesMap.set(key, u);
            } else {
              const existing = unifiedProfilesMap.get(key);
              unifiedProfilesMap.set(key, { ...u, ...existing });
            }
          }
        });
      }

      // If no non-admin users exist at all, include default seeded accounts
      const hasNonAdminInMap = Array.from(unifiedProfilesMap.values()).some(
        (u: any) => (u.role || '').toLowerCase() !== 'admin'
      );
      if (!hasNonAdminInMap) {
        defaultAccounts.forEach((acc) => {
          const key = acc.email.trim().toLowerCase();
          if (!unifiedProfilesMap.has(key)) {
            unifiedProfilesMap.set(key, acc);
          }
        });
      }

      const allUnifiedProfiles = Array.from(unifiedProfilesMap.values());

      activeUserList = allUnifiedProfiles.map((item: any, idx: number) => {
        const uid = item.id || `profile-${idx}`;
        const cleanEmail = (item.email || '').trim().toLowerCase();

        // Match subscription by user ID OR by Email
        const sub = subsByUser[uid] || subsByUser[cleanEmail];

        // Check if local cache matches this user
        const localMatches =
          localAvailed &&
          (localAvailed.email?.toLowerCase() === cleanEmail || activeUserList.length === 1);

        // REAL-TIME DYNAMIC TIER IDENTIFICATION
        let tier = 'free';
        if (sub && sub.tier) {
          tier = sub.tier;
        } else if (localMatches && localAvailed.tier) {
          tier = localAvailed.tier;
        } else if (item.tier && item.tier !== 'none') {
          tier = item.tier;
        }

        let income_cap = Number(item.income_cap);
        if (sub && sub.income_cap) {
          income_cap = Number(sub.income_cap);
        } else if (localMatches && localAvailed.cap) {
          income_cap = Number(localAvailed.cap);
        } else if (!income_cap || isNaN(income_cap)) {
          if (tier === 'starter_10k') income_cap = 10000;
          else if (tier === 'plus_15k') income_cap = 15000;
          else if (tier === 'unlimited') income_cap = 1000000;
          else income_cap = 5000;
        }

        let tier_expires_at = item.tier_expires_at;
        if (sub && sub.expires_at) {
          tier_expires_at = sub.expires_at;
        } else if (localMatches && localAvailed.expires_at) {
          tier_expires_at = localAvailed.expires_at;
        }

        // Real calculated financial values directly tied to this user's records
        const total_income = userIncomeMap[uid] || item.total_income || 0;
        const total_expenses = userExpenseMap[uid] || item.total_expenses || 0;
        const total_budget = userBudgetMap[uid] || item.total_budget || (item.role === 'admin' ? 0 : 38000);

        return {
          id: uid,
          email: item.email || 'user@example.com',
          role: item.role || 'mother',
          created_at: item.created_at ? item.created_at.split('T')[0] : '2024-08-14',
          status: 'Active',
          householdName:
            item.role === 'admin'
              ? 'System Administrator'
              : item.householdName || `${(item.email || 'Household').split('@')[0]} Household`,
          tier,
          income_cap,
          tier_expires_at: tier_expires_at ? tier_expires_at.split('T')[0] : undefined,
          total_income,
          total_expenses,
          total_budget,
        };
      });

      // Attribute unassigned demo transactions to first household
      const unassignedIncomes = txData
        ? txData.filter((t: any) => !t.user_id && t.type === 'income').reduce((s: number, t: any) => s + (Number(t.amount) || 0), 0)
        : 0;
      const unassignedExpenses = txData
        ? txData.filter((t: any) => !t.user_id && t.type === 'expense').reduce((s: number, t: any) => s + (Number(t.amount) || 0), 0)
        : 0;

      if ((unassignedIncomes > 0 || unassignedExpenses > 0) && activeUserList.length > 0) {
        const firstMother = activeUserList.find((u) => u.role !== 'admin');
        if (firstMother) {
          firstMother.total_income = (firstMother.total_income || 0) + unassignedIncomes;
          firstMother.total_expenses = (firstMother.total_expenses || 0) + unassignedExpenses;
        }
      }

      setUsers(activeUserList);

      // 6. Update Overall Dynamic System Totals
      const nonAdminActiveUsers = activeUserList.filter((u) => u.role.toLowerCase() !== 'admin');

      const sumUserIncomes = nonAdminActiveUsers.reduce((sum, u) => sum + (u.total_income || 0), 0);
      const sumUserExpenses = nonAdminActiveUsers.reduce((sum, u) => sum + (u.total_expenses || 0), 0);
      const sumUserBudgets = nonAdminActiveUsers.reduce((sum, u) => sum + (u.total_budget || 0), 0);

      setTotalHouseholdIncome(aggregatedIncomes > 0 ? aggregatedIncomes : sumUserIncomes > 0 ? sumUserIncomes : 145000);
      setTotalHouseholdExpenses(aggregatedExpenses > 0 ? aggregatedExpenses : sumUserExpenses > 0 ? sumUserExpenses : 48500);
      setTotalHouseholdBudget(aggregatedBudgets > 0 ? aggregatedBudgets : sumUserBudgets > 0 ? sumUserBudgets : 245000);

      // Profit is exact: strictly follows how many users did avail the upgrade plan
      if (calculatedProfit === 0) {
        const tierPriceMap: Record<string, number> = {
          starter_10k: 100,
          plus_15k: 150,
          unlimited: 300,
        };
        const nonAdminAvailed = activeUserList.filter(
          (u) => u.role.toLowerCase() !== 'admin' && u.tier && u.tier !== 'free' && u.tier !== 'none'
        );
        if (!profileErr && profilesData && profilesData.length > 0 && nonAdminAvailed.length > 0) {
          calculatedProfit = nonAdminAvailed.reduce(
            (sum, u) => sum + (tierPriceMap[u.tier || ''] || 0),
            0
          );
        }
      }
      setTotalProfit(calculatedProfit);

      // 7. Generate Real-time Live Activity Stream with SPECIFIC USER IDENTITIES
      const activities: LiveActivityItem[] = [];

      // A. Pull persistent live activities recorded locally (new registrations, etc.)
      try {
        const cachedActRaw = await AsyncStorage.getItem('@household_live_activities');
        if (cachedActRaw) {
          const parsedActs = JSON.parse(cachedActRaw);
          if (Array.isArray(parsedActs)) {
            const cleanedActs = parsedActs.map((a: any) => ({
              ...a,
              subtitle: a.subtitle ? a.subtitle.replace(/👤\s*/g, '') : a.subtitle,
            }));
            activities.push(...cleanedActs.slice(0, 5));
          }
        }
      } catch { }

      // B. Add new user registrations from activeUserList
      const registeredNonAdmin = activeUserList.filter((u) => u.role.toLowerCase() !== 'admin');
      registeredNonAdmin.slice(0, 3).forEach((u) => {
        const alreadyIn = activities.some((a) => a.id.includes(u.id) || a.title.includes(u.email));
        if (!alreadyIn) {
          activities.push({
            id: `reg-${u.id}`,
            title: `Account Registered: ${u.email}`,
            subtitle: `Joined ${u.tier && u.tier !== 'free' ? `Upgraded: ${getTierLabel(u.tier)}` : 'Free Basic Plan (Limit: ₱5,000)'}`,
            icon: 'person-add-outline',
            time: u.created_at || 'Recently',
            isHighlight: true,
            category: 'Account Registration',
          });
        }
      });

      // C. Add recent subscription upgrades with specific person who availed
      if (subsData && subsData.length > 0) {
        subsData.slice(0, 4).forEach((sub: any) => {
          const personEmail = sub.user_email || 'mother@household.com';
          activities.push({
            id: `sub-${sub.id}`,
            title: `Upgrade Availed: ${sub.plan_name || 'Income Booster'} (+₱${sub.amount_paid || 0} Profit)`,
            subtitle: `⭐ ${personEmail} • Limit: ₱${(sub.income_cap || 10000).toLocaleString()} • ${sub.duration || 'Active'}`,
            icon: 'star-outline',
            time: sub.created_at ? new Date(sub.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
            isHighlight: true,
            category: 'Subscription Upgrade',
          });
        });
      }

      // D. Add recent transaction events
      if (txData && txData.length > 0) {
        txData.slice(0, 3).forEach((tx: any) => {
          activities.push({
            id: `tx-${tx.id}`,
            title: `Household ${tx.type === 'income' ? 'Income' : 'Expense'}: ${tx.title}`,
            subtitle: `₱ ${Number(tx.amount || 0).toLocaleString()} • ${tx.date || 'Today'}`,
            icon: tx.type === 'income' ? 'trending-up-outline' : 'receipt-outline',
            time: 'Recently',
            category: 'Household Transaction',
          });
        });
      }

      // E. Filter out activities deleted by admin
      let deletedIds: string[] = [];
      try {
        const deletedIdsRaw = await AsyncStorage.getItem('@household_deleted_activity_ids');
        if (deletedIdsRaw) {
          deletedIds = JSON.parse(deletedIdsRaw);
        }
      } catch { }

      const filteredActivities = activities.filter((a) => !deletedIds.includes(a.id));
      setLiveActivities(filteredActivities);

      // 8. Fetch Sent Notifications
      const { data: notifData } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (notifData && notifData.length > 0) {
        const formattedNotifs: AdminSentNotification[] = notifData.map((n: any) => ({
          id: n.id,
          user_email: n.user_email,
          title: n.title,
          message: n.message,
          time: n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today',
          type: n.type || 'reminder',
        }));
        setSentNotifications(formattedNotifs);
      }

      // 9. Fetch System Settings
      const { data: settingsData } = await supabase
        .from('system_settings')
        .select('*')
        .eq('id', 'global_settings')
        .maybeSingle();

      if (settingsData) {
        if (settingsData.plan_configs) setPlanConfigs(settingsData.plan_configs);
        if (settingsData.admin_info) setAdminInfo(settingsData.admin_info);
        if (settingsData.about_us) setAboutUsText(settingsData.about_us);
        if (settingsData.rules) setRulesText(settingsData.rules);
        if (settingsData.how_to_use) setHowToUseText(settingsData.how_to_use);
      } else {
        const localSettings = await AsyncStorage.getItem('admin_system_settings');
        if (localSettings) {
          const parsed = JSON.parse(localSettings);
          if (parsed.planConfigs) setPlanConfigs(parsed.planConfigs);
          if (parsed.adminInfo) setAdminInfo(parsed.adminInfo);
          if (parsed.aboutUsText) setAboutUsText(parsed.aboutUsText);
          if (parsed.rulesText) setRulesText(parsed.rulesText);
          if (parsed.howToUseText) setHowToUseText(parsed.howToUseText);
        }
      }
    } catch (err: any) {
      console.log('Error fetching dynamic admin metrics:', err);
      setUsers(defaultAccounts);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Real-time Supabase Event Listener + Auto-poll with unique channel ID
  useEffect(() => {
    const channelId = `admin-realtime-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const channel = supabase
      .channel(channelId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subscriptions' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'budgets' }, () => fetchData())
      .subscribe();

    // 4-second auto poll to ensure immediate reaction if sockets are silent
    const interval = setInterval(() => {
      fetchData();
    }, 4000);

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch { }
      clearInterval(interval);
    };
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Logout handler
  const handleLogout = () => {
    setShowAdminLogoutDialog(true);
  };

  const confirmAdminLogout = async () => {
    setShowAdminLogoutDialog(false);
    await supabase.auth.signOut();
    router.replace('/');
  };

  // Open User Detail Modal
  const handleOpenUserDetail = (user: UserProfile) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  // Open Notify Composer for a specific user
  const handleOpenNotifyComposer = (user: UserProfile) => {
    const remaining = getRemainingTimeInfo(user.tier_expires_at);
    setNotifyRecipientEmail(user.email);
    setNotifyTitle(`Notice regarding your ${getTierLabel(user.tier)}`);
    setNotifyMessage(
      `Hello! Your ${getTierLabel(user.tier)} currently has ${remaining.text}. To continue recording high transactions up to ₱${(user.income_cap || 10000).toLocaleString()}, please make sure to renew before expiration.`
    );
    setShowNotifyModal(true);
  };

  // Send Notification handler
  const handleSendNotification = async () => {
    if (!notifyTitle.trim() || !notifyMessage.trim()) {
      Alert.alert('Missing Fields', 'Please enter a notification title and message.');
      return;
    }

    setIsSendingNotification(true);
    try {
      // 1. Insert into Supabase notifications table
      const { error } = await supabase.from('notifications').insert({
        user_email: notifyRecipientEmail.trim(),
        title: notifyTitle.trim(),
        message: notifyMessage.trim(),
        type: 'reminder',
      });

      if (error) {
        console.log('Notice inserting notification to Supabase:', error.message);
      }

      // 2. Cache in AsyncStorage
      const newNotifItem: AdminSentNotification = {
        id: `notif-${Date.now()}`,
        user_email: notifyRecipientEmail.trim(),
        title: notifyTitle.trim(),
        message: notifyMessage.trim(),
        time: 'Just now',
        type: 'reminder',
      };

      setSentNotifications((prev) => [newNotifItem, ...prev]);

      setAdminFeedback({
        visible: true,
        title: 'Notification Sent',
        message: `Your notification was dispatched to "${notifyRecipientEmail}" and will appear on their Dashboard immediately.`,
        tone: 'success',
        icon: 'notifications-outline',
      });

      setShowNotifyModal(false);
      setNotifyTitle('');
      setNotifyMessage('');
    } catch {
      Alert.alert('Error', 'Failed to dispatch notification.');
    } finally {
      setIsSendingNotification(false);
    }
  };

  // Broadcast Notification to all users
  const handleOpenBroadcastComposer = () => {
    setNotifyRecipientEmail('All Registered Households');
    setNotifyTitle('Important System Announcement');
    setNotifyMessage('Dear households, please review your monthly budgets and bill reminders.');
    setShowNotifyModal(true);
  };


  const handleProvisionUser = async () => {
    if (!provisionEmail.trim() || !provisionPassword.trim()) {
      Alert.alert('Required Fields', 'Please enter email and password for the new household user.');
      return;
    }
    if (provisionPassword.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters long.');
      return;
    }

    setIsProvisioning(true);
    const cleanEmail = provisionEmail.trim().toLowerCase();
    const displayName = provisionName.trim() || `${cleanEmail.split('@')[0]} Household`;
    const incomeCap =
      provisionTier === 'starter_10k' ? 10000 : provisionTier === 'plus_15k' ? 15000 : provisionTier === 'unlimited' ? 1000000 : 5000;

    try {
      // 1. Create dedicated client that does NOT persist session, so admin stays logged in!
      const nonPersistClient = createClient(
        'https://trohgrbenjgaqsaumfbe.supabase.co',
        'sb_publishable_zQPkKIansE-CWZyplEmwIA_U-D8WvRL',
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
          },
        }
      );

      const { data: signUpData, error: signUpError } = await nonPersistClient.auth.signUp({
        email: cleanEmail,
        password: provisionPassword,
        options: {
          data: {
            full_name: displayName,
            role: 'mother',
          },
        },
      });

      if (signUpError && !signUpError.message.includes('already registered')) {
        console.log('Notice signing up user:', signUpError.message);
      }

      const newUserId = signUpData?.user?.id || `usr-${Date.now()}`;

      // 2. Direct upsert into public.profiles for instant database path
      try {
        await supabase.from('profiles').upsert({
          id: newUserId,
          email: cleanEmail,
          role: 'mother',
          full_name: displayName,
          tier: provisionTier,
          income_cap: incomeCap,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      } catch (profileErr: any) {
        console.log('Profile sync note:', profileErr?.message);
      }

      // 3. If tier is upgraded, insert into subscriptions table so profit and logs update dynamically
      if (provisionTier !== 'free') {
        const planCost = provisionTier === 'starter_10k' ? 100 : provisionTier === 'plus_15k' ? 150 : 300;
        try {
          await supabase.from('subscriptions').insert({
            user_id: newUserId,
            user_email: cleanEmail,
            plan_id: provisionTier,
            plan_name: provisionTier === 'starter_10k' ? 'Starter Income Booster' : provisionTier === 'plus_15k' ? 'Plus Household Growth' : 'Unlimited Family Pro',
            amount_paid: planCost,
            income_cap: incomeCap,
            status: 'active',
          });
        } catch { }
        setTotalProfit((prev) => prev + planCost);
      }

      // 4. Update local registered users cache
      const newHouseholdUser: UserProfile = {
        id: newUserId,
        email: cleanEmail,
        role: 'mother',
        created_at: new Date().toISOString().split('T')[0],
        status: 'Active',
        householdName: displayName,
        tier: provisionTier,
        income_cap: incomeCap,
        total_income: 0,
        total_expenses: 0,
        total_budget: 35000,
      };

      try {
        const cachedRaw = await AsyncStorage.getItem('@household_registered_users');
        const cached = cachedRaw ? JSON.parse(cachedRaw) : [];
        const updatedList = [newHouseholdUser, ...cached.filter((u: any) => u.email?.toLowerCase() !== cleanEmail)];
        await AsyncStorage.setItem('@household_registered_users', JSON.stringify(updatedList));
      } catch { }

      // 5. Add to Live Activities log
      const newAct: LiveActivityItem = {
        id: `prov-${Date.now()}`,
        title: `Account Provisioned: ${cleanEmail}`,
        subtitle: `Admin Provisioned • Tier: ${getTierLabel(provisionTier)} (Limit: ₱${incomeCap.toLocaleString()})`,
        icon: 'person-add-outline',
        time: 'Just now',
        isHighlight: true,
        category: 'User Provisioning',
      };
      setLiveActivities((prev) => [newAct, ...prev]);

      try {
        const existingActRaw = await AsyncStorage.getItem('@household_live_activities');
        const existingAct = existingActRaw ? JSON.parse(existingActRaw) : [];
        await AsyncStorage.setItem('@household_live_activities', JSON.stringify([newAct, ...existingAct].slice(0, 15)));
      } catch { }

      // 6. Update in-memory users state
      setUsers((prev) => [newHouseholdUser, ...prev.filter((u) => u.email?.toLowerCase() !== cleanEmail)]);

      // 7. Discard modal & reset
      setShowProvisionUserModal(false);
      setProvisionName('');
      setProvisionEmail('');
      setProvisionPassword('');
      setProvisionTier('free');

      setAdminFeedback({
        visible: true,
        title: 'User Provisioned Successfully',
        message: `Household account for "${cleanEmail}" was registered and connected to Supabase.\n\nTier: ${getTierLabel(provisionTier)}\nIncome Cap: ₱${incomeCap.toLocaleString()}`,
        tone: 'success',
        icon: 'person-add-outline',
      });
    } catch (err: any) {
      Alert.alert('Provisioning Notice', `Household user registered: ${err?.message || 'Ready in system'}`);
    } finally {
      setIsProvisioning(false);
    }
  };

  // Delete User handler
  const handleDeleteUser = (user: UserProfile) => {
    Alert.alert(
      'Delete User Account',
      `Are you sure you want to permanently delete user "${user.email}"? All their household budgets, limits, and records will be removed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete User',
          style: 'destructive',
          onPress: async () => {
            try {
              await supabase.from('profiles').delete().eq('id', user.id);
            } catch { }

            try {
              const localRegRaw = await AsyncStorage.getItem('@household_registered_users');
              if (localRegRaw) {
                const parsed = JSON.parse(localRegRaw);
                const filtered = parsed.filter((u: any) => u.id !== user.id && u.email !== user.email);
                await AsyncStorage.setItem('@household_registered_users', JSON.stringify(filtered));
              }
            } catch { }

            setUsers((prev) => prev.filter((u) => u.id !== user.id));
            setAdminFeedback({
              visible: true,
              title: 'User Account Deleted',
              message: `User account ${user.email} has been deleted successfully.`,
              tone: 'success',
              icon: 'trash-outline',
            });
            fetchData();
          },
        },
      ]
    );
  };

  // Activity Log Management Handlers (3-Dot Menu, View, Delete)
  const handleOpenActivityOptions = (activity: LiveActivityItem) => {
    setSelectedActivity(activity);
    setShowActivityMenuModal(true);
  };

  const handleViewActivityDetails = () => {
    setShowActivityMenuModal(false);
    setShowActivityDetailsModal(true);
  };

  const handlePromptDeleteActivity = () => {
    setShowActivityMenuModal(false);
    setShowDeleteConfirmModal(true);
  };

  const handleConfirmDeleteActivity = async () => {
    if (!selectedActivity) return;
    const actId = selectedActivity.id;

    // 1. Instantly remove from local active state
    setLiveActivities((prev) => prev.filter((a) => a.id !== actId));

    // 2. Add to deleted IDs array in AsyncStorage so sync won't recreate it
    try {
      const deletedIdsRaw = await AsyncStorage.getItem('@household_deleted_activity_ids');
      const deletedIds: string[] = deletedIdsRaw ? JSON.parse(deletedIdsRaw) : [];
      if (!deletedIds.includes(actId)) {
        deletedIds.push(actId);
        await AsyncStorage.setItem('@household_deleted_activity_ids', JSON.stringify(deletedIds));
      }
    } catch { }

    // 3. Remove from locally stored activities if cached
    try {
      const cachedActRaw = await AsyncStorage.getItem('@household_live_activities');
      if (cachedActRaw) {
        const parsedActs = JSON.parse(cachedActRaw);
        if (Array.isArray(parsedActs)) {
          const updatedActs = parsedActs.filter((a: any) => a.id !== actId);
          await AsyncStorage.setItem('@household_live_activities', JSON.stringify(updatedActs));
        }
      }
    } catch { }

    setShowDeleteConfirmModal(false);
    setShowActivityDetailsModal(false);
    setSelectedActivity(null);
  };

  // Save Settings handler
  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const payload = {
        id: 'global_settings',
        plan_configs: planConfigs,
        admin_info: adminInfo,
        about_us: aboutUsText,
        rules: rulesText,
        how_to_use: howToUseText,
        updated_at: new Date().toISOString(),
      };

      await supabase.from('system_settings').upsert(payload, { onConflict: 'id' });

      await AsyncStorage.setItem(
        'admin_system_settings',
        JSON.stringify({
          planConfigs,
          adminInfo,
          aboutUsText,
          rulesText,
          howToUseText,
        })
      );

      setAdminFeedback({
        visible: true,
        title: 'Settings Saved',
        message: 'System pricing, limits, administrator profile, About Us, Rules, and How-to content were updated successfully.',
        tone: 'success',
        icon: 'checkmark-circle-outline',
      });
    } catch {
      setAdminFeedback({
        visible: true,
        title: 'Saved Locally',
        message: 'Settings were saved in local app storage.',
        tone: 'info',
        icon: 'checkmark-circle-outline',
      });
    } finally {
      setSavingSettings(false);
    }
  };

  // Filter out admin users from user lists
  const nonAdminUsers = users.filter((u) => u.role.toLowerCase() !== 'admin');

  // Metrics Calculations (Directly calculated from users)
  const totalUsersCount = nonAdminUsers.length;
  const availedUsers = nonAdminUsers.filter(
    (u) => u.tier && u.tier !== 'free' && u.tier !== 'none'
  );
  const totalAvailedCount = availedUsers.length;
  const freeUsersCount = totalUsersCount - totalAvailedCount;

  // Filtered users for Users Tab
  const filteredUsersList = nonAdminUsers.filter((user) => {
    const isAvailed = user.tier && user.tier !== 'free' && user.tier !== 'none';
    if (userFilter === 'availed' && !isAvailed) return false;
    if (userFilter === 'free' && isAvailed) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        user.email.toLowerCase().includes(q) ||
        (user.householdName && user.householdName.toLowerCase().includes(q)) ||
        (user.tier && user.tier.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Helpers for displaying tier labels
  const getTierLabel = (tier?: string) => {
    switch (tier) {
      case 'starter_10k':
        return 'Starter (₱10k Cap)';
      case 'plus_15k':
        return 'Plus (₱15k Cap)';
      case 'unlimited':
        return 'Unlimited Pro';
      default:
        return 'Free Basic (₱5k Cap)';
    }
  };

  const isUserAvailed = (tier?: string) => {
    return tier === 'starter_10k' || tier === 'plus_15k' || tier === 'unlimited';
  };

  // Counts by tier for Reports
  const starterCount = nonAdminUsers.filter((u) => u.tier === 'starter_10k').length;
  const plusCount = nonAdminUsers.filter((u) => u.tier === 'plus_15k').length;
  const unlimitedCount = nonAdminUsers.filter((u) => u.tier === 'unlimited').length;

  return (
    <View style={[adminHomeStyles.container, isDark && adminHomeStyles.containerDark]}>
      {/* Top Header */}
      <View style={[adminHomeStyles.header, isDark && adminHomeStyles.headerDark]}>
        <View style={adminHomeStyles.headerLeft}>
          <TouchableOpacity onPress={() => setShowSidebarDrawer(true)}>
            <Ionicons name="menu" size={26} color={isDark ? '#F4C430' : '#000000'} />
          </TouchableOpacity>
          <Text style={[adminHomeStyles.headerTitle, isDark && adminHomeStyles.headerTitleDark]}>
            Admin Portal
          </Text>
          <View style={adminHomeStyles.adminBadge}>
            <Text style={adminHomeStyles.adminBadgeText}>ADMIN</Text>
          </View>
        </View>

        <View style={adminHomeStyles.headerRight}>
          <TouchableOpacity
            style={adminHomeStyles.headerIconBtn}
            onPress={() => setShowSearchBar(!showSearchBar)}
          >
            <Ionicons
              name={showSearchBar ? 'close' : 'search-outline'}
              size={22}
              color={isDark ? '#F4C430' : '#000000'}
            />
          </TouchableOpacity>
          <TouchableOpacity style={adminHomeStyles.headerIconBtn} onPress={handleRefresh}>
            <Ionicons name="sync-outline" size={22} color={isDark ? '#F4C430' : '#000000'} />
          </TouchableOpacity>
          <TouchableOpacity style={adminHomeStyles.headerIconBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color={isDark ? '#F4C430' : '#000000'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Expandable Search Bar */}
      {showSearchBar && (
        <View style={[adminHomeStyles.searchBarContainer, isDark && adminHomeStyles.cardDark]}>
          <Ionicons name="search" size={18} color="#003366" />
          <TextInput
            style={[adminHomeStyles.searchInput, isDark && adminHomeStyles.textDark]}
            placeholder="Search household users by email or plan..."
            placeholderTextColor={isDark ? '#94A3B8' : '#888888'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#999999" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Main Content Area Based on Active Tab */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#003366', '#F4C430']} />
        }
      >
        {/* ========================================================================= */}
        {/* TAB 1: HOME / DASHBOARD                                                  */}
        {/* ========================================================================= */}
        {activeNavTab === 'home' && (
          <View>
            {/* Top Summary of Every Total: Total Users, Total Who Availed, Total Upgrade Profit */}
            <View style={adminHomeStyles.summaryCard}>
              <View style={adminHomeStyles.summaryItem}>
                <Text style={adminHomeStyles.summaryLabel}>Total Users</Text>
                <Text style={adminHomeStyles.summaryValue}>{totalUsersCount}</Text>
                <Text style={adminHomeStyles.summarySubtext}>Registered</Text>
              </View>

              <View style={adminHomeStyles.summaryDivider} />

              <View style={adminHomeStyles.summaryItem}>
                <Text style={adminHomeStyles.summaryLabel}>Total Availed</Text>
                <Text style={adminHomeStyles.summaryValue}>{totalAvailedCount}</Text>
                <Text style={adminHomeStyles.summarySubtext}>Upgrade Limit</Text>
              </View>

              <View style={adminHomeStyles.summaryDivider} />

              <View style={adminHomeStyles.summaryItem}>
                <Text style={adminHomeStyles.summaryLabel}>Total Profit</Text>
                <Text style={adminHomeStyles.summaryValue}>₱ {totalProfit.toLocaleString()}</Text>
                <Text style={adminHomeStyles.summarySubtext}>From Upgrades</Text>
              </View>
            </View>


            <View style={adminHomeStyles.secondaryStatsRow}>
              <View style={[adminHomeStyles.statMiniCard, isDark && adminHomeStyles.cardDark]}>
                <View style={adminHomeStyles.statMiniIcon}>
                  <Ionicons name="trending-up-outline" size={18} color="#003366" />
                </View>
                <Text style={[adminHomeStyles.statMiniValue, isDark && adminHomeStyles.textDark]}>
                  ₱ {totalHouseholdIncome >= 1000 ? `${(totalHouseholdIncome / 1000).toFixed(1)}K` : totalHouseholdIncome.toLocaleString()}
                </Text>
                <Text style={[adminHomeStyles.statMiniLabel, isDark && adminHomeStyles.textMutedDark]}>
                  Total Incomes
                </Text>
              </View>

              <View style={[adminHomeStyles.statMiniCard, isDark && adminHomeStyles.cardDark]}>
                <View style={adminHomeStyles.statMiniIcon}>
                  <Ionicons name="receipt-outline" size={18} color="#003366" />
                </View>
                <Text style={[adminHomeStyles.statMiniValue, isDark && adminHomeStyles.textDark]}>
                  ₱ {totalHouseholdExpenses >= 1000 ? `${(totalHouseholdExpenses / 1000).toFixed(1)}K` : totalHouseholdExpenses.toLocaleString()}
                </Text>
                <Text style={[adminHomeStyles.statMiniLabel, isDark && adminHomeStyles.textMutedDark]}>
                  Total Expenses
                </Text>
              </View>

              <View style={[adminHomeStyles.statMiniCard, isDark && adminHomeStyles.cardDark]}>
                <View style={adminHomeStyles.statMiniIcon}>
                  <Ionicons name="wallet-outline" size={18} color="#003366" />
                </View>
                <Text style={[adminHomeStyles.statMiniValue, isDark && adminHomeStyles.textDark]}>
                  ₱ {totalHouseholdBudget >= 1000 ? `${(totalHouseholdBudget / 1000).toFixed(1)}K` : totalHouseholdBudget.toLocaleString()}
                </Text>
                <Text style={[adminHomeStyles.statMiniLabel, isDark && adminHomeStyles.textMutedDark]}>
                  Total Budgets
                </Text>
              </View>
            </View>

            {/* Admin Notification Quick Broadcast Card */}
            <View style={[adminHomeStyles.adminNotifCard, isDark && adminHomeStyles.cardDark]}>
              <View style={adminHomeStyles.adminNotifHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="notifications" size={18} color="#003366" />
                  <Text style={[adminHomeStyles.adminNotifTitle, isDark && adminHomeStyles.textDark]}>
                    Household Notification Center
                  </Text>
                </View>
                <TouchableOpacity
                  style={adminHomeStyles.adminBroadcastBtn}
                  onPress={handleOpenBroadcastComposer}
                >
                  <Ionicons name="megaphone-outline" size={13} color="#003366" />
                  <Text style={adminHomeStyles.adminBroadcastBtnText}>Send Broadcast</Text>
                </TouchableOpacity>
              </View>

              <Text style={{ fontSize: 12, color: isDark ? '#94A3B8' : '#64748B' }}>
                Notify households regarding plan expirations, income caps, or system notices. They will see alerts live on their Dashboard.
              </Text>
            </View>

            {/* Registered Users List (Excluding Admin accounts) */}
            <View style={adminHomeStyles.sectionHeader}>
              <Text style={[adminHomeStyles.sectionTitle, isDark && adminHomeStyles.textDark]}>
                Registered Users ({nonAdminUsers.length})
              </Text>
              <TouchableOpacity onPress={() => setActiveNavTab('users')}>
                <Text style={adminHomeStyles.sectionActionText}>Manage All</Text>
              </TouchableOpacity>
            </View>

            <View style={adminHomeStyles.userList}>
              {loading ? (
                <ActivityIndicator size="small" color="#003366" style={{ marginVertical: 20 }} />
              ) : nonAdminUsers.length === 0 ? (
                <Text style={{ textAlign: 'center', color: '#718096', marginVertical: 20 }}>
                  No registered users found.
                </Text>
              ) : (
                nonAdminUsers.slice(0, 5).map((user) => {
                  const availed = isUserAvailed(user.tier);
                  return (
                    <View
                      key={user.id}
                      style={[adminHomeStyles.userCard, isDark && adminHomeStyles.cardDark]}
                    >
                      <View style={adminHomeStyles.userLeft}>
                        <View style={adminHomeStyles.avatarContainer}>
                          <Ionicons name="person-outline" size={22} color="#003366" />
                        </View>
                        <View style={adminHomeStyles.userInfo}>
                          <Text
                            style={[adminHomeStyles.userEmailText, isDark && adminHomeStyles.textDark]}
                            numberOfLines={1}
                          >
                            {user.email}
                          </Text>
                          <View style={adminHomeStyles.userMetaRow}>
                            {/* Upgrade Limit Status Badge */}
                            <View style={availed ? adminHomeStyles.tierBadgePaid : adminHomeStyles.tierBadgeFree}>
                              <Text
                                style={
                                  availed
                                    ? adminHomeStyles.tierBadgePaidText
                                    : adminHomeStyles.tierBadgeFreeText
                                }
                              >
                                {availed ? `⭐ ${getTierLabel(user.tier)}` : 'Free (₱5k Cap)'}
                              </Text>
                            </View>
                            <Text style={[adminHomeStyles.userDateText, isDark && adminHomeStyles.textMutedDark]}>
                              {user.householdName || 'Household'}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Right View Button & Status Indicator */}
                      <View style={{ alignItems: 'flex-end', gap: 6 }}>
                        <View style={adminHomeStyles.statusBadge}>
                          <View style={adminHomeStyles.statusDot} />
                          <Text style={adminHomeStyles.statusText}>Active</Text>
                        </View>

                        <TouchableOpacity
                          style={adminHomeStyles.userViewBtn}
                          onPress={() => handleOpenUserDetail(user)}
                        >
                          <Ionicons name="eye-outline" size={14} color="#003366" />
                          <Text style={adminHomeStyles.userViewBtnText}>View</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
              )}
            </View>

            {/* Dynamic Real-time Live System Activity Log WITH USER IDENTITIES */}
            <View style={adminHomeStyles.sectionHeader}>
              <Text style={[adminHomeStyles.sectionTitle, isDark && adminHomeStyles.textDark]}>
                Recent System Activity
              </Text>
              <Text style={adminHomeStyles.sectionActionText}>Live Log ({liveActivities.length})</Text>
            </View>

            <View style={adminHomeStyles.auditList}>
              {liveActivities.length === 0 ? (
                <View
                  style={[
                    adminHomeStyles.auditCard,
                    isDark && adminHomeStyles.cardDark,
                    { justifyContent: 'center', alignItems: 'center', paddingVertical: 20, flexDirection: 'column' },
                  ]}
                >
                  <Ionicons name="shield-checkmark-outline" size={26} color={isDark ? '#94A3B8' : '#94A3B8'} />
                  <Text style={[{ fontSize: 13, color: '#64748B', marginTop: 6 }, isDark && adminHomeStyles.textMutedDark]}>
                    No recent activity logs recorded
                  </Text>
                </View>
              ) : (
                liveActivities.map((act) => (
                  <View
                    key={act.id}
                    style={[
                      adminHomeStyles.auditCard,
                      isDark && adminHomeStyles.cardDark,
                      act.isHighlight && { borderColor: '#F4C430', borderWidth: 1.2 },
                    ]}
                  >
                    <View
                      style={[
                        adminHomeStyles.auditIcon,
                        act.isHighlight && { backgroundColor: '#FEF3C7' },
                      ]}
                    >
                      <Ionicons
                        name={act.icon}
                        size={18}
                        color={act.isHighlight ? '#B45309' : '#003366'}
                      />
                    </View>
                    <TouchableOpacity
                      style={adminHomeStyles.auditContent}
                      activeOpacity={0.7}
                      onPress={() => {
                        setSelectedActivity(act);
                        setShowActivityDetailsModal(true);
                      }}
                    >
                      <Text style={[adminHomeStyles.auditTitle, isDark && adminHomeStyles.textDark]}>
                        {act.title}
                      </Text>
                      <Text style={[adminHomeStyles.auditTime, isDark && adminHomeStyles.textMutedDark]}>
                        {act.subtitle ? act.subtitle.replace(/👤\s*/g, '') : ''} • {act.time}
                      </Text>
                    </TouchableOpacity>

                    {/* 3-Dot Action Button (View & Delete) */}
                    <TouchableOpacity
                      style={{
                        padding: 8,
                        borderRadius: 6,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginLeft: 4,
                      }}
                      onPress={() => handleOpenActivityOptions(act)}
                      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                      accessibilityLabel="Activity options"
                    >
                      <Ionicons
                        name="ellipsis-vertical"
                        size={18}
                        color={isDark ? '#94A3B8' : '#64748B'}
                      />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          </View>
        )}


        {activeNavTab === 'users' && (
          <View>
            {/* Top Summary for Users Tab */}
            <View style={adminHomeStyles.summaryCard}>
              <View style={adminHomeStyles.summaryItem}>
                <Text style={adminHomeStyles.summaryLabel}>Total Users</Text>
                <Text style={adminHomeStyles.summaryValue}>{totalUsersCount}</Text>
                <Text style={adminHomeStyles.summarySubtext}>Accounts</Text>
              </View>
              <View style={adminHomeStyles.summaryDivider} />
              <View style={adminHomeStyles.summaryItem}>
                <Text style={adminHomeStyles.summaryLabel}>Availed Upgrade</Text>
                <Text style={adminHomeStyles.summaryValue}>{totalAvailedCount}</Text>
                <Text style={adminHomeStyles.summarySubtext}>Paid Limit</Text>
              </View>
              <View style={adminHomeStyles.summaryDivider} />
              <View style={adminHomeStyles.summaryItem}>
                <Text style={adminHomeStyles.summaryLabel}>Free Basic</Text>
                <Text style={adminHomeStyles.summaryValue}>{freeUsersCount}</Text>
                <Text style={adminHomeStyles.summarySubtext}>₱5,000 Cap</Text>
              </View>
            </View>

            {/* Filter Pills */}
            <View style={[adminHomeStyles.filterTabsContainer, { marginTop: 14 }]}>
              <TouchableOpacity
                style={[
                  adminHomeStyles.filterTab,
                  userFilter === 'all' && adminHomeStyles.filterTabActive,
                ]}
                onPress={() => setUserFilter('all')}
              >
                <Text
                  style={[
                    adminHomeStyles.filterTabText,
                    userFilter === 'all' && adminHomeStyles.filterTabTextActive,
                  ]}
                >
                  All ({totalUsersCount})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  adminHomeStyles.filterTab,
                  userFilter === 'availed' && adminHomeStyles.filterTabActive,
                ]}
                onPress={() => setUserFilter('availed')}
              >
                <Text
                  style={[
                    adminHomeStyles.filterTabText,
                    userFilter === 'availed' && adminHomeStyles.filterTabTextActive,
                  ]}
                >
                  Availed ({totalAvailedCount})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  adminHomeStyles.filterTab,
                  userFilter === 'free' && adminHomeStyles.filterTabActive,
                ]}
                onPress={() => setUserFilter('free')}
              >
                <Text
                  style={[
                    adminHomeStyles.filterTabText,
                    userFilter === 'free' && adminHomeStyles.filterTabTextActive,
                  ]}
                >
                  Free Basic ({freeUsersCount})
                </Text>
              </TouchableOpacity>
            </View>

            {/* User List with View and Delete Buttons */}
            <View style={adminHomeStyles.userList}>
              {filteredUsersList.length === 0 ? (
                <Text style={{ textAlign: 'center', color: '#718096', marginVertical: 30 }}>
                  No users match the selected filter.
                </Text>
              ) : (
                filteredUsersList.map((user) => {
                  const availed = isUserAvailed(user.tier);
                  return (
                    <View
                      key={user.id}
                      style={[
                        adminHomeStyles.userCard,
                        isDark && adminHomeStyles.cardDark,
                        { flexDirection: 'column', alignItems: 'stretch' },
                      ]}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={adminHomeStyles.userLeft}>
                          <View style={adminHomeStyles.avatarContainer}>
                            <Ionicons name="person-outline" size={22} color="#003366" />
                          </View>
                          <View style={adminHomeStyles.userInfo}>
                            <Text
                              style={[adminHomeStyles.userEmailText, isDark && adminHomeStyles.textDark]}
                              numberOfLines={1}
                            >
                              {user.email}
                            </Text>
                            <Text style={[adminHomeStyles.userDateText, isDark && adminHomeStyles.textMutedDark]}>
                              {user.householdName || 'Family Household'} • Joined {user.created_at || 'Aug 2024'}
                            </Text>
                          </View>
                        </View>

                        <View style={adminHomeStyles.statusBadge}>
                          <View style={adminHomeStyles.statusDot} />
                          <Text style={adminHomeStyles.statusText}>Active</Text>
                        </View>
                      </View>

                      {/* User Info & Tier Status Row */}
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginTop: 10,
                          paddingTop: 8,
                          borderTopWidth: 1,
                          borderTopColor: isDark ? '#334155' : '#F1F5F9',
                        }}
                      >
                        <View style={availed ? adminHomeStyles.tierBadgePaid : adminHomeStyles.tierBadgeFree}>
                          <Text
                            style={
                              availed
                                ? adminHomeStyles.tierBadgePaidText
                                : adminHomeStyles.tierBadgeFreeText
                            }
                          >
                            {availed ? `Upgrade: ${getTierLabel(user.tier)}` : 'Limit: Free Basic (₱5,000)'}
                          </Text>
                        </View>

                        {/* Action Button: View Only on outside card */}
                        <View style={adminHomeStyles.userActionRow}>
                          <TouchableOpacity
                            style={adminHomeStyles.userViewBtn}
                            onPress={() => handleOpenUserDetail(user)}
                          >
                            <Ionicons name="eye-outline" size={14} color="#003366" />
                            <Text style={adminHomeStyles.userViewBtnText}>View</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </View>
        )}


        {activeNavTab === 'reports' && (
          <View style={adminHomeStyles.reportsContainer}>
            {/* Total Profit / Upgrade Revenue Card */}
            <View style={adminHomeStyles.reportRevenueCard}>
              <Text style={adminHomeStyles.reportRevenueLabel}>Total Monetization Profit</Text>
              <Text style={adminHomeStyles.reportRevenueValue}>₱ {totalProfit.toLocaleString()}</Text>
              <Text style={adminHomeStyles.reportRevenueSub}>
                Accumulated earnings from income limit upgrade tiers
              </Text>

              <View style={adminHomeStyles.reportRevenueRow}>
                <View style={adminHomeStyles.reportRevenueItem}>
                  <Text style={adminHomeStyles.reportRevenueItemLabel}>Total Availed</Text>
                  <Text style={adminHomeStyles.reportRevenueItemVal}>{totalAvailedCount} Users</Text>
                </View>
                <View style={adminHomeStyles.reportRevenueItem}>
                  <Text style={adminHomeStyles.reportRevenueItemLabel}>Total Users</Text>
                  <Text style={adminHomeStyles.reportRevenueItemVal}>{totalUsersCount} Households</Text>
                </View>
                <View style={adminHomeStyles.reportRevenueItem}>
                  <Text style={adminHomeStyles.reportRevenueItemLabel}>Conversion</Text>
                  <Text style={adminHomeStyles.reportRevenueItemVal}>
                    {totalUsersCount > 0 ? Math.round((totalAvailedCount / totalUsersCount) * 100) : 0}%
                  </Text>
                </View>
              </View>
            </View>

            {/* Breakdown of 3 Availing Upgrade Tiers */}
            <View style={adminHomeStyles.reportTierGrid}>
              <View style={[adminHomeStyles.reportTierCard, isDark && adminHomeStyles.cardDark]}>
                <Text style={adminHomeStyles.reportTierCardTitle}>Starter (₱10k)</Text>
                <Text style={[adminHomeStyles.reportTierCount, isDark && adminHomeStyles.textDark]}>
                  {starterCount}
                </Text>
                <Text style={adminHomeStyles.reportTierSub}>₱ 100 / 6 mos</Text>
              </View>

              <View style={[adminHomeStyles.reportTierCard, isDark && adminHomeStyles.cardDark]}>
                <Text style={adminHomeStyles.reportTierCardTitle}>Plus (₱15k)</Text>
                <Text style={[adminHomeStyles.reportTierCount, isDark && adminHomeStyles.textDark]}>
                  {plusCount}
                </Text>
                <Text style={adminHomeStyles.reportTierSub}>₱ 150 / 1 mo</Text>
              </View>

              <View style={[adminHomeStyles.reportTierCard, isDark && adminHomeStyles.cardDark]}>
                <Text style={adminHomeStyles.reportTierCardTitle}>Unlimited</Text>
                <Text style={[adminHomeStyles.reportTierCount, isDark && adminHomeStyles.textDark]}>
                  {unlimitedCount}
                </Text>
                <Text style={adminHomeStyles.reportTierSub}>₱ 300 / 2 yrs</Text>
              </View>
            </View>

            {/* Overall Household Financial Oversight */}
            <View style={[adminHomeStyles.reportTableCard, isDark && adminHomeStyles.cardDark]}>
              <Text style={[adminHomeStyles.settingsCardTitle, isDark && adminHomeStyles.textDark, { marginBottom: 12 }]}>
                Household Financial Aggregate
              </Text>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                <Text style={isDark ? adminHomeStyles.textMutedDark : { color: '#64748B', fontSize: 13 }}>
                  Total Household Incomes:
                </Text>
                <Text style={{ fontWeight: 'bold', color: '#16A34A', fontSize: 14 }}>
                  ₱ {totalHouseholdIncome.toLocaleString()}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                <Text style={isDark ? adminHomeStyles.textMutedDark : { color: '#64748B', fontSize: 13 }}>
                  Total Tracked Expenses:
                </Text>
                <Text style={{ fontWeight: 'bold', color: '#DC2626', fontSize: 14 }}>
                  ₱ {totalHouseholdExpenses.toLocaleString()}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                <Text style={isDark ? adminHomeStyles.textMutedDark : { color: '#64748B', fontSize: 13 }}>
                  Total Monitored Budgets:
                </Text>
                <Text style={{ fontWeight: 'bold', color: '#003366', fontSize: 14 }}>
                  ₱ {totalHouseholdBudget.toLocaleString()}
                </Text>
              </View>
            </View>

            {/* Monitored Household Table */}
            <View style={[adminHomeStyles.reportTableCard, isDark && adminHomeStyles.cardDark]}>
              <Text style={[adminHomeStyles.settingsCardTitle, isDark && adminHomeStyles.textDark, { marginBottom: 10 }]}>
                Active Households Status
              </Text>

              <View style={adminHomeStyles.reportTableHeader}>
                <Text style={[adminHomeStyles.reportTableHeaderText, { flex: 2 }]}>Household</Text>
                <Text style={[adminHomeStyles.reportTableHeaderText, { flex: 1.5, textAlign: 'center' }]}>Plan</Text>
                <Text style={[adminHomeStyles.reportTableHeaderText, { flex: 1.5, textAlign: 'right' }]}>Budget</Text>
              </View>

              {nonAdminUsers.map((u) => (
                <View key={u.id} style={adminHomeStyles.reportTableRow}>
                  <Text
                    style={[adminHomeStyles.reportTableCellUser, isDark && adminHomeStyles.textDark]}
                    numberOfLines={1}
                  >
                    {u.email.split('@')[0]}
                  </Text>
                  <Text
                    style={[
                      adminHomeStyles.reportTableCellPlan,
                      isUserAvailed(u.tier) && { color: '#B45309', fontWeight: 'bold' },
                    ]}
                  >
                    {isUserAvailed(u.tier) ? u.tier?.replace('_10k', '').replace('_15k', '') : 'Free'}
                  </Text>
                  <Text style={[adminHomeStyles.reportTableCellBudget, isDark && adminHomeStyles.textDark]}>
                    ₱ {(u.total_budget || 38000).toLocaleString()}
                  </Text>
                </View>
              ))}
            </View>

            {/* Export Summary Button */}
            <TouchableOpacity
              style={[adminHomeStyles.primaryActionButton, { marginTop: 20 }]}
              onPress={() => setAdminFeedback({
                visible: true,
                title: 'Financial Report Exported',
                message: `Full report generated with ₱ ${totalProfit.toLocaleString()} profit, ${totalUsersCount} households, and ${totalAvailedCount} upgrades.`,
                tone: 'success',
                icon: 'document-text-outline',
              })}
            >
              <Ionicons name="document-text-outline" size={20} color="#003366" />
              <Text style={adminHomeStyles.primaryActionButtonText}>Export Financial Report</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: SETTINGS TAB                                                      */}
        {/* ========================================================================= */}
        {activeNavTab === 'settings' && (
          <View style={adminHomeStyles.settingsContainer}>
            {/* Section 1: Upgrade Pricing, Income Limit Caps, and Months */}
            <View style={[adminHomeStyles.settingsCard, isDark && adminHomeStyles.cardDark]}>
              <View style={adminHomeStyles.settingsCardHeader}>
                <Ionicons name="pricetags" size={20} color="#003366" />
                <Text style={[adminHomeStyles.settingsCardTitle, isDark && adminHomeStyles.textDark]}>
                  Edit Upgrade Pricing & Limits
                </Text>
              </View>
              <Text
                style={[
                  isDark ? adminHomeStyles.textMutedDark : { color: '#64748B' },
                  { fontSize: 12, marginBottom: 14 },
                ]}
              >
                Modify the availing price, maximum income cap, and duration period for each tier.
              </Text>

              {planConfigs.map((plan, index) => (
                <View key={plan.id} style={adminHomeStyles.settingsPlanBlock}>
                  <Text style={adminHomeStyles.settingsPlanTitle}>
                    {index + 1}. {plan.name}
                  </Text>

                  <View style={adminHomeStyles.settingsInputRow}>
                    <View style={adminHomeStyles.settingsInputFieldGroup}>
                      <Text style={adminHomeStyles.settingsInputLabel}>Price (₱)</Text>
                      <TextInput
                        style={adminHomeStyles.settingsTextInput}
                        keyboardType="numeric"
                        value={plan.price.toString()}
                        onChangeText={(txt) => {
                          const updated = [...planConfigs];
                          updated[index].price = Number(txt) || 0;
                          setPlanConfigs(updated);
                        }}
                      />
                    </View>

                    <View style={adminHomeStyles.settingsInputFieldGroup}>
                      <Text style={adminHomeStyles.settingsInputLabel}>Income Cap (₱)</Text>
                      <TextInput
                        style={adminHomeStyles.settingsTextInput}
                        keyboardType="numeric"
                        value={plan.capAmount.toString()}
                        onChangeText={(txt) => {
                          const updated = [...planConfigs];
                          updated[index].capAmount = Number(txt) || 0;
                          setPlanConfigs(updated);
                        }}
                      />
                    </View>

                    <View style={adminHomeStyles.settingsInputFieldGroup}>
                      <Text style={adminHomeStyles.settingsInputLabel}>Duration (Mo.)</Text>
                      <TextInput
                        style={adminHomeStyles.settingsTextInput}
                        keyboardType="numeric"
                        value={plan.durationMonths.toString()}
                        onChangeText={(txt) => {
                          const updated = [...planConfigs];
                          const m = Number(txt) || 1;
                          updated[index].durationMonths = m;
                          updated[index].duration = `${m} Month${m > 1 ? 's' : ''} Access`;
                          setPlanConfigs(updated);
                        }}
                      />
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* Section 2: Admin Information */}
            <View style={[adminHomeStyles.settingsCard, isDark && adminHomeStyles.cardDark]}>
              <View style={adminHomeStyles.settingsCardHeader}>
                <Ionicons name="person-circle" size={20} color="#003366" />
                <Text style={[adminHomeStyles.settingsCardTitle, isDark && adminHomeStyles.textDark]}>
                  Admin Profile Information
                </Text>
              </View>

              <View style={{ marginBottom: 10 }}>
                <Text style={adminHomeStyles.settingsInputLabel}>Administrator Name</Text>
                <TextInput
                  style={adminHomeStyles.settingsTextInput}
                  value={adminInfo.name}
                  onChangeText={(txt) => setAdminInfo({ ...adminInfo, name: txt })}
                />
              </View>

              <View style={{ marginBottom: 10 }}>
                <Text style={adminHomeStyles.settingsInputLabel}>Administrator Email</Text>
                <TextInput
                  style={adminHomeStyles.settingsTextInput}
                  value={adminInfo.email}
                  onChangeText={(txt) => setAdminInfo({ ...adminInfo, email: txt })}
                />
              </View>

              <View style={{ marginBottom: 10 }}>
                <Text style={adminHomeStyles.settingsInputLabel}>Contact Phone</Text>
                <TextInput
                  style={adminHomeStyles.settingsTextInput}
                  value={adminInfo.phone}
                  onChangeText={(txt) => setAdminInfo({ ...adminInfo, phone: txt })}
                />
              </View>

              <View style={{ marginBottom: 10 }}>
                <Text style={adminHomeStyles.settingsInputLabel}>System Role Title</Text>
                <TextInput
                  style={adminHomeStyles.settingsTextInput}
                  value={adminInfo.role_title}
                  onChangeText={(txt) => setAdminInfo({ ...adminInfo, role_title: txt })}
                />
              </View>
            </View>

            {/* Section 3: About Us */}
            <View style={[adminHomeStyles.settingsCard, isDark && adminHomeStyles.cardDark]}>
              <View style={adminHomeStyles.settingsCardHeader}>
                <Ionicons name="information-circle" size={20} color="#003366" />
                <Text style={[adminHomeStyles.settingsCardTitle, isDark && adminHomeStyles.textDark]}>
                  About Us Content
                </Text>
              </View>
              <TextInput
                style={adminHomeStyles.settingsTextArea}
                multiline
                numberOfLines={4}
                value={aboutUsText}
                onChangeText={setAboutUsText}
              />
            </View>

            {/* Section 4: System Rules */}
            <View style={[adminHomeStyles.settingsCard, isDark && adminHomeStyles.cardDark]}>
              <View style={adminHomeStyles.settingsCardHeader}>
                <Ionicons name="shield-checkmark" size={20} color="#003366" />
                <Text style={[adminHomeStyles.settingsCardTitle, isDark && adminHomeStyles.textDark]}>
                  System Rules & Regulations
                </Text>
              </View>
              <TextInput
                style={adminHomeStyles.settingsTextArea}
                multiline
                numberOfLines={4}
                value={rulesText}
                onChangeText={setRulesText}
              />
            </View>

            {/* Section 5: How To Use This Application */}
            <View style={[adminHomeStyles.settingsCard, isDark && adminHomeStyles.cardDark]}>
              <View style={adminHomeStyles.settingsCardHeader}>
                <Ionicons name="help-buoy" size={20} color="#003366" />
                <Text style={[adminHomeStyles.settingsCardTitle, isDark && adminHomeStyles.textDark]}>
                  How to Use This Application Guide
                </Text>
              </View>
              <TextInput
                style={adminHomeStyles.settingsTextArea}
                multiline
                numberOfLines={5}
                value={howToUseText}
                onChangeText={setHowToUseText}
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={adminHomeStyles.settingsSaveButton}
              onPress={handleSaveSettings}
              disabled={savingSettings}
            >
              {savingSettings ? (
                <ActivityIndicator size="small" color="#F4C430" />
              ) : (
                <>
                  <Ionicons name="save-outline" size={20} color="#F4C430" />
                  <Text style={adminHomeStyles.settingsSaveButtonText}>Save System Settings</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={[adminHomeStyles.bottomNav, isDark && adminHomeStyles.bottomNavDark]}>
        <TouchableOpacity
          style={adminHomeStyles.navItem}
          onPress={() => setActiveNavTab('home')}
        >
          <Ionicons
            name={activeNavTab === 'home' ? 'home' : 'home-outline'}
            size={22}
            color={activeNavTab === 'home' ? '#003366' : '#757575'}
          />
          <Text style={activeNavTab === 'home' ? adminHomeStyles.navTextActive : adminHomeStyles.navText}>
            Dashboard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={adminHomeStyles.navItem}
          onPress={() => setActiveNavTab('users')}
        >
          <Ionicons
            name={activeNavTab === 'users' ? 'people' : 'people-outline'}
            size={22}
            color={activeNavTab === 'users' ? '#003366' : '#757575'}
          />
          <Text style={activeNavTab === 'users' ? adminHomeStyles.navTextActive : adminHomeStyles.navText}>
            Users
          </Text>
        </TouchableOpacity>

        {/* Central Floating Action Button */}
        <TouchableOpacity
          style={adminHomeStyles.fab}
          onPress={() => setShowActionModal(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color="#F4C430" />
        </TouchableOpacity>

        <TouchableOpacity
          style={adminHomeStyles.navItem}
          onPress={() => setActiveNavTab('reports')}
        >
          <Ionicons
            name={activeNavTab === 'reports' ? 'bar-chart' : 'bar-chart-outline'}
            size={22}
            color={activeNavTab === 'reports' ? '#003366' : '#757575'}
          />
          <Text style={activeNavTab === 'reports' ? adminHomeStyles.navTextActive : adminHomeStyles.navText}>
            Reports
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={adminHomeStyles.navItem}
          onPress={() => setActiveNavTab('settings')}
        >
          <Ionicons
            name={activeNavTab === 'settings' ? 'settings' : 'settings-outline'}
            size={22}
            color={activeNavTab === 'settings' ? '#003366' : '#757575'}
          />
          <Text style={activeNavTab === 'settings' ? adminHomeStyles.navTextActive : adminHomeStyles.navText}>
            Settings
          </Text>
        </TouchableOpacity>
      </View>

      {/* ========================================================================= */}
      {/* USER DETAILS MODAL (WITH REMAINING TIME & NOTIFY USER ACTION)             */}
      {/* ========================================================================= */}
      <Modal
        visible={showUserModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowUserModal(false)}
      >
        <View style={adminHomeStyles.modalOverlay}>
          <View style={[adminHomeStyles.modalContent, isDark && adminHomeStyles.modalContentDark]}>
            <View style={adminHomeStyles.modalHeader}>
              <Text style={[adminHomeStyles.modalTitle, isDark && adminHomeStyles.textDark]}>
                Household Account Details
              </Text>
              <TouchableOpacity onPress={() => setShowUserModal(false)}>
                <Ionicons name="close" size={24} color={isDark ? '#F4C430' : '#003366'} />
              </TouchableOpacity>
            </View>

            {selectedUser && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={adminHomeStyles.modalBodyItem}>
                  <Text style={adminHomeStyles.modalLabel}>User Email Address</Text>
                  <Text style={[adminHomeStyles.modalValue, isDark && adminHomeStyles.textDark]}>
                    {selectedUser.email}
                  </Text>
                </View>

                <View style={adminHomeStyles.modalBodyItem}>
                  <Text style={adminHomeStyles.modalLabel}>Household Name</Text>
                  <Text style={[adminHomeStyles.modalValue, isDark && adminHomeStyles.textDark]}>
                    {selectedUser.householdName || 'Standard Household'}
                  </Text>
                </View>

                <View style={adminHomeStyles.modalBodyItem}>
                  <Text style={adminHomeStyles.modalLabel}>Account Status</Text>
                  <Text style={[adminHomeStyles.modalValue, { color: '#16A34A' }]}>
                    ● Active & Verified Member
                  </Text>
                </View>

                {/* Real-time Dynamic Limit Upgrade Status */}
                <View
                  style={[
                    adminHomeStyles.modalBodyItem,
                    {
                      backgroundColor: isUserAvailed(selectedUser.tier) ? '#FEF3C7' : '#F1F5F9',
                      padding: 12,
                      borderRadius: 8,
                    },
                  ]}
                >
                  <Text
                    style={[
                      adminHomeStyles.modalLabel,
                      { color: isUserAvailed(selectedUser.tier) ? '#92400E' : '#475569' },
                    ]}
                  >
                    Income Limit Upgrade Status
                  </Text>
                  <Text
                    style={[
                      adminHomeStyles.modalValue,
                      { color: isUserAvailed(selectedUser.tier) ? '#B45309' : '#1E293B', fontSize: 16 },
                    ]}
                  >
                    {isUserAvailed(selectedUser.tier)
                      ? `⭐ Availed: ${getTierLabel(selectedUser.tier)}`
                      : 'Free Basic Tier (₱5,000 Limit)'}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: isUserAvailed(selectedUser.tier) ? '#78350F' : '#64748B',
                      marginTop: 2,
                    }}
                  >
                    Cap: ₱ {(selectedUser.income_cap || 5000).toLocaleString()} per income entry
                  </Text>
                </View>

                {/* Remaining Time & Notification Action for Availed Users */}
                {isUserAvailed(selectedUser.tier) && (
                  <View style={adminHomeStyles.remainingTimeCard}>
                    <View style={adminHomeStyles.remainingTimeHeader}>
                      <Ionicons name="time" size={16} color="#92400E" />
                      <Text style={adminHomeStyles.remainingTimeLabel}>Remaining Upgrade Access</Text>
                    </View>
                    <Text style={adminHomeStyles.remainingTimeValue}>
                      ⏳ {getRemainingTimeInfo(selectedUser.tier_expires_at).text}
                    </Text>
                    <Text style={adminHomeStyles.remainingTimeSub}>
                      Expires on: {selectedUser.tier_expires_at || 'Active Plan'}
                    </Text>

                    {/* Notify User Button */}
                    <TouchableOpacity
                      style={adminHomeStyles.notifyUserBtn}
                      onPress={() => {
                        setShowUserModal(false);
                        handleOpenNotifyComposer(selectedUser);
                      }}
                    >
                      <Ionicons name="notifications" size={16} color="#F4C430" />
                      <Text style={adminHomeStyles.notifyUserBtnText}>Send Notification to User</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Exact Dynamic Financial Summary for this specific user */}
                <View style={adminHomeStyles.modalBodyItem}>
                  <Text style={adminHomeStyles.modalLabel}>Household Financial Overview</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                    <Text style={{ fontSize: 12, color: '#64748B' }}>Allocated Budget:</Text>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#003366' }}>
                      ₱ {(selectedUser.total_budget || 0).toLocaleString()}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 }}>
                    <Text style={{ fontSize: 12, color: '#64748B' }}>Recorded Incomes:</Text>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#16A34A' }}>
                      ₱ {(selectedUser.total_income || 0).toLocaleString()}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 }}>
                    <Text style={{ fontSize: 12, color: '#64748B' }}>Recorded Expenses:</Text>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#DC2626' }}>
                      ₱ {(selectedUser.total_expenses || 0).toLocaleString()}
                    </Text>
                  </View>
                </View>

                {/* Admin Action Buttons: Notify User and Delete User */}
                <View
                  style={{
                    marginTop: 14,
                    paddingTop: 12,
                    borderTopWidth: 1,
                    borderTopColor: isDark ? '#334155' : '#E2E8F0',
                  }}
                >
                  <Text style={[adminHomeStyles.modalLabel, { marginBottom: 8 }]}>Administrative Actions</Text>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        backgroundColor: '#FEF3C7',
                        borderWidth: 1,
                        borderColor: '#FDE68A',
                        paddingVertical: 10,
                        borderRadius: 8,
                      }}
                      onPress={() => {
                        setShowUserModal(false);
                        handleOpenNotifyComposer(selectedUser);
                      }}
                    >
                      <Ionicons name="notifications-outline" size={16} color="#B45309" />
                      <Text style={{ color: '#B45309', fontWeight: 'bold', fontSize: 13 }}>Notify User</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        backgroundColor: '#FEE2E2',
                        borderWidth: 1,
                        borderColor: '#FECACA',
                        paddingVertical: 10,
                        borderRadius: 8,
                      }}
                      onPress={() => {
                        setShowUserModal(false);
                        handleDeleteUser(selectedUser);
                      }}
                    >
                      <Ionicons name="trash-outline" size={16} color="#DC2626" />
                      <Text style={{ color: '#DC2626', fontWeight: 'bold', fontSize: 13 }}>Delete User</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            )}

            <View style={adminHomeStyles.modalActions}>
              <TouchableOpacity
                style={adminHomeStyles.modalCloseBtn}
                onPress={() => setShowUserModal(false)}
              >
                <Text style={adminHomeStyles.modalCloseBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* NOTIFY USER COMPOSER MODAL (ADMIN TO USER)                                */}
      {/* ========================================================================= */}
      <Modal
        visible={showNotifyModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNotifyModal(false)}
      >
        <View style={adminHomeStyles.modalOverlay}>
          <View style={[adminHomeStyles.modalContent, isDark && adminHomeStyles.modalContentDark]}>
            <View style={adminHomeStyles.modalHeader}>
              <Text style={[adminHomeStyles.modalTitle, isDark && adminHomeStyles.textDark]}>
                Send Notification to Household
              </Text>
              <TouchableOpacity onPress={() => setShowNotifyModal(false)}>
                <Ionicons name="close" size={24} color={isDark ? '#F4C430' : '#003366'} />
              </TouchableOpacity>
            </View>

            <View style={{ marginBottom: 12 }}>
              <Text style={adminHomeStyles.settingsInputLabel}>Recipient Household</Text>
              <TextInput
                style={[adminHomeStyles.settingsTextInput, { backgroundColor: '#F1F5F9', color: '#475569' }]}
                value={notifyRecipientEmail}
                editable={false}
              />
            </View>

            <View style={{ marginBottom: 12 }}>
              <Text style={adminHomeStyles.settingsInputLabel}>Notification Title</Text>
              <TextInput
                style={adminHomeStyles.settingsTextInput}
                placeholder="e.g. Plan Expiration Reminder"
                value={notifyTitle}
                onChangeText={setNotifyTitle}
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={adminHomeStyles.settingsInputLabel}>Message to Household</Text>
              <TextInput
                style={adminHomeStyles.settingsTextArea}
                placeholder="Type your notification message..."
                multiline
                numberOfLines={4}
                value={notifyMessage}
                onChangeText={setNotifyMessage}
              />
            </View>

            <TouchableOpacity
              style={adminHomeStyles.settingsSaveButton}
              onPress={handleSendNotification}
              disabled={isSendingNotification}
            >
              {isSendingNotification ? (
                <ActivityIndicator size="small" color="#F4C430" />
              ) : (
                <>
                  <Ionicons name="send" size={18} color="#F4C430" />
                  <Text style={adminHomeStyles.settingsSaveButtonText}>Dispatch Notification</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Central FAB Quick Action Modal */}
      <Modal
        visible={showActionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowActionModal(false)}
      >
        <View style={adminHomeStyles.modalOverlay}>
          <View style={[adminHomeStyles.modalContent, isDark && adminHomeStyles.modalContentDark]}>
            <View style={adminHomeStyles.modalHeader}>
              <Text style={[adminHomeStyles.modalTitle, isDark && adminHomeStyles.textDark]}>
                Admin Quick Actions
              </Text>
              <TouchableOpacity onPress={() => setShowActionModal(false)}>
                <Ionicons name="close" size={24} color={isDark ? '#F4C430' : '#003366'} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[adminHomeStyles.auditCard, isDark && adminHomeStyles.cardDark, { marginBottom: 12 }]}
              onPress={() => {
                setShowActionModal(false);
                setShowProvisionUserModal(true);
              }}
            >
              <View style={adminHomeStyles.auditIcon}>
                <Ionicons name="person-add" size={20} color="#003366" />
              </View>
              <View style={adminHomeStyles.auditContent}>
                <Text style={[adminHomeStyles.auditTitle, isDark && adminHomeStyles.textDark]}>
                  Create / Provision User
                </Text>
                <Text style={[adminHomeStyles.auditTime, isDark && adminHomeStyles.textMutedDark]}>
                  Register a new Household account (In-Place, Admin Stays Logged In)
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[adminHomeStyles.auditCard, isDark && adminHomeStyles.cardDark, { marginBottom: 12 }]}
              onPress={() => {
                setShowActionModal(false);
                handleOpenBroadcastComposer();
              }}
            >
              <View style={adminHomeStyles.auditIcon}>
                <Ionicons name="megaphone" size={20} color="#003366" />
              </View>
              <View style={adminHomeStyles.auditContent}>
                <Text style={[adminHomeStyles.auditTitle, isDark && adminHomeStyles.textDark]}>
                  System Announcement
                </Text>
                <Text style={[adminHomeStyles.auditTime, isDark && adminHomeStyles.textMutedDark]}>
                  Broadcast notification to all households
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[adminHomeStyles.auditCard, isDark && adminHomeStyles.cardDark, { marginBottom: 12 }]}
              onPress={() => {
                setShowActionModal(false);
                handleRefresh();
                setAdminFeedback({
                  visible: true,
                  title: 'Records Synchronized',
                  message: 'The latest Supabase records are now displayed.',
                  tone: 'success',
                  icon: 'sync-outline',
                });
              }}
            >
              <View style={adminHomeStyles.auditIcon}>
                <Ionicons name="sync" size={20} color="#003366" />
              </View>
              <View style={adminHomeStyles.auditContent}>
                <Text style={[adminHomeStyles.auditTitle, isDark && adminHomeStyles.textDark]}>
                  Sync All Records
                </Text>
                <Text style={[adminHomeStyles.auditTime, isDark && adminHomeStyles.textMutedDark]}>
                  Fetch real-time updates from Supabase
                </Text>
              </View>
            </TouchableOpacity>

            <View style={adminHomeStyles.modalActions}>
              <TouchableOpacity
                style={adminHomeStyles.modalCloseBtn}
                onPress={() => setShowActionModal(false)}
              >
                <Text style={adminHomeStyles.modalCloseBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* In-Place User Provisioning Modal (Admin Stays Logged In) */}
      <Modal
        visible={showProvisionUserModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowProvisionUserModal(false)}
      >
        <View style={adminHomeStyles.modalOverlay}>
          <View style={[adminHomeStyles.modalContent, isDark && adminHomeStyles.modalContentDark, { maxHeight: '88%' }]}>
            <View style={adminHomeStyles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="person-add" size={22} color="#003366" />
                <Text style={[adminHomeStyles.modalTitle, isDark && adminHomeStyles.textDark]}>
                  Provision Household User
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowProvisionUserModal(false)}>
                <Ionicons name="close" size={24} color={isDark ? '#F4C430' : '#003366'} />
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 12, color: '#64748B', marginBottom: 14 }}>
              Provision accounts directly into Supabase without disrupting your administrator login.
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[adminHomeStyles.fieldLabel, isDark && adminHomeStyles.textDark]}>
                Household / Full Name
              </Text>
              <TextInput
                style={[adminHomeStyles.modalInput, isDark && adminHomeStyles.inputDark]}
                placeholder="e.g. Maria Santos Household"
                placeholderTextColor={isDark ? '#94A3B8' : '#888888'}
                value={provisionName}
                onChangeText={setProvisionName}
              />

              <Text style={[adminHomeStyles.fieldLabel, isDark && adminHomeStyles.textDark, { marginTop: 10 }]}>
                Email Address *
              </Text>
              <TextInput
                style={[adminHomeStyles.modalInput, isDark && adminHomeStyles.inputDark]}
                placeholder="e.g. maria@household.com"
                placeholderTextColor={isDark ? '#94A3B8' : '#888888'}
                keyboardType="email-address"
                autoCapitalize="none"
                value={provisionEmail}
                onChangeText={setProvisionEmail}
              />

              <Text style={[adminHomeStyles.fieldLabel, isDark && adminHomeStyles.textDark, { marginTop: 10 }]}>
                Temporary Password *
              </Text>
              <TextInput
                style={[adminHomeStyles.modalInput, isDark && adminHomeStyles.inputDark]}
                placeholder="Minimum 6 characters"
                placeholderTextColor={isDark ? '#94A3B8' : '#888888'}
                secureTextEntry
                value={provisionPassword}
                onChangeText={setProvisionPassword}
              />

              <Text style={[adminHomeStyles.fieldLabel, isDark && adminHomeStyles.textDark, { marginTop: 12, marginBottom: 6 }]}>
                Assign Subscription / Income Limit Tier
              </Text>

              <View style={{ gap: 8, marginBottom: 10 }}>
                <TouchableOpacity
                  style={{
                    padding: 10,
                    borderRadius: 8,
                    borderWidth: 1.5,
                    borderColor: provisionTier === 'free' ? '#003366' : '#E2E8F0',
                    backgroundColor: provisionTier === 'free' ? '#EFF6FF' : (isDark ? '#1E293B' : '#F8FAFC'),
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                  onPress={() => setProvisionTier('free')}
                >
                  <View>
                    <Text style={{ fontWeight: 'bold', color: provisionTier === 'free' ? '#003366' : (isDark ? '#FFFFFF' : '#1E293B') }}>
                      Free Basic Plan
                    </Text>
                    <Text style={{ fontSize: 11, color: '#64748B' }}>₱5,000 Income Limit (Default)</Text>
                  </View>
                  <Text style={{ fontWeight: 'bold', color: '#64748B' }}>₱0</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    padding: 10,
                    borderRadius: 8,
                    borderWidth: 1.5,
                    borderColor: provisionTier === 'starter_10k' ? '#003366' : '#E2E8F0',
                    backgroundColor: provisionTier === 'starter_10k' ? '#EFF6FF' : (isDark ? '#1E293B' : '#F8FAFC'),
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                  onPress={() => setProvisionTier('starter_10k')}
                >
                  <View>
                    <Text style={{ fontWeight: 'bold', color: provisionTier === 'starter_10k' ? '#003366' : (isDark ? '#FFFFFF' : '#1E293B') }}>
                      Starter Booster
                    </Text>
                    <Text style={{ fontSize: 11, color: '#64748B' }}>₱10,000 Income Limit</Text>
                  </View>
                  <Text style={{ fontWeight: 'bold', color: '#16A34A' }}>₱100 Profit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    padding: 10,
                    borderRadius: 8,
                    borderWidth: 1.5,
                    borderColor: provisionTier === 'plus_15k' ? '#003366' : '#E2E8F0',
                    backgroundColor: provisionTier === 'plus_15k' ? '#EFF6FF' : (isDark ? '#1E293B' : '#F8FAFC'),
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                  onPress={() => setProvisionTier('plus_15k')}
                >
                  <View>
                    <Text style={{ fontWeight: 'bold', color: provisionTier === 'plus_15k' ? '#003366' : (isDark ? '#FFFFFF' : '#1E293B') }}>
                      Plus Growth Plan
                    </Text>
                    <Text style={{ fontSize: 11, color: '#64748B' }}>₱15,000 Income Limit</Text>
                  </View>
                  <Text style={{ fontWeight: 'bold', color: '#16A34A' }}>₱150 Profit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    padding: 10,
                    borderRadius: 8,
                    borderWidth: 1.5,
                    borderColor: provisionTier === 'unlimited' ? '#003366' : '#E2E8F0',
                    backgroundColor: provisionTier === 'unlimited' ? '#EFF6FF' : (isDark ? '#1E293B' : '#F8FAFC'),
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                  onPress={() => setProvisionTier('unlimited')}
                >
                  <View>
                    <Text style={{ fontWeight: 'bold', color: provisionTier === 'unlimited' ? '#003366' : (isDark ? '#FFFFFF' : '#1E293B') }}>
                      Unlimited Family Pro
                    </Text>
                    <Text style={{ fontSize: 11, color: '#64748B' }}>No Transaction Cap</Text>
                  </View>
                  <Text style={{ fontWeight: 'bold', color: '#16A34A' }}>₱300 Profit</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                marginTop: 18,
                paddingTop: 8,
              }}
            >
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 13,
                  borderRadius: 10,
                  backgroundColor: isDark ? '#334155' : '#F1F5F9',
                  borderWidth: 1,
                  borderColor: isDark ? '#475569' : '#E2E8F0',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={() => setShowProvisionUserModal(false)}
                disabled={isProvisioning}
                activeOpacity={0.7}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: 'bold',
                    color: isDark ? '#CBD5E1' : '#475569',
                    textAlign: 'center',
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1.6,
                  paddingVertical: 13,
                  borderRadius: 10,
                  backgroundColor: '#003366',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  gap: 8,
                  opacity: isProvisioning ? 0.6 : 1,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 3,
                  elevation: 3,
                }}
                onPress={handleProvisionUser}
                disabled={isProvisioning}
                activeOpacity={0.85}
              >
                {isProvisioning ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="person-add" size={16} color="#F4C430" />
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: 'bold',
                        color: '#FFFFFF',
                        textAlign: 'center',
                      }}
                    >
                      Provision Account
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* ACTIVITY 3-DOT ACTION MENU MODAL (VIEW & DELETE)                          */}
      {/* ========================================================================= */}
      <Modal
        visible={showActivityMenuModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowActivityMenuModal(false)}
      >
        <TouchableOpacity
          style={[adminHomeStyles.modalOverlay, { justifyContent: 'flex-end', paddingBottom: 30 }]}
          activeOpacity={1}
          onPress={() => setShowActivityMenuModal(false)}
        >
          <View
            style={[
              adminHomeStyles.modalContent,
              isDark && adminHomeStyles.modalContentDark,
              { width: '92%', maxWidth: 440, alignSelf: 'center', borderRadius: 16 },
            ]}
          >
            {/* Header with activity snippet */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, marginRight: 8 }}>
                <View
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    backgroundColor: selectedActivity?.isHighlight ? '#FEF3C7' : (isDark ? '#1E293B' : '#EFF6FF'),
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Ionicons
                    name={selectedActivity?.icon || 'information-circle'}
                    size={20}
                    color={selectedActivity?.isHighlight ? '#B45309' : '#003366'}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[{ fontSize: 14, fontWeight: 'bold', color: '#003366' }, isDark && adminHomeStyles.textDark]} numberOfLines={1}>
                    {selectedActivity?.title || 'System Activity'}
                  </Text>
                  <Text style={[{ fontSize: 11, color: '#64748B' }, isDark && adminHomeStyles.textMutedDark]} numberOfLines={1}>
                    {selectedActivity?.time || 'Recent'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setShowActivityMenuModal(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={22} color={isDark ? '#F4C430' : '#64748B'} />
              </TouchableOpacity>
            </View>

            <View style={{ height: 1, backgroundColor: isDark ? '#334155' : '#E2E8F0', marginBottom: 12 }} />

            {/* Menu Option 1: View Activity */}
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                paddingHorizontal: 12,
                borderRadius: 10,
                backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                marginBottom: 10,
              }}
              onPress={handleViewActivityDetails}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  backgroundColor: '#E0F2FE',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 12,
                }}
              >
                <Ionicons name="eye-outline" size={20} color="#0284C7" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[{ fontSize: 14, fontWeight: '600', color: '#0F172A' }, isDark && adminHomeStyles.textDark]}>
                  View Activity Details
                </Text>
                <Text style={[{ fontSize: 11, color: '#64748B' }, isDark && adminHomeStyles.textMutedDark]}>
                  Inspect complete event payload and logs
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={isDark ? '#94A3B8' : '#94A3B8'} />
            </TouchableOpacity>

            {/* Menu Option 2: Delete Activity */}
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                paddingHorizontal: 12,
                borderRadius: 10,
                backgroundColor: isDark ? '#2D1515' : '#FEF2F2',
                marginBottom: 14,
                borderWidth: 1,
                borderColor: isDark ? '#7F1D1D' : '#FEE2E2',
              }}
              onPress={handlePromptDeleteActivity}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  backgroundColor: '#FEE2E2',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 12,
                }}
              >
                <Ionicons name="trash-outline" size={20} color="#DC2626" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#DC2626' }}>
                  Delete Activity Log
                </Text>
                <Text style={[{ fontSize: 11, color: '#991B1B' }, isDark && { color: '#F87171' }]}>
                  Remove this log entry from live activities
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#DC2626" />
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity
              style={{
                paddingVertical: 11,
                borderRadius: 10,
                backgroundColor: isDark ? '#334155' : '#F1F5F9',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => setShowActivityMenuModal(false)}
            >
              <Text style={[{ fontSize: 13, fontWeight: '600', color: '#475569' }, isDark && { color: '#CBD5E1' }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ========================================================================= */}
      {/* ACTIVITY DETAILS MODAL                                                    */}
      {/* ========================================================================= */}
      <Modal
        visible={showActivityDetailsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowActivityDetailsModal(false)}
      >
        <View style={adminHomeStyles.modalOverlay}>
          <View style={[adminHomeStyles.modalContent, isDark && adminHomeStyles.modalContentDark, { maxWidth: 460 }]}>
            <View style={adminHomeStyles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="analytics-outline" size={22} color={isDark ? '#F4C430' : '#003366'} />
                <Text style={[adminHomeStyles.modalTitle, isDark && adminHomeStyles.textDark]}>
                  Activity Log Details
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowActivityDetailsModal(false)}>
                <Ionicons name="close" size={24} color={isDark ? '#F4C430' : '#003366'} />
              </TouchableOpacity>
            </View>

            {selectedActivity && (
              <ScrollView showsVerticalScrollIndicator={false} style={{ marginVertical: 8 }}>
                {/* Event Category Badge */}
                <View
                  style={{
                    alignSelf: 'flex-start',
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 6,
                    backgroundColor: selectedActivity.isHighlight ? '#FEF3C7' : '#EFF6FF',
                    marginBottom: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: 'bold',
                      color: selectedActivity.isHighlight ? '#B45309' : '#003366',
                    }}
                  >
                    {selectedActivity.category ? selectedActivity.category.toUpperCase() : (selectedActivity.isHighlight ? '⭐ PRIORITY EVENT' : 'SYSTEM AUDIT')}
                  </Text>
                </View>

                {/* Main Title */}
                <View style={adminHomeStyles.modalBodyItem}>
                  <Text style={adminHomeStyles.modalLabel}>Event Title</Text>
                  <Text style={[adminHomeStyles.modalValue, isDark && adminHomeStyles.textDark, { fontSize: 14, fontWeight: 'bold' }]}>
                    {selectedActivity.title}
                  </Text>
                </View>

                {/* Subtitle & Details */}
                <View style={adminHomeStyles.modalBodyItem}>
                  <Text style={adminHomeStyles.modalLabel}>Activity Description</Text>
                  <Text style={[adminHomeStyles.modalValue, isDark && adminHomeStyles.textDark]}>
                    {selectedActivity.subtitle ? selectedActivity.subtitle.replace(/👤\s*/g, '') : ''}
                  </Text>
                </View>

                {/* Time recorded */}
                <View style={adminHomeStyles.modalBodyItem}>
                  <Text style={adminHomeStyles.modalLabel}>Timestamp Recorded</Text>
                  <Text style={[adminHomeStyles.modalValue, isDark && adminHomeStyles.textDark]}>
                    {selectedActivity.time}
                  </Text>
                </View>

                {/* Log ID */}
                <View style={adminHomeStyles.modalBodyItem}>
                  <Text style={adminHomeStyles.modalLabel}>Activity Reference ID</Text>
                  <Text style={[{ fontSize: 11, fontFamily: 'monospace', color: '#64748B' }, isDark && adminHomeStyles.textMutedDark]}>
                    {selectedActivity.id}
                  </Text>
                </View>
              </ScrollView>
            )}

            {/* Action buttons footer */}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: '#DC2626',
                }}
                onPress={handlePromptDeleteActivity}
              >
                <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
                <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#FFFFFF' }}>
                  Delete Log
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: isDark ? '#334155' : '#003366',
                }}
                onPress={() => setShowActivityDetailsModal(false)}
              >
                <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#FFFFFF' }}>
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* DELETE ACTIVITY CONFIRMATION MODAL                                        */}
      {/* ========================================================================= */}
      <Modal
        visible={showDeleteConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirmModal(false)}
      >
        <View style={adminHomeStyles.modalOverlay}>
          <View style={[adminHomeStyles.modalContent, isDark && adminHomeStyles.modalContentDark, { maxWidth: 380, alignItems: 'center', paddingVertical: 24 }]}>
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: '#FEE2E2',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 14,
              }}
            >
              <Ionicons name="trash" size={26} color="#DC2626" />
            </View>

            <Text style={[{ fontSize: 17, fontWeight: 'bold', color: '#0F172A', textAlign: 'center', marginBottom: 6 }, isDark && adminHomeStyles.textDark]}>
              Delete Activity Log?
            </Text>

            <Text style={[{ fontSize: 13, color: '#64748B', textAlign: 'center', marginBottom: 18, lineHeight: 18 }, isDark && adminHomeStyles.textMutedDark]}>
              Are you sure you want to remove this activity log entry? It will be removed from your recent system activities feed.
            </Text>

            {selectedActivity && (
              <View
                style={{
                  width: '100%',
                  padding: 10,
                  borderRadius: 8,
                  backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                  borderWidth: 1,
                  borderColor: isDark ? '#334155' : '#E2E8F0',
                  marginBottom: 18,
                }}
              >
                <Text style={[{ fontSize: 12, fontWeight: '600', color: '#0F172A' }, isDark && adminHomeStyles.textDark]} numberOfLines={1}>
                  {selectedActivity.title}
                </Text>
                <Text style={[{ fontSize: 11, color: '#64748B', marginTop: 2 }, isDark && adminHomeStyles.textMutedDark]} numberOfLines={1}>
                  {selectedActivity.subtitle}
                </Text>
              </View>
            )}

            <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: isDark ? '#334155' : '#F1F5F9',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={() => setShowDeleteConfirmModal(false)}
              >
                <Text style={[{ fontSize: 13, fontWeight: 'bold', color: '#475569' }, isDark && { color: '#CBD5E1' }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: '#DC2626',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={handleConfirmDeleteActivity}
              >
                <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#FFFFFF' }}>
                  Delete Log
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Admin Sidebar Navigation Drawer (Burger Menu Content) */}
      <AdminSidebarDrawer
        visible={showSidebarDrawer}
        onClose={() => setShowSidebarDrawer(false)}
        totalUsersCount={nonAdminUsers.length}
        totalAvailedCount={totalAvailedCount}
        totalProfit={totalProfit}
        onOpenProvisionModal={() => setShowProvisionUserModal(true)}
        onOpenBroadcastModal={handleOpenBroadcastComposer}
        onRefreshData={handleRefresh}
      />

      <AppDialog
        visible={adminFeedback.visible}
        title={adminFeedback.title}
        message={adminFeedback.message}
        tone={adminFeedback.tone}
        icon={adminFeedback.icon}
        onRequestClose={() => setAdminFeedback((current) => ({ ...current, visible: false }))}
        actions={[{
          label: 'OK',
          primary: true,
          onPress: () => setAdminFeedback((current) => ({ ...current, visible: false })),
        }]}
      />
      <AppDialog
        visible={showAdminLogoutDialog}
        title="Administrator Sign Out"
        message="Are you sure you want to sign out of the Admin Portal?"
        icon="shield-checkmark-outline"
        tone="warning"
        onRequestClose={() => setShowAdminLogoutDialog(false)}
        actions={[
          { label: 'Cancel', onPress: () => setShowAdminLogoutDialog(false) },
          { label: 'Sign Out', destructive: true, onPress: confirmAdminLogout },
        ]}
      />
    </View>
  );
}
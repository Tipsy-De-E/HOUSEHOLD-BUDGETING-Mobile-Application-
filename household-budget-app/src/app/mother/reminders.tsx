// src/app/mother/reminders.tsx
import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  RefreshControl,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerChangeEvent } from '@react-native-community/datetimepicker';
import { remindersStyles } from '../../components/mother-css/remindersStyles';
import { supabase } from '../../../lib/supabase';
import { AddTransactionModal } from './AddTransactionModal';
import { CalendarTrackerModal } from './CalendarTrackerModal';
import { SidebarDrawer } from './SidebarDrawer';
import { useAppTheme } from '../../context/ThemeContext';
import { AppDialog } from '../../components/ui/AppDialog';

interface BillItem {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  category: string;
  isPaid: boolean;
  notes?: string;
}

interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  category: string;
}

const DEFAULT_BILLS: BillItem[] = [];
const DEFAULT_GOALS: SavingsGoal[] = [];

export default function MotherRemindersScreen() {
  const router = useRouter();
  const { isDarkMode, theme } = useAppTheme();
  const [activeTab, setActiveTab] = useState<'bills' | 'savings'>('bills');
  const [bills, setBills] = useState<BillItem[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showSidebarDrawer, setShowSidebarDrawer] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Modal States
  const [showAddBillModal, setShowAddBillModal] = useState(false);
  const [showBillSuccessDialog, setShowBillSuccessDialog] = useState(false);
  const [billSuccessMessage, setBillSuccessMessage] = useState('');
  const [newBillTitle, setNewBillTitle] = useState('');
  const [newBillAmount, setNewBillAmount] = useState('');
  const [newBillDueDate, setNewBillDueDate] = useState('');
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const [newBillNotes, setNewBillNotes] = useState('');

  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [showGoalSuccessDialog, setShowGoalSuccessDialog] = useState(false);
  const [goalSuccessMessage, setGoalSuccessMessage] = useState('');
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalInitial, setNewGoalInitial] = useState('');

  const [showDepositModal, setShowDepositModal] = useState(false);
  const [selectedGoalForDeposit, setSelectedGoalForDeposit] = useState<SavingsGoal | null>(null);
  const [depositAmount, setDepositAmount] = useState('');

  const handleDueDateValueChange = (_event: DateTimePickerChangeEvent, selectedDate: Date) => {
    if (selectedDate) {
      setNewBillDueDate(selectedDate.toISOString().split('T')[0]);
    }
  };

  const handleDueDateDismiss = () => setShowDueDatePicker(false);
  const handleDueDateNeutralButton = () => setShowDueDatePicker(false);

  const sanitizeBills = (rawList: BillItem[]): BillItem[] => {
    const map = new Map<string, BillItem>();
    rawList.forEach((b) => {
      const key = `${b.title.trim().toLowerCase()}::${b.dueDate}`;
      const existing = map.get(key);
      if (!existing) {
        map.set(key, b);
      } else if (existing.id.startsWith('bill-') && !b.id.startsWith('bill-')) {
        map.set(key, b);
      }
    });
    return Array.from(map.values());
  };

  const sanitizeGoals = (rawList: SavingsGoal[]): SavingsGoal[] => {
    const map = new Map<string, SavingsGoal>();
    rawList.forEach((g) => {
      const key = g.title.trim().toLowerCase();
      const existing = map.get(key);
      if (!existing) {
        map.set(key, g);
      } else if (existing.id.startsWith('goal-') && !g.id.startsWith('goal-')) {
        map.set(key, g);
      }
    });
    return Array.from(map.values());
  };

  // Load Persisted Data directly from Supabase / AsyncStorage without resurrecting deleted items
  const loadData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // 1. Load Bills from Supabase
      if (user) {
        const { data: billData, error: billErr } = await supabase
          .from('bills')
          .select('*')
          .eq('user_id', user.id)
          .order('due_date', { ascending: true });

        if (!billErr && billData) {
          const mappedBills: BillItem[] = billData.map((b: any) => ({
            id: b.id,
            title: b.title,
            amount: Number(b.amount),
            dueDate: b.due_date,
            category: b.category,
            isPaid: Boolean(b.is_paid),
            notes: b.notes || '',
          }));
          const cleanBills = sanitizeBills(mappedBills);
          setBills(cleanBills);
          await AsyncStorage.setItem('household_bills', JSON.stringify(cleanBills));
        } else {
          const savedBills = await AsyncStorage.getItem('household_bills');
          if (savedBills) {
            setBills(sanitizeBills(JSON.parse(savedBills)));
          }
        }

        // 2. Load Goals from Supabase
        const { data: goalData, error: goalErr } = await supabase
          .from('savings_goals')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (!goalErr && goalData) {
          const mappedGoals: SavingsGoal[] = goalData.map((g: any) => ({
            id: g.id,
            title: g.title,
            targetAmount: Number(g.target_amount),
            currentAmount: Number(g.current_amount),
            targetDate: g.target_date,
            category: g.category,
          }));
          const cleanGoals = sanitizeGoals(mappedGoals);
          setGoals(cleanGoals);
          await AsyncStorage.setItem('household_savings_goals', JSON.stringify(cleanGoals));
        } else {
          const savedGoals = await AsyncStorage.getItem('household_savings_goals');
          if (savedGoals) {
            setGoals(sanitizeGoals(JSON.parse(savedGoals)));
          }
        }
      } else {
        const savedBills = await AsyncStorage.getItem('household_bills');
        if (savedBills) setBills(sanitizeBills(JSON.parse(savedBills)));
        const savedGoals = await AsyncStorage.getItem('household_savings_goals');
        if (savedGoals) setGoals(sanitizeGoals(JSON.parse(savedGoals)));
      }
    } catch (err) {
      console.log('Error loading reminders from Supabase:', err);
      const savedBills = await AsyncStorage.getItem('household_bills');
      if (savedBills) setBills(sanitizeBills(JSON.parse(savedBills)));
      const savedGoals = await AsyncStorage.getItem('household_savings_goals');
      if (savedGoals) setGoals(sanitizeGoals(JSON.parse(savedGoals)));
    }
  }, []);

  // useFocusEffect for auto-refresh
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = async () => {
    setShowLogoutDialog(false);
    await supabase.auth.signOut();
    router.replace('/');
  };

  // Toggle Bill Paid Status
  const handleToggleBillPaid = async (billId: string) => {
    const targetBill = bills.find((b) => b.id === billId);
    const newPaidStatus = targetBill ? !targetBill.isPaid : true;

    const updated = bills.map((b) => (b.id === billId ? { ...b, isPaid: newPaidStatus } : b));
    setBills(updated);
    await AsyncStorage.setItem('household_bills', JSON.stringify(updated));

    try {
      await supabase
        .from('bills')
        .update({ is_paid: newPaidStatus })
        .eq('id', billId);
    } catch (e) {
      console.log('Error updating bill paid status in Supabase:', e);
    }
  };

  // Delete Bill Reminder
  const handleDeleteBill = (billId: string, billTitle: string) => {
    Alert.alert(
      'Delete Reminder',
      `Are you sure you want to delete "${billTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updated = bills.filter((b) => b.id !== billId);
            setBills(updated);
            await AsyncStorage.setItem('household_bills', JSON.stringify(updated));
            try {
              await supabase.from('bills').delete().eq('id', billId);
            } catch (e) {
              console.log('Error deleting bill in Supabase:', e);
            }
          },
        },
      ]
    );
  };

  // Add Bill Handler
  const handleAddBill = async () => {
    if (!newBillTitle.trim()) {
      Alert.alert('Required Field', 'Please enter a bill title.');
      return;
    }
    const amt = parseFloat(newBillAmount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }
    const due = newBillDueDate.trim() || new Date().toISOString().split('T')[0];

    const newBill: BillItem = {
      id: `bill-${Date.now()}`,
      title: newBillTitle.trim(),
      amount: amt,
      dueDate: due,
      category: 'Bills',
      isPaid: false,
      notes: newBillNotes.trim(),
    };

    const updated = [newBill, ...bills];
    setBills(updated);
    await AsyncStorage.setItem('household_bills', JSON.stringify(updated));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: inserted } = await supabase
        .from('bills')
        .insert({
          user_id: user ? user.id : null,
          title: newBill.title,
          amount: newBill.amount,
          due_date: newBill.dueDate,
          category: newBill.category,
          is_paid: false,
          notes: newBill.notes,
        })
        .select()
        .single();

      if (inserted) {
        const syncedBills = updated.map((b) => (b.id === newBill.id ? { ...b, id: inserted.id } : b));
        setBills(syncedBills);
        await AsyncStorage.setItem('household_bills', JSON.stringify(syncedBills));
      }
    } catch (e) {
      console.log('Supabase add bill error:', e);
    }

    setBillSuccessMessage(`Your bill reminder is scheduled for ${due}.`);
    setShowAddBillModal(false);
    setNewBillTitle('');
    setNewBillAmount('');
    setNewBillDueDate('');
    setNewBillNotes('');
    setShowBillSuccessDialog(true);
  };

  // Add Savings Goal Handler
  const handleAddGoal = async () => {
    if (!newGoalTitle.trim()) {
      Alert.alert('Required Field', 'Please enter a goal title.');
      return;
    }
    const target = parseFloat(newGoalTarget);
    if (isNaN(target) || target <= 0) {
      Alert.alert('Invalid Target', 'Please enter a valid target amount.');
      return;
    }
    const initial = parseFloat(newGoalInitial) || 0;

    const newGoal: SavingsGoal = {
      id: `goal-${Date.now()}`,
      title: newGoalTitle.trim(),
      targetAmount: target,
      currentAmount: initial,
      category: 'Savings',
    };

    const updated = [newGoal, ...goals];
    setGoals(updated);
    await AsyncStorage.setItem('household_savings_goals', JSON.stringify(updated));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: inserted } = await supabase
        .from('savings_goals')
        .insert({
          user_id: user ? user.id : null,
          title: newGoal.title,
          target_amount: newGoal.targetAmount,
          current_amount: newGoal.currentAmount,
          category: newGoal.category,
        })
        .select()
        .single();

      if (inserted) {
        const syncedGoals = updated.map((g) => (g.id === newGoal.id ? { ...g, id: inserted.id } : g));
        setGoals(syncedGoals);
        await AsyncStorage.setItem('household_savings_goals', JSON.stringify(syncedGoals));
      }
    } catch (e) {
      console.log('Supabase add savings goal error:', e);
    }

    // If an initial deposit was entered, automatically record an Expense transaction under 'Savings' to deduct from household balance
    if (initial > 0) {
      const initialDepositTx = {
        id: `tx-${Date.now()}`,
        title: `Initial Deposit: ${newGoal.title}`,
        type: 'expense' as const,
        amount: initial,
        category: 'Savings',
        description: `Initial savings allocation for "${newGoal.title}"`,
        date: new Date().toISOString().split('T')[0],
      };

      try {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from('transactions').insert({
          user_id: user ? user.id : null,
          title: initialDepositTx.title,
          type: initialDepositTx.type,
          amount: initialDepositTx.amount,
          category: initialDepositTx.category,
          description: initialDepositTx.description,
          date: initialDepositTx.date,
        });

        const cachedStr = await AsyncStorage.getItem('@household_transactions_v2');
        const list = cachedStr ? JSON.parse(cachedStr) : [];
        const updatedList = [initialDepositTx, ...list];
        await AsyncStorage.setItem('@household_transactions_v2', JSON.stringify(updatedList));
        await AsyncStorage.setItem('cached_transactions', JSON.stringify(updatedList));
      } catch (txErr) {
        console.log('Error creating initial deposit transaction:', txErr);
      }
    }

    setShowAddGoalModal(false);
    setNewGoalTitle('');
    setNewGoalTarget('');
    setNewGoalInitial('');
    setGoalSuccessMessage(
      initial > 0
        ? `Goal "${newGoal.title}" created with ₱ ${initial.toLocaleString()} initial deposit recorded as a Savings expense.`
        : `Goal "${newGoal.title}" created successfully!`
    );
    setShowGoalSuccessDialog(true);
  };

  // Delete Savings Goal Handler
  const handleDeleteGoal = (goalId: string, goalTitle: string) => {
    Alert.alert(
      'Delete Savings Goal',
      `Are you sure you want to delete "${goalTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updated = goals.filter((g) => g.id !== goalId);
            setGoals(updated);
            await AsyncStorage.setItem('household_savings_goals', JSON.stringify(updated));
            try {
              await supabase.from('savings_goals').delete().eq('id', goalId);
            } catch (e) {
              console.log('Error deleting goal in Supabase:', e);
            }
          },
        },
      ]
    );
  };

  // Deposit Money to Goal & automatically record Expense transaction to deduct from balance
  const handleDepositToGoal = async () => {
    if (!selectedGoalForDeposit) return;
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid deposit amount.');
      return;
    }

    const newCurrent = selectedGoalForDeposit.currentAmount + amt;
    const updated = goals.map((g) =>
      g.id === selectedGoalForDeposit.id
        ? { ...g, currentAmount: newCurrent }
        : g
    );

    setGoals(updated);
    await AsyncStorage.setItem('household_savings_goals', JSON.stringify(updated));

    try {
      await supabase
        .from('savings_goals')
        .update({ current_amount: newCurrent })
        .eq('id', selectedGoalForDeposit.id);
    } catch (e) {
      console.log('Supabase deposit update error:', e);
    }

    // Automatically record an expense transaction under 'Savings' to deduct from household balance
    const depositTx = {
      id: `tx-${Date.now()}`,
      title: `Deposit: ${selectedGoalForDeposit.title}`,
      type: 'expense' as const,
      amount: amt,
      category: 'Savings',
      description: `Deposit allocation for savings goal "${selectedGoalForDeposit.title}"`,
      date: new Date().toISOString().split('T')[0],
    };

    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('transactions').insert({
        user_id: user ? user.id : null,
        title: depositTx.title,
        type: depositTx.type,
        amount: depositTx.amount,
        category: depositTx.category,
        description: depositTx.description,
        date: depositTx.date,
      });

      const cachedStr = await AsyncStorage.getItem('@household_transactions_v2');
      const list = cachedStr ? JSON.parse(cachedStr) : [];
      const updatedList = [depositTx, ...list];
      await AsyncStorage.setItem('@household_transactions_v2', JSON.stringify(updatedList));
      await AsyncStorage.setItem('cached_transactions', JSON.stringify(updatedList));
    } catch (txErr) {
      console.log('Error creating deposit transaction:', txErr);
    }

    setShowDepositModal(false);
    setSelectedGoalForDeposit(null);
    setDepositAmount('');
    Alert.alert(
      'Deposit Successful',
      `Deposited ₱ ${amt.toLocaleString()} to "${selectedGoalForDeposit.title}"!\n\nThis has also been recorded as an expense under "Savings" to deduct from your available balance.`
    );
  };

  // Helper for due date badge
  const getDueBadgeInfo = (dueDateStr: string, isPaid: boolean) => {
    if (isPaid) {
      return { text: 'PAID', style: remindersStyles.dueBadgePaid, textColor: '#15803D' };
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDateStr);
    due.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        text: `OVERDUE (${Math.abs(diffDays)}d)`,
        style: remindersStyles.dueBadgeUrgent,
        textColor: '#B91C1C',
      };
    }
    if (diffDays === 0) {
      return { text: 'DUE TODAY', style: remindersStyles.dueBadgeUrgent, textColor: '#B91C1C' };
    }
    if (diffDays <= 3) {
      return {
        text: `Due in ${diffDays} days`,
        style: remindersStyles.dueBadgeNormal,
        textColor: '#B45309',
      };
    }
    return {
      text: `Due in ${diffDays} days`,
      style: remindersStyles.dueBadgeNormal,
      textColor: '#475569',
    };
  };

  return (
    <View style={[remindersStyles.container, isDarkMode && remindersStyles.containerDark]}>
      <View style={remindersStyles.bannerYellow} />

      {/* Uniform Header matching other mother screens */}
      <View style={[remindersStyles.header, isDarkMode && remindersStyles.headerDark]}>
        <View style={remindersStyles.headerLeft}>
          <TouchableOpacity onPress={() => setShowSidebarDrawer(true)}>
            <Ionicons name="menu" size={24} color={isDarkMode ? '#F4C430' : '#000000'} />
          </TouchableOpacity>
          <Text style={[remindersStyles.headerTitle, isDarkMode && remindersStyles.headerTitleDark]}>
            Reminders & Savings
          </Text>
        </View>

        <View style={remindersStyles.headerRight}>
          <TouchableOpacity
            onPress={() => setShowCalendarModal(true)}
            accessibilityLabel="Financial Calendar"
          >
            <Ionicons name="calendar-outline" size={22} color={isDarkMode ? '#F4C430' : '#000000'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={loadData}>
            <Ionicons name="refresh-outline" size={22} color={isDarkMode ? '#F4C430' : '#000000'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color={isDarkMode ? '#F4C430' : '#000000'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Switcher */}
      <View style={[remindersStyles.tabSwitcher, isDarkMode && remindersStyles.tabSwitcherDark]}>
        <TouchableOpacity
          style={[
            remindersStyles.tabBtn,
            activeTab === 'bills' && remindersStyles.tabBtnActive,
          ]}
          onPress={() => setActiveTab('bills')}
        >
          <Ionicons
            name="calendar-outline"
            size={16}
            color={activeTab === 'bills' ? '#FFFFFF' : isDarkMode ? '#94A3B8' : '#64748B'}
          />
          <Text
            style={[
              remindersStyles.tabBtnText,
              isDarkMode && remindersStyles.tabBtnTextDark,
              activeTab === 'bills' && remindersStyles.tabBtnTextActive,
            ]}
          >
            Bill Due Dates ({bills.filter((b) => !b.isPaid).length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            remindersStyles.tabBtn,
            activeTab === 'savings' && remindersStyles.tabBtnActive,
          ]}
          onPress={() => setActiveTab('savings')}
        >
          <Ionicons
            name="trending-up-outline"
            size={16}
            color={activeTab === 'savings' ? '#FFFFFF' : isDarkMode ? '#94A3B8' : '#64748B'}
          />
          <Text
            style={[
              remindersStyles.tabBtnText,
              isDarkMode && remindersStyles.tabBtnTextDark,
              activeTab === 'savings' && remindersStyles.tabBtnTextActive,
            ]}
          >
            Savings Goals ({goals.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={[remindersStyles.content, isDarkMode && remindersStyles.containerDark]}
        contentContainerStyle={remindersStyles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#003366']} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Interactive Calendar Quick Launch Banner */}
        <TouchableOpacity
          style={remindersStyles.calendarQuickBanner}
          onPress={() => setShowCalendarModal(true)}
        >
          <View style={remindersStyles.calendarQuickLeft}>
            <View style={remindersStyles.calendarQuickIconBox}>
              <Ionicons name="calendar" size={22} color="#003366" />
            </View>
            <View>
              <Text style={remindersStyles.calendarQuickTitle}>Financial & Reminders Calendar</Text>
              <Text style={remindersStyles.calendarQuickSubtitle}>
                View daily expense spikes & scheduled due dates
              </Text>
            </View>
          </View>
          <View style={remindersStyles.calendarQuickBtn}>
            <Text style={remindersStyles.calendarQuickBtnText}>Open ➔</Text>
          </View>
        </TouchableOpacity>

        {activeTab === 'bills' ? (
          /* BILL DUE-DATE REMINDERS SECTION */
          <View>
            <View style={remindersStyles.sectionHeader}>
              <Text style={[remindersStyles.sectionTitle, isDarkMode && remindersStyles.titleDark]}>
                Upcoming Payment Due Dates
              </Text>
              <TouchableOpacity
                style={remindersStyles.addBtn}
                onPress={() => setShowAddBillModal(true)}
              >
                <Ionicons name="add" size={16} color="#FFFFFF" />
                <Text style={remindersStyles.addBtnText}>Add Bill</Text>
              </TouchableOpacity>
            </View>

            {bills.map((bill) => {
              const badge = getDueBadgeInfo(bill.dueDate, bill.isPaid);
              return (
                <View key={bill.id} style={[remindersStyles.billCard, isDarkMode && remindersStyles.cardDark]}>
                  <View style={remindersStyles.billTopRow}>
                    <View style={remindersStyles.billLeft}>
                      <View style={remindersStyles.billIconBox}>
                        <Ionicons
                          name={
                            bill.category === 'Education'
                              ? 'school-outline'
                              : bill.category === 'Utilities'
                                ? 'flash-outline'
                                : 'receipt-outline'
                          }
                          size={22}
                          color="#003366"
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[remindersStyles.billName, isDarkMode && remindersStyles.titleDark]}>
                          {bill.title}
                        </Text>
                        <Text style={[remindersStyles.billDueDate, isDarkMode && remindersStyles.textMutedDark]}>
                          Due Date: {bill.dueDate}
                        </Text>
                        {bill.notes ? (
                          <Text style={{ fontSize: 10, color: isDarkMode ? '#94A3B8' : '#64748B', marginTop: 2 }}>
                            {bill.notes}
                          </Text>
                        ) : null}
                      </View>
                    </View>

                    <View style={remindersStyles.billRight}>
                      <Text style={[remindersStyles.billAmount, isDarkMode && remindersStyles.titleDark]}>
                        ₱ {bill.amount.toLocaleString()}
                      </Text>
                      <View style={[remindersStyles.dueBadge, badge.style]}>
                        <Text style={[remindersStyles.dueBadgeText, { color: badge.textColor }]}>
                          {badge.text}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={remindersStyles.billActionsRow}>
                    <Text
                      style={[
                        remindersStyles.billStatusText,
                        { color: bill.isPaid ? '#15803D' : '#D97706' },
                      ]}
                    >
                      Status: {bill.isPaid ? 'Paid' : 'Unpaid Reminder'}
                    </Text>

                    <View style={remindersStyles.billActionButtonsGroup}>
                      <TouchableOpacity
                        style={[
                          remindersStyles.togglePaidBtn,
                          bill.isPaid
                            ? remindersStyles.togglePaidBtnPaid
                            : remindersStyles.togglePaidBtnUnpaid,
                        ]}
                        onPress={() => handleToggleBillPaid(bill.id)}
                      >
                        <Ionicons
                          name={bill.isPaid ? 'close-circle-outline' : 'checkmark-circle'}
                          size={16}
                          color={bill.isPaid ? '#64748B' : '#15803D'}
                        />
                        <Text
                          style={[
                            remindersStyles.togglePaidBtnText,
                            bill.isPaid
                              ? remindersStyles.togglePaidBtnTextPaid
                              : remindersStyles.togglePaidBtnTextUnpaid,
                          ]}
                        >
                          {bill.isPaid ? 'Mark as Unpaid' : 'Mark as Paid'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={remindersStyles.deleteBillBtn}
                        onPress={() => handleDeleteBill(bill.id, bill.title)}
                        accessibilityLabel="Delete bill"
                      >
                        <Ionicons name="trash-outline" size={16} color="#DC2626" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          /* SAVINGS GOALS TRACKER SECTION */
          <View>
            <View style={remindersStyles.sectionHeader}>
              <Text style={[remindersStyles.sectionTitle, isDarkMode && remindersStyles.titleDark]}>
                Household Savings Goals
              </Text>
              <TouchableOpacity
                style={remindersStyles.addBtn}
                onPress={() => setShowAddGoalModal(true)}
              >
                <Ionicons name="add" size={16} color="#FFFFFF" />
                <Text style={remindersStyles.addBtnText}>New Goal</Text>
              </TouchableOpacity>
            </View>

            {goals.map((goal) => {
              const pct = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
              const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

              return (
                <View key={goal.id} style={[remindersStyles.goalCard, isDarkMode && remindersStyles.cardDark]}>
                  <View style={remindersStyles.goalTopRow}>
                    <View style={remindersStyles.goalInfo}>
                      <View style={remindersStyles.goalIconBox}>
                        <Ionicons name="shield-checkmark" size={22} color="#003366" />
                      </View>
                      <View>
                        <Text style={[remindersStyles.goalTitle, isDarkMode && remindersStyles.titleDark]}>
                          {goal.title}
                        </Text>
                        <Text style={[remindersStyles.goalTarget, isDarkMode && remindersStyles.textMutedDark]}>
                          Target:  ₱ {goal.targetAmount.toLocaleString()}
                        </Text>
                      </View>
                    </View>

                    <View style={remindersStyles.goalAmounts}>
                      <Text style={[remindersStyles.goalCurrent, isDarkMode && remindersStyles.titleDark]}>
                        ₱ {goal.currentAmount.toLocaleString()}
                      </Text>
                      <Text style={[remindersStyles.goalPct, isDarkMode && { color: '#38BDF8' }]}>
                        {pct.toFixed(0)}% Saved
                      </Text>
                    </View>
                  </View>

                  {/* Progress Bar */}
                  <View style={remindersStyles.goalProgressBarBg}>
                    <View
                      style={[
                        remindersStyles.goalProgressBarFill,
                        {
                          width: `${Math.min(100, Math.max(3, pct))}%`,
                          backgroundColor: pct >= 100 ? '#16A34A' : '#F4C430',
                        },
                      ]}
                    />
                  </View>

                  <View style={remindersStyles.goalFooter}>
                    <Text style={{ fontSize: 11, color: isDarkMode ? '#94A3B8' : '#64748B' }}>
                      {remaining === 0 ? 'Goal Reached! 🎉' : ` ₱ ${remaining.toLocaleString()} remaining`}
                    </Text>

                    <View style={remindersStyles.goalActionGroup}>
                      <TouchableOpacity
                        style={remindersStyles.depositBtn}
                        onPress={() => {
                          setSelectedGoalForDeposit(goal);
                          setShowDepositModal(true);
                        }}
                      >
                        <Ionicons name="add-circle" size={14} color="#FFFFFF" />
                        <Text style={remindersStyles.depositBtnText}>Deposit</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={remindersStyles.deleteGoalBtn}
                        onPress={() => handleDeleteGoal(goal.id, goal.title)}
                        accessibilityLabel="Delete savings goal"
                      >
                        <Ionicons name="trash-outline" size={14} color="#DC2626" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* ========================================================= */}
      {/* ADD BILL REMINDER MODAL                                   */}
      {/* ========================================================= */}
      <Modal
        visible={showAddBillModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddBillModal(false)}
      >
        <View style={remindersStyles.modalOverlay}>
          <View style={[remindersStyles.modalContent, isDarkMode && remindersStyles.modalContentDark]}>
            <View style={remindersStyles.modalHeader}>
              <Text style={[remindersStyles.modalTitle, isDarkMode && remindersStyles.titleDark]}>
                Add Bill Reminder
              </Text>
              <TouchableOpacity onPress={() => setShowAddBillModal(false)}>
                <Ionicons name="close" size={24} color={isDarkMode ? '#F4C430' : '#003366'} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[remindersStyles.inputLabel, isDarkMode && remindersStyles.inputLabelDark]}>
                Bill / Payment Title
              </Text>
              <TextInput
                style={[remindersStyles.inputField, isDarkMode && remindersStyles.inputFieldDark]}
                placeholder="e.g. Meralco Electric Bill"
                placeholderTextColor="#94A3B8"
                value={newBillTitle}
                onChangeText={setNewBillTitle}
              />

              <Text style={[remindersStyles.inputLabel, isDarkMode && remindersStyles.inputLabelDark]}>
                Amount Due ( ₱)
              </Text>
              <TextInput
                style={[remindersStyles.inputField, isDarkMode && remindersStyles.inputFieldDark]}
                placeholder="e.g. 2500"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={newBillAmount}
                onChangeText={setNewBillAmount}
              />

              <Text style={[remindersStyles.inputLabel, isDarkMode && remindersStyles.inputLabelDark]}>
                Due Date
              </Text>
              <TouchableOpacity
                style={[
                  remindersStyles.dueDateField,
                  isDarkMode && remindersStyles.inputFieldDark,
                ]}
                onPress={() => setShowDueDatePicker(true)}
                accessibilityLabel="Choose bill due date"
              >
                <View style={[remindersStyles.dueDateIconBox, isDarkMode && remindersStyles.dueDateIconBoxDark]}>
                  <Ionicons name="calendar-outline" size={20} color={isDarkMode ? '#38BDF8' : '#003366'} />
                </View>
                <View style={remindersStyles.dueDateTextGroup}>
                  <Text style={[remindersStyles.dueDateValue, isDarkMode && remindersStyles.dueDateValueDark]}>
                    {newBillDueDate || 'Choose a due date'}
                  </Text>
                  <Text style={[remindersStyles.dueDateHint, isDarkMode && remindersStyles.dueDateHintDark]}>
                    Tap to open the calendar
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={isDarkMode ? '#94A3B8' : '#64748B'} />
              </TouchableOpacity>

              {showDueDatePicker && (
                <DateTimePicker
                  value={newBillDueDate ? new Date(`${newBillDueDate}T00:00:00`) : new Date()}
                  mode="date"
                  display={Platform.OS === 'android' ? 'calendar' : 'inline'}
                  themeVariant={isDarkMode ? 'dark' : 'light'}
                  accentColor={isDarkMode ? '#38BDF8' : '#003366'}
                  minimumDate={new Date()}
                  onValueChange={handleDueDateValueChange}
                  onDismiss={handleDueDateDismiss}
                  onNeutralButtonPress={handleDueDateNeutralButton}
                />
              )}

              <Text style={[remindersStyles.inputLabel, isDarkMode && remindersStyles.inputLabelDark]}>
                Account / Notes (Optional)
              </Text>
              <TextInput
                style={[remindersStyles.inputField, isDarkMode && remindersStyles.inputFieldDark]}
                placeholder="e.g. Account # 1234567"
                placeholderTextColor="#94A3B8"
                value={newBillNotes}
                onChangeText={setNewBillNotes}
              />

              <View style={remindersStyles.modalBtnContainer}>
                <TouchableOpacity
                  style={[remindersStyles.modalCancelBtn, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#475569' }]}
                  onPress={() => setShowAddBillModal(false)}
                >
                  <Text style={[remindersStyles.modalCancelBtnText, isDarkMode && { color: '#94A3B8' }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={remindersStyles.modalSaveBtn}
                  onPress={handleAddBill}
                >
                  <Text style={remindersStyles.modalSaveBtnText}>Save Reminder</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ========================================================= */}
      {/* ADD SAVINGS GOAL MODAL                                    */}
      {/* ========================================================= */}
      <Modal
        visible={showAddGoalModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddGoalModal(false)}
      >
        <View style={remindersStyles.modalOverlay}>
          <View style={[remindersStyles.modalContent, isDarkMode && remindersStyles.modalContentDark]}>
            <View style={remindersStyles.modalHeader}>
              <Text style={[remindersStyles.modalTitle, isDarkMode && remindersStyles.titleDark]}>
                Create Savings Goal
              </Text>
              <TouchableOpacity onPress={() => setShowAddGoalModal(false)}>
                <Ionicons name="close" size={24} color={isDarkMode ? '#F4C430' : '#003366'} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[remindersStyles.inputLabel, isDarkMode && remindersStyles.inputLabelDark]}>
                Goal Name
              </Text>
              <TextInput
                style={[remindersStyles.inputField, isDarkMode && remindersStyles.inputFieldDark]}
                placeholder="e.g. Emergency Fund"
                placeholderTextColor="#94A3B8"
                value={newGoalTitle}
                onChangeText={setNewGoalTitle}
              />

              <Text style={[remindersStyles.inputLabel, isDarkMode && remindersStyles.inputLabelDark]}>
                Target Amount ( ₱)
              </Text>
              <TextInput
                style={[remindersStyles.inputField, isDarkMode && remindersStyles.inputFieldDark]}
                placeholder="e.g. 50000"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={newGoalTarget}
                onChangeText={setNewGoalTarget}
              />

              <Text style={[remindersStyles.inputLabel, isDarkMode && remindersStyles.inputLabelDark]}>
                Initial Saved Amount ( ₱)
              </Text>
              <TextInput
                style={[remindersStyles.inputField, isDarkMode && remindersStyles.inputFieldDark]}
                placeholder="e.g. 5000 (deducted from balance)"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={newGoalInitial}
                onChangeText={setNewGoalInitial}
              />

              <View style={remindersStyles.modalBtnContainer}>
                <TouchableOpacity
                  style={[remindersStyles.modalCancelBtn, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#475569' }]}
                  onPress={() => setShowAddGoalModal(false)}
                >
                  <Text style={[remindersStyles.modalCancelBtnText, isDarkMode && { color: '#94A3B8' }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={remindersStyles.modalSaveBtn}
                  onPress={handleAddGoal}
                >
                  <Text style={remindersStyles.modalSaveBtnText}>Create Goal</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ========================================================= */}
      {/* DEPOSIT TO GOAL MODAL                                     */}
      {/* ========================================================= */}
      <Modal
        visible={showDepositModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDepositModal(false)}
      >
        <View style={remindersStyles.modalOverlay}>
          <View style={[remindersStyles.modalContent, isDarkMode && remindersStyles.modalContentDark]}>
            <View style={remindersStyles.modalHeader}>
              <Text style={[remindersStyles.modalTitle, isDarkMode && remindersStyles.titleDark]}>
                Deposit to {selectedGoalForDeposit?.title}
              </Text>
              <TouchableOpacity onPress={() => setShowDepositModal(false)}>
                <Ionicons name="close" size={24} color={isDarkMode ? '#F4C430' : '#003366'} />
              </TouchableOpacity>
            </View>

            <Text style={[remindersStyles.inputLabel, isDarkMode && remindersStyles.inputLabelDark]}>
              Deposit Amount ( ₱)
            </Text>
            <TextInput
              style={[remindersStyles.inputField, isDarkMode && remindersStyles.inputFieldDark]}
              placeholder="e.g. 1000"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={depositAmount}
              onChangeText={setDepositAmount}
            />

            <View style={remindersStyles.modalBtnContainer}>
              <TouchableOpacity
                style={[remindersStyles.modalCancelBtn, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#475569' }]}
                onPress={() => setShowDepositModal(false)}
              >
                <Text style={[remindersStyles.modalCancelBtnText, isDarkMode && { color: '#94A3B8' }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={remindersStyles.modalSaveBtn}
                onPress={handleDepositToGoal}
              >
                <Text style={remindersStyles.modalSaveBtnText}>Confirm Deposit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================= */}
      {/* GLOBAL ADD TRANSACTION MODAL (Expense / Income)           */}
      {/* ========================================================= */}
      <AddTransactionModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={(_newTx) => {
          loadData();
        }}
      />

      {/* ========================================================= */}
      {/* FINANCIAL & REMINDERS CALENDAR MODAL                      */}
      {/* ========================================================= */}
      <CalendarTrackerModal
        visible={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        onRefreshData={loadData}
      />

      {/* ========================================================= */}
      {/* BOTTOM NAVIGATION BAR                                     */}
      {/* ========================================================= */}
      <View style={[remindersStyles.bottomNav, isDarkMode && remindersStyles.bottomNavDark]}>
        <TouchableOpacity
          style={remindersStyles.navItem}
          onPress={() => router.push('/mother/home')}
        >
          <Ionicons name="home-outline" size={22} color={isDarkMode ? '#94A3B8' : '#757575'} />
          <Text style={[remindersStyles.navText, isDarkMode && remindersStyles.navTextDark]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={remindersStyles.navItem}
          onPress={() => router.push('/mother/reports')}
        >
          <Ionicons name="bar-chart-outline" size={22} color={isDarkMode ? '#94A3B8' : '#757575'} />
          <Text style={[remindersStyles.navText, isDarkMode && remindersStyles.navTextDark]}>Reports</Text>
        </TouchableOpacity>

        {/* Global Add FAB */}
        <TouchableOpacity
          style={remindersStyles.fab}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={28} color="#F4C430" />
        </TouchableOpacity>

        <TouchableOpacity
          style={remindersStyles.navItem}
          onPress={() => router.push('/mother/budget')}
        >
          <Ionicons name="wallet-outline" size={22} color={isDarkMode ? '#94A3B8' : '#757575'} />
          <Text style={[remindersStyles.navText, isDarkMode && remindersStyles.navTextDark]}>Budget</Text>
        </TouchableOpacity>

        <TouchableOpacity style={remindersStyles.navItem}>
          <Ionicons name="alarm" size={22} color={isDarkMode ? '#38BDF8' : '#003366'} />
          <Text style={[remindersStyles.navText, isDarkMode ? remindersStyles.navTextActiveDark : remindersStyles.navTextActive]}>
            Reminders
          </Text>
        </TouchableOpacity>
      </View>

      {/* ========================================================= */}
      {/* SIDEBAR DRAWER NAVIGATION                                 */}
      {/* ========================================================= */}
      <SidebarDrawer
        visible={showSidebarDrawer}
        onClose={() => setShowSidebarDrawer(false)}
      />

      <AppDialog
        visible={showBillSuccessDialog}
        title="Reminder Saved"
        message={billSuccessMessage}
        icon="calendar-outline"
        tone="success"
        onRequestClose={() => setShowBillSuccessDialog(false)}
        actions={[{
          label: 'Done',
          primary: true,
          onPress: () => setShowBillSuccessDialog(false),
        }]}
      />

      <AppDialog
        visible={showGoalSuccessDialog}
        title="Savings Goal Created"
        message={goalSuccessMessage}
        icon="trophy-outline"
        tone="success"
        onRequestClose={() => setShowGoalSuccessDialog(false)}
        actions={[{
          label: 'Done',
          primary: true,
          onPress: () => setShowGoalSuccessDialog(false),
        }]}
      />
      <AppDialog
        visible={showLogoutDialog}
        title="Sign Out"
        message="Are you sure you want to sign out of your Household Portal?"
        icon="log-out-outline"
        tone="warning"
        onRequestClose={() => setShowLogoutDialog(false)}
        actions={[
          { label: 'Cancel', onPress: () => setShowLogoutDialog(false) },
          { label: 'Sign Out', destructive: true, onPress: confirmLogout },
        ]}
      />
    </View>
  );
}

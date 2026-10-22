// src/app/mother/budget.tsx
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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { budgetStyles } from '../../components/mother-css/budgetStyles';
import { supabase } from '../../../lib/supabase';
import { AddTransactionModal } from './AddTransactionModal';
import { CalendarTrackerModal } from './CalendarTrackerModal';
import { SidebarDrawer } from './SidebarDrawer';
import { useAppTheme } from '../../context/ThemeContext';
import { AppDialog } from '../../components/ui/AppDialog';
import { normalizeCategoryIcon } from '../../utils/categoryIcons';

interface TransactionItem {
  id: string;
  title: string;
  type: 'expense' | 'income';
  amount: number;
  category: string;
  date: string;
  description?: string;
}

interface CategoryBudget {
  category: string;
  limit: number;
  icon: keyof typeof Ionicons.glyphMap;
}

const DEFAULT_CATEGORY_BUDGETS: CategoryBudget[] = [
  { category: 'Food & Dining', limit: 8000, icon: 'restaurant-outline' },
  { category: 'Groceries', limit: 10000, icon: 'cart-outline' },
  { category: 'Utilities', limit: 6000, icon: 'flash-outline' },
  { category: 'Transportation', limit: 4000, icon: 'bus-outline' },
  { category: 'Education', limit: 5000, icon: 'school-outline' },
  { category: 'Healthcare', limit: 3000, icon: 'medkit-outline' },
  { category: 'Shopping', limit: 3000, icon: 'pricetag-outline' },
  { category: 'Personal Care', limit: 2000, icon: 'person-outline' },
  { category: 'Other', limit: 2000, icon: 'ellipsis-horizontal-circle-outline' },
];

export default function MotherBudgetScreen() {
  const router = useRouter();
  const { isDarkMode, theme } = useAppTheme();
  const [period, setPeriod] = useState<'monthly' | 'weekly'>('monthly');
  const [totalBudgetLimit, setTotalBudgetLimit] = useState<number>(38000);
  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudget[]>(DEFAULT_CATEGORY_BUDGETS);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showSidebarDrawer, setShowSidebarDrawer] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Modal State for Setting Limits
  const [showEditBudgetModal, setShowEditBudgetModal] = useState(false);
  const [newTotalLimitInput, setNewTotalLimitInput] = useState('');
  const [selectedCatForEdit, setSelectedCatForEdit] = useState<CategoryBudget | null>(null);
  const [catLimitInput, setCatLimitInput] = useState('');

  // Modal State for Viewing Category Expenses
  const [selectedCatForViewExpenses, setSelectedCatForViewExpenses] = useState<CategoryBudget | null>(null);

  // Load budgets & transactions with dual persistence
  const loadData = useCallback(async () => {
    try {
      // 1. Load from AsyncStorage first as immediate local cache
      const savedTotal = await AsyncStorage.getItem('household_total_budget');
      if (savedTotal && !isNaN(Number(savedTotal))) {
        setTotalBudgetLimit(Number(savedTotal));
      }
      const savedCats = await AsyncStorage.getItem('household_category_budgets');
      if (savedCats) {
        try {
          const parsed = JSON.parse(savedCats);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const normalized = parsed.map((c: any) => ({
              ...c,
              icon: normalizeCategoryIcon(c.icon, c.category),
            }));
            setCategoryBudgets(normalized);
          }
        } catch { }
      }

      // 2. Fetch and sync from Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: budgetData, error: bErr } = await supabase
          .from('budgets')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!bErr && budgetData) {
          if (budgetData.total_limit) {
            const num = Number(budgetData.total_limit);
            setTotalBudgetLimit(num);
            await AsyncStorage.setItem('household_total_budget', num.toString());
          }
          if (budgetData.category_limits && Array.isArray(budgetData.category_limits)) {
            const normalized = budgetData.category_limits.map((c: any) => ({
              ...c,
              icon: normalizeCategoryIcon(c.icon, c.category),
            }));
            setCategoryBudgets(normalized);
            await AsyncStorage.setItem('household_category_budgets', JSON.stringify(normalized));
          }
        }
      }

      // 3. Fetch transactions for calculation
      let query = supabase.from('transactions').select('*');
      if (user) {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (!error && data) {
        const unique = Array.from(new Map(data.map((t: any) => [t.id, t])).values());
        const mapped: TransactionItem[] = unique.map((t: any) => ({
          id: t.id,
          title: t.title,
          type: t.type as 'expense' | 'income',
          amount: Number(t.amount) || 0,
          category: t.category || 'General',
          date: t.date ? new Date(t.date).toISOString().split('T')[0] : '',
          description: t.description || '',
        }));
        setTransactions(mapped);
        await AsyncStorage.setItem('cached_transactions', JSON.stringify(mapped));
        await AsyncStorage.setItem('@household_transactions_v2', JSON.stringify(mapped));
        return;
      }

      const cached = await AsyncStorage.getItem('@household_transactions_v2') ||
        await AsyncStorage.getItem('cached_transactions');
      if (cached) {
        setTransactions(JSON.parse(cached));
      }
    } catch (err) {
      console.log('Error loading budget data:', err);
    }
  }, []);

  // Automatically refresh when screen comes into focus
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

  // Filter transactions according to period
  const periodExpenses = useMemo(() => {
    const today = new Date();
    return transactions.filter((t) => {
      if (t.type !== 'expense') return false;
      const txDate = new Date(t.date);
      if (period === 'weekly') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(today.getDate() - 7);
        return txDate >= oneWeekAgo && txDate <= today;
      } else {
        return (
          txDate.getFullYear() === today.getFullYear() &&
          txDate.getMonth() === today.getMonth()
        );
      }
    });
  }, [transactions, period]);

  // Adjust total budget limit based on period
  const activeBudgetLimit = period === 'weekly' ? Math.round(totalBudgetLimit / 4) : totalBudgetLimit;

  // Calculate total spent
  const totalSpent = useMemo(() => {
    return periodExpenses.reduce((sum, t) => sum + t.amount, 0);
  }, [periodExpenses]);

  const remainingBudget = activeBudgetLimit - totalSpent;
  const spendingPercentage = activeBudgetLimit > 0 ? (totalSpent / activeBudgetLimit) * 100 : 0;

  // Category spending map
  const categorySpentMap = useMemo(() => {
    const map: Record<string, number> = {};
    periodExpenses.forEach((t) => {
      const catKey = t.category.trim();
      map[catKey] = (map[catKey] || 0) + t.amount;
    });
    return map;
  }, [periodExpenses]);

  // Save Total Budget Limit
  const handleSaveBudgetLimit = async () => {
    const num = parseFloat(newTotalLimitInput.replace(/[^0-9.]/g, ''));
    if (isNaN(num) || num <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid budget amount.');
      return;
    }
    const finalLimit = period === 'weekly' ? num * 4 : num;
    setTotalBudgetLimit(finalLimit);
    await AsyncStorage.setItem('household_total_budget', finalLimit.toString());

    // Save to Supabase
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: existing } = await supabase
          .from('budgets')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (existing) {
          await supabase.from('budgets').update({
            total_limit: finalLimit,
            period: period,
            category_limits: categoryBudgets,
            updated_at: new Date().toISOString(),
          }).eq('id', existing.id);
        } else {
          await supabase.from('budgets').insert({
            user_id: user.id,
            period: period,
            total_limit: finalLimit,
            category_limits: categoryBudgets,
            updated_at: new Date().toISOString(),
          });
        }
      }
    } catch (e) {
      console.log('Supabase budget save error:', e);
    }

    setShowEditBudgetModal(false);
    Alert.alert('Budget Updated', `Overall budget limit set to ₱ ${finalLimit.toLocaleString()}.`);
  };

  // Save Category Budget Limit
  const handleSaveCategoryLimit = async () => {
    if (!selectedCatForEdit) return;
    const num = parseFloat(catLimitInput.replace(/[^0-9.]/g, ''));
    if (isNaN(num) || num <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid category limit.');
      return;
    }
    const finalCatLimit = period === 'weekly' ? num * 4 : num;
    const updated = categoryBudgets.map((cb) =>
      cb.category === selectedCatForEdit.category ? { ...cb, limit: finalCatLimit } : cb
    );
    setCategoryBudgets(updated);
    await AsyncStorage.setItem('household_category_budgets', JSON.stringify(updated));

    // Save to Supabase
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: existing } = await supabase
          .from('budgets')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (existing) {
          await supabase.from('budgets').update({
            total_limit: totalBudgetLimit,
            category_limits: updated,
            updated_at: new Date().toISOString(),
          }).eq('id', existing.id);
        } else {
          await supabase.from('budgets').insert({
            user_id: user.id,
            period: period,
            total_limit: totalBudgetLimit,
            category_limits: updated,
            updated_at: new Date().toISOString(),
          });
        }
      }
    } catch (e) {
      console.log('Supabase category budget save error:', e);
    }

    setSelectedCatForEdit(null);
    Alert.alert('Limit Updated', `${selectedCatForEdit.category} limit set to ₱ ${finalCatLimit.toLocaleString()}.`);
  };

  // Filter expenses for selected category view modal
  const selectedCatExpenses = useMemo(() => {
    if (!selectedCatForViewExpenses) return [];
    return periodExpenses.filter(
      (t) => t.category.trim().toLowerCase() === selectedCatForViewExpenses.category.trim().toLowerCase()
    );
  }, [selectedCatForViewExpenses, periodExpenses]);

  return (
    <View style={[budgetStyles.container, isDarkMode && budgetStyles.containerDark]}>
      <View style={budgetStyles.bannerYellow} />

      {/* Uniform Header matching Home & Reports screens */}
      <View style={[budgetStyles.header, isDarkMode && budgetStyles.headerDark]}>
        <View style={budgetStyles.headerLeft}>
          <TouchableOpacity onPress={() => setShowSidebarDrawer(true)}>
            <Ionicons name="menu" size={24} color={isDarkMode ? "#F4C430" : "#000000"} />
          </TouchableOpacity>
          <Text style={[budgetStyles.headerTitle, isDarkMode && budgetStyles.headerTitleDark]}>Budget Planner</Text>
        </View>

        <View style={budgetStyles.headerRight}>
          <TouchableOpacity
            onPress={() => setShowCalendarModal(true)}
            accessibilityLabel="Financial Calendar"
          >
            <Ionicons name="calendar-outline" size={22} color={isDarkMode ? "#F4C430" : "#000000"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={loadData}>
            <Ionicons name="refresh-outline" size={22} color={isDarkMode ? "#F4C430" : "#000000"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color={isDarkMode ? "#F4C430" : "#000000"} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Period Toggle (Monthly vs Weekly) */}
      <View style={[budgetStyles.periodToggleContainer, isDarkMode && budgetStyles.periodToggleContainerDark]}>
        <TouchableOpacity
          style={[
            budgetStyles.periodToggleBtn,
            period === 'monthly' && budgetStyles.periodToggleBtnActive,
          ]}
          onPress={() => setPeriod('monthly')}
        >
          <Text
            style={[
              budgetStyles.periodToggleText,
              isDarkMode && budgetStyles.periodToggleTextDark,
              period === 'monthly' && budgetStyles.periodToggleTextActive,
            ]}
          >
            Monthly Budget
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            budgetStyles.periodToggleBtn,
            period === 'weekly' && budgetStyles.periodToggleBtnActive,
          ]}
          onPress={() => setPeriod('weekly')}
        >
          <Text
            style={[
              budgetStyles.periodToggleText,
              isDarkMode && budgetStyles.periodToggleTextDark,
              period === 'weekly' && budgetStyles.periodToggleTextActive,
            ]}
          >
            Weekly Budget
          </Text>
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={budgetStyles.content}
        contentContainerStyle={budgetStyles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#003366']} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Main Budget Summary Card */}
        <View style={budgetStyles.budgetSummaryCard}>
          <View style={budgetStyles.budgetCardTop}>
            <Text style={budgetStyles.budgetCardLabel}>
              Remaining {period === 'monthly' ? 'Monthly' : 'Weekly'} Budget
            </Text>
            <TouchableOpacity
              style={budgetStyles.budgetEditBtn}
              onPress={() => {
                setNewTotalLimitInput(activeBudgetLimit.toString());
                setShowEditBudgetModal(true);
              }}
            >
              <Ionicons name="create-outline" size={14} color="#F4C430" />
              <Text style={budgetStyles.budgetEditBtnText}>Set Limit</Text>
            </TouchableOpacity>
          </View>

          <Text
            style={[
              budgetStyles.budgetRemainingAmount,
              remainingBudget < 0 && budgetStyles.budgetRemainingNegative,
            ]}
          >
            ₱ {remainingBudget.toLocaleString()}
          </Text>
          <Text style={budgetStyles.budgetRemainingSub}>
            {remainingBudget >= 0
              ? `${(100 - spendingPercentage).toFixed(1)}% of your budget left`
              : `Over budget by ₱ ${Math.abs(remainingBudget).toLocaleString()}!`}
          </Text>

          {/* Progress Bar */}
          <View style={budgetStyles.mainProgressBarBg}>
            <View
              style={[
                budgetStyles.mainProgressBarFill,
                spendingPercentage > 100
                  ? budgetStyles.progressBarDanger
                  : spendingPercentage > 85
                    ? budgetStyles.progressBarWarning
                    : budgetStyles.progressBarGold,
                { width: `${Math.min(100, spendingPercentage)}%` },
              ]}
            />
          </View>

          <View style={budgetStyles.budgetSplitRow}>
            <View style={budgetStyles.budgetSplitItem}>
              <Text style={budgetStyles.budgetSplitLabel}>Total Spent</Text>
              <Text style={budgetStyles.budgetSplitValue}>
                ₱ {totalSpent.toLocaleString()}
              </Text>
            </View>

            <View style={budgetStyles.budgetSplitItemRight}>
              <Text style={budgetStyles.budgetSplitLabel}>Budget Limit</Text>
              <Text style={budgetStyles.budgetSplitValue}>
                ₱ {activeBudgetLimit.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Warning / Overspending Banner */}
        {spendingPercentage > 100 ? (
          <View style={budgetStyles.dangerBanner}>
            <Ionicons name="alert-circle" size={24} color="#DC2626" />
            <Text style={budgetStyles.dangerText}>
              Overspending Alert: You have exceeded your {period} budget limit by ₱{' '}
              {Math.abs(remainingBudget).toLocaleString()}!
            </Text>
          </View>
        ) : spendingPercentage >= 85 ? (
          <View style={budgetStyles.warningBanner}>
            <Ionicons name="warning" size={24} color="#D97706" />
            <Text style={budgetStyles.warningText}>
              Budget Caution: You have used {spendingPercentage.toFixed(0)}% of your {period} budget.
            </Text>
          </View>
        ) : null}

        {/* Category Budget Section Header */}
        <View style={budgetStyles.sectionHeader}>
          <Text style={[budgetStyles.sectionTitle, isDarkMode && budgetStyles.titleDark]}>Category Budget Limits & Expenses</Text>
        </View>

        {/* Category Budget Cards */}
        {categoryBudgets.map((item, index) => {
          const limit = period === 'weekly' ? Math.round(item.limit / 4) : item.limit;
          const spent = categorySpentMap[item.category] || 0;
          const catRemaining = limit - spent;
          const catPct = limit > 0 ? (spent / limit) * 100 : 0;
          const isOver = spent > limit;

          return (
            <View key={index} style={[budgetStyles.categoryBudgetCard, isDarkMode && budgetStyles.categoryBudgetCardDark]}>
              <View style={budgetStyles.catBudgetTop}>
                <View style={budgetStyles.catBudgetInfo}>
                  <View style={[budgetStyles.catIconBox, isDarkMode && budgetStyles.catIconBoxDark]}>
                    <Ionicons name={normalizeCategoryIcon(item.icon, item.category)} size={20} color={isDarkMode ? "#38BDF8" : "#003366"} />
                  </View>
                  <View>
                    <Text style={[budgetStyles.catName, isDarkMode && budgetStyles.catNameDark]}>{item.category}</Text>
                    <Text style={[budgetStyles.catLimitSubtitle, isDarkMode && budgetStyles.textMutedDark]}>
                      Limit: ₱ {limit.toLocaleString()} / {period === 'weekly' ? 'wk' : 'mo'}
                    </Text>
                  </View>
                </View>

                <View style={budgetStyles.catAmounts}>
                  <Text
                    style={[
                      budgetStyles.catSpentText,
                      isDarkMode && budgetStyles.catSpentTextDark,
                      isOver && budgetStyles.catSpentTextOver,
                    ]}
                  >
                    ₱ {spent.toLocaleString()}
                  </Text>
                  <Text
                    style={[
                      budgetStyles.catRemainingText,
                      isOver && budgetStyles.catRemainingTextOver,
                      !isOver && isDarkMode && budgetStyles.textMutedDark,
                    ]}
                  >
                    {isOver
                      ? `Over by ₱ ${Math.abs(catRemaining).toLocaleString()}`
                      : `₱ ${catRemaining.toLocaleString()} left`}
                  </Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={budgetStyles.mainProgressBarBg}>
                <View
                  style={[
                    budgetStyles.mainProgressBarFill,
                    catPct > 100
                      ? budgetStyles.progressBarDanger
                      : catPct > 80
                        ? budgetStyles.progressBarWarning
                        : budgetStyles.progressBarNavy,
                    { width: `${Math.min(100, catPct)}%` },
                  ]}
                />
              </View>

              {/* Action Buttons: View Expenses (👁️) and Set Limit (✏️) */}
              <View style={budgetStyles.catActionRow}>
                <TouchableOpacity
                  style={budgetStyles.catActionBtnSecondary}
                  onPress={() => setSelectedCatForViewExpenses(item)}
                >
                  <Ionicons name="eye-outline" size={14} color="#003366" />
                  <Text style={budgetStyles.catActionBtnTextSecondary}>View Expenses</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={budgetStyles.catActionBtn}
                  onPress={() => {
                    setSelectedCatForEdit(item);
                    setCatLimitInput(limit.toString());
                  }}
                >
                  <Ionicons name="create-outline" size={14} color="#FFFFFF" />
                  <Text style={budgetStyles.catActionBtnText}>Set Limit</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* ===============================      {/* VIEW CATEGORY EXPENSES MODAL                              */}
      {/* ========================================================= */}
      <Modal
        visible={!!selectedCatForViewExpenses}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedCatForViewExpenses(null)}
      >
        <View style={budgetStyles.modalOverlay}>
          <View style={[budgetStyles.modalContent, isDarkMode && budgetStyles.modalContentDark]}>
            <View style={budgetStyles.modalHeader}>
              <View style={budgetStyles.catModalHeaderTitleGroup}>
                <Ionicons name="receipt" size={20} color={isDarkMode ? "#F4C430" : "#003366"} />
                <Text style={[budgetStyles.modalTitle, isDarkMode && budgetStyles.modalTitleDark]}>
                  {selectedCatForViewExpenses?.category} Expenses
                </Text>
              </View>
              <TouchableOpacity
                style={budgetStyles.modalCloseIconBtn}
                onPress={() => setSelectedCatForViewExpenses(null)}
              >
                <Ionicons name="close" size={22} color={isDarkMode ? "#F8FAFC" : "#003366"} />
              </TouchableOpacity>
            </View>

            {selectedCatForViewExpenses && (
              <View style={[budgetStyles.catExpensesInfoBanner, isDarkMode && budgetStyles.catExpensesInfoBannerDark]}>
                <Text style={[budgetStyles.catExpensesInfoText, isDarkMode && budgetStyles.catExpensesInfoTextDark]}>
                  Total Spent:{' '}
                  <Text style={budgetStyles.catExpensesSpentHighlight}>
                    ₱ {(categorySpentMap[selectedCatForViewExpenses.category] || 0).toLocaleString()}
                  </Text>{' '}
                  | Limit:{' '}
                  <Text style={budgetStyles.catExpensesLimitHighlight}>
                    ₱ {(period === 'weekly' ? Math.round(selectedCatForViewExpenses.limit / 4) : selectedCatForViewExpenses.limit).toLocaleString()}
                  </Text>
                </Text>
              </View>
            )}

            <ScrollView style={budgetStyles.catExpensesListScroll} showsVerticalScrollIndicator={false}>
              {selectedCatExpenses.length === 0 ? (
                <View style={budgetStyles.catExpensesEmptyContainer}>
                  <Ionicons name="file-tray-outline" size={36} color="#94A3B8" />
                  <Text style={budgetStyles.catExpensesEmptyText}>
                    No expenses recorded under this category for this period.
                  </Text>
                </View>
              ) : (
                selectedCatExpenses.map((tx) => (
                  <View key={tx.id} style={[budgetStyles.catExpenseItem, isDarkMode && budgetStyles.catExpenseItemDark]}>
                    <View style={budgetStyles.catExpenseTopRow}>
                      <Text style={[budgetStyles.catExpenseTitle, isDarkMode && budgetStyles.catExpenseTitleDark]}>{tx.title}</Text>
                      <Text style={budgetStyles.catExpenseAmount}>-₱ {tx.amount.toLocaleString()}</Text>
                    </View>
                    <Text style={[budgetStyles.catExpenseDate, isDarkMode && budgetStyles.textMutedDark]}>Date: {tx.date}</Text>
                    {tx.description ? (
                      <Text style={[budgetStyles.catExpenseDesc, isDarkMode && budgetStyles.textMutedDark]}>{tx.description}</Text>
                    ) : null}
                  </View>
                ))
              )}
            </ScrollView>

            <View style={budgetStyles.modalFooterRow}>
              <TouchableOpacity
                style={budgetStyles.modalCloseBtn}
                onPress={() => setSelectedCatForViewExpenses(null)}
              >
                <Ionicons name="close-circle-outline" size={18} color="#64748B" />
                <Text style={budgetStyles.modalCloseBtnText}>Close</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={budgetStyles.modalConfirmBtn}
                onPress={() => setSelectedCatForViewExpenses(null)}
              >
                <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />
                <Text style={budgetStyles.modalConfirmBtnText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================= */}
      {/* EDIT TOTAL BUDGET MODAL                                   */}
      {/* ========================================================= */}
      <Modal
        visible={showEditBudgetModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditBudgetModal(false)}
      >
        <View style={budgetStyles.modalOverlay}>
          <View style={[budgetStyles.modalContent, isDarkMode && budgetStyles.modalContentDark]}>
            <View style={budgetStyles.modalHeader}>
              <Text style={[budgetStyles.modalTitle, isDarkMode && budgetStyles.modalTitleDark]}>Set {period === 'monthly' ? 'Monthly' : 'Weekly'} Limit</Text>
              <TouchableOpacity onPress={() => setShowEditBudgetModal(false)}>
                <Ionicons name="close" size={24} color={isDarkMode ? "#F8FAFC" : "#003366"} />
              </TouchableOpacity>
            </View>

            <Text style={[budgetStyles.inputLabel, isDarkMode && budgetStyles.inputLabelDark]}>Budget Amount (₱)</Text>
            <TextInput
              style={[budgetStyles.inputField, isDarkMode && budgetStyles.inputFieldDark]}
              placeholder="e.g. 35000"
              placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
              keyboardType="numeric"
              value={newTotalLimitInput}
              onChangeText={setNewTotalLimitInput}
            />

            <View style={budgetStyles.modalBtnContainer}>
              <TouchableOpacity
                style={budgetStyles.modalCancelBtn}
                onPress={() => setShowEditBudgetModal(false)}
              >
                <Text style={budgetStyles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={budgetStyles.modalSaveBtn}
                onPress={handleSaveBudgetLimit}
              >
                <Text style={budgetStyles.modalSaveBtnText}>Save Limit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================= */}
      {/* EDIT CATEGORY BUDGET MODAL                                */}
      {/* ========================================================= */}
      <Modal
        visible={!!selectedCatForEdit}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedCatForEdit(null)}
      >
        <View style={budgetStyles.modalOverlay}>
          <View style={[budgetStyles.modalContent, isDarkMode && budgetStyles.modalContentDark]}>
            <View style={budgetStyles.modalHeader}>
              <Text style={[budgetStyles.modalTitle, isDarkMode && budgetStyles.modalTitleDark]}>
                {selectedCatForEdit?.category} Limit
              </Text>
              <TouchableOpacity onPress={() => setSelectedCatForEdit(null)}>
                <Ionicons name="close" size={24} color={isDarkMode ? "#F8FAFC" : "#003366"} />
              </TouchableOpacity>
            </View>

            <Text style={[budgetStyles.inputLabel, isDarkMode && budgetStyles.inputLabelDark]}>
              {period === 'monthly' ? 'Monthly' : 'Weekly'} Target Limit (₱)
            </Text>
            <TextInput
              style={[budgetStyles.inputField, isDarkMode && budgetStyles.inputFieldDark]}
              placeholder="e.g. 8000"
              placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
              keyboardType="numeric"
              value={catLimitInput}
              onChangeText={setCatLimitInput}
            />

            <View style={budgetStyles.modalBtnContainer}>
              <TouchableOpacity
                style={budgetStyles.modalCancelBtn}
                onPress={() => setSelectedCatForEdit(null)}
              >
                <Text style={budgetStyles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={budgetStyles.modalSaveBtn}
                onPress={handleSaveCategoryLimit}
              >
                <Text style={budgetStyles.modalSaveBtnText}>Update Limit</Text>
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
      <View style={[budgetStyles.bottomNav, isDarkMode && budgetStyles.bottomNavDark]}>
        <TouchableOpacity
          style={budgetStyles.navItem}
          onPress={() => router.push('/mother/home')}
        >
          <Ionicons name="home-outline" size={22} color={isDarkMode ? "#94A3B8" : "#757575"} />
          <Text style={[budgetStyles.navText, isDarkMode && budgetStyles.navTextDark]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={budgetStyles.navItem}
          onPress={() => router.push('/mother/reports')}
        >
          <Ionicons name="bar-chart-outline" size={22} color={isDarkMode ? "#94A3B8" : "#757575"} />
          <Text style={[budgetStyles.navText, isDarkMode && budgetStyles.navTextDark]}>Reports</Text>
        </TouchableOpacity>

        {/* Global Add FAB */}
        <TouchableOpacity
          style={budgetStyles.fab}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={28} color="#F4C430" />
        </TouchableOpacity>

        <TouchableOpacity style={budgetStyles.navItem}>
          <Ionicons name="wallet" size={22} color={isDarkMode ? "#38BDF8" : "#003366"} />
          <Text style={[budgetStyles.navText, budgetStyles.navTextActive, isDarkMode && budgetStyles.navTextActiveDark]}>
            Budget
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={budgetStyles.navItem}
          onPress={() => router.push('/mother/reminders')}
        >
          <Ionicons name="alarm-outline" size={22} color={isDarkMode ? "#94A3B8" : "#757575"} />
          <Text style={[budgetStyles.navText, isDarkMode && budgetStyles.navTextDark]}>Reminders</Text>
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

// src/app/mother/reports.tsx
import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Platform,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { reportsStyles } from '../../components/mother-css/reportsStyles';
import { supabase } from '../../../lib/supabase';
import { AddTransactionModal, TransactionRecord } from './AddTransactionModal';
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

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  'Food & Dining': 'restaurant-outline',
  'Groceries': 'cart-outline',
  'Utilities': 'flash-outline',
  'Bills & Utilities': 'flash-outline',
  'Healthcare': 'medkit-outline',
  'Transportation': 'bus-outline',
  'Education': 'school-outline',
  'Shopping': 'pricetag-outline',
  'Personal Care': 'person-outline',
  'Entertainment': 'game-controller-outline',
  'Salary': 'cash-outline',
  'Business': 'business-outline',
  'Allowance': 'wallet-outline',
  'Freelance': 'laptop-outline',
  'Other': 'ellipsis-horizontal-circle-outline',
};

export default function MotherReportsScreen() {
  const router = useRouter();
  const { isDarkMode, theme } = useAppTheme();
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month'>('month');
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showSidebarDrawer, setShowSidebarDrawer] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Fetch transactions from Supabase and sync with local storage with deduplication
  const fetchTransactions = useCallback(async () => {
    try {
      // 1. Try reading from Supabase
      const { data: { user } } = await supabase.auth.getUser();
      let query = supabase.from('transactions').select('*').order('date', { ascending: false });

      if (user) {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (!error && data) {
        const mapped: TransactionItem[] = data.map((t: any) => ({
          id: t.id,
          title: t.title,
          type: t.type as 'expense' | 'income',
          amount: Number(t.amount),
          category: t.category,
          date: t.date ? new Date(t.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          description: t.description || '',
        }));
        // Deduplicate
        const unique = Array.from(new Map(mapped.map((t) => [t.id, t])).values());
        setTransactions(unique);
        await AsyncStorage.setItem('cached_transactions', JSON.stringify(unique));
        await AsyncStorage.setItem('@household_transactions_v2', JSON.stringify(unique));
        return;
      }

      // 2. Fallback to AsyncStorage cache
      const cached = await AsyncStorage.getItem('@household_transactions_v2') ||
        await AsyncStorage.getItem('cached_transactions');
      if (cached) {
        const parsed: TransactionItem[] = JSON.parse(cached);
        const unique = Array.from(new Map(parsed.map((t) => [t.id, t])).values());
        setTransactions(unique);
      } else {
        setTransactions([]);
      }
    } catch (err) {
      console.log('Error fetching transactions for reports:', err);
      const cached = await AsyncStorage.getItem('cached_transactions');
      if (cached) {
        const parsed: TransactionItem[] = JSON.parse(cached);
        const unique = Array.from(new Map(parsed.map((t) => [t.id, t])).values());
        setTransactions(unique);
      }
    }
  }, []);

  // useFocusEffect guarantees data refreshes whenever user switches to this tab
  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
    }, [fetchTransactions])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
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

  // Filter transactions by time
  const filteredTransactions = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    return transactions.filter((t) => {
      if (timeFilter === 'all') return true;

      const txDate = new Date(t.date);
      if (timeFilter === 'today') {
        return t.date === todayStr;
      }
      if (timeFilter === 'week') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(today.getDate() - 7);
        return txDate >= oneWeekAgo && txDate <= today;
      }
      if (timeFilter === 'month') {
        return (
          txDate.getFullYear() === today.getFullYear() &&
          txDate.getMonth() === today.getMonth()
        );
      }
      return true;
    });
  }, [transactions, timeFilter]);

  // Aggregate Calculations
  const { totalExpense, totalIncome, categoryBreakdown, topExpenseCategory } = useMemo(() => {
    let exp = 0;
    let inc = 0;
    const catMap: Record<string, { total: number; count: number }> = {};

    filteredTransactions.forEach((t) => {
      if (t.type === 'expense') {
        exp += t.amount;
        if (!catMap[t.category]) {
          catMap[t.category] = { total: 0, count: 0 };
        }
        catMap[t.category].total += t.amount;
        catMap[t.category].count += 1;
      } else {
        inc += t.amount;
      }
    });

    const breakdown = Object.entries(catMap)
      .map(([category, data]) => ({
        category,
        total: data.total,
        count: data.count,
        percent: exp > 0 ? (data.total / exp) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);

    const topCat = breakdown.length > 0 ? breakdown[0] : null;

    return {
      totalExpense: exp,
      totalIncome: inc,
      categoryBreakdown: breakdown,
      topExpenseCategory: topCat,
    };
  }, [filteredTransactions]);

  const savingsRate = totalIncome > 0 ? Math.max(0, ((totalIncome - totalExpense) / totalIncome) * 100) : 0;
  const netBalance = totalIncome - totalExpense;

  // Print / PDF Export Handler
  const handlePrintAction = () => {
    if (Platform.OS === 'web') {
      try {
        const rowsHtml = categoryBreakdown
          .map(
            (c) => `
            <tr>
              <td class="td-category">${c.category}</td>
              <td class="td-center">${c.count}</td>
              <td class="td-amount">₱ ${c.total.toLocaleString()}</td>
              <td class="td-percent">${c.percent.toFixed(1)}%</td>
            </tr>
          `
          )
          .join('');

        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>USTP Household Spending Report - ${timeFilter.toUpperCase()}</title>
                <style>
                  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #0f172a; }
                  .header { border-bottom: 3px solid #003366; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: flex-end; }
                  .inst { font-size: 14px; font-weight: bold; color: #003366; text-transform: uppercase; letter-spacing: 1px; }
                  .title { font-size: 24px; font-weight: bold; margin-top: 5px; }
                  .date { font-size: 12px; color: #64748b; text-align: right; }
                  .grid { display: flex; gap: 15px; margin-bottom: 30px; }
                  .grid-item { flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; }
                  .grid-label { font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600; }
                  .grid-val { font-size: 18px; font-weight: bold; margin-top: 5px; }
                  .grid-val-income { color: #2e7d32; }
                  .grid-val-expense { color: #d32f2f; }
                  .grid-val-balance { color: #003366; }
                  .grid-val-savings { color: #0284c7; }
                  .section-heading { font-size: 15px; margin-bottom: 8px; color: #003366; font-weight: bold; }
                  table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                  th { background: #003366; color: #ffffff; padding: 10px; text-align: left; font-size: 12px; }
                  th.th-center { text-align: center; }
                  th.th-right { text-align: right; }
                  td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
                  .td-category { font-weight: 600; }
                  .td-center { text-align: center; }
                  .td-amount { text-align: right; font-weight: bold; color: #003366; }
                  .td-percent { text-align: right; color: #64748b; }
                  .footer { margin-top: 40px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px; }
                  @media print {
                    body { padding: 20px; }
                  }
                </style>
              </head>
              <body>
                <div class="header">
                  <div>
                    <div class="inst">USTP Household Budgeting System</div>
                    <div class="title">Official Spending & Expense Statement</div>
                  </div>
                  <div class="date">
                    Generated on: ${new Date().toLocaleDateString()}<br>
                    Period: <b>${timeFilter.toUpperCase()}</b>
                  </div>
                </div>

                <div class="grid">
                  <div class="grid-item">
                    <div class="grid-label">Total Income</div>
                    <div class="grid-val grid-val-income">₱ ${totalIncome.toLocaleString()}</div>
                  </div>
                  <div class="grid-item">
                    <div class="grid-label">Total Expenses</div>
                    <div class="grid-val grid-val-expense">₱ ${totalExpense.toLocaleString()}</div>
                  </div>
                  <div class="grid-item">
                    <div class="grid-label">Net Balance</div>
                    <div class="grid-val grid-val-balance">₱ ${netBalance.toLocaleString()}</div>
                  </div>
                  <div class="grid-item">
                    <div class="grid-label">Savings Rate</div>
                    <div class="grid-val grid-val-savings">${savingsRate.toFixed(1)}%</div>
                  </div>
                </div>

                <div class="section-heading">Category Breakdown</div>
                <table>
                  <thead>
                    <tr>
                      <th>CATEGORY</th>
                      <th class="th-center">TRANSACTIONS</th>
                      <th class="th-right">AMOUNT SPENT</th>
                      <th class="th-right">% OF TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${rowsHtml}
                  </tbody>
                </table>

                <div class="footer">
                  This document was automatically generated by the USTP Household Budgeting App. &copy; ${new Date().getFullYear()}
                </div>

                <script>
                  window.onload = function() {
                    window.print();
                  }
                </script>
              </body>
            </html>
          `);
          printWindow.document.close();
        } else {
          window.print();
        }
      } catch (e) {
        window.print();
      }
    } else {
      Alert.alert(
        'Statement Generated',
        `Household Statement prepared for ${timeFilter.toUpperCase()}.\n\nTotal Spends: ₱ ${totalExpense.toLocaleString()}\nTotal Income: ₱ ${totalIncome.toLocaleString()}\nNet Balance: ₱ ${netBalance.toLocaleString()}`,
        [{ text: 'OK', onPress: () => setShowPrintModal(false) }]
      );
    }
  };

  return (
    <View style={[reportsStyles.container, isDarkMode && reportsStyles.containerDark]}>
      <View style={reportsStyles.bannerYellow} />

      {/* Uniform Header matching Home screen */}
      <View style={[reportsStyles.header, isDarkMode && reportsStyles.headerDark]}>
        <View style={reportsStyles.headerLeft}>
          <TouchableOpacity
            onPress={() => setShowSidebarDrawer(true)}
            accessibilityLabel="Open Navigation Menu"
          >
            <Ionicons name="menu" size={24} color={isDarkMode ? "#F4C430" : "#000000"} />
          </TouchableOpacity>
          <Text style={[reportsStyles.headerTitle, isDarkMode && reportsStyles.headerTitleDark]}>Spending Analytics</Text>
        </View>

        <View style={reportsStyles.headerRight}>
          <TouchableOpacity
            onPress={() => setShowCalendarModal(true)}
            accessibilityLabel="Financial Calendar"
          >
            <Ionicons name="calendar-outline" size={22} color={isDarkMode ? "#F4C430" : "#000000"} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowPrintModal(true)}
            accessibilityLabel="Print Report"
          >
            <Ionicons name="print-outline" size={22} color={isDarkMode ? "#F4C430" : "#000000"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={fetchTransactions}>
            <Ionicons name="refresh-outline" size={22} color={isDarkMode ? "#F4C430" : "#000000"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color={isDarkMode ? "#F4C430" : "#000000"} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Time Filter Pills */}
      <View style={[reportsStyles.timeFilterContainer, isDarkMode && reportsStyles.timeFilterContainerDark]}>
        {(['all', 'today', 'week', 'month'] as const).map((key) => {
          const labels = {
            all: 'All Time',
            today: 'Today',
            week: 'This Week',
            month: 'This Month',
          };
          const isActive = timeFilter === key;
          return (
            <TouchableOpacity
              key={key}
              style={[
                reportsStyles.timePill,
                isDarkMode && reportsStyles.timePillDark,
                isActive && reportsStyles.timePillActive,
              ]}
              onPress={() => setTimeFilter(key)}
            >
              <Text
                style={[
                  reportsStyles.timePillText,
                  isDarkMode && reportsStyles.timePillTextDark,
                  isActive && reportsStyles.timePillTextActive,
                ]}
              >
                {labels[key]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={reportsStyles.content}
        contentContainerStyle={reportsStyles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#003366']} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Main Spending Summary Overview Card */}
        <View style={reportsStyles.overviewCard}>
          <View style={reportsStyles.overviewCardHeader}>
            <Text style={reportsStyles.overviewTitle}>Total Spending</Text>
            <TouchableOpacity
              style={reportsStyles.printQuickBtn}
              onPress={() => setShowPrintModal(true)}
            >
              <Ionicons name="print" size={12} color="#F4C430" />
              <Text style={reportsStyles.printQuickText}>Print Statement</Text>
            </TouchableOpacity>
          </View>

          <Text style={reportsStyles.overviewMainAmount}>
            ₱ {totalExpense.toLocaleString()}
          </Text>
          <Text style={reportsStyles.overviewSubtext}>
            {timeFilter === 'month' ? 'Current Month Overview' : `Filtered Range: ${timeFilter.toUpperCase()}`}
          </Text>

          <View style={reportsStyles.overviewRow}>
            <View style={reportsStyles.overviewStatItem}>
              <Text style={reportsStyles.overviewStatLabel}>Total Income</Text>
              <Text style={reportsStyles.overviewStatValue}>
                ₱ {totalIncome.toLocaleString()}
              </Text>
            </View>

            <View style={reportsStyles.overviewStatItem}>
              <Text style={reportsStyles.overviewStatLabel}>Savings Rate</Text>
              <Text style={reportsStyles.overviewStatValue}>
                {savingsRate.toFixed(1)}%
              </Text>
            </View>

            <View style={reportsStyles.overviewStatItem}>
              <Text style={reportsStyles.overviewStatLabel}>Transactions</Text>
              <Text style={reportsStyles.overviewStatValue}>
                {filteredTransactions.length}
              </Text>
            </View>
          </View>
        </View>

        {/* Overspending Alert Banner */}
        {topExpenseCategory && topExpenseCategory.percent >= 45 && (
          <View style={reportsStyles.alertBanner}>
            <View style={reportsStyles.alertIconContainer}>
              <Ionicons name="warning-outline" size={22} color="#DC2626" />
            </View>
            <View style={reportsStyles.alertTextContainer}>
              <Text style={reportsStyles.alertTitle}>
                High Spending Alert: {topExpenseCategory.category}
              </Text>
              <Text style={reportsStyles.alertDesc}>
                Takes up {topExpenseCategory.percent.toFixed(0)}% of your expenses ( ₱{' '}
                {topExpenseCategory.total.toLocaleString()}). Consider budgeting this category.
              </Text>
            </View>
          </View>
        )}

        {/* Category Breakdown Section */}
        <View style={reportsStyles.sectionHeader}>
          <Text style={[reportsStyles.sectionTitle, isDarkMode && reportsStyles.titleDark]}>Expense Categorization</Text>
          <Text style={[reportsStyles.sectionCount, isDarkMode && reportsStyles.textMutedDark]}>
            {categoryBreakdown.length} Categories
          </Text>
        </View>

        {categoryBreakdown.length === 0 ? (
          <View style={[reportsStyles.emptyCard, isDarkMode && reportsStyles.cardDark]}>
            <Ionicons name="receipt-outline" size={40} color={isDarkMode ? "#64748B" : "#94A3B8"} />
            <Text style={[reportsStyles.emptyTitle, isDarkMode && reportsStyles.titleDark]}>No Expense Records Found</Text>
            <Text style={[reportsStyles.emptySubtitle, isDarkMode && reportsStyles.textMutedDark]}>
              Tap the (+) button at the bottom to add an expense and view your breakdown.
            </Text>
          </View>
        ) : (
          categoryBreakdown.map((item, index) => {
            const iconName = normalizeCategoryIcon(CATEGORY_ICONS[item.category], item.category);

            return (
              <View key={index} style={[reportsStyles.categoryCard, isDarkMode && reportsStyles.cardDark]}>
                <View style={reportsStyles.categoryTopRow}>
                  <View style={reportsStyles.categoryLeft}>
                    <View style={[reportsStyles.categoryIconBox, isDarkMode && { backgroundColor: '#334155' }]}>
                      <Ionicons
                        name={iconName}
                        size={20}
                        color={isDarkMode ? "#38BDF8" : "#003366"}
                      />
                    </View>
                    <View>
                      <Text style={[reportsStyles.categoryName, isDarkMode && reportsStyles.titleDark]}>{item.category}</Text>
                      <Text style={[reportsStyles.categoryTxCount, isDarkMode && reportsStyles.textMutedDark]}>
                        {item.count} {item.count === 1 ? 'record' : 'records'}
                      </Text>
                    </View>
                  </View>

                  <View style={reportsStyles.categoryRight}>
                    <Text style={[reportsStyles.categoryAmount, isDarkMode && { color: '#F8FAFC' }]}>
                      ₱ {item.total.toLocaleString()}
                    </Text>
                    <Text style={[reportsStyles.categoryPercent, isDarkMode && reportsStyles.textMutedDark]}>
                      {item.percent.toFixed(1)}% of total
                    </Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <View style={reportsStyles.progressBarBg}>
                  <View
                    style={[
                      reportsStyles.progressBarFill,
                      item.percent > 40
                        ? reportsStyles.progressBarFillDanger
                        : item.percent > 20
                          ? reportsStyles.progressBarFillPrimary
                          : reportsStyles.progressBarFillWarning,
                      { width: `${Math.min(100, Math.max(5, item.percent))}%` },
                    ]}
                  />
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <Modal
        visible={showPrintModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPrintModal(false)}
      >
        <View style={reportsStyles.printModalOverlay}>
          <View style={[reportsStyles.printModalCard, isDarkMode && reportsStyles.modalContentDark]}>
            <View style={reportsStyles.printDocHeader}>
              <Text style={reportsStyles.printInstitutionTitle}>
                USTP Household Budgeting System
              </Text>
              <Text style={[reportsStyles.printDocTitle, isDarkMode && reportsStyles.titleDark]}>Spending & Expense Report</Text>
              <Text style={[reportsStyles.printDocDate, isDarkMode && reportsStyles.textMutedDark]}>
                Generated on: {new Date().toLocaleDateString()} | Filter: {timeFilter.toUpperCase()}
              </Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Summary 3-Grid */}
              <View style={reportsStyles.printSummaryGrid}>
                <View style={[reportsStyles.printGridItem, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
                  <Text style={[reportsStyles.printGridLabel, isDarkMode && reportsStyles.textMutedDark]}>Total Incomes</Text>
                  <Text style={[reportsStyles.printGridValue, reportsStyles.printIncomeValue]}>
                    ₱{totalIncome.toLocaleString()}
                  </Text>
                </View>

                <View style={[reportsStyles.printGridItem, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
                  <Text style={[reportsStyles.printGridLabel, isDarkMode && reportsStyles.textMutedDark]}>Total Spends</Text>
                  <Text style={[reportsStyles.printGridValue, reportsStyles.printExpenseValue]}>
                    ₱{totalExpense.toLocaleString()}
                  </Text>
                </View>

                <View style={[reportsStyles.printGridItem, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
                  <Text style={[reportsStyles.printGridLabel, isDarkMode && reportsStyles.textMutedDark]}>Net Balance</Text>
                  <Text style={[reportsStyles.printGridValue, reportsStyles.printNetValue, isDarkMode && { color: '#38BDF8' }]}>
                    ₱{netBalance.toLocaleString()}
                  </Text>
                </View>
              </View>

              {/* Table of Categorized Spends */}
              <View style={reportsStyles.printTableHeader}>
                <Text style={reportsStyles.printTableHeaderText}>CATEGORY</Text>
                <Text style={reportsStyles.printTableHeaderText}>ENTRIES</Text>
                <Text style={reportsStyles.printTableHeaderText}>TOTAL SPENT</Text>
              </View>

              {categoryBreakdown.map((item, idx) => (
                <View key={idx} style={[reportsStyles.printTableRow, isDarkMode && reportsStyles.printTableRowDark]}>
                  <Text style={[reportsStyles.printTableCategory, isDarkMode && reportsStyles.printTableCategoryDark]}>{item.category}</Text>
                  <Text style={[reportsStyles.printTableCount, isDarkMode && reportsStyles.textMutedDark]}>{item.count}</Text>
                  <Text style={[reportsStyles.printTableAmount, isDarkMode && { color: '#38BDF8' }]}>
                    ₱ {item.total.toLocaleString()} ({item.percent.toFixed(0)}%)
                  </Text>
                </View>
              ))}
            </ScrollView>

            <View style={reportsStyles.printModalActions}>
              <TouchableOpacity
                style={reportsStyles.printCloseBtn}
                onPress={() => setShowPrintModal(false)}
              >
                <Text style={reportsStyles.printCloseBtnText}>Close</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={reportsStyles.printConfirmBtn}
                onPress={handlePrintAction}
              >
                <Ionicons name="print" size={16} color="#FFFFFF" />
                <Text style={reportsStyles.printConfirmBtnText}>Print Statement</Text>
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
          fetchTransactions();
        }}
      />

      {/* ========================================================= */}
      {/* FINANCIAL & REMINDERS CALENDAR MODAL                      */}
      {/* ========================================================= */}
      <CalendarTrackerModal
        visible={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        onRefreshData={fetchTransactions}
      />

      {/* ========================================================= */}
      {/* SIDEBAR NAVIGATION DRAWER                                 */}
      {/* ========================================================= */}
      <SidebarDrawer
        visible={showSidebarDrawer}
        onClose={() => setShowSidebarDrawer(false)}
        onRefreshData={fetchTransactions}
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

      {/* ========================================================= */}
      {/* BOTTOM NAVIGATION BAR                                     */}
      {/* ========================================================= */}
      <View style={[reportsStyles.bottomNav, isDarkMode && reportsStyles.bottomNavDark]}>
        <TouchableOpacity
          style={reportsStyles.navItem}
          onPress={() => router.push('/mother/home')}
        >
          <Ionicons name="home-outline" size={22} color={isDarkMode ? "#94A3B8" : "#757575"} />
          <Text style={[reportsStyles.navText, isDarkMode && reportsStyles.navTextDark]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={reportsStyles.navItem}>
          <Ionicons name="bar-chart" size={22} color={isDarkMode ? "#38BDF8" : "#003366"} />
          <Text style={[reportsStyles.navText, reportsStyles.navTextActive, isDarkMode && reportsStyles.navTextActiveDark]}>
            Reports
          </Text>
        </TouchableOpacity>

        {/* Global Add FAB */}
        <TouchableOpacity
          style={reportsStyles.fab}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={28} color="#F4C430" />
        </TouchableOpacity>

        <TouchableOpacity
          style={reportsStyles.navItem}
          onPress={() => router.push('/mother/budget')}
        >
          <Ionicons name="wallet-outline" size={22} color={isDarkMode ? "#94A3B8" : "#757575"} />
          <Text style={[reportsStyles.navText, isDarkMode && reportsStyles.navTextDark]}>Budget</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={reportsStyles.navItem}
          onPress={() => router.push('/mother/reminders')}
        >
          <Ionicons name="alarm-outline" size={22} color={isDarkMode ? "#94A3B8" : "#757575"} />
          <Text style={[reportsStyles.navText, isDarkMode && reportsStyles.navTextDark]}>Reminders</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

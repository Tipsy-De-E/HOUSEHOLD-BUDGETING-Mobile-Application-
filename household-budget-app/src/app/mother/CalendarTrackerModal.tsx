// src/components/CalendarTrackerModal.tsx
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../../lib/supabase';
import { calendarStyles } from '../../components/mother-css/calendarStyles';
import { AddTransactionModal, TransactionRecord } from './AddTransactionModal';
import { useAppTheme } from '../../context/ThemeContext';

interface TransactionItem {
  id: string;
  title: string;
  type: 'expense' | 'income';
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  description?: string;
}

interface BillItem {
  id: string;
  title: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  category: string;
  isPaid: boolean;
  notes?: string;
}

interface CalendarTrackerModalProps {
  visible?: boolean;
  onClose?: () => void;
  onRefreshData?: () => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const REMINDER_CATEGORIES = [
  'Utilities',
  'Education',
  'Housing',
  'Healthcare',
  'Shopping',
  'Personal Care',
  'Food & Dining',
  'Other',
];

export const CalendarTrackerModal: React.FC<CalendarTrackerModalProps> = ({
  visible = false,
  onClose = () => { },
  onRefreshData,
}) => {
  const { isDarkMode } = useAppTheme();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [bills, setBills] = useState<BillItem[]>([]);

  // Modals inside Calendar Flow
  const [showDayDetailsModal, setShowDayDetailsModal] = useState(false);
  const [showAddChoiceModal, setShowAddChoiceModal] = useState(false);
  const [showAddReminderModal, setShowAddReminderModal] = useState(false);
  const [showAddTxModal, setShowAddTxModal] = useState(false);
  const [addTxType, setAddTxType] = useState<'expense' | 'income'>('expense');

  // Add Reminder Form State
  const [newBillTitle, setNewBillTitle] = useState('');
  const [newBillAmount, setNewBillAmount] = useState('');
  const [newBillCategory, setNewBillCategory] = useState(REMINDER_CATEGORIES[0]);
  const [newBillNotes, setNewBillNotes] = useState('');
  const [isSavingBill, setIsSavingBill] = useState(false);

  // Load transactions and bills
  const loadData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // 1. Fetch Transactions
      let txQuery = supabase.from('transactions').select('*');
      if (user) txQuery = txQuery.eq('user_id', user.id);
      const { data: txData } = await txQuery;

      if (txData && txData.length > 0) {
        const txMap = new Map<string, TransactionItem>();
        txData.forEach((t: any) => {
          const key = t.id || `${t.title}_${t.date}_${t.amount}`;
          txMap.set(key, {
            id: t.id,
            title: t.title,
            type: t.type as 'expense' | 'income',
            amount: Number(t.amount) || 0,
            category: t.category,
            date: t.date ? new Date(t.date).toISOString().split('T')[0] : '',
            description: t.description || '',
          });
        });
        setTransactions(Array.from(txMap.values()));
      } else {
        const cached = await AsyncStorage.getItem('@household_transactions_v2') ||
          await AsyncStorage.getItem('cached_transactions');
        if (cached) setTransactions(JSON.parse(cached));
      }

      // 2. Fetch Bills / Reminders
      let billQuery = supabase.from('bills').select('*');
      if (user) billQuery = billQuery.eq('user_id', user.id);
      const { data: bData } = await billQuery;

      if (bData && bData.length > 0) {
        const billMap = new Map<string, BillItem>();
        bData.forEach((b: any) => {
          const key = `${b.title.trim().toLowerCase()}::${b.due_date}`;
          billMap.set(key, {
            id: b.id,
            title: b.title,
            amount: Number(b.amount) || 0,
            dueDate: b.due_date,
            category: b.category,
            isPaid: Boolean(b.is_paid),
            notes: b.notes || '',
          });
        });
        setBills(Array.from(billMap.values()));
      } else {
        const cachedBills = await AsyncStorage.getItem('household_bills');
        if (cachedBills) {
          const list: BillItem[] = JSON.parse(cachedBills);
          const billMap = new Map<string, BillItem>();
          list.forEach((b) => {
            const key = `${b.title.trim().toLowerCase()}::${b.dueDate}`;
            billMap.set(key, b);
          });
          setBills(Array.from(billMap.values()));
        }
      }
    } catch (e) {
      console.log('CalendarTrackerModal load error:', e);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible, loadData]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Month navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleJumpToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  // Calendar calculations
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  // Aggregate data by date string YYYY-MM-DD
  const dateDataMap = useMemo(() => {
    const map: Record<
      string,
      {
        totalExpense: number;
        totalIncome: number;
        txList: TransactionItem[];
        billList: BillItem[];
      }
    > = {};

    transactions.forEach((tx) => {
      if (!tx.date) return;
      if (!map[tx.date]) {
        map[tx.date] = { totalExpense: 0, totalIncome: 0, txList: [], billList: [] };
      }
      if (tx.type === 'expense') {
        map[tx.date].totalExpense += tx.amount;
      } else {
        map[tx.date].totalIncome += tx.amount;
      }
      map[tx.date].txList.push(tx);
    });

    bills.forEach((bill) => {
      if (!bill.dueDate) return;
      if (!map[bill.dueDate]) {
        map[bill.dueDate] = { totalExpense: 0, totalIncome: 0, txList: [], billList: [] };
      }
      map[bill.dueDate].billList.push(bill);
    });

    return map;
  }, [transactions, bills]);

  // Determine highest expense threshold in the currently displayed month
  const maxMonthExpense = useMemo(() => {
    let max = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayData = dateDataMap[dStr];
      if (dayData && dayData.totalExpense > max) {
        max = dayData.totalExpense;
      }
    }
    return max;
  }, [dateDataMap, daysInMonth, year, month]);

  // Selected Date Info
  const selectedDayData = dateDataMap[selectedDateStr] || {
    totalExpense: 0,
    totalIncome: 0,
    txList: [],
    billList: [],
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // Day Click Handler: Selects date and opens Day Details Modal
  const handleDayClick = (dateStr: string) => {
    setSelectedDateStr(dateStr);
    setShowDayDetailsModal(true);
  };

  // Toggle Bill Paid Status
  const handleToggleBillStatus = async (billId: string, currentStatus: boolean) => {
    const updated = bills.map((b) => (b.id === billId ? { ...b, isPaid: !currentStatus } : b));
    setBills(updated);
    await AsyncStorage.setItem('household_bills', JSON.stringify(updated));

    try {
      await supabase.from('bills').update({ is_paid: !currentStatus }).eq('id', billId);
    } catch { }

    if (onRefreshData) onRefreshData();
  };

  // Delete Reminder Handler
  const handleDeleteReminder = (billId: string, title: string) => {
    Alert.alert(
      'Delete Reminder',
      `Are you sure you want to delete "${title}"?`,
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
            } catch { }
            if (onRefreshData) onRefreshData();
          },
        },
      ]
    );
  };

  // Save Reminder for Date
  const handleSaveReminderForDate = async () => {
    if (!newBillTitle.trim()) {
      Alert.alert('Required', 'Please enter a reminder/bill title.');
      return;
    }
    const amt = parseFloat(newBillAmount.replace(/[^0-9.]/g, ''));
    if (isNaN(amt) || amt <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }

    setIsSavingBill(true);

    const newBill: BillItem = {
      id: `bill-${Date.now()}`,
      title: newBillTitle.trim(),
      amount: amt,
      dueDate: selectedDateStr,
      category: newBillCategory,
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
        setBills((prev) => prev.map((b) => (b.id === newBill.id ? { ...b, id: inserted.id } : b)));
      }
    } catch (e) {
      console.log('Save reminder error:', e);
    } finally {
      setIsSavingBill(false);
      setShowAddReminderModal(false);
      setNewBillTitle('');
      setNewBillAmount('');
      setNewBillNotes('');
      Alert.alert('Reminder Saved', `Reminder "${newBill.title}" scheduled for ${selectedDateStr}.`);
      if (onRefreshData) onRefreshData();
    }
  };

  return (
    <>
      {/* ========================================================= */}
      {/* 1. MAIN MONTHLY CALENDAR MODAL                            */}
      {/* ========================================================= */}
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <View style={calendarStyles.modalOverlay}>
          <View style={[calendarStyles.modalContent, isDarkMode && calendarStyles.modalContentDark]}>
            {/* Header */}
            <View style={calendarStyles.header}>
              <View style={calendarStyles.headerLeft}>
                <View style={[calendarStyles.headerIconBox, isDarkMode && { backgroundColor: '#334155' }]}>
                  <Ionicons name="calendar" size={20} color={isDarkMode ? "#38BDF8" : "#003366"} />
                </View>
                <View>
                  <Text style={[calendarStyles.headerTitle, isDarkMode && calendarStyles.headerTitleDark]}>Financial & Reminders Calendar</Text>
                  <Text style={[calendarStyles.headerSubtitle, isDarkMode && { color: '#94A3B8' }]}>
                    Tap any day to view transactions & reminders
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[calendarStyles.closeIconBtn, isDarkMode && { backgroundColor: '#334155' }]}
                onPress={onClose}
                accessibilityLabel="Close Calendar"
              >
                <Ionicons name="close" size={20} color={isDarkMode ? "#F8FAFC" : "#003366"} />
              </TouchableOpacity>
            </View>

            {/* Month Navigation Bar */}
            <View style={[calendarStyles.monthNavBar, isDarkMode && calendarStyles.monthNavBarDark]}>
              <TouchableOpacity style={[calendarStyles.navArrowBtn, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]} onPress={handlePrevMonth}>
                <Ionicons name="chevron-back" size={18} color={isDarkMode ? "#38BDF8" : "#003366"} />
              </TouchableOpacity>

              <Text style={[calendarStyles.monthTitleText, isDarkMode && calendarStyles.monthTitleTextDark]}>
                {MONTH_NAMES[month]} {year}
              </Text>

              <TouchableOpacity style={calendarStyles.todayJumpBtn} onPress={handleJumpToday}>
                <Text style={calendarStyles.todayJumpText}>Today</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[calendarStyles.navArrowBtn, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]} onPress={handleNextMonth}>
                <Ionicons name="chevron-forward" size={18} color={isDarkMode ? "#38BDF8" : "#003366"} />
              </TouchableOpacity>
            </View>

            {/* Legend (Clean 3-Dots) */}
            <View style={calendarStyles.legendContainer}>
              <View style={calendarStyles.legendItem}>
                <View style={[calendarStyles.legendDot, calendarStyles.legendDotRed]} />
                <Text style={[calendarStyles.legendText, isDarkMode && { color: '#CBD5E1' }]}>Heavy Expense</Text>
              </View>
              <View style={calendarStyles.legendItem}>
                <View style={[calendarStyles.legendDot, calendarStyles.legendDotYellow]} />
                <Text style={[calendarStyles.legendText, isDarkMode && { color: '#CBD5E1' }]}>Reminder / Bill Due</Text>
              </View>
              <View style={calendarStyles.legendItem}>
                <View style={[calendarStyles.legendDot, calendarStyles.legendDotGreen]} />
                <Text style={[calendarStyles.legendText, isDarkMode && { color: '#CBD5E1' }]}>Income</Text>
              </View>
            </View>

            {/* Weekdays Row */}
            <View style={calendarStyles.weekdayRow}>
              {WEEKDAYS.map((day, idx) => (
                <Text
                  key={day}
                  style={[
                    calendarStyles.weekdayText,
                    isDarkMode && { color: '#CBD5E1' },
                    (idx === 0 || idx === 6) && calendarStyles.weekdayWeekend,
                  ]}
                >
                  {day}
                </Text>
              ))}
            </View>

            {/* Days Grid */}
            <View style={calendarStyles.gridContainer}>
              {/* Empty Leading Cells */}
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <View key={`empty-${i}`} style={[calendarStyles.dayCell, calendarStyles.dayCellEmpty]} />
              ))}

              {/* Days of the Month */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const isToday = dateStr === todayStr;
                const isSelected = dateStr === selectedDateStr;
                const dayData = dateDataMap[dateStr];

                const hasExpenses = dayData && dayData.totalExpense > 0;
                const isHighExpense = hasExpenses && maxMonthExpense > 0 && dayData.totalExpense >= maxMonthExpense * 0.55;
                const hasIncome = dayData && dayData.totalIncome > 0;
                const hasBills = dayData && dayData.billList.length > 0;

                return (
                  <TouchableOpacity
                    key={`day-${dayNum}`}
                    style={[
                      calendarStyles.dayCell,
                      isToday && calendarStyles.dayCellToday,
                      isToday && isDarkMode && { backgroundColor: '#334155' },
                      isSelected && calendarStyles.dayCellSelected,
                      isSelected && isDarkMode && { backgroundColor: '#172554', borderColor: '#38BDF8' },
                    ]}
                    onPress={() => handleDayClick(dateStr)}
                  >
                    <Text
                      style={[
                        calendarStyles.dayNumber,
                        isDarkMode && { color: '#E2E8F0' },
                        isToday && calendarStyles.dayNumberToday,
                        isSelected && calendarStyles.dayNumberSelected,
                        (isToday || isSelected) && isDarkMode && { color: '#38BDF8' },
                      ]}
                    >
                      {dayNum}
                    </Text>

                    {/* Indicator Dots (Only clean colored dots, no money text) */}
                    <View style={calendarStyles.dayBadgeRow}>
                      {isHighExpense && (
                        <View style={[calendarStyles.indicatorDot, calendarStyles.indicatorDotRed]} />
                      )}
                      {hasBills && (
                        <View style={[calendarStyles.indicatorDot, calendarStyles.indicatorDotYellow]} />
                      )}
                      {hasIncome && (
                        <View style={[calendarStyles.indicatorDot, calendarStyles.indicatorDotGreen]} />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Footer */}
            <View style={[calendarStyles.footerRow, isDarkMode && { borderTopColor: '#334155' }]}>
              <TouchableOpacity
                style={[calendarStyles.closeBtn, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#475569' }]}
                onPress={onClose}
              >
                <Text style={[calendarStyles.closeBtnText, isDarkMode && { color: '#CBD5E1' }]}>Close Calendar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={calendarStyles.actionBtn}
                onPress={() => {
                  setSelectedDateStr(todayStr);
                  setShowAddChoiceModal(true);
                }}
              >
                <Ionicons name="add-circle-outline" size={16} color="#FFFFFF" />
                <Text style={calendarStyles.actionBtnText}>Add For Today</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================= */}
      {/* 2. DEDICATED DAY DETAILS MODAL (Opens on Day Click)       */}
      {/* ========================================================= */}
      <Modal
        visible={showDayDetailsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDayDetailsModal(false)}
      >
        <View style={calendarStyles.dayDetailOverlay}>
          <View style={[calendarStyles.dayDetailCard, isDarkMode && calendarStyles.detailsCardDark]}>
            {/* Header */}
            <View style={[calendarStyles.dayDetailHeader, isDarkMode && { borderBottomColor: '#334155' }]}>
              <View style={calendarStyles.dayDetailHeaderLeft}>
                <Ionicons name="calendar-outline" size={20} color={isDarkMode ? "#38BDF8" : "#003366"} />
                <Text style={[calendarStyles.dayDetailTitle, isDarkMode && calendarStyles.detailsDateTitleDark]}>
                  {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
              </View>
              <TouchableOpacity
                style={[calendarStyles.closeIconBtn, isDarkMode && { backgroundColor: '#334155' }]}
                onPress={() => setShowDayDetailsModal(false)}
              >
                <Ionicons name="close" size={20} color={isDarkMode ? "#F8FAFC" : "#003366"} />
              </TouchableOpacity>
            </View>

            {/* Mini Summary Stats Row */}
            <View style={[calendarStyles.dayDetailStatsRow, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
              <View style={calendarStyles.dayDetailStatItem}>
                <Text style={[calendarStyles.dayDetailStatLabel, isDarkMode && { color: '#94A3B8' }]}>Total Spent</Text>
                <Text style={calendarStyles.dayDetailStatValExp}>
                  ₱ {selectedDayData.totalExpense.toLocaleString()}
                </Text>
              </View>
              <View style={calendarStyles.dayDetailStatItem}>
                <Text style={[calendarStyles.dayDetailStatLabel, isDarkMode && { color: '#94A3B8' }]}>Income</Text>
                <Text style={calendarStyles.dayDetailStatValInc}>
                  ₱ {selectedDayData.totalIncome.toLocaleString()}
                </Text>
              </View>
              <View style={calendarStyles.dayDetailStatItem}>
                <Text style={[calendarStyles.dayDetailStatLabel, isDarkMode && { color: '#94A3B8' }]}>Bills Due</Text>
                <Text style={[calendarStyles.dayDetailStatValBills, isDarkMode && { color: '#F4C430' }]}>
                  {selectedDayData.billList.length}
                </Text>
              </View>
            </View>

            {/* Scrollable Records */}
            <ScrollView style={calendarStyles.dayDetailListScroll} showsVerticalScrollIndicator={false}>
              {/* Bills Section */}
              {selectedDayData.billList.length > 0 && (
                <View>
                  <Text style={[calendarStyles.sectionSubHeader, isDarkMode && { color: '#F4C430' }]}>Bills & Reminders Due</Text>
                  {selectedDayData.billList.map((bill) => (
                    <View key={bill.id} style={[calendarStyles.reminderItemCard, isDarkMode && calendarStyles.itemCardDark]}>
                      <View style={{ flex: 1 }}>
                        <Text style={[calendarStyles.reminderTitle, isDarkMode && calendarStyles.itemTitleDark]}>{bill.title}</Text>
                        <Text style={[calendarStyles.reminderNotes, isDarkMode && { color: '#94A3B8' }]}>
                          {bill.category} {bill.notes ? `• ${bill.notes}` : ''}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end', gap: 4 }}>
                        <Text style={[calendarStyles.reminderAmount, isDarkMode && { color: '#FCD34D' }]}>₱ {bill.amount.toLocaleString()}</Text>
                        <View style={calendarStyles.reminderActionGroup}>
                          <TouchableOpacity
                            style={[
                              calendarStyles.reminderStatusBadge,
                              isDarkMode && { backgroundColor: '#78350F' },
                              bill.isPaid && calendarStyles.reminderPaidBadge,
                              bill.isPaid && isDarkMode && { backgroundColor: '#14532D' },
                            ]}
                            onPress={() => handleToggleBillStatus(bill.id, bill.isPaid)}
                          >
                            <Text
                              style={[
                                calendarStyles.reminderStatusText,
                                isDarkMode && { color: '#FDE68A' },
                                bill.isPaid && calendarStyles.reminderPaidText,
                                bill.isPaid && isDarkMode && { color: '#86EFAC' },
                              ]}
                            >
                              {bill.isPaid ? '✓ Paid' : 'Pending (Tap to Pay)'}
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[calendarStyles.reminderDeleteBtn, isDarkMode && { backgroundColor: '#7F1D1D' }]}
                            onPress={() => handleDeleteReminder(bill.id, bill.title)}
                            accessibilityLabel="Delete reminder"
                          >
                            <Ionicons name="trash-outline" size={14} color="#DC2626" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Transactions Section */}
              {selectedDayData.txList.length > 0 && (
                <View>
                  <Text style={[calendarStyles.sectionSubHeader, isDarkMode && { color: '#38BDF8' }]}>💳 Transactions Recorded</Text>
                  {selectedDayData.txList.map((tx) => (
                    <View key={tx.id} style={[calendarStyles.txItemCard, isDarkMode && calendarStyles.itemCardDark]}>
                      <View style={{ flex: 1 }}>
                        <Text style={[calendarStyles.txTitle, isDarkMode && calendarStyles.itemTitleDark]}>{tx.title}</Text>
                        <Text style={[calendarStyles.txCategory, isDarkMode && { color: '#94A3B8' }]}>
                          {tx.category} {tx.description ? `• ${tx.description}` : ''}
                        </Text>
                      </View>
                      <Text
                        style={
                          tx.type === 'expense'
                            ? calendarStyles.txAmountExp
                            : calendarStyles.txAmountInc
                        }
                      >
                        {tx.type === 'expense' ? '-' : '+'}₱ {tx.amount.toLocaleString()}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {selectedDayData.billList.length === 0 && selectedDayData.txList.length === 0 && (
                <View style={calendarStyles.emptyDayContainer}>
                  <Ionicons name="document-text-outline" size={32} color={isDarkMode ? "#64748B" : "#94A3B8"} />
                  <Text style={[calendarStyles.emptyDayText, isDarkMode && { color: '#94A3B8' }]}>
                    No transactions or reminders recorded for this date.
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* Day Detail Footer */}
            <View style={calendarStyles.dayDetailFooter}>
              <TouchableOpacity
                style={[calendarStyles.dayDetailCloseBtn, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}
                onPress={() => setShowDayDetailsModal(false)}
              >
                <Text style={[calendarStyles.dayDetailCloseBtnText, isDarkMode && { color: '#94A3B8' }]}>Close</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={calendarStyles.dayDetailAddBtn}
                onPress={() => setShowAddChoiceModal(true)}
              >
                <Ionicons name="add-circle-outline" size={16} color="#FFFFFF" />
                <Text style={calendarStyles.dayDetailAddBtnText}>Add For This Date</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================= */}
      {/* 3. ADD CHOICE ACTION SHEET (Expense / Income / Reminder)  */}
      {/* ========================================================= */}
      <Modal
        visible={showAddChoiceModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddChoiceModal(false)}
      >
        <View style={calendarStyles.choiceModalOverlay}>
          <View style={[calendarStyles.choiceModalCard, isDarkMode && calendarStyles.modalContentDark]}>
            <View style={calendarStyles.choiceModalHeader}>
              <Text style={[calendarStyles.choiceModalTitle, isDarkMode && calendarStyles.headerTitleDark]}>
                Add Record for {selectedDateStr}
              </Text>
              <TouchableOpacity onPress={() => setShowAddChoiceModal(false)}>
                <Ionicons name="close" size={20} color={isDarkMode ? "#F8FAFC" : "#003366"} />
              </TouchableOpacity>
            </View>

            {/* Option 1: Add Expense */}
            <TouchableOpacity
              style={[
                calendarStyles.choiceOptionCard,
                calendarStyles.choiceOptionExpense,
                isDarkMode && calendarStyles.choiceOptionCardDark,
              ]}
              onPress={() => {
                setShowAddChoiceModal(false);
                setAddTxType('expense');
                setShowAddTxModal(true);
              }}
            >
              <View style={[calendarStyles.choiceIconBox, calendarStyles.choiceIconBoxExpense]}>
                <Ionicons name="arrow-down-circle" size={22} color="#DC2626" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[calendarStyles.choiceOptionTitle, isDarkMode && calendarStyles.choiceOptionTitleDark]}>Log Expense</Text>
                <Text style={[calendarStyles.choiceOptionDesc, isDarkMode && { color: '#94A3B8' }]}>Record household spending or purchase</Text>
              </View>
            </TouchableOpacity>

            {/* Option 2: Add Income */}
            <TouchableOpacity
              style={[
                calendarStyles.choiceOptionCard,
                calendarStyles.choiceOptionIncome,
                isDarkMode && calendarStyles.choiceOptionCardDark,
              ]}
              onPress={() => {
                setShowAddChoiceModal(false);
                setAddTxType('income');
                setShowAddTxModal(true);
              }}
            >
              <View style={[calendarStyles.choiceIconBox, calendarStyles.choiceIconBoxIncome]}>
                <Ionicons name="arrow-up-circle" size={22} color="#16A34A" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[calendarStyles.choiceOptionTitle, isDarkMode && calendarStyles.choiceOptionTitleDark]}>Log Income</Text>
                <Text style={[calendarStyles.choiceOptionDesc, isDarkMode && { color: '#94A3B8' }]}>Record salary, deposit, or allowance</Text>
              </View>
            </TouchableOpacity>

            {/* Option 3: Add Bill / Reminder */}
            <TouchableOpacity
              style={[
                calendarStyles.choiceOptionCard,
                calendarStyles.choiceOptionReminder,
                isDarkMode && calendarStyles.choiceOptionCardDark,
              ]}
              onPress={() => {
                setShowAddChoiceModal(false);
                setShowAddReminderModal(true);
              }}
            >
              <View style={[calendarStyles.choiceIconBox, calendarStyles.choiceIconBoxReminder]}>
                <Ionicons name="alarm" size={22} color="#D97706" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[calendarStyles.choiceOptionTitle, isDarkMode && calendarStyles.choiceOptionTitleDark]}>Add Reminder / Bill</Text>
                <Text style={[calendarStyles.choiceOptionDesc, isDarkMode && { color: '#94A3B8' }]}>Schedule payment due date or notice</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[calendarStyles.choiceCancelBtn, isDarkMode && { borderColor: '#334155' }]}
              onPress={() => setShowAddChoiceModal(false)}
            >
              <Text style={[calendarStyles.choiceCancelBtnText, isDarkMode && { color: '#94A3B8' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ========================================================= */}
      {/* 4. ADD REMINDER / BILL FOR DATE MODAL                     */}
      {/* ========================================================= */}
      <Modal
        visible={showAddReminderModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddReminderModal(false)}
      >
        <View style={calendarStyles.choiceModalOverlay}>
          <View style={[calendarStyles.choiceModalCard, isDarkMode && calendarStyles.modalContentDark]}>
            <View style={calendarStyles.choiceModalHeader}>
              <Text style={[calendarStyles.choiceModalTitle, isDarkMode && calendarStyles.headerTitleDark]}>Schedule Bill / Reminder</Text>
              <TouchableOpacity onPress={() => setShowAddReminderModal(false)}>
                <Ionicons name="close" size={20} color={isDarkMode ? "#F8FAFC" : "#003366"} />
              </TouchableOpacity>
            </View>

            <View style={calendarStyles.formField}>
              <Text style={[calendarStyles.formLabel, isDarkMode && calendarStyles.formLabelDark]}>Bill Title / Purpose *</Text>
              <TextInput
                style={[calendarStyles.formInput, isDarkMode && calendarStyles.formInputDark]}
                placeholder="e.g. Electric Bill, Tuition Fee"
                placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
                value={newBillTitle}
                onChangeText={setNewBillTitle}
              />
            </View>

            <View style={calendarStyles.formField}>
              <Text style={[calendarStyles.formLabel, isDarkMode && calendarStyles.formLabelDark]}>Amount (₱) *</Text>
              <TextInput
                style={[calendarStyles.formInput, isDarkMode && calendarStyles.formInputDark]}
                placeholder="e.g. 2500"
                placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
                keyboardType="numeric"
                value={newBillAmount}
                onChangeText={setNewBillAmount}
              />
            </View>

            <View style={calendarStyles.formField}>
              <Text style={[calendarStyles.formLabel, isDarkMode && calendarStyles.formLabelDark]}>Due Date</Text>
              <TextInput
                style={[calendarStyles.formInput, isDarkMode && calendarStyles.formInputDark]}
                value={selectedDateStr}
                editable={false}
              />
            </View>

            <View style={calendarStyles.formField}>
              <Text style={[calendarStyles.formLabel, isDarkMode && calendarStyles.formLabelDark]}>Category</Text>
              <View style={calendarStyles.formCategoriesRow}>
                {REMINDER_CATEGORIES.map((cat) => {
                  const isCatSelected = newBillCategory === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        calendarStyles.catChip,
                        isDarkMode && calendarStyles.catChipDark,
                        isCatSelected && calendarStyles.catChipActive,
                      ]}
                      onPress={() => setNewBillCategory(cat)}
                    >
                      <Text
                        style={[
                          calendarStyles.catChipText,
                          isDarkMode && calendarStyles.catChipTextDark,
                          isCatSelected && calendarStyles.catChipTextActive,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={calendarStyles.formField}>
              <Text style={[calendarStyles.formLabel, isDarkMode && calendarStyles.formLabelDark]}>Notes (Optional)</Text>
              <TextInput
                style={[calendarStyles.formInput, isDarkMode && calendarStyles.formInputDark]}
                placeholder="e.g. Account # or reminder details"
                placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
                value={newBillNotes}
                onChangeText={setNewBillNotes}
              />
            </View>

            <View style={calendarStyles.formBtnRow}>
              <TouchableOpacity
                style={[calendarStyles.formCancelBtn, isDarkMode && { borderColor: '#334155' }]}
                onPress={() => setShowAddReminderModal(false)}
              >
                <Text style={[calendarStyles.formCancelBtnText, isDarkMode && { color: '#94A3B8' }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={calendarStyles.formSaveBtn}
                onPress={handleSaveReminderForDate}
                disabled={isSavingBill}
              >
                <Text style={calendarStyles.formSaveBtnText}>
                  {isSavingBill ? 'Saving...' : 'Save Reminder'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================= */}
      {/* 5. ADD TRANSACTION (Expense / Income) FOR DATE MODAL      */}
      {/* ========================================================= */}
      <AddTransactionModal
        visible={showAddTxModal}
        initialType={addTxType}
        initialDate={selectedDateStr}
        onClose={() => setShowAddTxModal(false)}
        onSuccess={(_tx) => {
          setShowAddTxModal(false);
          loadData();
          if (onRefreshData) onRefreshData();
        }}
      />
    </>
  );
};

export default CalendarTrackerModal;

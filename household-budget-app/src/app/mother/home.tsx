
// src/app/mother/home.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Modal,
    Alert,
    RefreshControl,
    Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { homeStyles } from '../../components/mother-css/homeStyles';
import { supabase } from '../../../lib/supabase';
import { AddTransactionModal } from './AddTransactionModal';
import { CalendarTrackerModal } from './CalendarTrackerModal';
import { SidebarDrawer } from './SidebarDrawer';
import { useAppTheme } from '../../context/ThemeContext';
import { AppDialog } from '../../components/ui/AppDialog';
import { normalizeCategoryIcon } from '../../utils/categoryIcons';

export interface Transaction {
    id: string;
    user_id?: string;
    title: string;
    type: 'expense' | 'income';
    amount: number;
    category: string;
    description?: string;
    receipt_url?: string;
    date: string;
    created_at?: string;
}

const STORAGE_KEY = '@household_transactions_v2';

const EXPENSE_CATEGORIES = [
    'Food & Dining',
    'Groceries',
    'Transportation',
    'Utilities',
    'Healthcare',
    'Education',
    'Shopping',
    'Personal Care',
    'Other',
];

const INCOME_CATEGORIES = [
    'Salary',
    'Business',
    'Allowance',
    'Freelance',
    'Gift',
    'Savings',
    'Other',
];

const INITIAL_TRANSACTIONS: Transaction[] = [];

export default function MotherHomeScreen() {
    const router = useRouter();
    const { isDarkMode, theme } = useAppTheme();

    // Transactions State
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Filters State
    const [searchQuery, setSearchQuery] = useState('');
    const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'all'>('all');
    const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');

    // Modal States
    const [showAddModal, setShowAddModal] = useState(false);
    const [showCalendarModal, setShowCalendarModal] = useState(false);
    const [showSidebarDrawer, setShowSidebarDrawer] = useState(false);
    const [selectedTxForView, setSelectedTxForView] = useState<Transaction | null>(null);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const [transactionPendingDelete, setTransactionPendingDelete] = useState<Transaction | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    // Notifications State
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotifModal, setShowNotifModal] = useState(false);
    const [dismissedBannerId, setDismissedBannerId] = useState<string | null>(null);

    // Add Form State
    const [newType, setNewType] = useState<'expense' | 'income'>('expense');
    const [newTitle, setNewTitle] = useState('');
    const [newAmount, setNewAmount] = useState('');
    const [newCategory, setNewCategory] = useState(EXPENSE_CATEGORIES[0]);
    const [newDescription, setNewDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch Notifications from Supabase
    const fetchNotifications = useCallback(async () => {
        try {
            const savedEmail = (await AsyncStorage.getItem('user_email')) || 'mother@household.com';
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .or(`user_email.eq.${savedEmail},user_email.eq.All Registered Households,user_email.is.null`)
                .order('created_at', { ascending: false });

            if (!error && data && data.length > 0) {
                setNotifications(data);
                await AsyncStorage.setItem('@household_notifications', JSON.stringify(data));
            } else {
                const cached = await AsyncStorage.getItem('@household_notifications');
                if (cached) {
                    setNotifications(JSON.parse(cached));
                } else {
                    setNotifications([
                        {
                            id: 'notif-welcome',
                            title: 'Welcome to USTP Budgeting!',
                            message: 'Your account is active. Manage your budgets, track daily expenses, and keep your income limits updated.',
                            type: 'system',
                            is_read: false,
                            created_at: new Date().toISOString(),
                        },
                    ]);
                }
            }
        } catch { }
    }, []);

    // Listen to real-time notifications with unique channel ID + auto-polling fallback
    useEffect(() => {
        fetchNotifications();

        const channelId = `mother-notifs-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
        const channel = supabase
            .channel(channelId)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
                fetchNotifications();
            })
            .subscribe();

        // 5-second polling fallback so notices show up even if realtime replication is pending
        const interval = setInterval(() => {
            fetchNotifications();
        }, 5000);

        return () => {
            try {
                supabase.removeChannel(channel);
            } catch { }
            clearInterval(interval);
        };
    }, [fetchNotifications]);

    const handleDismissNotification = async (id: string) => {
        setDismissedBannerId(id);
        try {
            await supabase.from('notifications').update({ is_read: true }).eq('id', id);
            setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
        } catch {
            setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
        }
    };

    const unreadNotifs = notifications.filter((n) => !n.is_read);
    const latestBannerNotif = notifications.find((n) => !n.is_read && n.id !== dismissedBannerId);

    // 1. Fetch Transactions from Supabase / AsyncStorage with strict deduplication
    const loadTransactions = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            // First try fetching from Supabase for current user
            let query = supabase
                .from('transactions')
                .select('*')
                .order('date', { ascending: false })
                .order('created_at', { ascending: false });

            if (user) {
                query = query.eq('user_id', user.id);
            }

            const { data, error } = await query;

            if (!error && data) {
                const formatted: Transaction[] = data.map((t: any) => ({
                    id: t.id,
                    user_id: t.user_id,
                    title: t.title,
                    type: t.type,
                    amount: Number(t.amount) || 0,
                    category: t.category || 'General',
                    description: t.description || '',
                    receipt_url: t.receipt_url || undefined,
                    date: t.date || new Date().toISOString().split('T')[0],
                    created_at: t.created_at,
                }));
                // Deduplicate by ID
                const unique = Array.from(new Map(formatted.map((t) => [t.id, t])).values());
                setTransactions(unique);
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(unique));
                await AsyncStorage.setItem('cached_transactions', JSON.stringify(unique));
            } else {
                // Fallback to AsyncStorage
                const cached = await AsyncStorage.getItem(STORAGE_KEY);
                if (cached) {
                    const parsed: Transaction[] = JSON.parse(cached);
                    const unique = Array.from(new Map(parsed.map((t) => [t.id, t])).values());
                    setTransactions(unique);
                } else {
                    setTransactions([]);
                }
            }
        } catch {
            // Network error fallback
            const cached = await AsyncStorage.getItem(STORAGE_KEY);
            if (cached) {
                const parsed: Transaction[] = JSON.parse(cached);
                const unique = Array.from(new Map(parsed.map((t) => [t.id, t])).values());
                setTransactions(unique);
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // Re-fetch transactions whenever returning to Home tab
    useFocusEffect(
        useCallback(() => {
            loadTransactions();
        }, [loadTransactions])
    );

    const handleRefresh = () => {
        setRefreshing(true);
        loadTransactions();
    };

    async function handleLogout() {
        setShowLogoutDialog(true);
    }

    async function confirmLogout() {
        setShowLogoutDialog(false);
        await supabase.auth.signOut();
        router.replace('/');
    }

    // 2. Filter Transactions by Time, Type, and Search
    const filteredTransactions = useMemo(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        const now = new Date();

        // Start of current week (Sunday)
        const dayOfWeek = now.getDay();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - dayOfWeek);
        startOfWeek.setHours(0, 0, 0, 0);

        // Start of current month
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        return transactions.filter((tx) => {
            const txDate = new Date(tx.date);

            // Time Filter Check
            if (timeFilter === 'today') {
                if (tx.date !== todayStr) return false;
            } else if (timeFilter === 'week') {
                if (txDate < startOfWeek) return false;
            } else if (timeFilter === 'month') {
                if (txDate < startOfMonth) return false;
            }

            // Type Filter Check
            if (typeFilter !== 'all' && tx.type !== typeFilter) {
                return false;
            }

            // Search Query Check
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase().trim();
                const matchesTitle = tx.title.toLowerCase().includes(query);
                const matchesCategory = tx.category.toLowerCase().includes(query);
                const matchesDesc = (tx.description || '').toLowerCase().includes(query);
                if (!matchesTitle && !matchesCategory && !matchesDesc) {
                    return false;
                }
            }

            return true;
        });
    }, [transactions, timeFilter, typeFilter, searchQuery]);

    // 3. Dynamic Financial Totals Calculation (from time-filtered transactions)
    const timeFilteredAllTypes = useMemo(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        const now = new Date();
        const dayOfWeek = now.getDay();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - dayOfWeek);
        startOfWeek.setHours(0, 0, 0, 0);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        return transactions.filter((tx) => {
            const txDate = new Date(tx.date);
            if (timeFilter === 'today') return tx.date === todayStr;
            if (timeFilter === 'week') return txDate >= startOfWeek;
            if (timeFilter === 'month') return txDate >= startOfMonth;
            return true;
        });
    }, [transactions, timeFilter]);

    const totalExpenses = useMemo(() => {
        return timeFilteredAllTypes
            .filter((t) => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
    }, [timeFilteredAllTypes]);

    const totalIncome = useMemo(() => {
        return timeFilteredAllTypes
            .filter((t) => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
    }, [timeFilteredAllTypes]);

    const balance = useMemo(() => {
        return totalIncome - totalExpenses;
    }, [totalIncome, totalExpenses]);

    // 4. Add Transaction Handler
    async function handleAddTransaction() {
        if (!newTitle.trim()) {
            Alert.alert('Required', 'Please enter the item or reason for this transaction.');
            return;
        }

        const parsedAmount = parseFloat(newAmount.replace(/,/g, ''));
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid amount greater than 0.');
            return;
        }

        setIsSubmitting(true);

        const todayDate = new Date().toISOString().split('T')[0];
        const newTx: Transaction = {
            id: `tx-${Date.now()}`,
            title: newTitle.trim(),
            type: newType,
            amount: parsedAmount,
            category: newCategory,
            description: newDescription.trim(),
            date: todayDate,
            created_at: new Date().toISOString(),
        };

        // Attempt Supabase insert
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            const { data: dbData, error: dbError } = await supabase
                .from('transactions')
                .insert({
                    user_id: user?.id || null,
                    title: newTx.title,
                    type: newTx.type,
                    amount: newTx.amount,
                    category: newTx.category,
                    description: newTx.description,
                    date: newTx.date,
                })
                .select()
                .single();

            if (!dbError && dbData) {
                newTx.id = dbData.id;
            }
        } catch {
            // Offline fallback
        }

        // Update local state & cache
        const updated = [newTx, ...transactions];
        setTransactions(updated);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

        // Reset Form
        setNewTitle('');
        setNewAmount('');
        setNewDescription('');
        setIsSubmitting(false);
        setShowAddModal(false);

        Alert.alert(
            'Success!',
            `${newType === 'expense' ? 'Expense' : 'Income'} of ₱ ${parsedAmount.toLocaleString()} added. Balance updated!`
        );
    }

    // 5. Delete Transaction Handler
    function handleDeleteTransaction(tx: Transaction) {
        setTransactionPendingDelete(tx);
        setShowDeleteDialog(true);
    }

    async function confirmDeleteTransaction() {
        const tx = transactionPendingDelete;
        if (!tx) return;
        setShowDeleteDialog(false);
        // Delete from Supabase
        try {
            await supabase.from('transactions').delete().eq('id', tx.id);
        } catch {
            // Ignore
        }

        // Delete from state & cache
        const updated = transactions.filter((t) => t.id !== tx.id);
        setTransactions(updated);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

        if (selectedTxForView?.id === tx.id) {
            setSelectedTxForView(null);
        }
        setTransactionPendingDelete(null);
    }

    // Helper icon selector based on category using Ionicons
    const getCategoryIcon = (category: string, type: 'expense' | 'income'): keyof typeof Ionicons.glyphMap => {
        if (type === 'income') return 'wallet-outline';
        return normalizeCategoryIcon(undefined, category);
    };

    return (
        <View style={[homeStyles.container, isDarkMode && homeStyles.containerDark]}>
            {/* USTP Yellow Top Accent Bar */}
            <View style={homeStyles.bannerYellow} />

            {/* Top Header */}
            <View style={[homeStyles.header, isDarkMode && homeStyles.headerDark]}>
                <View style={homeStyles.headerLeft}>
                    <TouchableOpacity
                        onPress={() => setShowSidebarDrawer(true)}
                        accessibilityLabel="Open Navigation Menu"
                    >
                        <Ionicons name="menu" size={24} color={isDarkMode ? '#F4C430' : '#000000'} />
                    </TouchableOpacity>
                    <Text style={[homeStyles.headerTitle, isDarkMode && homeStyles.headerTitleDark]}>
                        Dashboard
                    </Text>
                </View>

                <View style={homeStyles.headerRight}>
                    {/* Notification Bell with Badge */}
                    <TouchableOpacity
                        style={homeStyles.headerBellBtn}
                        onPress={() => setShowNotifModal(true)}
                        accessibilityLabel="Notifications from Admin"
                    >
                        <Ionicons
                            name={unreadNotifs.length > 0 ? "notifications" : "notifications-outline"}
                            size={22}
                            color={isDarkMode ? '#F4C430' : '#000000'}
                        />
                        {unreadNotifs.length > 0 && (
                            <View style={homeStyles.bellBadge}>
                                <Text style={homeStyles.bellBadgeText}>{unreadNotifs.length}</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setShowCalendarModal(true)}
                        accessibilityLabel="Financial Calendar"
                    >
                        <Ionicons name="calendar-outline" size={22} color={isDarkMode ? '#F4C430' : '#000000'} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleRefresh}>
                        <Ionicons name="refresh-outline" size={22} color={isDarkMode ? '#F4C430' : '#000000'} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleLogout}>
                        <Ionicons name="log-out-outline" size={24} color={isDarkMode ? '#F4C430' : '#000000'} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Live Notification Alert Banner from Admin */}
            {latestBannerNotif && (
                <View style={[homeStyles.notifBanner, isDarkMode && homeStyles.notifBannerDark]}>
                    <Ionicons name="notifications" size={20} color={isDarkMode ? '#F4C430' : '#003366'} />
                    <View style={homeStyles.notifBannerContent}>
                        <Text style={[homeStyles.notifBannerTitle, isDarkMode && { color: '#F4C430' }]}>
                            {latestBannerNotif.title}
                        </Text>
                        <Text style={[homeStyles.notifBannerText, isDarkMode && { color: '#E2E8F0' }]}>
                            {latestBannerNotif.message}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={homeStyles.notifBannerCloseBtn}
                        onPress={() => handleDismissNotification(latestBannerNotif.id)}
                    >
                        <Ionicons name="close" size={18} color={isDarkMode ? '#CBD5E1' : '#64748B'} />
                    </TouchableOpacity>
                </View>
            )}

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={homeStyles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
            >
                {/* Dynamic Financial Summary Card (Expenses | Income | Balance) */}
                <View style={[homeStyles.summaryCard, isDarkMode && homeStyles.summaryCardDark]}>
                    <View style={homeStyles.summaryItem}>
                        <Text style={homeStyles.summaryLabel}>Expenses</Text>
                        <Text style={homeStyles.summaryValue}>
                            ₱ {totalExpenses.toLocaleString()}
                        </Text>
                    </View>
                    <View style={homeStyles.summaryDivider} />
                    <View style={homeStyles.summaryItem}>
                        <Text style={homeStyles.summaryLabel}>Income</Text>
                        <Text style={homeStyles.summaryValue}>
                            ₱ {totalIncome.toLocaleString()}
                        </Text>
                    </View>
                    <View style={homeStyles.summaryDivider} />
                    <View style={homeStyles.summaryItem}>
                        <Text style={homeStyles.summaryLabel}>Balance</Text>
                        <Text
                            style={[
                                homeStyles.summaryValue,
                                balance < 0 ? { color: '#FFCDD2' } : { color: '#C8E6C9' },
                            ]}
                        >
                            ₱ {balance.toLocaleString()}
                        </Text>
                    </View>
                </View>

                {/* Search Bar (Placed below summary card) */}
                <View style={[homeStyles.searchContainer, isDarkMode && homeStyles.searchContainerDark]}>
                    <Ionicons name="search-outline" size={18} color={isDarkMode ? '#38BDF8' : '#003366'} />
                    <TextInput
                        style={[homeStyles.searchInput, isDarkMode && homeStyles.searchInputDark]}
                        placeholder="Search transactions by title, category, description..."
                        placeholderTextColor="#888888"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={18} color="#888888" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Time Filter Pills (Today, Week, Month, All Time) */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={homeStyles.timeFilterScroll}
                >
                    <View style={homeStyles.timeFilterContainer}>
                        <TouchableOpacity
                            style={[
                                homeStyles.timeFilterPill,
                                isDarkMode && homeStyles.timeFilterPillDark,
                                timeFilter === 'today' && homeStyles.timeFilterPillActive,
                            ]}
                            onPress={() => setTimeFilter('today')}
                        >
                            <Text
                                style={[
                                    homeStyles.timeFilterText,
                                    isDarkMode && homeStyles.timeFilterTextDark,
                                    timeFilter === 'today' && homeStyles.timeFilterTextActive,
                                ]}
                            >
                                Today
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                homeStyles.timeFilterPill,
                                isDarkMode && homeStyles.timeFilterPillDark,
                                timeFilter === 'week' && homeStyles.timeFilterPillActive,
                            ]}
                            onPress={() => setTimeFilter('week')}
                        >
                            <Text
                                style={[
                                    homeStyles.timeFilterText,
                                    isDarkMode && homeStyles.timeFilterTextDark,
                                    timeFilter === 'week' && homeStyles.timeFilterTextActive,
                                ]}
                            >
                                This Week
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                homeStyles.timeFilterPill,
                                isDarkMode && homeStyles.timeFilterPillDark,
                                timeFilter === 'month' && homeStyles.timeFilterPillActive,
                            ]}
                            onPress={() => setTimeFilter('month')}
                        >
                            <Text
                                style={[
                                    homeStyles.timeFilterText,
                                    isDarkMode && homeStyles.timeFilterTextDark,
                                    timeFilter === 'month' && homeStyles.timeFilterTextActive,
                                ]}
                            >
                                This Month
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                homeStyles.timeFilterPill,
                                isDarkMode && homeStyles.timeFilterPillDark,
                                timeFilter === 'all' && homeStyles.timeFilterPillActive,
                            ]}
                            onPress={() => setTimeFilter('all')}
                        >
                            <Text
                                style={[
                                    homeStyles.timeFilterText,
                                    isDarkMode && homeStyles.timeFilterTextDark,
                                    timeFilter === 'all' && homeStyles.timeFilterTextActive,
                                ]}
                            >
                                All Time
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>

                {/* Type Filter Tabs (All, Expenses, Income) */}
                <View style={homeStyles.typeFilterContainer}>
                    <TouchableOpacity
                        style={[
                            homeStyles.typeTab,
                            isDarkMode && homeStyles.typeTabDark,
                            typeFilter === 'all' && homeStyles.typeTabActiveAll,
                        ]}
                        onPress={() => setTypeFilter('all')}
                    >
                        <Text
                            style={[
                                homeStyles.typeTabText,
                                isDarkMode && homeStyles.typeTabTextDark,
                                typeFilter === 'all' && homeStyles.typeTabTextAll,
                            ]}
                        >
                            All Types
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            homeStyles.typeTab,
                            isDarkMode && homeStyles.typeTabDark,
                            typeFilter === 'expense' && homeStyles.typeTabActiveExpense,
                        ]}
                        onPress={() => setTypeFilter('expense')}
                    >
                        <Text
                            style={[
                                homeStyles.typeTabText,
                                isDarkMode && homeStyles.typeTabTextDark,
                                typeFilter === 'expense' && homeStyles.typeTabTextExpense,
                            ]}
                        >
                            Expenses
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            homeStyles.typeTab,
                            isDarkMode && homeStyles.typeTabDark,
                            typeFilter === 'income' && homeStyles.typeTabActiveIncome,
                        ]}
                        onPress={() => setTypeFilter('income')}
                    >
                        <Text
                            style={[
                                homeStyles.typeTabText,
                                isDarkMode && homeStyles.typeTabTextDark,
                                typeFilter === 'income' && homeStyles.typeTabTextIncome,
                            ]}
                        >
                            Income
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Structured Column Header Row */}
                <View style={[homeStyles.tableHeaderRow, isDarkMode && homeStyles.tableHeaderRowDark]}>
                    <Text style={[homeStyles.tableColTitle, isDarkMode && homeStyles.tableColDark]}>ITEM / TITLE</Text>
                    <Text style={[homeStyles.tableColType, isDarkMode && homeStyles.tableColDark]}>TYPE</Text>
                    <Text style={[homeStyles.tableColAmountDate, isDarkMode && homeStyles.tableColDark]}>AMOUNT / DATE</Text>
                    <Text style={[homeStyles.tableColAction, isDarkMode && homeStyles.tableColDark]}>ACTION</Text>
                </View>

                {/* Transaction Table / List */}
                <View style={homeStyles.transactionList}>
                    {filteredTransactions.length === 0 ? (
                        <View style={homeStyles.emptyState}>
                            <Ionicons name="receipt-outline" size={48} color="#BDBDBD" />
                            <Text style={[homeStyles.emptyStateTitle, isDarkMode && homeStyles.txTitleDark]}>
                                No Transactions Found
                            </Text>
                            <Text style={homeStyles.emptyStateSubtext}>
                                {searchQuery
                                    ? 'No results match your search query.'
                                    : 'Tap the "+" button below to add your first expense or income!'}
                            </Text>
                        </View>
                    ) : (
                        filteredTransactions.map((tx) => {
                            const isExpense = tx.type === 'expense';
                            const iconName = getCategoryIcon(tx.category, tx.type);

                            return (
                                <View key={tx.id} style={[homeStyles.transactionCard, isDarkMode && homeStyles.transactionCardDark]}>
                                    {/* Column 1: Item / Title */}
                                    <View style={homeStyles.txColTitle}>
                                        <View style={[homeStyles.iconContainer, isDarkMode && { backgroundColor: '#334155' }]}>
                                            <Ionicons
                                                name={iconName}
                                                size={20}
                                                color={isDarkMode ? '#F4C430' : '#003366'}
                                            />
                                        </View>
                                        <View style={homeStyles.txTitleGroup}>
                                            <Text style={[homeStyles.transactionTitle, isDarkMode && homeStyles.txTitleDark]} numberOfLines={1}>
                                                {tx.title}
                                            </Text>
                                            <Text style={[homeStyles.transactionCategory, isDarkMode && homeStyles.txCategoryDark]} numberOfLines={1}>
                                                {tx.category}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Column 2: Type */}
                                    <View style={homeStyles.txColType}>
                                        <View
                                            style={
                                                isExpense
                                                    ? homeStyles.typeBadgeExpense
                                                    : homeStyles.typeBadgeIncome
                                            }
                                        >
                                            <Text
                                                style={
                                                    isExpense
                                                        ? homeStyles.typeBadgeTextExpense
                                                        : homeStyles.typeBadgeTextIncome
                                                }
                                            >
                                                {isExpense ? 'Expense' : 'Income'}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Column 3: Amount / Date */}
                                    <View style={homeStyles.txColAmountDate}>
                                        <Text
                                            style={
                                                isExpense ? homeStyles.expenseAmount : homeStyles.incomeAmount
                                            }
                                        >
                                            {isExpense ? '-' : '+'}₱ {tx.amount.toLocaleString()}
                                        </Text>
                                        <Text style={[homeStyles.txDateText, isDarkMode && homeStyles.txCategoryDark]}>{tx.date}</Text>
                                    </View>

                                    {/* Column 4: Actions (View & Delete) */}
                                    <View style={homeStyles.txColAction}>
                                        <TouchableOpacity
                                            style={[homeStyles.actionIconBtn, isDarkMode && { backgroundColor: '#334155' }]}
                                            onPress={() => setSelectedTxForView(tx)}
                                        >
                                            <Ionicons name="eye-outline" size={16} color={isDarkMode ? '#38BDF8' : '#003366'} />
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[homeStyles.actionIconBtn, homeStyles.actionIconBtnDelete]}
                                            onPress={() => handleDeleteTransaction(tx)}
                                        >
                                            <Ionicons name="trash-outline" size={16} color="#D32F2F" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        })
                    )}
                </View>
            </ScrollView>

            {/* Bottom Navigation Bar with Center FAB */}
            <View style={[homeStyles.bottomNav, isDarkMode && homeStyles.bottomNavDark]}>
                <TouchableOpacity style={homeStyles.navItem}>
                    <Ionicons name="home" size={22} color={isDarkMode ? '#38BDF8' : '#003366'} />
                    <Text style={[homeStyles.navText, isDarkMode ? homeStyles.navTextActiveDark : homeStyles.navTextActive]}>Home</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={homeStyles.navItem}
                    onPress={() => router.push('/mother/reports')}
                >
                    <Ionicons name="bar-chart-outline" size={22} color={isDarkMode ? '#94A3B8' : '#757575'} />
                    <Text style={[homeStyles.navText, isDarkMode && homeStyles.navTextDark]}>Reports</Text>
                </TouchableOpacity>

                {/* Central Floating Action Button (Add Expense / Income) */}
                <TouchableOpacity
                    style={homeStyles.fab}
                    onPress={() => setShowAddModal(true)}
                >
                    <Ionicons name="add" size={28} color="#F4C430" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={homeStyles.navItem}
                    onPress={() => router.push('/mother/budget')}
                >
                    <Ionicons name="wallet-outline" size={22} color={isDarkMode ? '#94A3B8' : '#757575'} />
                    <Text style={[homeStyles.navText, isDarkMode && homeStyles.navTextDark]}>Budget</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={homeStyles.navItem}
                    onPress={() => router.push('/mother/reminders')}
                >
                    <Ionicons name="alarm-outline" size={22} color={isDarkMode ? '#94A3B8' : '#757575'} />
                    <Text style={[homeStyles.navText, isDarkMode && homeStyles.navTextDark]}>Reminders</Text>
                </TouchableOpacity>
            </View>

            {/* ========================================================= */}
            {/* GLOBAL ADD TRANSACTION MODAL (Expense / Income)           */}
            {/* ========================================================= */}
            <AddTransactionModal
                visible={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={(_newTx) => {
                    loadTransactions();
                }}
            />

            {/* ========================================================= */}
            {/* VIEW TRANSACTION DETAILS MODAL                            */}
            {/* ========================================================= */}
            <Modal
                visible={!!selectedTxForView}
                transparent
                animationType="fade"
                onRequestClose={() => setSelectedTxForView(null)}
            >
                <View style={homeStyles.modalOverlay}>
                    <View style={[homeStyles.modalContent, isDarkMode && homeStyles.modalContentDark]}>
                        <View style={homeStyles.modalHeader}>
                            <Text style={[homeStyles.modalTitle, isDarkMode && homeStyles.modalTitleDark]}>
                                Transaction Details
                            </Text>
                            <TouchableOpacity onPress={() => setSelectedTxForView(null)}>
                                <Ionicons name="close" size={24} color={isDarkMode ? '#F4C430' : '#003366'} />
                            </TouchableOpacity>
                        </View>

                        {selectedTxForView && (
                            <View>
                                <View style={[homeStyles.detailRow, isDarkMode && homeStyles.detailRowDark]}>
                                    <Text style={[homeStyles.detailLabel, isDarkMode && homeStyles.detailLabelDark]}>Type</Text>
                                    <Text
                                        style={[
                                            homeStyles.detailValue,
                                            {
                                                color:
                                                    selectedTxForView.type === 'expense'
                                                        ? '#D32F2F'
                                                        : '#2E7D32',
                                                textTransform: 'capitalize',
                                            },
                                        ]}
                                    >
                                        {selectedTxForView.type}
                                    </Text>
                                </View>

                                <View style={[homeStyles.detailRow, isDarkMode && homeStyles.detailRowDark]}>
                                    <Text style={[homeStyles.detailLabel, isDarkMode && homeStyles.detailLabelDark]}>Item / Reason</Text>
                                    <Text style={[homeStyles.detailValue, isDarkMode && homeStyles.detailValueDark]}>{selectedTxForView.title}</Text>
                                </View>

                                <View style={[homeStyles.detailRow, isDarkMode && homeStyles.detailRowDark]}>
                                    <Text style={[homeStyles.detailLabel, isDarkMode && homeStyles.detailLabelDark]}>Amount</Text>
                                    <Text
                                        style={[
                                            homeStyles.detailValue,
                                            {
                                                color:
                                                    selectedTxForView.type === 'expense'
                                                        ? '#D32F2F'
                                                        : '#2E7D32',
                                                fontSize: 16,
                                            },
                                        ]}
                                    >
                                        ₱ {selectedTxForView.amount.toLocaleString()}
                                    </Text>
                                </View>

                                <View style={[homeStyles.detailRow, isDarkMode && homeStyles.detailRowDark]}>
                                    <Text style={[homeStyles.detailLabel, isDarkMode && homeStyles.detailLabelDark]}>Category</Text>
                                    <Text style={[homeStyles.detailValue, isDarkMode && homeStyles.detailValueDark]}>
                                        {selectedTxForView.category}
                                    </Text>
                                </View>

                                <View style={[homeStyles.detailRow, isDarkMode && homeStyles.detailRowDark]}>
                                    <Text style={[homeStyles.detailLabel, isDarkMode && homeStyles.detailLabelDark]}>Date</Text>
                                    <Text style={[homeStyles.detailValue, isDarkMode && homeStyles.detailValueDark]}>{selectedTxForView.date}</Text>
                                </View>

                                {selectedTxForView.description ? (
                                    <View style={[homeStyles.detailRow, isDarkMode && homeStyles.detailRowDark, { flexDirection: 'column', gap: 4 }]}>
                                        <Text style={[homeStyles.detailLabel, isDarkMode && homeStyles.detailLabelDark]}>Description / Notes</Text>
                                        <Text style={[homeStyles.detailValue, isDarkMode && homeStyles.detailValueDark, { maxWidth: '100%', textAlign: 'left' }]}>
                                            {selectedTxForView.description}
                                        </Text>
                                    </View>
                                ) : null}

                                {selectedTxForView.receipt_url ? (
                                    <View style={[homeStyles.detailReceiptContainer, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
                                        <Text style={[homeStyles.detailLabel, isDarkMode && homeStyles.detailLabelDark, { alignSelf: 'flex-start', fontWeight: 'bold' }]}>
                                            🧾 Attached Receipt Proof
                                        </Text>
                                        <Image
                                            source={{ uri: selectedTxForView.receipt_url }}
                                            style={homeStyles.detailReceiptImage}
                                            resizeMode="cover"
                                        />
                                    </View>
                                ) : null}

                                <View style={homeStyles.modalBtnContainer}>
                                    <TouchableOpacity
                                        style={[
                                            homeStyles.modalCancelBtn,
                                            { borderColor: '#D32F2F', backgroundColor: '#FFEBEE' },
                                        ]}
                                        onPress={() => {
                                            const txToDelete = selectedTxForView;
                                            setSelectedTxForView(null);
                                            if (txToDelete) handleDeleteTransaction(txToDelete);
                                        }}
                                    >
                                        <Text style={{ color: '#D32F2F', fontWeight: 'bold' }}>
                                            Delete
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={homeStyles.modalSaveBtn}
                                        onPress={() => setSelectedTxForView(null)}
                                    >
                                        <Text style={homeStyles.modalSaveBtnText}>Close</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>

            <CalendarTrackerModal
                visible={showCalendarModal}
                onClose={() => setShowCalendarModal(false)}
                onRefreshData={loadTransactions}
            />


            <SidebarDrawer
                visible={showSidebarDrawer}
                onClose={() => setShowSidebarDrawer(false)}
                onRefreshData={loadTransactions}
            />


            <Modal
                visible={showNotifModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowNotifModal(false)}
            >
                <View style={homeStyles.modalOverlay}>
                    <View style={[homeStyles.modalContent, isDarkMode && homeStyles.modalContentDark]}>
                        <View style={homeStyles.modalHeader}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Ionicons name="notifications" size={22} color={isDarkMode ? '#F4C430' : '#003366'} />
                                <Text style={[homeStyles.modalTitle, isDarkMode && homeStyles.modalTitleDark]}>
                                    Admin Notices & Alerts
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => setShowNotifModal(false)}>
                                <Ionicons name="close" size={24} color={isDarkMode ? '#F4C430' : '#000000'} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
                            {notifications.length === 0 ? (
                                <Text style={{ textAlign: 'center', color: '#94A3B8', marginVertical: 30 }}>
                                    No notifications received yet.
                                </Text>
                            ) : (
                                notifications.map((n) => (
                                    <View
                                        key={n.id}
                                        style={[
                                            homeStyles.notifCard,
                                            !n.is_read && homeStyles.notifCardUnread,
                                            isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' },
                                        ]}
                                    >
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text
                                                style={[
                                                    homeStyles.notifCardTitle,
                                                    isDarkMode && { color: '#F4C430' },
                                                ]}
                                            >
                                                {n.title}
                                            </Text>
                                            {!n.is_read && (
                                                <TouchableOpacity onPress={() => handleDismissNotification(n.id)}>
                                                    <Text style={{ fontSize: 11, color: '#003366', fontWeight: 'bold' }}>
                                                        Mark as Read
                                                    </Text>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                        <Text
                                            style={[
                                                homeStyles.notifCardMsg,
                                                isDarkMode && { color: '#E2E8F0' },
                                            ]}
                                        >
                                            {n.message}
                                        </Text>
                                        <Text
                                            style={[
                                                homeStyles.notifCardTime,
                                                isDarkMode && { color: '#94A3B8' },
                                            ]}
                                        >
                                            {n.created_at ? new Date(n.created_at).toLocaleDateString() : 'Recent'} • USTP System Admin
                                        </Text>
                                    </View>
                                ))
                            )}
                        </ScrollView>

                        {/* <TouchableOpacity
                            style={[homeStyles.modalSaveBtn, { marginTop: 14 }]}
                            onPress={() => setShowNotifModal(false)}
                        >
                            <Text style={homeStyles.modalSaveBtnText}>Close</Text>
                        </TouchableOpacity> */}
                    </View>
                </View>
            </Modal>

            <AppDialog
                visible={showDeleteDialog}
                title="Delete Transaction"
                message={transactionPendingDelete ? `Delete "${transactionPendingDelete.title}" (₱ ${transactionPendingDelete.amount.toLocaleString()})?` : ''}
                icon="trash-outline"
                tone="danger"
                onRequestClose={() => setShowDeleteDialog(false)}
                actions={[
                    { label: 'Cancel', onPress: () => setShowDeleteDialog(false) },
                    { label: 'Delete', destructive: true, onPress: confirmDeleteTransaction },
                ]}
            />
            <AppDialog
                visible={showLogoutDialog}
                title="Sign Out"
                message="Are you sure you want to log out of Household Portal?"
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

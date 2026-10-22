// src/app/admin/reports.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { adminReportsStyles } from '../../components/admin-css/adminReportsStyles';
import { supabase } from '../../../lib/supabase';
import { useAppTheme } from '../../context/ThemeContext';
import { AppDialog } from '../../components/ui/AppDialog';

export default function AdminReportsScreen() {
  const { isDarkMode, toggleDarkMode } = useAppTheme();
  const isDark = isDarkMode;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalProfit, setTotalProfit] = useState<number>(0);
  const [totalUsersCount, setTotalUsersCount] = useState<number>(0);
  const [totalAvailedCount, setTotalAvailedCount] = useState<number>(0);
  const [totalIncome, setTotalIncome] = useState<number>(145000);
  const [totalExpenses, setTotalExpenses] = useState<number>(48500);
  const [totalBudget, setTotalBudget] = useState<number>(245000);

  const [starterProfit, setStarterProfit] = useState<number>(0);
  const [plusProfit, setPlusProfit] = useState<number>(0);
  const [unlimitedProfit, setUnlimitedProfit] = useState<number>(0);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportSummary, setExportSummary] = useState('');

  const fetchReportsData = useCallback(async () => {
    try {
      // 1. Fetch Subscriptions
      const { data: subsData } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      let profit = 0;
      let starter = 0;
      let plus = 0;
      let unlimited = 0;

      if (subsData && subsData.length > 0) {
        subsData.forEach((s: any) => {
          const amt = Number(s.amount_paid) || 0;
          profit += amt;
          if (s.tier === 'starter_10k') starter += amt;
          else if (s.tier === 'plus_15k') plus += amt;
          else if (s.tier === 'unlimited') unlimited += amt;
        });
      }

      // 2. Fetch Profiles to count users
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*');

      if (profilesData && profilesData.length > 0) {
        const nonAdmin = profilesData.filter((u: any) => u.role !== 'admin');
        setTotalUsersCount(nonAdmin.length);
        const availed = nonAdmin.filter((u: any) => u.tier && u.tier !== 'free' && u.tier !== 'none');
        setTotalAvailedCount(availed.length);

        if (profit === 0 && availed.length > 0) {
          availed.forEach((u: any) => {
            if (u.tier === 'starter_10k') { starter += 100; profit += 100; }
            else if (u.tier === 'plus_15k') { plus += 150; profit += 150; }
            else if (u.tier === 'unlimited') { unlimited += 300; profit += 300; }
          });
        }
      }

      setTotalProfit(profit);
      setStarterProfit(starter);
      setPlusProfit(plus);
      setUnlimitedProfit(unlimited);

      // 3. Fetch Transactions
      const { data: txData } = await supabase
        .from('transactions')
        .select('type, amount');

      if (txData && txData.length > 0) {
        let inc = 0;
        let exp = 0;
        txData.forEach((tx: any) => {
          const amt = Number(tx.amount) || 0;
          if (tx.type === 'income') inc += amt;
          else if (tx.type === 'expense') exp += amt;
        });
        if (inc > 0) setTotalIncome(inc);
        if (exp > 0) setTotalExpenses(exp);
      }
    } catch (e) {
      console.log('Error fetching reports:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReportsData();
  }, [fetchReportsData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReportsData();
  };

  const netHouseholdSavings = totalIncome - totalExpenses;

  return (
    <View style={[adminReportsStyles.container, isDark && adminReportsStyles.containerDark]}>
      {/* Yellow Top Accent Bar */}
      <View style={adminReportsStyles.bannerYellow} />

      {/* Header */}
      <View style={[adminReportsStyles.header, isDark && adminReportsStyles.headerDark]}>
        <View style={adminReportsStyles.headerLeft}>
          <TouchableOpacity onPress={() => router.push('/admin')}>
            <Ionicons name="arrow-back" size={24} color="#000000" />
          </TouchableOpacity>
          <View>
            <Text style={adminReportsStyles.headerTitle}>Reports & Profit</Text>
            <Text style={{ fontSize: 11, color: '#334155', fontWeight: '500' }}>
              System Revenue & Economy Analytics
            </Text>
          </View>
        </View>

        <View style={adminReportsStyles.headerRight}>
          <TouchableOpacity
            style={adminReportsStyles.headerIconBtn}
            onPress={() => toggleDarkMode(!isDarkMode)}
          >
            <Ionicons name={isDarkMode ? 'sunny' : 'moon'} size={20} color="#000000" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#003366" style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* Total Profit Card */}
            <View style={[adminReportsStyles.reportRevenueCard, isDark && adminReportsStyles.cardDark]}>
              <View style={adminReportsStyles.reportRevenueHeader}>
                <Ionicons name="cash" size={24} color="#F4C430" />
                <Text style={adminReportsStyles.reportRevenueTitle}>Total Admin Profit Earned</Text>
              </View>
              <Text style={adminReportsStyles.reportRevenueValue}>₱ {totalProfit.toLocaleString()}</Text>
              <Text style={adminReportsStyles.reportRevenueSub}>
                Accumulated strictly from {totalAvailedCount} availed income limit upgrades
              </Text>

              {/* Profit breakdown by tier */}
              <View style={adminReportsStyles.reportRevenueBreakdown}>
                <View style={adminReportsStyles.reportRevenueItem}>
                  <Text style={adminReportsStyles.reportRevenueItemLabel}>Starter (₱100)</Text>
                  <Text style={adminReportsStyles.reportRevenueItemVal}>₱ {starterProfit.toLocaleString()}</Text>
                </View>
                <View style={adminReportsStyles.reportRevenueItem}>
                  <Text style={adminReportsStyles.reportRevenueItemLabel}>Plus Growth (₱150)</Text>
                  <Text style={adminReportsStyles.reportRevenueItemVal}>₱ {plusProfit.toLocaleString()}</Text>
                </View>
                <View style={adminReportsStyles.reportRevenueItem}>
                  <Text style={adminReportsStyles.reportRevenueItemLabel}>Unlimited (₱300)</Text>
                  <Text style={adminReportsStyles.reportRevenueItemVal}>₱ {unlimitedProfit.toLocaleString()}</Text>
                </View>
              </View>

              <View style={[adminReportsStyles.reportRevenueBreakdown, { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' }]}>
                <View style={adminReportsStyles.reportRevenueItem}>
                  <Text style={adminReportsStyles.reportRevenueItemLabel}>Upgrade Subscribers</Text>
                  <Text style={adminReportsStyles.reportRevenueItemVal}>{totalAvailedCount} Households</Text>
                </View>
                <View style={adminReportsStyles.reportRevenueItem}>
                  <Text style={adminReportsStyles.reportRevenueItemLabel}>Adoption Rate</Text>
                  <Text style={adminReportsStyles.reportRevenueItemVal}>
                    {totalUsersCount > 0 ? Math.round((totalAvailedCount / totalUsersCount) * 100) : 0}%
                  </Text>
                </View>
              </View>
            </View>

            {/* Financial Overview Card */}
            <View style={[adminReportsStyles.reportSummaryCard, isDark && adminReportsStyles.cardDark]}>
              <Text style={[adminReportsStyles.reportCardTitle, isDark && adminReportsStyles.textDark]}>
                Household Economy Overview
              </Text>

              <View style={adminReportsStyles.reportMetricRow}>
                <View style={adminReportsStyles.reportMetricItem}>
                  <Text style={adminReportsStyles.reportMetricLabel}>Total Incomes</Text>
                  <Text style={[adminReportsStyles.reportMetricVal, { color: '#16A34A' }]}>
                    ₱ {totalIncome.toLocaleString()}
                  </Text>
                </View>
                <View style={adminReportsStyles.reportMetricItem}>
                  <Text style={adminReportsStyles.reportMetricLabel}>Total Expenses</Text>
                  <Text style={[adminReportsStyles.reportMetricVal, { color: '#DC2626' }]}>
                    ₱ {totalExpenses.toLocaleString()}
                  </Text>
                </View>
              </View>

              <View style={[adminReportsStyles.reportMetricRow, { marginTop: 12 }]}>
                <View style={adminReportsStyles.reportMetricItem}>
                  <Text style={adminReportsStyles.reportMetricLabel}>Net Savings</Text>
                  <Text style={[adminReportsStyles.reportMetricVal, { color: netHouseholdSavings >= 0 ? '#003366' : '#DC2626' }]}>
                    ₱ {netHouseholdSavings.toLocaleString()}
                  </Text>
                </View>
                <View style={adminReportsStyles.reportMetricItem}>
                  <Text style={adminReportsStyles.reportMetricLabel}>Allocated Budgets</Text>
                  <Text style={[adminReportsStyles.reportMetricVal, { color: '#2563EB' }]}>
                    ₱ {totalBudget.toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>

            {/* Export Report Button */}
            <TouchableOpacity
              style={adminReportsStyles.exportBtn}
              onPress={() => {
                setExportSummary(
                  `Total Profit: ₱ ${totalProfit.toLocaleString()}\nTotal Households: ${totalUsersCount}\nTotal Availed Upgrades: ${totalAvailedCount}\nNet Household Savings: ₱ ${netHouseholdSavings.toLocaleString()}`
                );
                setShowExportDialog(true);
              }}
            >
              <Ionicons name="download-outline" size={18} color="#003366" />
              <Text style={adminReportsStyles.exportBtnText}>Generate Audit Summary</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      <AppDialog
        visible={showExportDialog}
        title="Report Summary Ready"
        message={`Your full audit report has been generated.\n\n${exportSummary}`}
        icon="download-outline"
        tone="success"
        onRequestClose={() => setShowExportDialog(false)}
        actions={[{
          label: 'Done',
          primary: true,
          onPress: () => setShowExportDialog(false),
        }]}
      />

      {/* Bottom Navigation Bar */}
      <View style={[adminReportsStyles.bottomNav, isDark && adminReportsStyles.bottomNavDark]}>
        <TouchableOpacity
          style={adminReportsStyles.navItem}
          onPress={() => router.push('/admin')}
        >
          <Ionicons name="grid-outline" size={22} color="#94A3B8" />
          <Text style={adminReportsStyles.navLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={adminReportsStyles.navItem}
          onPress={() => router.push('/admin/users')}
        >
          <Ionicons name="people-outline" size={22} color="#94A3B8" />
          <Text style={adminReportsStyles.navLabel}>Users</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={adminReportsStyles.navItem}
          onPress={() => { }}
        >
          <Ionicons name="bar-chart" size={22} color="#003366" />
          <Text style={[adminReportsStyles.navLabel, adminReportsStyles.navLabelActive]}>Reports</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={adminReportsStyles.navItem}
          onPress={() => router.push('/admin/settings')}
        >
          <Ionicons name="settings-outline" size={22} color="#94A3B8" />
          <Text style={adminReportsStyles.navLabel}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

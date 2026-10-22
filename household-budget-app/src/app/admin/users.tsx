// src/app/admin/users.tsx
import React, { useState, useEffect, useCallback } from 'react';
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
import { adminUsersStyles } from '../../components/admin-css/adminUsersStyles';
import { supabase } from '../../../lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { useAppTheme } from '../../context/ThemeContext';
import { AppDialog } from '../../components/ui/AppDialog';
import { UserProfile, SystemPlanConfig } from './index';

export default function AdminUsersScreen() {
  const { isDarkMode, toggleDarkMode } = useAppTheme();
  const isDark = isDarkMode;
  const router = useRouter();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [userFilter, setUserFilter] = useState<'all' | 'availed' | 'free'>('all');

  // User Details Modal
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  // Notify Modal
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notifyRecipientEmail, setNotifyRecipientEmail] = useState('');
  const [notifyTitle, setNotifyTitle] = useState('');
  const [notifyMessage, setNotifyMessage] = useState('');
  const [isSendingNotification, setIsSendingNotification] = useState(false);

  // Provision User Modal State
  const [showProvisionModal, setShowProvisionModal] = useState(false);
  const [provisionName, setProvisionName] = useState('');
  const [provisionEmail, setProvisionEmail] = useState('');
  const [provisionPassword, setProvisionPassword] = useState('');
  const [provisionTier, setProvisionTier] = useState<'free' | 'starter_10k' | 'plus_15k' | 'unlimited'>('free');
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [adminDialog, setAdminDialog] = useState<{
    visible: boolean;
    title: string;
    message: string;
    tone: 'success' | 'info' | 'warning' | 'danger';
    icon: 'checkmark-circle-outline' | 'person-add-outline' | 'trash-outline';
  }>({ visible: false, title: '', message: '', tone: 'info', icon: 'checkmark-circle-outline' });

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

  const getTierLabel = (tier?: string) => {
    switch (tier) {
      case 'starter_10k':
        return 'Starter Booster (₱10k)';
      case 'plus_15k':
        return 'Plus Growth (₱15k)';
      case 'unlimited':
        return 'Unlimited Pro (₱1M)';
      default:
        return 'Free Basic (₱5k)';
    }
  };

  const isUserAvailed = (tier?: string) => {
    return tier && tier !== 'free' && tier !== 'none';
  };

  const fetchUsers = useCallback(async () => {
    try {
      // 1. Fetch from Supabase profiles
      const { data: profilesData, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      // 2. Fetch subscriptions to accurately map tiers
      const { data: subsData } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      const subsByUser: Record<string, any> = {};
      if (subsData && subsData.length > 0) {
        subsData.forEach((s: any) => {
          if (s.user_id && !subsByUser[s.user_id]) subsByUser[s.user_id] = s;
          if (s.user_email) {
            const cleanEmail = s.user_email.trim().toLowerCase();
            if (!subsByUser[cleanEmail]) subsByUser[cleanEmail] = s;
          }
        });
      }

      // 3. Load locally registered users from AsyncStorage
      let localRegisteredUsers: any[] = [];
      try {
        const localRegRaw = await AsyncStorage.getItem('@household_registered_users');
        if (localRegRaw) {
          const parsed = JSON.parse(localRegRaw);
          if (Array.isArray(parsed)) localRegisteredUsers = parsed;
        }
      } catch { }

      // 4. Merge into unified list
      const unifiedMap = new Map<string, any>();

      if (!profileErr && profilesData && profilesData.length > 0) {
        profilesData.forEach((p: any) => {
          const key = (p.email || p.id || '').trim().toLowerCase();
          if (key) unifiedMap.set(key, p);
        });
      }

      if (localRegisteredUsers.length > 0) {
        localRegisteredUsers.forEach((u: any) => {
          const key = (u.email || u.id || '').trim().toLowerCase();
          if (key) {
            if (!unifiedMap.has(key)) {
              unifiedMap.set(key, u);
            } else {
              const existing = unifiedMap.get(key);
              unifiedMap.set(key, { ...u, ...existing });
            }
          }
        });
      }

      const allUnified = Array.from(unifiedMap.values());

      const mappedUsers: UserProfile[] = allUnified.map((item: any, idx: number) => {
        const uid = item.id || `profile-${idx}`;
        const cleanEmail = (item.email || '').trim().toLowerCase();
        const sub = subsByUser[uid] || subsByUser[cleanEmail];

        let tier = 'free';
        if (sub && sub.tier) tier = sub.tier;
        else if (item.tier && item.tier !== 'none') tier = item.tier;

        let income_cap = Number(item.income_cap);
        if (sub && sub.income_cap) income_cap = Number(sub.income_cap);
        else if (!income_cap || isNaN(income_cap)) {
          if (tier === 'starter_10k') income_cap = 10000;
          else if (tier === 'plus_15k') income_cap = 15000;
          else if (tier === 'unlimited') income_cap = 1000000;
          else income_cap = 5000;
        }

        let tier_expires_at = item.tier_expires_at;
        if (sub && sub.expires_at) tier_expires_at = sub.expires_at;

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
          total_income: item.total_income || 0,
          total_expenses: item.total_expenses || 0,
          total_budget: item.total_budget || 38000,
        };
      });

      setUsers(mappedUsers);
    } catch (e) {
      console.log('Error fetching users:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const handleOpenUserDetail = (user: UserProfile) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleOpenNotifyComposer = (user: UserProfile) => {
    setNotifyRecipientEmail(user.email);
    setNotifyTitle('Important Account Update');
    setNotifyMessage(
      `Hello ${user.householdName || 'Household'}, your account is active. Keep your expenses and income logged regularly!`
    );
    setShowNotifyModal(true);
  };

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
            setAdminDialog({
              visible: true,
              title: 'User Account Deleted',
              message: `User account ${user.email} has been removed successfully.`,
              tone: 'success',
              icon: 'trash-outline',
            });
            fetchUsers();
          },
        },
      ]
    );
  };

  const handleSendNotification = async () => {
    if (!notifyTitle.trim() || !notifyMessage.trim()) {
      Alert.alert('Missing Fields', 'Please enter a notification title and message.');
      return;
    }

    setIsSendingNotification(true);
    try {
      await supabase.from('notifications').insert({
        user_email: notifyRecipientEmail.trim(),
        title: notifyTitle.trim(),
        message: notifyMessage.trim(),
        type: 'reminder',
      });

      Alert.alert(
        'Notification Sent! 🔔',
        `Your notification has been dispatched to "${notifyRecipientEmail}".`
      );
      setShowNotifyModal(false);
      setNotifyTitle('');
      setNotifyMessage('');
    } catch {
      Alert.alert('Error', 'Failed to dispatch notification.');
    } finally {
      setIsSendingNotification(false);
    }
  };

  // In-Place Provision User (Admin does NOT get logged out)
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
      // Create non-persisting client so admin session is never replaced
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

      // Insert directly into public.profiles
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

      // If upgraded tier, insert into subscriptions table
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
      }

      // Update local registered users cache
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

      // Update in-memory users state
      setUsers((prev) => [newHouseholdUser, ...prev.filter((u) => u.email?.toLowerCase() !== cleanEmail)]);

      // Reset and close modal
      setShowProvisionModal(false);
      setProvisionName('');
      setProvisionEmail('');
      setProvisionPassword('');
      setProvisionTier('free');

      setAdminDialog({
        visible: true,
        title: 'User Provisioned Successfully',
        message: `Household account for "${cleanEmail}" is connected to Supabase.\n\nTier: ${getTierLabel(provisionTier)}\nIncome Cap: ₱${incomeCap.toLocaleString()}`,
        tone: 'success',
        icon: 'person-add-outline',
      });
    } catch (err: any) {
      Alert.alert('Provisioning Notice', `Household user registered: ${err?.message || 'Ready in system'}`);
    } finally {
      setIsProvisioning(false);
    }
  };

  const nonAdminUsers = users.filter((u) => u.role.toLowerCase() !== 'admin');
  const totalUsersCount = nonAdminUsers.length;
  const availedUsers = nonAdminUsers.filter((u) => isUserAvailed(u.tier));
  const totalAvailedCount = availedUsers.length;
  const freeUsersCount = totalUsersCount - totalAvailedCount;

  const filteredUsersList = nonAdminUsers.filter((user) => {
    const isAvailed = isUserAvailed(user.tier);
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

  return (
    <View style={[adminUsersStyles.container, isDark && adminUsersStyles.containerDark]}>
      {/* Yellow Top Accent Bar */}
      <View style={adminUsersStyles.bannerYellow} />

      {/* Header */}
      <View style={[adminUsersStyles.header, isDark && adminUsersStyles.headerDark]}>
        <View style={adminUsersStyles.headerLeft}>
          <TouchableOpacity onPress={() => router.push('/admin')}>
            <Ionicons name="arrow-back" size={24} color="#000000" />
          </TouchableOpacity>
          <View>
            <Text style={adminUsersStyles.headerTitle}>Household Accounts</Text>
            <Text style={{ fontSize: 11, color: '#334155', fontWeight: '500' }}>
              {totalUsersCount} Total • {totalAvailedCount} Upgraded
            </Text>
          </View>
        </View>

        <View style={adminUsersStyles.headerRight}>
          <TouchableOpacity
            style={adminUsersStyles.headerIconBtn}
            onPress={() => setShowProvisionModal(true)}
          >
            <Ionicons name="person-add" size={20} color="#000000" />
          </TouchableOpacity>
          <TouchableOpacity
            style={adminUsersStyles.headerIconBtn}
            onPress={() => setShowSearchBar(!showSearchBar)}
          >
            <Ionicons name="search" size={20} color="#000000" />
          </TouchableOpacity>
          <TouchableOpacity
            style={adminUsersStyles.headerIconBtn}
            onPress={() => toggleDarkMode(!isDarkMode)}
          >
            <Ionicons name={isDarkMode ? 'sunny' : 'moon'} size={20} color="#000000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      {showSearchBar && (
        <View style={[adminUsersStyles.searchBarContainer, isDark && adminUsersStyles.searchBarContainerDark]}>
          <Ionicons name="search" size={18} color="#64748B" />
          <TextInput
            style={[adminUsersStyles.searchInput, isDark && adminUsersStyles.textDark]}
            placeholder="Search email, household, or tier..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#64748B" />
            </TouchableOpacity>
          )}
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Filter Tabs */}
        <View style={[adminUsersStyles.filterTabsContainer, { marginTop: 14 }]}>
          <TouchableOpacity
            style={[
              adminUsersStyles.filterTab,
              userFilter === 'all' && adminUsersStyles.filterTabActive,
            ]}
            onPress={() => setUserFilter('all')}
          >
            <Text
              style={[
                adminUsersStyles.filterTabText,
                userFilter === 'all' && adminUsersStyles.filterTabTextActive,
              ]}
            >
              All ({totalUsersCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              adminUsersStyles.filterTab,
              userFilter === 'availed' && adminUsersStyles.filterTabActive,
            ]}
            onPress={() => setUserFilter('availed')}
          >
            <Text
              style={[
                adminUsersStyles.filterTabText,
                userFilter === 'availed' && adminUsersStyles.filterTabTextActive,
              ]}
            >
              ⭐ Availed ({totalAvailedCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              adminUsersStyles.filterTab,
              userFilter === 'free' && adminUsersStyles.filterTabActive,
            ]}
            onPress={() => setUserFilter('free')}
          >
            <Text
              style={[
                adminUsersStyles.filterTabText,
                userFilter === 'free' && adminUsersStyles.filterTabTextActive,
              ]}
            >
              Free Basic ({freeUsersCount})
            </Text>
          </TouchableOpacity>
        </View>

        {/* User Cards List */}
        {loading ? (
          <ActivityIndicator size="large" color="#003366" style={{ marginTop: 40 }} />
        ) : filteredUsersList.length === 0 ? (
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
                  adminUsersStyles.userCard,
                  isDark && adminUsersStyles.cardDark,
                  { flexDirection: 'column', alignItems: 'stretch' },
                ]}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={adminUsersStyles.userLeft}>
                    <View style={adminUsersStyles.avatarContainer}>
                      <Ionicons name="person-outline" size={22} color="#003366" />
                    </View>
                    <View style={adminUsersStyles.userInfo}>
                      <Text
                        style={[adminUsersStyles.userEmailText, isDark && adminUsersStyles.textDark]}
                        numberOfLines={1}
                      >
                        {user.email}
                      </Text>
                      <Text style={[adminUsersStyles.userDateText, isDark && adminUsersStyles.textMutedDark]}>
                        {user.householdName || 'Family Household'} • Joined {user.created_at || 'Recently'}
                      </Text>
                    </View>
                  </View>

                  <View style={adminUsersStyles.statusBadge}>
                    <View style={adminUsersStyles.statusDot} />
                    <Text style={adminUsersStyles.statusText}>Active</Text>
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
                  <View style={availed ? adminUsersStyles.tierBadgePaid : adminUsersStyles.tierBadgeFree}>
                    <Text
                      style={
                        availed
                          ? adminUsersStyles.tierBadgePaidText
                          : adminUsersStyles.tierBadgeFreeText
                      }
                    >
                      {availed ? `⭐ Upgrade: ${getTierLabel(user.tier)}` : 'Limit: Free Basic (₱5,000)'}
                    </Text>
                  </View>

                  {/* ONLY View Button on Outside Card */}
                  <View style={adminUsersStyles.userActionRow}>
                    <TouchableOpacity
                      style={adminUsersStyles.userViewBtn}
                      onPress={() => handleOpenUserDetail(user)}
                    >
                      <Ionicons name="eye-outline" size={14} color="#003366" />
                      <Text style={adminUsersStyles.userViewBtnText}>View</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* User Details Modal (With Notify and Delete inside) */}
      <Modal
        visible={showUserModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowUserModal(false)}
      >
        <View style={adminUsersStyles.modalOverlay}>
          <View style={[adminUsersStyles.modalContent, isDark && adminUsersStyles.modalContentDark]}>
            <View style={adminUsersStyles.modalHeader}>
              <Text style={[adminUsersStyles.modalTitle, isDark && adminUsersStyles.textDark]}>
                Household Member Details
              </Text>
              <TouchableOpacity onPress={() => setShowUserModal(false)}>
                <Ionicons name="close" size={24} color={isDark ? '#F8FAFC' : '#003366'} />
              </TouchableOpacity>
            </View>

            {selectedUser && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={adminUsersStyles.modalBodyItem}>
                  <Text style={adminUsersStyles.modalLabel}>Email Address</Text>
                  <Text style={[adminUsersStyles.modalValue, isDark && adminUsersStyles.textDark]}>
                    {selectedUser.email}
                  </Text>
                </View>

                <View style={adminUsersStyles.modalBodyItem}>
                  <Text style={adminUsersStyles.modalLabel}>Household Designation</Text>
                  <Text style={[adminUsersStyles.modalValue, isDark && adminUsersStyles.textDark]}>
                    {selectedUser.householdName || 'Family Budgeter'}
                  </Text>
                </View>

                <View style={adminUsersStyles.modalBodyItem}>
                  <Text style={adminUsersStyles.modalLabel}>Current Income Limit Status</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <View style={isUserAvailed(selectedUser.tier) ? adminUsersStyles.tierBadgePaid : adminUsersStyles.tierBadgeFree}>
                      <Text
                        style={
                          isUserAvailed(selectedUser.tier)
                            ? adminUsersStyles.tierBadgePaidText
                            : adminUsersStyles.tierBadgeFreeText
                        }
                      >
                        {isUserAvailed(selectedUser.tier)
                          ? `⭐ ${getTierLabel(selectedUser.tier)} (Cap: ₱${(selectedUser.income_cap || 10000).toLocaleString()})`
                          : 'Free Basic Tier (Cap: ₱5,000)'}
                      </Text>
                    </View>
                  </View>
                </View>

                {isUserAvailed(selectedUser.tier) && (
                  <View style={adminUsersStyles.remainingTimeCard}>
                    <View style={adminUsersStyles.remainingTimeHeader}>
                      <Ionicons name="time" size={16} color="#92400E" />
                      <Text style={adminUsersStyles.remainingTimeLabel}>Remaining Upgrade Access</Text>
                    </View>
                    <Text style={adminUsersStyles.remainingTimeValue}>
                      ⏳ {getRemainingTimeInfo(selectedUser.tier_expires_at).text}
                    </Text>
                    <Text style={adminUsersStyles.remainingTimeSub}>
                      Expires on: {selectedUser.tier_expires_at || 'Active Plan'}
                    </Text>
                  </View>
                )}

                {/* Financial Overview */}
                <View style={adminUsersStyles.modalBodyItem}>
                  <Text style={adminUsersStyles.modalLabel}>Household Financial Overview</Text>
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

                <View style={adminUsersStyles.modalBodyItem}>
                  <Text style={adminUsersStyles.modalLabel}>Member Since</Text>
                  <Text style={[adminUsersStyles.modalValue, isDark && adminUsersStyles.textDark]}>
                    {selectedUser.created_at || 'August 2024'}
                  </Text>
                </View>

                {/* Administrative Actions: Notify and Delete */}
                <View
                  style={{
                    marginTop: 14,
                    paddingTop: 12,
                    borderTopWidth: 1,
                    borderTopColor: isDark ? '#334155' : '#E2E8F0',
                  }}
                >
                  <Text style={[adminUsersStyles.modalLabel, { marginBottom: 8 }]}>Administrative Actions</Text>
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

            <View style={adminUsersStyles.modalActions}>
              <TouchableOpacity
                style={adminUsersStyles.modalCloseBtn}
                onPress={() => setShowUserModal(false)}
              >
                <Text style={adminUsersStyles.modalCloseBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Notify Modal */}
      <Modal
        visible={showNotifyModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNotifyModal(false)}
      >
        <View style={adminUsersStyles.modalOverlay}>
          <View style={[adminUsersStyles.modalContent, isDark && adminUsersStyles.modalContentDark]}>
            <View style={adminUsersStyles.modalHeader}>
              <Text style={[adminUsersStyles.modalTitle, isDark && adminUsersStyles.textDark]}>
                Send Notification to Household
              </Text>
              <TouchableOpacity onPress={() => setShowNotifyModal(false)}>
                <Ionicons name="close" size={24} color={isDark ? '#F8FAFC' : '#003366'} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ marginBottom: 12 }}>
                <Text style={adminUsersStyles.settingsInputLabel}>Recipient Household</Text>
                <TextInput
                  style={[adminUsersStyles.settingsTextInput, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}
                  editable={false}
                  value={notifyRecipientEmail}
                />
              </View>

              <View style={{ marginBottom: 12 }}>
                <Text style={adminUsersStyles.settingsInputLabel}>Notification Title</Text>
                <TextInput
                  style={adminUsersStyles.settingsTextInput}
                  placeholder="e.g. Upgrade Limit Renewal Reminder"
                  placeholderTextColor="#94A3B8"
                  value={notifyTitle}
                  onChangeText={setNotifyTitle}
                />
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={adminUsersStyles.settingsInputLabel}>Notification Message</Text>
                <TextInput
                  style={adminUsersStyles.settingsTextArea}
                  multiline
                  numberOfLines={4}
                  placeholder="Write message for the user's dashboard..."
                  placeholderTextColor="#94A3B8"
                  value={notifyMessage}
                  onChangeText={setNotifyMessage}
                />
              </View>

              <TouchableOpacity
                style={[
                  adminUsersStyles.settingsSaveButton,
                  { backgroundColor: '#003366' },
                  isSendingNotification && { opacity: 0.7 },
                ]}
                disabled={isSendingNotification}
                onPress={handleSendNotification}
              >
                {isSendingNotification ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Ionicons name="send" size={16} color="#FFFFFF" />
                    <Text style={adminUsersStyles.settingsSaveButtonText}>Dispatch Notification</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* In-Place User Provisioning Modal (Admin Stays Logged In) */}
      <Modal
        visible={showProvisionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowProvisionModal(false)}
      >
        <View style={adminUsersStyles.modalOverlay}>
          <View style={[adminUsersStyles.modalContent, isDark && adminUsersStyles.modalContentDark, { maxHeight: '88%' }]}>
            <View style={adminUsersStyles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="person-add" size={22} color="#003366" />
                <Text style={[adminUsersStyles.modalTitle, isDark && adminUsersStyles.textDark]}>
                  Provision Household User
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowProvisionModal(false)}>
                <Ionicons name="close" size={24} color={isDark ? '#F4C430' : '#003366'} />
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 12, color: '#64748B', marginBottom: 14 }}>
              Provision accounts directly into Supabase without disrupting your administrator login.
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[adminUsersStyles.settingsInputLabel, isDark && adminUsersStyles.textDark]}>
                Household / Full Name
              </Text>
              <TextInput
                style={[adminUsersStyles.settingsTextInput, isDark && adminUsersStyles.inputDark, { marginBottom: 10 }]}
                placeholder="e.g. Maria Santos Household"
                placeholderTextColor={isDark ? '#94A3B8' : '#888888'}
                value={provisionName}
                onChangeText={setProvisionName}
              />

              <Text style={[adminUsersStyles.settingsInputLabel, isDark && adminUsersStyles.textDark]}>
                Email Address *
              </Text>
              <TextInput
                style={[adminUsersStyles.settingsTextInput, isDark && adminUsersStyles.inputDark, { marginBottom: 10 }]}
                placeholder="e.g. maria@household.com"
                placeholderTextColor={isDark ? '#94A3B8' : '#888888'}
                keyboardType="email-address"
                autoCapitalize="none"
                value={provisionEmail}
                onChangeText={setProvisionEmail}
              />

              <Text style={[adminUsersStyles.settingsInputLabel, isDark && adminUsersStyles.textDark]}>
                Temporary Password *
              </Text>
              <TextInput
                style={[adminUsersStyles.settingsTextInput, isDark && adminUsersStyles.inputDark, { marginBottom: 12 }]}
                placeholder="Minimum 6 characters"
                placeholderTextColor={isDark ? '#94A3B8' : '#888888'}
                secureTextEntry
                value={provisionPassword}
                onChangeText={setProvisionPassword}
              />

              <Text style={[adminUsersStyles.settingsInputLabel, isDark && adminUsersStyles.textDark, { marginBottom: 6 }]}>
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

            {/* Centralized Side-by-Side Action Buttons: | Cancel | | Provision Account | */}
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
                onPress={() => setShowProvisionModal(false)}
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
      <AppDialog
        visible={adminDialog.visible}
        title={adminDialog.title}
        message={adminDialog.message}
        tone={adminDialog.tone}
        icon={adminDialog.icon}
        onRequestClose={() => setAdminDialog((current) => ({ ...current, visible: false }))}
        actions={[{
          label: 'Done',
          primary: true,
          onPress: () => setAdminDialog((current) => ({ ...current, visible: false })),
        }]}
      />

      {/* Bottom Navigation Bar */}
      <View style={[adminUsersStyles.bottomNav, isDark && adminUsersStyles.bottomNavDark]}>
        <TouchableOpacity
          style={adminUsersStyles.navItem}
          onPress={() => router.push('/admin')}
        >
          <Ionicons name="grid-outline" size={22} color="#757575" />
          <Text style={adminUsersStyles.navText}>Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={adminUsersStyles.navItem}
          onPress={() => { }}
        >
          <Ionicons name="people" size={22} color="#003366" />
          <Text style={adminUsersStyles.navTextActive}>Users</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={adminUsersStyles.navItem}
          onPress={() => router.push('/admin/reports')}
        >
          <Ionicons name="bar-chart-outline" size={22} color="#757575" />
          <Text style={adminUsersStyles.navText}>Reports</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={adminUsersStyles.navItem}
          onPress={() => router.push('/admin/settings')}
        >
          <Ionicons name="settings-outline" size={22} color="#757575" />
          <Text style={adminUsersStyles.navText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

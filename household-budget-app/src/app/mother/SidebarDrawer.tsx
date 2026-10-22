// src/app/mother/SidebarDrawer.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { sidebarStyles } from '../../components/mother-css/sidebarStyles';
import { SubscriptionModal, SUBSCRIPTION_PLANS } from './SubscriptionModal';
import { useAppTheme } from '../../context/ThemeContext';
import { AppDialog } from '../../components/ui/AppDialog';

export interface SidebarDrawerProps {
  visible?: boolean;
  onClose?: () => void;
  onRefreshData?: () => void;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  visible = false,
  onClose = () => { },
  onRefreshData,
}) => {
  const router = useRouter();
  const { isDarkMode, toggleDarkMode } = useAppTheme();
  const [userName, setUserName] = useState('Household Mother');
  const [userEmail, setUserEmail] = useState('mother@household.app');
  const [activeTier, setActiveTier] = useState('free');
  const [incomeCap, setIncomeCap] = useState(5000);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Load User and Subscription Profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserEmail(user.email || 'mother@household.app');
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

          if (profile) {
            if (profile.full_name) setUserName(profile.full_name);
            if (profile.tier) setActiveTier(profile.tier);
            if (profile.income_cap) setIncomeCap(Number(profile.income_cap));
          }
        }

        if (user) {
          const savedTier = await AsyncStorage.getItem(`user_subscription_tier:${user.id}`);
          if (savedTier) setActiveTier(savedTier);
          const savedCap = await AsyncStorage.getItem(`user_income_cap:${user.id}`);
          if (savedCap) setIncomeCap(Number(savedCap));
        }
      } catch (e) {
        console.log('Error loading sidebar profile:', e);
      }
    };

    if (visible) {
      loadProfile();
    }
  }, [visible]);

  const handleToggleDarkMode = async (val: boolean) => {
    await toggleDarkMode(val);
  };

  const handleLogout = async () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = async () => {
    setShowLogoutDialog(false);
    onClose();
    await supabase.auth.signOut();
    router.replace('/');
  };

  const activePlanInfo = SUBSCRIPTION_PLANS.find((p) => p.id === activeTier) || SUBSCRIPTION_PLANS[0];

  return (
    <>
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <View style={sidebarStyles.overlay}>
          <View style={[sidebarStyles.drawerContainer, isDarkMode && sidebarStyles.drawerDark]}>
            {/* Drawer Header Profile */}
            <View style={sidebarStyles.drawerHeader}>
              <View style={sidebarStyles.headerTopRow}>
                <View style={sidebarStyles.portalLogoBadge}>
                  <Ionicons name="home" size={14} color="#F4C430" />
                  <Text style={sidebarStyles.portalLogoText}>HOUSEHOLD PORTAL</Text>
                </View>
                <TouchableOpacity style={sidebarStyles.drawerCloseBtn} onPress={onClose}>
                  <Ionicons name="close" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <View style={sidebarStyles.profileRow}>
                <View style={sidebarStyles.avatarBox}>
                  <Text style={sidebarStyles.avatarInitial}>
                    {userName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={sidebarStyles.profileInfo}>
                  <Text style={sidebarStyles.userName} numberOfLines={1}>
                    {userName}
                  </Text>
                  <Text style={sidebarStyles.userEmail} numberOfLines={1}>
                    {userEmail}
                  </Text>
                </View>
              </View>

              {/* Active Tier Badge */}
              <View style={sidebarStyles.tierBadgeRow}>
                <View style={sidebarStyles.tierBadge}>
                  <Text style={sidebarStyles.tierBadgeText}>{activePlanInfo.name}</Text>
                </View>
                <Text style={sidebarStyles.capInfoText}>
                  Cap: {incomeCap >= 999999999 ? 'Unlimited' : `₱ ${incomeCap.toLocaleString()}`}
                </Text>
              </View>
            </View>

            {/* Drawer Scrollable Content */}
            <ScrollView style={sidebarStyles.drawerScroll} showsVerticalScrollIndicator={false}>
              {/* Promo Upgrade Banner if not Unlimited */}
              {activeTier !== 'unlimited' && (
                <View style={sidebarStyles.promoCard}>
                  <View style={sidebarStyles.promoHeader}>
                    <Ionicons name="sparkles" size={16} color="#D97706" />
                    <Text style={sidebarStyles.promoTitle}>Income Limit Booster</Text>
                  </View>
                  <Text style={sidebarStyles.promoDesc}>
                    Current income entry cap is ₱ {incomeCap.toLocaleString()}. Upgrade to unlock up to ₱ 15,000 or Unlimited access!
                  </Text>
                  <TouchableOpacity
                    style={sidebarStyles.promoBtn}
                    onPress={() => setShowUpgradeModal(true)}
                  >
                    <Text style={sidebarStyles.promoBtnText}>Avail Plan Upgrade ➔</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Section: Subscription & Upgrades */}
              <Text style={[sidebarStyles.sectionTitle, isDarkMode && sidebarStyles.sectionTitleDark]}>
                Subscriptions & Access
              </Text>

              <TouchableOpacity
                style={[sidebarStyles.menuItem, isDarkMode && sidebarStyles.menuItemDark]}
                onPress={() => setShowUpgradeModal(true)}
              >
                <View style={[sidebarStyles.menuIconBox, sidebarStyles.menuIconBoxGold]}>
                  <Ionicons name="card" size={18} color="#D97706" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[sidebarStyles.menuLabel, isDarkMode && sidebarStyles.menuLabelDark]}>
                    Avail Upgrade Plans
                  </Text>
                  <Text style={sidebarStyles.menuSubLabel}>Increase income limits (₱10k, ₱15k, Unlimited)</Text>
                </View>
                <View style={sidebarStyles.menuRightBadge}>
                  <Text style={sidebarStyles.menuRightBadgeText}>PLANS</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[sidebarStyles.menuItem, isDarkMode && sidebarStyles.menuItemDark]}
                onPress={() => setShowUpgradeModal(true)}
              >
                <View style={[sidebarStyles.menuIconBox, sidebarStyles.menuIconBoxPurple]}>
                  <Ionicons name="list" size={18} color="#7C3AED" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[sidebarStyles.menuLabel, isDarkMode && sidebarStyles.menuLabelDark]}>
                    List of Available Subscriptions
                  </Text>
                  <Text style={sidebarStyles.menuSubLabel}>Pricing tiers & validity durations</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
              </TouchableOpacity>

              {/* Section: Preferences */}
              <Text style={[sidebarStyles.sectionTitle, isDarkMode && sidebarStyles.sectionTitleDark]}>
                Appearance & Settings
              </Text>

              <View style={[sidebarStyles.switchRow, isDarkMode && sidebarStyles.menuItemDark]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={[sidebarStyles.menuIconBox, isDarkMode && sidebarStyles.menuIconBoxDark]}>
                    <Ionicons
                      name={isDarkMode ? 'moon' : 'sunny'}
                      size={18}
                      color={isDarkMode ? '#F4C430' : '#003366'}
                    />
                  </View>
                  <View>
                    <Text style={[sidebarStyles.menuLabel, isDarkMode && sidebarStyles.menuLabelDark]}>
                      Dark Mode Theme
                    </Text>
                    <Text style={sidebarStyles.menuSubLabel}>
                      {isDarkMode ? 'Dark display enabled' : 'Clean Light theme active'}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={isDarkMode}
                  onValueChange={handleToggleDarkMode}
                  trackColor={{ false: '#CBD5E1', true: '#003366' }}
                  thumbColor={isDarkMode ? '#F4C430' : '#FFFFFF'}
                />
              </View>

              {/* Section: System & Information */}
              <Text style={[sidebarStyles.sectionTitle, isDarkMode && sidebarStyles.sectionTitleDark]}>
                System Information
              </Text>

              <TouchableOpacity
                style={[sidebarStyles.menuItem, isDarkMode && sidebarStyles.menuItemDark]}
                onPress={() => setShowAboutModal(true)}
              >
                <View style={sidebarStyles.menuIconBox}>
                  <Ionicons name="information-circle" size={18} color="#003366" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[sidebarStyles.menuLabel, isDarkMode && sidebarStyles.menuLabelDark]}>
                    About Us
                  </Text>
                  <Text style={sidebarStyles.menuSubLabel}>Household Budgeting System v2.5</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
              </TouchableOpacity>
            </ScrollView>

            {/* Drawer Footer */}
            <View style={[sidebarStyles.drawerFooter, isDarkMode && sidebarStyles.drawerFooterDark]}>
              <TouchableOpacity style={sidebarStyles.logoutBtn} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={18} color="#DC2626" />
                <Text style={sidebarStyles.logoutBtnText}>Sign Out</Text>
              </TouchableOpacity>
              <Text style={sidebarStyles.footerAppVersion}>
                Household Budgeting App • 2026
              </Text>
            </View>
          </View>

          {/* Backdrop dismiss touchable */}
          <TouchableOpacity
            style={sidebarStyles.backdropTouchable}
            activeOpacity={1}
            onPress={onClose}
          />
        </View>
      </Modal>

      <AppDialog
        visible={showLogoutDialog}
        title="Sign Out"
        message="Are you sure you want to sign out of your Portal?"
        icon="log-out-outline"
        tone="warning"
        onRequestClose={() => setShowLogoutDialog(false)}
        actions={[
          { label: 'Cancel', onPress: () => setShowLogoutDialog(false) },
          { label: 'Sign Out', destructive: true, onPress: confirmLogout },
        ]}
      />

      {/* Subscription / Avail Upgrade Modal */}
      <SubscriptionModal
        visible={showUpgradeModal}
        currentTier={activeTier}
        onClose={() => setShowUpgradeModal(false)}
        onSuccess={(newTier, newCap) => {
          setActiveTier(newTier);
          setIncomeCap(newCap);
          if (onRefreshData) onRefreshData();
        }}
      />

      {/* About Us Modal */}
      <Modal
        visible={showAboutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAboutModal(false)}
      >
        <View style={sidebarStyles.aboutModalOverlay}>
          <View style={[sidebarStyles.aboutModalCard, isDarkMode && sidebarStyles.aboutModalCardDark]}>
            <View style={sidebarStyles.aboutModalHeader}>
              <View style={sidebarStyles.aboutModalTitleGroup}>
                <Ionicons name="wallet" size={22} color={isDarkMode ? '#F4C430' : '#003366'} />
                <Text style={[sidebarStyles.aboutModalTitle, isDarkMode && sidebarStyles.aboutModalTitleDark]}>
                  About Us
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowAboutModal(false)}>
                <Ionicons name="close" size={20} color={isDarkMode ? '#F4C430' : '#003366'} />
              </TouchableOpacity>
            </View>

            <Text style={[sidebarStyles.aboutModalBodyText, isDarkMode && sidebarStyles.aboutModalBodyTextDark]}>
              The **Household Budgeting System** is an advanced, secure mobile application tailored for mothers and household managers. It provides effortless tracking of income, category spending, dynamic budget limits, payment reminders, and receipt proof attachments.
            </Text>

            <View style={[sidebarStyles.aboutHighlightsBox, isDarkMode && sidebarStyles.aboutHighlightsBoxDark]}>
              <Text style={[sidebarStyles.aboutHighlightsTitle, isDarkMode && sidebarStyles.aboutHighlightsTitleDark]}>
                Key Features & Capabilities:
              </Text>
              <Text style={[sidebarStyles.aboutHighlightsList, isDarkMode && sidebarStyles.aboutHighlightsListDark]}>
                • Photo Proof & Receipt Attachment for Expenses{'\n'}
                • Tiered Income Limit Management & Upgrades{'\n'}
                • Automated Savings Goal Deductions & Tracking{'\n'}
                • Interactive Financial Calendar & Bill Reminders{'\n'}
                • Real-time Cloud Sync with Supabase & Offline Support
              </Text>
            </View>

            <TouchableOpacity
              style={sidebarStyles.aboutCloseBtn}
              onPress={() => setShowAboutModal(false)}
            >
              <Text style={sidebarStyles.aboutCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default SidebarDrawer;

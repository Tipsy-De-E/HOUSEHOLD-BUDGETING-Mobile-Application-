import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { adminSidebarStyles } from '../../components/admin-css/adminSidebarStyles';
import { useAppTheme } from '../../context/ThemeContext';
import { supabase } from '../../../lib/supabase';
import { AppDialog } from '../../components/ui/AppDialog';

export interface AdminSidebarDrawerProps {
  visible?: boolean;
  onClose?: () => void;
  totalUsersCount?: number;
  totalAvailedCount?: number;
  totalProfit?: number;
  onOpenProvisionModal?: () => void;
  onOpenBroadcastModal?: () => void;
  onRefreshData?: () => void;
}

export const AdminSidebarDrawer: React.FC<AdminSidebarDrawerProps> = ({
  visible = false,
  onClose = () => { },
  totalUsersCount = 0,
  totalAvailedCount = 0,
  totalProfit = 0,
  onOpenProvisionModal = () => { },
  onOpenBroadcastModal = () => { },
  onRefreshData = () => { },
}) => {
  const router = useRouter();
  const { isDarkMode, toggleDarkMode } = useAppTheme();
  const [showLogoutDialog, setShowLogoutDialog] = React.useState(false);

  const handleLogout = async () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = async () => {
    setShowLogoutDialog(false);
    onClose();
    await supabase.auth.signOut();
    router.replace('/');
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <View style={adminSidebarStyles.overlay}>
          <View style={[adminSidebarStyles.drawerContainer, isDarkMode && adminSidebarStyles.drawerDark]}>

            <View style={adminSidebarStyles.drawerHeader}>
              <View style={adminSidebarStyles.headerTopRow}>
                <View style={adminSidebarStyles.portalLogoBadge}>
                  <Ionicons name="shield-checkmark" size={14} color="#F4C430" />
                  <Text style={adminSidebarStyles.portalLogoText}>ADMIN CONTROL</Text>
                </View>
                <TouchableOpacity style={adminSidebarStyles.drawerCloseBtn} onPress={onClose}>
                  <Ionicons name="close" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <View style={adminSidebarStyles.profileInfoRow}>
                <View style={[adminSidebarStyles.profileAvatar, { backgroundColor: '#F4C430' }]}>
                  <Ionicons name="person" size={24} color="#003366" />
                </View>
                <View style={adminSidebarStyles.profileTextCol}>
                  <Text style={adminSidebarStyles.profileName} numberOfLines={1}>
                    System Administrator
                  </Text>
                  <Text style={adminSidebarStyles.profileEmail} numberOfLines={1}>
                    admin@household.com
                  </Text>
                  <View style={adminSidebarStyles.profileTierBadge}>
                    <Text style={adminSidebarStyles.profileTierBadgeText}>LEAD PORTAL ADMIN</Text>
                  </View>
                </View>
              </View>
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                backgroundColor: isDarkMode ? '#1E293B' : '#EFF6FF',
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderBottomWidth: 1,
                borderBottomColor: isDarkMode ? '#334155' : '#DBEAFE',
              }}
            >
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#003366' }}>{totalUsersCount}</Text>
                <Text style={{ fontSize: 10, color: '#64748B' }}>Households</Text>
              </View>
              <View style={{ width: 1, backgroundColor: isDarkMode ? '#334155' : '#BFDBFE' }} />
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#D97706' }}>{totalAvailedCount}</Text>
                <Text style={{ fontSize: 10, color: '#64748B' }}>Upgraded</Text>
              </View>
              <View style={{ width: 1, backgroundColor: isDarkMode ? '#334155' : '#BFDBFE' }} />
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#16A34A' }}>₱{totalProfit.toLocaleString()}</Text>
                <Text style={{ fontSize: 10, color: '#64748B' }}>Profit</Text>
              </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={adminSidebarStyles.navScrollContent}>
              <Text style={[adminSidebarStyles.sectionTitle, isDarkMode && { color: '#64748B' }]}>PORTAL NAVIGATION</Text>

              <TouchableOpacity
                style={[adminSidebarStyles.navItem, isDarkMode && adminSidebarStyles.navItemDark]}
                onPress={() => {
                  onClose();
                  router.push('/admin');
                }}
              >
                <View style={[adminSidebarStyles.navIconBox, { backgroundColor: '#E0F2FE' }]}>
                  <Ionicons name="grid" size={18} color="#0284C7" />
                </View>
                <View style={adminSidebarStyles.navItemTextCol}>
                  <Text style={[adminSidebarStyles.navItemTitle, isDarkMode && adminSidebarStyles.navItemTitleDark]}>
                    Dashboard Home
                  </Text>
                  <Text style={adminSidebarStyles.navItemSub}>Summary & Live Activity Log</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[adminSidebarStyles.navItem, isDarkMode && adminSidebarStyles.navItemDark]}
                onPress={() => {
                  onClose();
                  router.push('/admin/users');
                }}
              >
                <View style={[adminSidebarStyles.navIconBox, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="people" size={18} color="#D97706" />
                </View>
                <View style={adminSidebarStyles.navItemTextCol}>
                  <Text style={[adminSidebarStyles.navItemTitle, isDarkMode && adminSidebarStyles.navItemTitleDark]}>
                    Household Users
                  </Text>
                  <Text style={adminSidebarStyles.navItemSub}>Manage, Inspect & Delete</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[adminSidebarStyles.navItem, isDarkMode && adminSidebarStyles.navItemDark]}
                onPress={() => {
                  onClose();
                  router.push('/admin/reports');
                }}
              >
                <View style={[adminSidebarStyles.navIconBox, { backgroundColor: '#DCFCE7' }]}>
                  <Ionicons name="bar-chart" size={18} color="#16A34A" />
                </View>
                <View style={adminSidebarStyles.navItemTextCol}>
                  <Text style={[adminSidebarStyles.navItemTitle, isDarkMode && adminSidebarStyles.navItemTitleDark]}>
                    Reports & Profit
                  </Text>
                  <Text style={adminSidebarStyles.navItemSub}>Revenue Analytics & Audits</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[adminSidebarStyles.navItem, isDarkMode && adminSidebarStyles.navItemDark]}
                onPress={() => {
                  onClose();
                  router.push('/admin/settings');
                }}
              >
                <View style={[adminSidebarStyles.navIconBox, { backgroundColor: '#F3E8FF' }]}>
                  <Ionicons name="settings" size={18} color="#9333EA" />
                </View>
                <View style={adminSidebarStyles.navItemTextCol}>
                  <Text style={[adminSidebarStyles.navItemTitle, isDarkMode && adminSidebarStyles.navItemTitleDark]}>
                    System Settings
                  </Text>
                  <Text style={adminSidebarStyles.navItemSub}>Pricing, Limits & Guidelines</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
              </TouchableOpacity>

              <Text style={[adminSidebarStyles.sectionTitle, isDarkMode && { color: '#64748B' }, { marginTop: 14 }]}>
                ADMINISTRATIVE TOOLS
              </Text>

              <TouchableOpacity
                style={[adminSidebarStyles.navItem, isDarkMode && adminSidebarStyles.navItemDark]}
                onPress={() => {
                  onClose();
                  onOpenProvisionModal();
                }}
              >
                <View style={[adminSidebarStyles.navIconBox, { backgroundColor: '#CCFBF1' }]}>
                  <Ionicons name="person-add" size={18} color="#0D9488" />
                </View>
                <View style={adminSidebarStyles.navItemTextCol}>
                  <Text style={[adminSidebarStyles.navItemTitle, isDarkMode && adminSidebarStyles.navItemTitleDark]}>
                    Provision Household User
                  </Text>
                  <Text style={adminSidebarStyles.navItemSub}>Create directly without logout</Text>
                </View>
                <Ionicons name="add-circle" size={18} color="#0D9488" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[adminSidebarStyles.navItem, isDarkMode && adminSidebarStyles.navItemDark]}
                onPress={() => {
                  onClose();
                  onOpenBroadcastModal();
                }}
              >
                <View style={[adminSidebarStyles.navIconBox, { backgroundColor: '#FEE2E2' }]}>
                  <Ionicons name="megaphone" size={18} color="#DC2626" />
                </View>
                <View style={adminSidebarStyles.navItemTextCol}>
                  <Text style={[adminSidebarStyles.navItemTitle, isDarkMode && adminSidebarStyles.navItemTitleDark]}>
                    Broadcast Announcement
                  </Text>
                  <Text style={adminSidebarStyles.navItemSub}>Notify all households</Text>
                </View>
                <Ionicons name="send" size={16} color="#DC2626" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[adminSidebarStyles.navItem, isDarkMode && adminSidebarStyles.navItemDark]}
                onPress={() => {
                  onClose();
                  onRefreshData();
                  Alert.alert('Database Synchronized', 'Fetched latest records from Supabase tables.');
                }}
              >
                <View style={[adminSidebarStyles.navIconBox, { backgroundColor: '#E2E8F0' }]}>
                  <Ionicons name="sync" size={18} color="#475569" />
                </View>
                <View style={adminSidebarStyles.navItemTextCol}>
                  <Text style={[adminSidebarStyles.navItemTitle, isDarkMode && adminSidebarStyles.navItemTitleDark]}>
                    Sync All Records
                  </Text>
                  <Text style={adminSidebarStyles.navItemSub}>Refresh cloud database state</Text>
                </View>
                <Ionicons name="refresh" size={16} color="#475569" />
              </TouchableOpacity>

              {/* <Text style={[adminSidebarStyles.sectionTitle, isDarkMode && { color: '#64748B' }, { marginTop: 14 }]}>
              PREFERENCES
            </Text>

            <View style={[adminSidebarStyles.navItem, isDarkMode && adminSidebarStyles.navItemDark]}>
              <View style={[adminSidebarStyles.navIconBox, { backgroundColor: isDarkMode ? '#334155' : '#F1F5F9' }]}>
                <Ionicons name={isDarkMode ? 'moon' : 'sunny'} size={18} color={isDarkMode ? '#F4C430' : '#475569'} />
              </View>
              <View style={adminSidebarStyles.navItemTextCol}>
                <Text style={[adminSidebarStyles.navItemTitle, isDarkMode && adminSidebarStyles.navItemTitleDark]}>
                  {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                </Text>
                <Text style={adminSidebarStyles.navItemSub}>Toggle portal theme appearance</Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={(val) => toggleDarkMode(val)}
                trackColor={{ false: '#CBD5E1', true: '#003366' }}
                thumbColor={isDarkMode ? '#F4C430' : '#FFFFFF'}
              />
            </View> */}
            </ScrollView>

            <View style={[adminSidebarStyles.drawerFooter, isDarkMode && adminSidebarStyles.drawerFooterDark]}>
              <TouchableOpacity style={adminSidebarStyles.logoutBtn} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={18} color="#DC2626" />
                <Text style={adminSidebarStyles.logoutBtnText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={adminSidebarStyles.backdropTouchable} activeOpacity={1} onPress={onClose} />
        </View>
      </Modal>

      <AppDialog
        visible={showLogoutDialog}
        title="Administrator Sign Out"
        message="Are you sure you want to leave the Administrator Portal?"
        icon="shield-checkmark-outline"
        tone="warning"
        onRequestClose={() => setShowLogoutDialog(false)}
        actions={[
          { label: 'Cancel', onPress: () => setShowLogoutDialog(false) },
          { label: 'Sign Out', destructive: true, onPress: confirmLogout },
        ]}
      />
    </>
  );
};

export default AdminSidebarDrawer;

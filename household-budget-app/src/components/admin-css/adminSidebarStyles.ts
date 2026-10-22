// src/components/admin-css/adminSidebarStyles.ts
import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(320, width * 0.82);

export const adminSidebarStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    flexDirection: 'row',
  },
  backdropTouchable: {
    flex: 1,
  },
  drawerContainer: {
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 16,
  },
  drawerDark: {
    backgroundColor: '#0F172A',
  },

  // Header
  drawerHeader: {
    backgroundColor: '#003366',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 18,
    borderBottomRightRadius: 20,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  portalLogoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(244, 196, 48, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  portalLogoText: {
    color: '#F4C430',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.8,
  },
  drawerCloseBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },

  // Profile
  profileInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileTextCol: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileEmail: {
    fontSize: 11,
    color: '#CBD5E1',
    marginTop: 2,
  },
  profileTierBadge: {
    alignSelf: 'flex-start',
    marginTop: 6,
    backgroundColor: 'rgba(244, 196, 48, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F4C430',
  },
  profileTierBadgeText: {
    color: '#F4C430',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },

  // Content
  navScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 10,
    paddingHorizontal: 4,
  },

  // Nav item
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
    backgroundColor: '#F8FAFC',
  },
  navItemDark: {
    backgroundColor: '#1E293B',
  },
  navIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  navItemTextCol: {
    flex: 1,
  },
  navItemTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  navItemTitleDark: {
    color: '#F8FAFC',
  },
  navItemSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },

  // Footer
  drawerFooter: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  drawerFooterDark: {
    backgroundColor: '#0F172A',
    borderTopColor: '#334155',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#DC2626',
  },
});

export default adminSidebarStyles;

// components/mother-css/sidebarStyles.ts
import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(320, width * 0.82);

export const sidebarStyles = StyleSheet.create({
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
    backgroundColor: '#FFFFFF', // Clean White
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 16,
  },
  drawerDark: {
    backgroundColor: '#0F172A',
  },

  // Drawer Header Profile Card
  drawerHeader: {
    backgroundColor: '#003366', // USTP Navy Blue
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

  // User Profile
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F4C430', // USTP Gold
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarInitial: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#003366',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userEmail: {
    fontSize: 11,
    color: '#CBD5E1',
    marginTop: 2,
  },

  // Active Tier Badge
  tierBadgeRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tierBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: '#F4C430',
  },
  tierBadgeText: {
    color: '#003366',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  capInfoText: {
    fontSize: 11,
    color: '#E2E8F0',
    fontWeight: '500',
  },

  // Drawer Content Scroll
  drawerScroll: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  // Section Headers
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 10,
    paddingHorizontal: 4,
  },
  sectionTitleDark: {
    color: '#94A3B8',
  },

  // Menu Items
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  menuItemPressed: {
    backgroundColor: '#F1F5F9',
  },
  menuItemDark: {
    backgroundColor: 'transparent',
  },
  menuIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuIconBoxGold: {
    backgroundColor: '#FEF3C7',
  },
  menuIconBoxPurple: {
    backgroundColor: '#F3E8FF',
  },
  menuIconBoxDark: {
    backgroundColor: '#1E293B',
  },
  menuLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  menuLabelDark: {
    color: '#F8FAFC',
  },
  menuSubLabel: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  menuRightBadge: {
    backgroundColor: '#003366',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  menuRightBadgeText: {
    color: '#F4C430',
    fontSize: 10,
    fontWeight: 'bold',
  },

  // Upgrade Promotion Card in Sidebar
  promoCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginVertical: 8,
  },
  promoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  promoTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#92400E',
  },
  promoDesc: {
    fontSize: 10,
    color: '#B45309',
    lineHeight: 14,
  },
  promoBtn: {
    marginTop: 8,
    backgroundColor: '#003366',
    borderRadius: 6,
    paddingVertical: 6,
    alignItems: 'center',
  },
  promoBtnText: {
    color: '#F4C430',
    fontSize: 11,
    fontWeight: 'bold',
  },

  // Dark Mode Switch Row
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },

  // Drawer Footer
  drawerFooter: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FAFAFA',
  },
  drawerFooterDark: {
    backgroundColor: '#0F172A',
    borderTopColor: '#1E293B',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
  },
  logoutBtnText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: 'bold',
  },
  footerAppVersion: {
    textAlign: 'center',
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 8,
  },

  // About Us Modal Styles
  aboutModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  aboutModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 22,
    width: '100%',
    maxWidth: 440,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  aboutModalCardDark: {
    backgroundColor: '#1E293B',
  },
  aboutModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
  },
  aboutModalTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aboutModalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#003366',
  },
  aboutModalTitleDark: {
    color: '#F4C430',
  },
  aboutModalBodyText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 20,
    marginBottom: 12,
  },
  aboutModalBodyTextDark: {
    color: '#CBD5E1',
  },
  aboutHighlightsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  aboutHighlightsBoxDark: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
  },
  aboutHighlightsTitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  aboutHighlightsTitleDark: {
    color: '#94A3B8',
  },
  aboutHighlightsList: {
    fontSize: 12,
    color: '#0F172A',
    marginTop: 4,
    lineHeight: 18,
  },
  aboutHighlightsListDark: {
    color: '#F8FAFC',
  },
  aboutCloseBtn: {
    backgroundColor: '#003366',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  aboutCloseBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
});

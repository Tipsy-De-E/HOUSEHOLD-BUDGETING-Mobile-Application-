// components/mother-css/subscriptionStyles.ts
import { StyleSheet } from 'react-native';

export const subscriptionStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 520,
    maxHeight: '90%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  headerIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#003366', // USTP Navy
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },

  // Active Tier Banner
  activeTierBanner: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activeTierLabel: {
    fontSize: 11,
    color: '#1E40AF',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  activeTierTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#003366',
    marginTop: 2,
  },
  activeCapBadge: {
    backgroundColor: '#003366',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeCapText: {
    color: '#F4C430',
    fontSize: 11,
    fontWeight: 'bold',
  },

  // Plan Cards Scroll
  planListScroll: {
    maxHeight: 360,
  },

  // Tier Plan Card
  planCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  planCardSelected: {
    borderColor: '#003366',
    backgroundColor: '#F0F9FF',
  },
  planCardPopular: {
    borderColor: '#F4C430',
    backgroundColor: '#FFFBEB',
  },
  popularTag: {
    position: 'absolute',
    top: -10,
    right: 14,
    backgroundColor: '#003366',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F4C430',
  },
  popularTagText: {
    color: '#F4C430',
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  planTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  planName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  planDuration: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 1,
  },
  planPriceBox: {
    alignItems: 'flex-end',
  },
  planPriceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003366',
  },
  planPriceSub: {
    fontSize: 10,
    color: '#64748B',
  },

  // Feature Points
  featureList: {
    marginTop: 6,
    gap: 4,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureText: {
    fontSize: 12,
    color: '#334155',
  },
  featureHighlight: {
    fontWeight: 'bold',
    color: '#003366',
  },

  // Plan Avail Button
  availBtn: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#003366',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  availBtnPopular: {
    backgroundColor: '#003366',
  },
  availBtnDisabled: {
    backgroundColor: '#CBD5E1',
  },
  availBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },

  // Bottom Notice
  bottomNotice: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  noticeText: {
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 14,
  },

  // Dark Mode Styles
  modalCardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
  },
  headerTitleDark: {
    color: '#F4C430',
  },
  planCardDark: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
  },
  planNameDark: {
    color: '#F8FAFC',
  },
  featureTextDark: {
    color: '#CBD5E1',
  },
  planPriceTextDark: {
    color: '#38BDF8',
  },
});

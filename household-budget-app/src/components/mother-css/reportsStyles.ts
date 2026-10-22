// components/mother-css/reportsStyles.ts
import { StyleSheet } from 'react-native';

export const reportsStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // USTP Background: White
  },
  bannerYellow: {
    height: 8,
    backgroundColor: '#F4C430', // USTP Header accent
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#F4C430', // Header: Yellow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000', // Text: Black
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },

  // Time Filter Tabs
  timeFilterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  timePill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  timePillActive: {
    backgroundColor: '#003366', // USTP Blue
    borderColor: '#003366',
  },
  timePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  timePillTextActive: {
    color: '#FFFFFF',
  },

  // Summary Overview Card
  overviewCard: {
    backgroundColor: '#003366', // USTP Navy Blue
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  overviewCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  overviewTitle: {
    fontSize: 13,
    color: '#F4C430', // USTP Gold
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  printQuickBtn: {
    backgroundColor: 'rgba(244, 196, 48, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  printQuickText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#F4C430',
  },
  overviewMainAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  overviewSubtext: {
    fontSize: 12,
    color: '#CBD5E1',
    marginTop: 2,
    marginBottom: 16,
  },
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
  },
  overviewStatItem: {
    flex: 1,
  },
  overviewStatLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 2,
  },
  overviewStatValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000', // Text: Black
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },

  // Overspending Alert Banner
  alertBanner: {
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 16,
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  alertIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertTextContainer: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#991B1B',
  },
  alertDesc: {
    fontSize: 11,
    color: '#B91C1C',
    marginTop: 2,
  },

  // Category Breakdown Card
  categoryCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  categoryIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  categoryTxCount: {
    fontSize: 11,
    color: '#64748B',
  },
  categoryRight: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#003366', // USTP Blue
  },
  categoryPercent: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },

  // Progress Bar
  progressBarBg: {
    height: 7,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 6,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#003366', // USTP Blue
  },
  progressBarFillDanger: {
    backgroundColor: '#D32F2F',
  },
  progressBarFillPrimary: {
    backgroundColor: '#003366',
  },
  progressBarFillWarning: {
    backgroundColor: '#F4C430',
  },

  // Empty State
  emptyCard: {
    marginHorizontal: 16,
    marginTop: 30,
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#475569',
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
  },

  // Printable Statement Modal Styles
  printModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  printModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 600,
    maxHeight: '92%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  printDocHeader: {
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 2,
    borderBottomColor: '#003366',
    marginBottom: 14,
  },
  printInstitutionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#003366',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  printDocTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 2,
  },
  printDocDate: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  printSummaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  printGridItem: {
    alignItems: 'center',
    flex: 1,
  },
  printGridLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  printGridValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#003366',
    marginTop: 2,
  },
  printIncomeValue: {
    color: '#2E7D32',
  },
  printExpenseValue: {
    color: '#D32F2F',
  },
  printNetValue: {
    color: '#003366',
  },
  printTableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#003366',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 6,
  },
  printTableHeaderText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  printTableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  printTableCategory: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    flex: 2,
  },
  printTableCount: {
    fontSize: 12,
    color: '#64748B',
    flex: 1,
    textAlign: 'center',
  },
  printTableAmount: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#003366',
    flex: 1.5,
    textAlign: 'right',
  },
  printModalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  printCloseBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  printCloseBtnText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  printConfirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#003366',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  printConfirmBtnText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  // Bottom Navigation Bar
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 65,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 5,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    flex: 1,
  },
  navText: {
    fontSize: 11,
    color: '#757575',
    marginTop: 2,
    fontWeight: '500',
  },
  navTextActive: {
    color: '#003366', // USTP Blue
    fontWeight: 'bold',
  },
  fab: {
    top: -15,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#003366', // USTP Blue
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },

  // Dark Mode Styles
  containerDark: {
    backgroundColor: '#0F172A',
  },
  headerDark: {
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  headerTitleDark: {
    color: '#F4C430',
  },
  timeFilterContainerDark: {
    backgroundColor: '#1E293B',
    borderBottomColor: '#334155',
  },
  timePillDark: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
  },
  timePillTextDark: {
    color: '#94A3B8',
  },
  cardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  titleDark: {
    color: '#F8FAFC',
  },
  textMutedDark: {
    color: '#94A3B8',
  },
  categoryRowDark: {
    borderBottomColor: '#334155',
  },
  bottomNavDark: {
    backgroundColor: '#1E293B',
    borderTopColor: '#334155',
  },
  navTextDark: {
    color: '#94A3B8',
  },
  navTextActiveDark: {
    color: '#38BDF8',
  },
  modalContentDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  printTableRowDark: {
    borderBottomColor: '#334155',
  },
  printTableCategoryDark: {
    color: '#F8FAFC',
  },
});

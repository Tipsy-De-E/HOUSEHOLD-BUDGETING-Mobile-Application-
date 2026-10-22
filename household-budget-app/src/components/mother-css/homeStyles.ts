// components/mother-css/homeStyles.ts
import { StyleSheet } from 'react-native';

export const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Background: White
  },
  bannerYellow: {
    height: 8,
    backgroundColor: '#F4C430', // Header: Yellow accent strip
    width: '100%',
  },
  scrollContent: {
    paddingBottom: 100,
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000', // Text: Black
  },
  userGreetingBadge: {
    backgroundColor: '#003366',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  userGreetingText: {
    color: '#F4C430',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },

  // Financial Summary Card
  summaryCard: {
    backgroundColor: '#003366', // USTP Blue card
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 4,
    borderTopColor: '#F4C430', // Yellow accent border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#F4C430', // Yellow label for contrast
    marginBottom: 4,
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF', // White text on blue card
  },
  summaryDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(244, 196, 48, 0.4)', // Subtle yellow divider
  },

  // Search Bar (Placed below summary card)
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#000000',
    paddingVertical: 2,
  },

  // Time Filter Pills (Today, Week, Month, All Time)
  timeFilterScroll: {
    marginHorizontal: 20,
    marginTop: 12,
  },
  timeFilterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  timeFilterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  timeFilterPillActive: {
    backgroundColor: '#003366', // Blue when active
    borderColor: '#003366',
  },
  timeFilterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555555',
  },
  timeFilterTextActive: {
    color: '#F4C430', // Gold text when active
    fontWeight: 'bold',
  },

  // Type Filter Tabs (All, Expenses, Income)
  typeFilterContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 10,
    gap: 8,
  },
  typeTab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  typeTabActiveExpense: {
    backgroundColor: '#FFEBEE',
    borderColor: '#D32F2F',
  },
  typeTabActiveIncome: {
    backgroundColor: '#E8F5E9',
    borderColor: '#2E7D32',
  },
  typeTabActiveAll: {
    backgroundColor: '#E3F2FD',
    borderColor: '#003366',
  },
  typeTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555555',
  },
  typeTabTextExpense: {
    color: '#D32F2F',
    fontWeight: 'bold',
  },
  typeTabTextIncome: {
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  typeTabTextAll: {
    color: '#003366',
    fontWeight: 'bold',
  },

  // Table Column Headers
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4C430', // Yellow header row
    marginHorizontal: 20,
    marginTop: 14,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  tableColTitle: {
    flex: 2.2,
    fontSize: 11,
    fontWeight: 'bold',
    color: '#000000',
    letterSpacing: 0.5,
  },
  tableColType: {
    flex: 1.5,
    fontSize: 11,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  tableColAmountDate: {
    flex: 2,
    fontSize: 11,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'right',
    letterSpacing: 0.5,
  },
  tableColAction: {
    flex: 1.5,
    fontSize: 11,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    letterSpacing: 0.5,
  },

  // Transaction List & Rows
  transactionList: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  transactionCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  txColTitle: {
    flex: 2.2,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 6,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FFF9C4', // Soft yellow icon container
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  txTitleGroup: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#000000', // Text: Black
  },
  transactionCategory: {
    fontSize: 10,
    color: '#757575',
    marginTop: 1,
  },
  txColType: {
    flex: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBadgeExpense: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#FFCDD2',
  },
  typeBadgeIncome: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#C8E6C9',
  },
  typeBadgeTextExpense: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#D32F2F',
  },
  typeBadgeTextIncome: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  txColAmountDate: {
    flex: 2,
    alignItems: 'flex-end',
    paddingRight: 6,
  },
  expenseAmount: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#D32F2F', // Standard red
  },
  incomeAmount: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2E7D32', // Standard green
  },
  txDateText: {
    fontSize: 10,
    color: '#888888',
    marginTop: 2,
  },
  txColAction: {
    flex: 1.5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  actionIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIconBtnDelete: {
    backgroundColor: '#FFEBEE',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 10,
  },
  emptyStateSubtext: {
    fontSize: 12,
    color: '#757575',
    textAlign: 'center',
    marginTop: 4,
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
    fontSize: 11,
    color: '#003366', // USTP Blue
    fontWeight: 'bold',
    marginTop: 2,
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

  // Add / View Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 12,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003366',
  },

  // Modal Segmented Control (Expense vs Income)
  typeSelectorContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  typeSelectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    gap: 6,
  },
  typeSelectBtnActiveExpense: {
    backgroundColor: '#FFEBEE',
    borderColor: '#D32F2F',
  },
  typeSelectBtnActiveIncome: {
    backgroundColor: '#E8F5E9',
    borderColor: '#2E7D32',
  },
  typeSelectBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555555',
  },
  typeSelectBtnTextExpense: {
    color: '#D32F2F',
    fontWeight: 'bold',
  },
  typeSelectBtnTextIncome: {
    color: '#2E7D32',
    fontWeight: 'bold',
  },

  // Form Fields
  formGroup: {
    marginBottom: 14,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 6,
  },
  formInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D0D7DE',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#000000',
  },
  formTextArea: {
    height: 70,
    textAlignVertical: 'top',
  },

  // Category Quick Selector Pills
  categoryPillScroll: {
    marginBottom: 6,
  },
  categoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 6,
  },
  categoryPillActive: {
    backgroundColor: '#FFF9C4',
    borderColor: '#F4C430',
  },
  categoryPillText: {
    fontSize: 11,
    color: '#555555',
    fontWeight: '500',
  },
  categoryPillTextActive: {
    color: '#003366',
    fontWeight: 'bold',
  },

  // Modal Action Buttons
  modalBtnContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCancelBtnText: {
    color: '#555555',
    fontWeight: 'bold',
    fontSize: 14,
  },
  modalSaveBtn: {
    flex: 1.5,
    backgroundColor: '#003366', // USTP Blue button
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  modalSaveBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },

  // Details View Modal Rows
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  detailLabel: {
    fontSize: 13,
    color: '#757575',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
    maxWidth: '65%',
    textAlign: 'right',
  },
  detailReceiptContainer: {
    marginTop: 10,
    marginBottom: 6,
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  detailReceiptImage: {
    width: '100%',
    height: 160,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
    marginTop: 6,
  },

  // Dark Mode Style Variations
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
  summaryCardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  searchContainerDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  searchInputDark: {
    color: '#F8FAFC',
  },
  timeFilterPillDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  timeFilterTextDark: {
    color: '#94A3B8',
  },
  typeTabDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  typeTabTextDark: {
    color: '#94A3B8',
  },
  tableHeaderRowDark: {
    backgroundColor: '#334155',
  },
  tableColDark: {
    color: '#F4C430',
  },
  transactionCardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  txTitleDark: {
    color: '#F8FAFC',
  },
  txCategoryDark: {
    color: '#94A3B8',
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
  modalTitleDark: {
    color: '#F8FAFC',
  },
  detailRowDark: {
    borderBottomColor: '#334155',
  },
  detailLabelDark: {
    color: '#94A3B8',
  },
  detailValueDark: {
    color: '#F8FAFC',
  },

  // Notification Banner & Bell Styles
  headerBellBtn: {
    position: 'relative',
    padding: 2,
  },
  bellBadge: {
    position: 'absolute',
    top: -2,
    right: -4,
    backgroundColor: '#DC2626',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#F4C430',
  },
  bellBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  notifBanner: {
    backgroundColor: '#EFF6FF',
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderLeftWidth: 4,
    borderLeftColor: '#003366',
  },
  notifBannerDark: {
    backgroundColor: '#1E293B',
    borderColor: '#38BDF8',
    borderLeftColor: '#F4C430',
  },
  notifBannerContent: {
    flex: 1,
  },
  notifBannerTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#003366',
  },
  notifBannerText: {
    fontSize: 11,
    color: '#475569',
    marginTop: 2,
  },
  notifBannerCloseBtn: {
    padding: 4,
  },

  // Notification Modal Styles
  notifCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  notifCardUnread: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderLeftWidth: 3,
    borderLeftColor: '#003366',
  },
  notifCardTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 2,
  },
  notifCardMsg: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 16,
  },
  notifCardTime: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
  },
});

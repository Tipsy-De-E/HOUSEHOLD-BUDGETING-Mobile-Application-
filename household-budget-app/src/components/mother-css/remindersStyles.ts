// components/mother-css/remindersStyles.ts
import { StyleSheet } from 'react-native';

export const remindersStyles = StyleSheet.create({
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

  // Main Tab Switcher (Bills vs Savings Goals)
  tabSwitcher: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: '#003366', // USTP Blue
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
  },

  // Section Top Bar
  calendarQuickBanner: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: '#003366',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  calendarQuickLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  calendarQuickIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F4C430',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarQuickTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  calendarQuickSubtitle: {
    fontSize: 11,
    color: '#CBD5E1',
    marginTop: 2,
  },
  calendarQuickBtn: {
    backgroundColor: '#F4C430',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  calendarQuickBtnText: {
    color: '#003366',
    fontSize: 11,
    fontWeight: 'bold',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 18,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  addBtn: {
    backgroundColor: '#003366', // USTP Blue
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Bills Card
  billCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
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
  billTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  billIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  billName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  billDueDate: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  billRight: {
    alignItems: 'flex-end',
  },
  billAmount: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#003366',
  },
  dueBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },
  dueBadgeUrgent: {
    backgroundColor: '#FEE2E2',
  },
  dueBadgeNormal: {
    backgroundColor: '#FEF3C7',
  },
  dueBadgePaid: {
    backgroundColor: '#DCFCE7',
  },
  dueBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },

  // Bill Actions Footer
  billActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  billStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  billActionButtonsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  togglePaidBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  togglePaidBtnPaid: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
  },
  togglePaidBtnUnpaid: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  togglePaidBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  togglePaidBtnTextPaid: {
    color: '#64748B',
  },
  togglePaidBtnTextUnpaid: {
    color: '#15803D',
  },
  deleteBillBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  billNotesText: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },

  // Savings Goal Card
  goalCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  goalTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  goalIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  goalTarget: {
    fontSize: 11,
    color: '#64748B',
  },
  goalAmounts: {
    alignItems: 'flex-end',
  },
  goalCurrent: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#003366',
  },
  goalPct: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#16A34A',
  },

  // Goal Progress Bar
  goalProgressBarBg: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 12,
    marginBottom: 10,
  },
  goalProgressBarFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#F4C430', // USTP Gold
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  depositBtn: {
    backgroundColor: '#003366',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  depositBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  goalActionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteGoalBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Empty State
  emptyCard: {
    marginHorizontal: 16,
    marginTop: 20,
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#475569',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003366',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 6,
    marginTop: 10,
  },
  inputField: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  dueDateField: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
  },
  dueDateIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
  },
  dueDateIconBoxDark: {
    backgroundColor: '#1E3A5F',
  },
  dueDateTextGroup: {
    flex: 1,
  },
  dueDateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  dueDateValueDark: {
    color: '#F8FAFC',
  },
  dueDateHint: {
    marginTop: 2,
    fontSize: 10,
    color: '#64748B',
  },
  dueDateHintDark: {
    color: '#94A3B8',
  },
  modalBtnContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
  },
  modalCancelBtnText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#003366', // USTP Blue
    alignItems: 'center',
  },
  modalSaveBtnText: {
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
  tabSwitcherDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  tabBtnTextDark: {
    color: '#94A3B8',
  },
  tabBtnTextActiveDark: {
    color: '#FFFFFF',
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
  inputFieldDark: {
    backgroundColor: '#0F172A',
    borderColor: '#475569',
    color: '#F8FAFC',
  },
  inputLabelDark: {
    color: '#E2E8F0',
  },
  summaryCardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  summaryValueDark: {
    color: '#F8FAFC',
  },
});

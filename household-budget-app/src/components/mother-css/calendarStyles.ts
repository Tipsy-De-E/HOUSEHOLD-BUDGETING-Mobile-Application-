// components/mother-css/calendarStyles.ts
import { StyleSheet } from 'react-native';

export const calendarStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '94%',
    maxWidth: 460,
    maxHeight: '90%',
    padding: 18,
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
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  headerIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#003366', // USTP Blue
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
  },
  closeIconBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },

  // Month Navigation Bar
  monthNavBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  navArrowBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  monthTitleText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  todayJumpBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#003366',
  },
  todayJumpText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },

  // Calendar Legend
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendDotRed: {
    backgroundColor: '#DC2626',
  },
  legendDotYellow: {
    backgroundColor: '#D97706',
  },
  legendDotGreen: {
    backgroundColor: '#16A34A',
  },
  legendText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },

  // Weekdays Row
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 6,
  },
  weekdayText: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 11,
    fontWeight: 'bold',
    color: '#64748B',
  },
  weekdayWeekend: {
    color: '#DC2626',
  },

  // Days Grid
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  dayCell: {
    width: '14.28%',
    height: 46,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 1,
  },
  dayCellEmpty: {
    backgroundColor: 'transparent',
  },
  dayCellSelected: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#003366',
  },
  dayCellToday: {
    borderWidth: 1.5,
    borderColor: '#F4C430', // USTP Gold
    backgroundColor: '#FEFCE8',
  },
  dayNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  dayNumberToday: {
    color: '#92400E',
    fontWeight: 'bold',
  },
  dayNumberSelected: {
    color: '#003366',
    fontWeight: 'bold',
  },
  dayBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    marginTop: 2,
    minHeight: 6,
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  indicatorDotRed: {
    backgroundColor: '#DC2626',
  },
  indicatorDotYellow: {
    backgroundColor: '#D97706',
  },
  indicatorDotGreen: {
    backgroundColor: '#16A34A',
  },

  // Main Calendar Footer
  footerRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  closeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  closeBtnText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  actionBtn: {
    flex: 1.2,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#003366', // USTP Navy
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  actionBtnText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  // ==========================================
  // DEDICATED DAY DETAILS MODAL STYLES
  // ==========================================
  dayDetailOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  dayDetailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '96%',
    maxWidth: 500,
    maxHeight: '85%',
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  dayDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
    marginBottom: 12,
  },
  dayDetailHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dayDetailTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#003366',
  },

  // Day Stats Mini Bar
  dayDetailStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  dayDetailStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  dayDetailStatLabel: {
    fontSize: 10,
    color: '#64748B',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  dayDetailStatValExp: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#DC2626',
    marginTop: 2,
  },
  dayDetailStatValInc: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#16A34A',
    marginTop: 2,
  },
  dayDetailStatValBills: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#D97706',
    marginTop: 2,
  },

  // Day Details List Scroll
  dayDetailListScroll: {
    maxHeight: 280,
  },
  sectionSubHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 6,
    marginBottom: 6,
  },

  // Item Cards
  reminderItemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  reminderTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#92400E',
  },
  reminderNotes: {
    fontSize: 11,
    color: '#B45309',
    marginTop: 2,
  },
  reminderAmount: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#92400E',
  },
  reminderStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: '#FEF3C7',
  },
  reminderStatusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#B45309',
  },
  reminderPaidBadge: {
    backgroundColor: '#DCFCE7',
  },
  reminderPaidText: {
    color: '#15803D',
  },
  reminderActionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reminderDeleteBtn: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },

  txItemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  txTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  txCategory: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  txAmountExp: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#DC2626',
  },
  txAmountInc: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#16A34A',
  },

  emptyDayContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyDayText: {
    textAlign: 'center',
    color: '#64748B',
    fontSize: 12,
    marginTop: 6,
  },

  // Day Detail Footer
  dayDetailFooter: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  dayDetailAddBtn: {
    flex: 1.3,
    paddingVertical: 11,
    borderRadius: 8,
    backgroundColor: '#003366',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dayDetailAddBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  dayDetailCloseBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  dayDetailCloseBtnText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },

  // ==========================================
  // ADD CHOICE OPTIONS SHEET (Expense vs Income vs Reminder)
  // ==========================================
  choiceModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  choiceModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '92%',
    maxWidth: 420,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  choiceModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
  },
  choiceModalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#003366',
  },
  choiceOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  choiceOptionExpense: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  choiceOptionIncome: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  choiceOptionReminder: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  choiceIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  choiceIconBoxExpense: {
    backgroundColor: '#FEE2E2',
  },
  choiceIconBoxIncome: {
    backgroundColor: '#DCFCE7',
  },
  choiceIconBoxReminder: {
    backgroundColor: '#FEF3C7',
  },
  choiceOptionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  choiceOptionDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  choiceCancelBtn: {
    paddingVertical: 11,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    marginTop: 4,
  },
  choiceCancelBtnText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },

  // ==========================================
  // ADD REMINDER FOR DATE MODAL
  // ==========================================
  formField: {
    marginBottom: 12,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 4,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  formCategoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  catChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  catChipActive: {
    backgroundColor: '#003366',
    borderColor: '#003366',
  },
  catChipText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  catChipTextActive: {
    color: '#FFFFFF',
  },
  formBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  formCancelBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
  },
  formCancelBtnText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
  formSaveBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 8,
    backgroundColor: '#003366',
    alignItems: 'center',
  },
  formSaveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },

  // Dark Mode Styles
  modalContentDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
  },
  headerTitleDark: {
    color: '#F4C430',
  },
  monthNavBarDark: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
  },
  monthTitleTextDark: {
    color: '#F8FAFC',
  },
  calendarCardDark: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
  },
  cellTextDark: {
    color: '#E2E8F0',
  },
  cellMutedTextDark: {
    color: '#475569',
  },
  detailsCardDark: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
  },
  detailsDateTitleDark: {
    color: '#F8FAFC',
  },
  itemCardDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  itemTitleDark: {
    color: '#F8FAFC',
  },
  choiceOptionCardDark: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
  },
  choiceOptionTitleDark: {
    color: '#F8FAFC',
  },
  formInputDark: {
    backgroundColor: '#0F172A',
    borderColor: '#475569',
    color: '#F8FAFC',
  },
  formLabelDark: {
    color: '#CBD5E1',
  },
  catChipDark: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
  },
  catChipTextDark: {
    color: '#94A3B8',
  },
});

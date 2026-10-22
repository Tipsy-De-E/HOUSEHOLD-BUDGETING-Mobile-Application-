import { StyleSheet } from "react-native";

export const budgetStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  bannerYellow: {
    height: 8,
    backgroundColor: "#F4C430",
    width: "100%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: "#F4C430",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },

  periodToggleContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  periodToggleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  periodToggleBtnActive: {
    backgroundColor: "#003366",
  },
  periodToggleText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },
  periodToggleTextActive: {
    color: "#FFFFFF",
  },

  budgetSummaryCard: {
    backgroundColor: "#003366",
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  budgetCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  budgetCardLabel: {
    fontSize: 12,
    color: "#F4C430",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  budgetEditBtn: {
    backgroundColor: "rgba(244, 196, 48, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  budgetEditBtnText: {
    color: "#F4C430",
    fontSize: 12,
    fontWeight: "bold",
  },
  budgetRemainingAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 6,
  },
  budgetRemainingNegative: {
    color: "#FF8A80",
  },
  budgetRemainingSub: {
    fontSize: 12,
    color: "#CBD5E1",
    marginTop: 2,
    marginBottom: 16,
  },

  mainProgressBarBg: {
    height: 10,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 14,
  },
  mainProgressBarFill: {
    height: "100%",
    borderRadius: 5,
    backgroundColor: "#F4C430",
  },
  progressBarDanger: {
    backgroundColor: "#EF4444",
  },
  progressBarWarning: {
    backgroundColor: "#F59E0B",
  },
  progressBarGold: {
    backgroundColor: "#F4C430",
  },
  progressBarNavy: {
    backgroundColor: "#003366",
  },

  budgetSplitRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.15)",
  },
  budgetSplitItem: {
    flex: 1,
  },
  budgetSplitItemRight: {
    flex: 1,
    alignItems: "flex-end",
  },
  budgetSplitLabel: {
    fontSize: 11,
    color: "#94A3B8",
    marginBottom: 2,
  },
  budgetSplitValue: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#FFFFFF",
  },

  warningBanner: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: "#FFFBEB",
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
    borderRadius: 10,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dangerBanner: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: "#FEF2F2",
    borderLeftWidth: 4,
    borderLeftColor: "#EF4444",
    borderRadius: 10,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: "#92400E",
    fontWeight: "500",
  },
  dangerText: {
    flex: 1,
    fontSize: 12,
    color: "#B91C1C",
    fontWeight: "bold",
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000000", // Text: Black
  },

  // Category Budget Card
  categoryBudgetCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  catBudgetTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  catBudgetInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  catIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  catName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0F172A",
  },
  catLimitSubtitle: {
    fontSize: 11,
    color: "#64748B",
  },
  catAmounts: {
    alignItems: "flex-end",
  },
  catSpentText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#003366", // USTP Blue
  },
  catSpentTextOver: {
    color: "#DC2626",
  },
  catRemainingText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
  },
  catRemainingTextOver: {
    color: "#DC2626",
  },
  catActionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  catActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#003366", // USTP Blue
  },
  catActionBtnText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  catActionBtnSecondary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  catActionBtnTextSecondary: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#003366",
  },

  // Category Expenses Modal Item Styles
  catExpensesInfoBanner: {
    marginBottom: 12,
    backgroundColor: "#F1F5F9",
    padding: 10,
    borderRadius: 8,
  },
  catExpensesInfoText: {
    fontSize: 12,
    color: "#475569",
  },
  catExpensesSpentHighlight: {
    fontWeight: "bold",
    color: "#D32F2F",
  },
  catExpensesLimitHighlight: {
    fontWeight: "bold",
    color: "#003366",
  },
  catExpensesListScroll: {
    maxHeight: 280,
  },
  catExpensesEmptyContainer: {
    padding: 24,
    alignItems: "center",
  },
  catExpensesEmptyText: {
    color: "#64748B",
    fontSize: 13,
    marginTop: 8,
    textAlign: "center",
  },
  catExpenseItem: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  catExpenseTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  catExpenseTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#0F172A",
    flex: 1,
  },
  catExpenseAmount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#D32F2F",
  },
  catExpenseDate: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  catExpenseDesc: {
    fontSize: 11,
    color: "#475569",
    marginTop: 4,
    fontStyle: "italic",
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    width: "100%",
    maxWidth: 500,
    maxHeight: "85%",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingBottom: 10,
  },
  catModalHeaderTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  modalCloseIconBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#003366",
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#334155",
    marginBottom: 6,
    marginTop: 10,
  },
  inputField: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#0F172A",
    backgroundColor: "#F8FAFC",
  },
  modalBtnContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    alignItems: "center",
  },
  modalCancelBtnText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
  },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#003366", // USTP Blue
    alignItems: "center",
  },
  modalSaveBtnText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  modalFooterFull: {
    marginTop: 14,
    width: "100%",
  },
  modalFooterRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
    width: "100%",
  },
  modalCloseBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  modalCloseBtnText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
  },
  modalConfirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#003366", // USTP Blue
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  modalConfirmBtnText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  // Bottom Navigation Bar
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 65,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 5,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    flex: 1,
  },
  navText: {
    fontSize: 11,
    color: "#757575",
    marginTop: 2,
    fontWeight: "500",
  },
  navTextActive: {
    color: "#003366", // USTP Blue
    fontWeight: "bold",
  },
  fab: {
    top: -15,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#003366", // USTP Blue
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },

  // Dark Mode Style Variations
  containerDark: {
    backgroundColor: "#0F172A",
  },
  headerDark: {
    backgroundColor: "#1E293B",
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  headerTitleDark: {
    color: "#F4C430",
  },
  periodToggleContainerDark: {
    backgroundColor: "#1E293B",
    borderColor: "#334155",
  },
  periodToggleTextDark: {
    color: "#94A3B8",
  },
  overviewCardDark: {
    backgroundColor: "#1E293B",
    borderColor: "#334155",
  },
  overviewTitleDark: {
    color: "#F8FAFC",
  },
  cardDark: {
    backgroundColor: "#1E293B",
    borderColor: "#334155",
  },
  categoryBudgetCardDark: {
    backgroundColor: "#1E293B",
    borderColor: "#334155",
  },
  catNameDark: {
    color: "#F8FAFC",
  },
  catIconBoxDark: {
    backgroundColor: "#334155",
  },
  catSpentTextDark: {
    color: "#F8FAFC",
  },
  titleDark: {
    color: "#F8FAFC",
  },
  textMutedDark: {
    color: "#94A3B8",
  },
  bottomNavDark: {
    backgroundColor: "#1E293B",
    borderTopColor: "#334155",
  },
  navTextDark: {
    color: "#94A3B8",
  },
  navTextActiveDark: {
    color: "#38BDF8",
  },
  modalContentDark: {
    backgroundColor: "#1E293B",
    borderColor: "#334155",
  },
  modalTitleDark: {
    color: "#F8FAFC",
  },
  catExpenseItemDark: {
    backgroundColor: "#0F172A",
    borderColor: "#334155",
  },
  catExpenseTitleDark: {
    color: "#F8FAFC",
  },
  catExpensesInfoBannerDark: {
    backgroundColor: "#0F172A",
    borderColor: "#334155",
  },
  catExpensesInfoTextDark: {
    color: "#CBD5E1",
  },
  inputFieldDark: {
    backgroundColor: "#0F172A",
    borderColor: "#475569",
    color: "#F8FAFC",
  },
  inputLabelDark: {
    color: "#E2E8F0",
  },
});

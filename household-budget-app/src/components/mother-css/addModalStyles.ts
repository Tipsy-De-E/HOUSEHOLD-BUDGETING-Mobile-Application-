// components/mother-css/addModalStyles.ts
import { StyleSheet } from 'react-native';

export const addModalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    padding: 20,
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
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003366', // USTP Navy Blue
  },
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
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
  },
  typeSelectBtnActiveExpense: {
    borderColor: '#D32F2F',
    backgroundColor: '#FFEBEE',
  },
  typeSelectBtnActiveIncome: {
    borderColor: '#2E7D32',
    backgroundColor: '#E8F5E9',
  },
  typeSelectBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  typeSelectBtnTextExpense: {
    color: '#D32F2F',
    fontWeight: 'bold',
  },
  typeSelectBtnTextIncome: {
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 6,
    marginTop: 8,
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
  incomeLimitHint: {
    marginTop: 8,
    marginBottom: 4,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  incomeLimitHintDark: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
  },
  incomeLimitHintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  incomeLimitHintLabel: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  incomeLimitHintLabelDark: {
    color: '#CBD5E1',
  },
  incomeLimitHintAmount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#003366',
  },
  incomeLimitHintAmountDark: {
    color: '#38BDF8',
  },
  incomeLimitHintAmountExceeded: {
    color: '#DC2626',
  },
  incomeLimitTrack: {
    height: 6,
    marginTop: 7,
    overflow: 'hidden',
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
  },
  incomeLimitTrackDark: {
    backgroundColor: '#334155',
  },
  incomeLimitFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  incomeLimitFillExceeded: {
    backgroundColor: '#DC2626',
  },
  incomeLimitHintText: {
    marginTop: 5,
    fontSize: 10,
    color: '#64748B',
  },
  incomeLimitHintTextDark: {
    color: '#94A3B8',
  },
  categoryScroll: {
    marginVertical: 4,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  categoryPillActive: {
    backgroundColor: '#003366',
    borderColor: '#003366',
  },
  categoryPillText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  modalBtnContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
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

  // Photo / Receipt Proof Upload Section
  photoSection: {
    marginTop: 12,
    marginBottom: 4,
  },
  photoUploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#93C5FD',
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  photoUploadBtnText: {
    color: '#003366',
    fontSize: 13,
    fontWeight: '600',
  },
  photoPreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  photoPreviewLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  photoThumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  photoPreviewInfo: {
    flex: 1,
  },
  photoPreviewTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  photoPreviewSubtitle: {
    fontSize: 10,
    color: '#16A34A',
    fontWeight: '600',
    marginTop: 2,
  },
  photoRemoveBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#FEE2E2',
  },

  // ========================================================
  // ENHANCED INCOME LIMIT EXCEEDED MODAL
  // ========================================================
  limitOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  limitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 440,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 1.5,
    borderColor: '#FEF08A',
  },
  limitHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  limitIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  limitTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#92400E',
    textAlign: 'center',
  },
  limitSubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 8,
  },
  limitStatsCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  limitStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  limitStatLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  limitStatVal: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  limitStatDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  limitStatValExceeded: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#DC2626',
  },
  limitStatValCap: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#003366',
  },
  limitProgressBarBg: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 4,
  },
  limitProgressBarFill: {
    height: '100%',
    backgroundColor: '#DC2626',
    borderRadius: 4,
  },
  limitActionRow: {
    gap: 10,
    marginTop: 10,
  },
  limitUpgradeBtn: {
    backgroundColor: '#003366',
    borderRadius: 10,
    paddingVertical: 13,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#003366',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  limitUpgradeBtnText: {
    color: '#F4C430',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  limitCancelBtn: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  limitCancelBtnText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },

  // Dark mode styles
  modalContentDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
  },
  modalTitleDark: {
    color: '#F4C430',
  },
  inputLabelDark: {
    color: '#E2E8F0',
  },
  inputFieldDark: {
    backgroundColor: '#0F172A',
    borderColor: '#475569',
    color: '#F8FAFC',
  },
  categoryPillDark: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
  },
  categoryPillTextDark: {
    color: '#94A3B8',
  },
  limitStatsCardDark: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
  },
  limitStatValDark: {
    color: '#F8FAFC',
  },
});

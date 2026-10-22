// src/components/admin-css/adminHomeStyles.ts
import { StyleSheet } from 'react-native';
import { adminHomeStyles as baseStyles } from './admindashboard';

export const adminHomeStyles = StyleSheet.create({
  ...baseStyles,

  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0F172A',
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  modalCancelBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#475569',
  },
  modalSendBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#003366',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modalSendBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default adminHomeStyles;

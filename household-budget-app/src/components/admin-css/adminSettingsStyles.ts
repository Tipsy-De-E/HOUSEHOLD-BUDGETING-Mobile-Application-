// src/components/admin-css/adminSettingsStyles.ts
import { StyleSheet } from 'react-native';
import { adminHomeStyles } from './admindashboard';

export const adminSettingsStyles = StyleSheet.create({
  ...adminHomeStyles,

  // Settings Plan Box
  settingsPlanBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  settingsPlanBoxTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 10,
  },

  // Save button
  settingsSaveBtn: {
    backgroundColor: '#003366',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  settingsSaveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Bottom Nav Labels
  navLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 3,
  },
  navLabelActive: {
    color: '#003366',
    fontWeight: 'bold',
  },
});

export default adminSettingsStyles;

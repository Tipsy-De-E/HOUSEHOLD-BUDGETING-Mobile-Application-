// src/components/admin-css/adminReportsStyles.ts
import { StyleSheet } from 'react-native';
import { adminHomeStyles } from './admindashboard';

export const adminReportsStyles = StyleSheet.create({
  ...adminHomeStyles,

  // Revenue card specific
  reportRevenueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  reportRevenueTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  reportRevenueBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    padding: 10,
  },

  // Summary Card
  reportSummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  reportCardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 12,
  },
  reportMetricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  reportMetricItem: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reportMetricLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 4,
  },
  reportMetricVal: {
    fontSize: 15,
    fontWeight: 'bold',
  },

  // Export button
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 18,
  },
  exportBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#003366',
  },

  // Bottom Navigation text labels
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

export default adminReportsStyles;

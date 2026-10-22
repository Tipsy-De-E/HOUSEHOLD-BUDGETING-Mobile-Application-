// src/components/admin-css/adminUsersStyles.ts
import { StyleSheet } from 'react-native';
import { adminHomeStyles } from './admindashboard';

export const adminUsersStyles = StyleSheet.create({
  ...adminHomeStyles,
  searchBarContainerDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
});

export default adminUsersStyles;

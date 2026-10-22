import { StyleSheet } from 'react-native';

export const appDialogStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'rgba(15, 23, 42, 0.58)',
  },
  card: {
    width: '100%',
    maxWidth: 390,
    padding: 22,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 12,
  },
  cardDark: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    textAlign: 'center',
  },
  titleDark: {
    color: '#F8FAFC',
  },
  message: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 19,
    color: '#64748B',
    textAlign: 'center',
  },
  messageDark: {
    color: '#CBD5E1',
  },
  actionRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  action: {
    flex: 1,
    minHeight: 42,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionDark: {
    borderColor: '#475569',
  },
  primaryAction: {
    backgroundColor: '#003366',
    borderColor: '#003366',
  },
  destructiveAction: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    textAlign: 'center',
  },
  actionTextDark: {
    color: '#CBD5E1',
  },
  primaryActionText: {
    color: '#FFFFFF',
  },
  destructiveActionText: {
    color: '#FFFFFF',
  },
});

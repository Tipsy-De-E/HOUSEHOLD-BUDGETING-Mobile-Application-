// src/components/admin-css/loginStyle.ts
import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const loginStyles = StyleSheet.create({
  // ==========================================
  // 1. SPLASH / LOADING SCREEN STYLES
  // ==========================================
  splashContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  splashTopRightAccent: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#FFB800',
  },
  splashBottomLeftAccent: {
    position: 'absolute',
    bottom: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#FFB800',
  },
  splashContent: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  splashLogoImage: {
    width: 140,
    height: 140,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  splashTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0A2540',
    letterSpacing: 0.5,
    marginTop: 4,
    textAlign: 'center',
  },
  splashSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 3,
    marginTop: 6,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  splashLoader: {
    marginTop: 32,
  },

  // ==========================================
  // 2. WELCOME / ONBOARDING SCREEN STYLES
  // ==========================================
  welcomeContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
  },
  welcomeTopArea: {
    flex: 1.1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  welcomeLogoImage: {
    width: 130,
    height: 130,
    resizeMode: 'contain',
    marginBottom: 14,
  },
  welcomeBrandTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0A2540',
    letterSpacing: 0.5,
  },
  welcomeBrandSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 3,
    marginTop: 6,
    textTransform: 'uppercase',
  },
  welcomeBottomCard: {
    backgroundColor: '#FFB800',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: 44,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  welcomeGreetingTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0A2540',
    marginBottom: 10,
  },
  welcomeDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: '#2D3748',
    fontWeight: '500',
    marginBottom: 30,
  },
  welcomeButtonRow: {
    flexDirection: 'row',
    gap: 14,
  },
  welcomeSignInBtn: {
    flex: 1,
    backgroundColor: '#003366',
    borderRadius: 28,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#003366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  welcomeSignInBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  welcomeSignUpBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3,
  },
  welcomeSignUpBtnText: {
    color: '#003366',
    fontSize: 15,
    fontWeight: '700',
  },

  // ==========================================
  // 3. SIGN IN SCREEN STYLES
  // ==========================================
  signInContainer: {
    flex: 1,
    backgroundColor: '#FFB800',
  },
  signInTopNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 54,
    paddingBottom: 16,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerNavText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0A2540',
  },
  signInHeaderArea: {
    paddingHorizontal: 28,
    paddingBottom: 28,
  },
  signInTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0A2540',
    marginBottom: 6,
  },
  signInSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#334155',
    fontWeight: '500',
  },
  signInCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 8,
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
    marginLeft: 4,
  },
  modernInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 25,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modernInputWrapperFocused: {
    borderColor: '#003366',
    backgroundColor: '#FFFFFF',
  },
  inputIcon: {
    marginRight: 10,
  },
  modernInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: '#0F172A',
  },
  eyeToggle: {
    padding: 8,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: 4,
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  signInActionButton: {
    backgroundColor: '#003366',
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#003366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  signInActionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  bottomSwitchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 26,
    paddingBottom: 20,
  },
  bottomSwitchText: {
    fontSize: 14,
    color: '#64748B',
  },
  bottomSwitchAction: {
    fontSize: 14,
    fontWeight: '700',
    color: '#003366',
    marginLeft: 6,
  },
});
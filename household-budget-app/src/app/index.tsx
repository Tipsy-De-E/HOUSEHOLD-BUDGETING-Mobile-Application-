// src/app/index.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../lib/supabase';
import { loginStyles } from '../components/admin-css/loginStyle';
import { Ionicons } from '@expo/vector-icons';

type ScreenState = 'splash' | 'welcome' | 'signin';

export default function IndexScreen() {
  const [screenState, setScreenState] = useState<ScreenState>('splash');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    // Display the wallet splash/loading screen briefly, then transition to Welcome screen
    const timer = setTimeout(() => {
      if (isMounted) {
        setScreenState('welcome');
      }
    }, 1500);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert('Missing Fields', 'Please enter both your email and password.');
      return;
    }

    setLoading(true);

    try {
      // 1. Authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        if (authError.message.toLowerCase().includes('email not confirmed')) {
          Alert.alert(
            'Email Not Confirmed',
            'Please verify your email using the confirmation link sent to your inbox before logging in.'
          );
        } else {
          Alert.alert('Login Failed', authError.message);
        }
        setLoading(false);
        return;
      }

      const user = authData.user;
      if (!user) {
        Alert.alert('Error', 'User not found. Please try again.');
        setLoading(false);
        return;
      }

      // 2. Fetch the user's role from the profiles table
      let userRole = user.user_metadata?.role;

      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileData?.role) {
        userRole = profileData.role;
      }

      // Fallback if role is not explicitly set in profile table
      if (!userRole) {
        if (user.email === 'admin@household.com') {
          userRole = 'admin';
        } else {
          userRole = 'mother';
        }
      }

      // Persist authenticated credentials locally
      await AsyncStorage.setItem('user_email', user.email || email.trim());
      await AsyncStorage.setItem('user_id', user.id);
      await AsyncStorage.setItem('user_role', userRole);

      // 3. Dynamic Routing based on Database Role
      if (userRole === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/mother/home');
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // RENDER 1: SPLASH / LOADING SCREEN (Screen 1)
  // ==========================================
  if (screenState === 'splash') {
    return (
      <View style={loginStyles.splashContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        {/* Top-Right Yellow Organic Corner Accent */}
        <View style={loginStyles.splashTopRightAccent} />

        {/* Bottom-Left Yellow Organic Corner Accent */}
        <View style={loginStyles.splashBottomLeftAccent} />

        {/* Center Wallet Branding */}
        <View style={loginStyles.splashContent}>
          <Image
            source={require('../../assets/images/wallet-logo.png')}
            style={loginStyles.splashLogoImage}
          />
          <Text style={loginStyles.splashTitle}>Household Budget</Text>
          <Text style={loginStyles.splashSubtitle}>Smart Expense Tracker</Text>

          <ActivityIndicator
            size="small"
            color="#003366"
            style={loginStyles.splashLoader}
          />
        </View>
      </View>
    );
  }

  // ==========================================
  // RENDER 2: WELCOME / ONBOARDING SCREEN (Screen 2)
  // ==========================================
  if (screenState === 'welcome') {
    return (
      <View style={loginStyles.welcomeContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        {/* Top White Half: Logo & App Title */}
        <View style={loginStyles.welcomeTopArea}>
          <Image
            source={require('../../assets/images/wallet-logo.png')}
            style={loginStyles.welcomeLogoImage}
          />
          <Text style={loginStyles.welcomeBrandTitle}>Household Budget</Text>
          <Text style={loginStyles.welcomeBrandSubtitle}>Smart Household Finance</Text>
        </View>

        {/* Bottom Yellow Card: Welcome & Auth Actions */}
        <View style={loginStyles.welcomeBottomCard}>
          <Text style={loginStyles.welcomeGreetingTitle}>Welcome</Text>
          <Text style={loginStyles.welcomeDescription}>
            Take control of your household finances, monitor daily expenses, and achieve your financial goals with ease.
          </Text>

          <View style={loginStyles.welcomeButtonRow}>
            {/* Sign In Pill Button */}
            <TouchableOpacity
              style={loginStyles.welcomeSignInBtn}
              activeOpacity={0.85}
              onPress={() => setScreenState('signin')}
            >
              <Text style={loginStyles.welcomeSignInBtnText}>Sign In</Text>
            </TouchableOpacity>

            {/* Sign Up Pill Button */}
            <TouchableOpacity
              style={loginStyles.welcomeSignUpBtn}
              activeOpacity={0.85}
              onPress={() => router.push('/mother/signup')}
            >
              <Text style={loginStyles.welcomeSignUpBtnText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // ==========================================
  // RENDER 3: MODERN SIGN IN SCREEN (Screen 3)
  // ==========================================
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={loginStyles.signInContainer}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFB800" />

      {/* Top Header Navigation */}
      <View style={loginStyles.signInTopNav}>
        <TouchableOpacity
          style={loginStyles.backButton}
          onPress={() => setScreenState('welcome')}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color="#0A2540" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/mother/signup')}
          activeOpacity={0.7}
        >
          <Text style={loginStyles.registerNavText}>Register</Text>
        </TouchableOpacity>
      </View>

      {/* Header Title Section */}
      <View style={loginStyles.signInHeaderArea}>
        <Text style={loginStyles.signInTitle}>Sign In</Text>
        <Text style={loginStyles.signInSubtitle}>
          Enter your credentials to manage your household budget.
        </Text>
      </View>

      {/* White Form Card Curving Up */}
      <View style={loginStyles.signInCard}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Email / Username Input */}
          <View style={loginStyles.inputGroup}>
            <Text style={loginStyles.inputLabel}>Email Address</Text>
            <View
              style={[
                loginStyles.modernInputWrapper,
                emailFocused && loginStyles.modernInputWrapperFocused,
              ]}
            >
              <Ionicons
                name="mail-outline"
                size={20}
                color={emailFocused ? '#003366' : '#94A3B8'}
                style={loginStyles.inputIcon}
              />
              <TextInput
                style={loginStyles.modernInput}
                placeholder="Enter your email"
                placeholderTextColor="#94A3B8"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={loginStyles.inputGroup}>
            <Text style={loginStyles.inputLabel}>Password</Text>
            <View
              style={[
                loginStyles.modernInputWrapper,
                passwordFocused && loginStyles.modernInputWrapperFocused,
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={passwordFocused ? '#003366' : '#94A3B8'}
                style={loginStyles.inputIcon}
              />
              <TextInput
                style={loginStyles.modernInput}
                placeholder="Enter your password"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
              <TouchableOpacity
                style={loginStyles.eyeToggle}
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot Password Link */}
          <TouchableOpacity
            style={loginStyles.forgotPasswordContainer}
            onPress={() =>
              Alert.alert(
                'Password Reset',
                'Please contact support or your household administrator to reset your password.'
              )
            }
          >
            <Text style={loginStyles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Primary Action Button: Blue Pill */}
          <TouchableOpacity
            style={loginStyles.signInActionButton}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={loginStyles.signInActionButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Bottom Switch Link */}
          <View style={loginStyles.bottomSwitchContainer}>
            <Text style={loginStyles.bottomSwitchText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/mother/signup')}>
              <Text style={loginStyles.bottomSwitchAction}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
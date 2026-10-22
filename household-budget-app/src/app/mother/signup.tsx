// src/app/mother/signup.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Modal, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../../lib/supabase';
import { signupStyles } from '../../components/mother-css/signupStyles';
import { Ionicons } from '@expo/vector-icons';

export default function MotherSignUpScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [createdEmail, setCreatedEmail] = useState('');
    const [createdPassword, setCreatedPassword] = useState('');
    const [createdUserId, setCreatedUserId] = useState<string | null>(null);
    const router = useRouter();

    async function handleSignUp() {
        if (!email.trim() || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match.');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'Password should be at least 6 characters long.');
            return;
        }

        setLoading(true);

        try {
            const cleanEmail = email.trim().toLowerCase();
            const { data, error } = await supabase.auth.signUp({
                email: cleanEmail,
                password,
                options: {
                    data: {
                        role: 'mother',
                        full_name: 'Household Budgeter',
                    },
                },
            });

            if (error) {
                if (error.code === 'over_email_send_rate_limit' || error.message.toLowerCase().includes('rate limit')) {
                    Alert.alert(
                        'Supabase Email Rate Limit Exceeded',
                        'Supabase limits confirmation emails to 3-4 per hour on the default mailer.\n\nTo fix this permanently:\n1. Go to your Supabase Dashboard\n2. Open Authentication > Providers > Email\n3. Turn OFF "Confirm email" and click Save.\n\nThis will enable instant, unlimited account signups!'
                    );
                } else if (
                    error.message.toLowerCase().includes('already registered') ||
                    error.message.toLowerCase().includes('already exists')
                ) {
                    Alert.alert(
                        'Account Already Exists',
                        'An account with this email address already exists. You can log in directly.',
                        [
                            { text: 'Go to Login', onPress: () => router.replace('/') },
                            { text: 'Cancel', style: 'cancel' }
                        ]
                    );
                } else {
                    Alert.alert('Sign Up Failed', error.message);
                }
                setLoading(false);
                return;
            }

            // Sync with profiles table if user was created
            if (data?.user) {
                setCreatedUserId(data.user.id);
                try {
                    await supabase.from('profiles').upsert({
                        id: data.user.id,
                        email: cleanEmail,
                        role: 'mother',
                        full_name: `${cleanEmail.split('@')[0]} Household`,
                        tier: 'free',
                        income_cap: 5000.00,
                        updated_at: new Date().toISOString(),
                    });
                } catch {
                    // Handled gracefully: Database trigger handles profile creation
                }
            }

            // Record in shared registered users cache & Live Activity Log for instant Admin visibility
            try {
                const uid = data?.user?.id || `usr-${Date.now()}`;
                const newRegisteredUser = {
                    id: uid,
                    email: cleanEmail,
                    role: 'mother',
                    created_at: new Date().toISOString().split('T')[0],
                    status: 'Active',
                    householdName: `${cleanEmail.split('@')[0]} Household`,
                    tier: 'free',
                    income_cap: 5000,
                    total_income: 0,
                    total_expenses: 0,
                    total_budget: 38000,
                };

                const existingUsersRaw = await AsyncStorage.getItem('@household_registered_users');
                const existingUsers = existingUsersRaw ? JSON.parse(existingUsersRaw) : [];
                const updatedUsers = [newRegisteredUser, ...existingUsers.filter((u: any) => u.email?.toLowerCase() !== cleanEmail.toLowerCase())];
                await AsyncStorage.setItem('@household_registered_users', JSON.stringify(updatedUsers));

                // Add to Live Activities log
                const newAct = {
                    id: `reg-${Date.now()}`,
                    title: `Account Registered: ${cleanEmail}`,
                    subtitle: `Joined Free Basic Plan (Income Limit: ₱5,000)`,
                    icon: 'person-add-outline',
                    time: 'Just now',
                    isHighlight: true,
                };
                const existingActRaw = await AsyncStorage.getItem('@household_live_activities');
                const existingAct = existingActRaw ? JSON.parse(existingActRaw) : [];
                await AsyncStorage.setItem(
                    '@household_live_activities',
                    JSON.stringify([newAct, ...existingAct.filter((a: any) => a.title !== newAct.title)].slice(0, 15))
                );

                // Insert into Supabase notifications
                await supabase.from('notifications').insert({
                    user_email: cleanEmail,
                    title: 'New Account Registered',
                    message: `Household account "${cleanEmail}" has been registered with Free Basic Plan (₱5,000 limit).`,
                    type: 'system',
                });
            } catch (regLogErr) {
                console.log('Error logging user registration:', regLogErr);
            }

            // Save credentials for direct continuation
            setCreatedEmail(cleanEmail);
            setCreatedPassword(password);
            setShowSuccessModal(true);
        } catch (err: any) {
            Alert.alert('Error', err?.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    }

    async function handleContinue() {
        setLoading(true);
        setShowSuccessModal(false);

        try {
            // Set fresh clean storage for new registered user
            await AsyncStorage.setItem('user_email', createdEmail);
            if (createdUserId) {
                await AsyncStorage.setItem('user_id', createdUserId);
            }
            await AsyncStorage.setItem('user_role', 'mother');
            await AsyncStorage.setItem('user_income_cap', '5000');
            await AsyncStorage.setItem('user_subscription_tier', 'free');
            await AsyncStorage.removeItem('last_availed_plan');

            // Check if active session already exists
            const { data: sessionData } = await supabase.auth.getSession();
            if (sessionData?.session) {
                // Ensure profile is synced
                try {
                    await supabase.from('profiles').upsert({
                        id: sessionData.session.user.id,
                        email: createdEmail,
                        role: 'mother',
                        full_name: `${createdEmail.split('@')[0]} Household`,
                        tier: 'free',
                        income_cap: 5000.00,
                        updated_at: new Date().toISOString(),
                    });
                } catch { }
                router.replace('/mother/home');
                return;
            }

            // Attempt automatic sign-in with created credentials
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email: createdEmail,
                password: createdPassword,
            });

            if (signInError) {
                if (signInError.message.toLowerCase().includes('email not confirmed')) {
                    Alert.alert(
                        'Email Not Confirmed',
                        'Your account is saved in Supabase! Please confirm your email via the link sent to your inbox, or disable "Confirm email" in your Supabase Auth settings to log in immediately.',
                        [{ text: 'Go to Login', onPress: () => router.replace('/') }]
                    );
                } else {
                    Alert.alert('Notice', signInError.message, [
                        { text: 'Go to Login', onPress: () => router.replace('/') }
                    ]);
                }
                return;
            }

            // Ensure profile exists after authenticated sign in
            if (signInData?.user) {
                try {
                    await supabase.from('profiles').upsert({
                        id: signInData.user.id,
                        email: createdEmail,
                        role: 'mother',
                        full_name: `${createdEmail.split('@')[0]} Household`,
                        tier: 'free',
                        income_cap: 5000.00,
                        updated_at: new Date().toISOString(),
                    });
                } catch { }
            }

            // Successfully signed in, navigate to Mother Dashboard
            router.replace('/mother/home');
        } catch {
            router.replace('/mother/home');
        } finally {
            setLoading(false);
        }
    }

    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [confirmFocused, setConfirmFocused] = useState(false);

    function handleBackToLogin() {
        setShowSuccessModal(false);
        router.replace('/');
    }

    return (
        <View style={signupStyles.container}>
            {/* Top Navigation */}
            <View style={signupStyles.topNav}>
                <TouchableOpacity
                    style={signupStyles.backButton}
                    onPress={() => router.replace('/')}
                    activeOpacity={0.7}
                >
                    <Ionicons name="arrow-back" size={22} color="#0A2540" />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => router.replace('/')}
                    activeOpacity={0.7}
                >
                    <Text style={signupStyles.loginNavText}>Sign In</Text>
                </TouchableOpacity>
            </View>

            {/* Header Area */}
            <View style={signupStyles.headerArea}>
                <Text style={signupStyles.headerTitle}>Create Account</Text>
                <Text style={signupStyles.headerSubtitle}>
                    Sign up to start tracking your household budget and finances.
                </Text>
            </View>

            {/* White Rounded Form Card */}
            <View style={signupStyles.formCard}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={signupStyles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Email Address */}
                    <View style={signupStyles.inputGroup}>
                        <Text style={signupStyles.inputLabel}>Email Address</Text>
                        <View
                            style={[
                                signupStyles.modernInputWrapper,
                                emailFocused && signupStyles.modernInputWrapperFocused,
                            ]}
                        >
                            <Ionicons
                                name="mail-outline"
                                size={20}
                                color={emailFocused ? '#003366' : '#94A3B8'}
                                style={signupStyles.inputIcon}
                            />
                            <TextInput
                                style={signupStyles.modernInput}
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

                    {/* Password */}
                    <View style={signupStyles.inputGroup}>
                        <Text style={signupStyles.inputLabel}>Password</Text>
                        <View
                            style={[
                                signupStyles.modernInputWrapper,
                                passwordFocused && signupStyles.modernInputWrapperFocused,
                            ]}
                        >
                            <Ionicons
                                name="lock-closed-outline"
                                size={20}
                                color={passwordFocused ? '#003366' : '#94A3B8'}
                                style={signupStyles.inputIcon}
                            />
                            <TextInput
                                style={signupStyles.modernInput}
                                placeholder="Create a password (min 6 chars)"
                                placeholderTextColor="#94A3B8"
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={setPassword}
                                onFocus={() => setPasswordFocused(true)}
                                onBlur={() => setPasswordFocused(false)}
                            />
                            <TouchableOpacity
                                style={signupStyles.eyeToggle}
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

                    {/* Confirm Password */}
                    <View style={signupStyles.inputGroup}>
                        <Text style={signupStyles.inputLabel}>Confirm Password</Text>
                        <View
                            style={[
                                signupStyles.modernInputWrapper,
                                confirmFocused && signupStyles.modernInputWrapperFocused,
                            ]}
                        >
                            <Ionicons
                                name="lock-closed-outline"
                                size={20}
                                color={confirmFocused ? '#003366' : '#94A3B8'}
                                style={signupStyles.inputIcon}
                            />
                            <TextInput
                                style={signupStyles.modernInput}
                                placeholder="Re-enter your password"
                                placeholderTextColor="#94A3B8"
                                secureTextEntry={!showConfirmPassword}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                onFocus={() => setConfirmFocused(true)}
                                onBlur={() => setConfirmFocused(false)}
                            />
                            <TouchableOpacity
                                style={signupStyles.eyeToggle}
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Ionicons
                                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                                    size={20}
                                    color="#64748B"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Action Button: Navy Blue Pill */}
                    <TouchableOpacity
                        style={signupStyles.signupActionButton}
                        onPress={handleSignUp}
                        disabled={loading}
                        activeOpacity={0.85}
                    >
                        <Text style={signupStyles.signupActionButtonText}>
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </Text>
                    </TouchableOpacity>

                    {/* Bottom Switch Link */}
                    <View style={signupStyles.bottomSwitchContainer}>
                        <Text style={signupStyles.bottomSwitchText}>Already have an account?</Text>
                        <TouchableOpacity onPress={() => router.replace('/')}>
                            <Text style={signupStyles.bottomSwitchAction}>Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>

            {/* Account Created Choice Modal */}
            <Modal
                visible={showSuccessModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowSuccessModal(false)}
            >
                <View style={signupStyles.modalOverlay}>
                    <View style={signupStyles.modalContent}>
                        <View style={signupStyles.modalIconContainer}>
                            <Ionicons name="checkmark-circle" size={42} color="#16A34A" />
                        </View>
                        <Text style={signupStyles.modalTitle}>Account Created!</Text>
                        <Text style={signupStyles.modalSubtitle}>
                            Your account is ready in Supabase. You can proceed directly to your budget dashboard or return to sign in.
                        </Text>
                        <View style={signupStyles.modalButtonContainer}>
                            <TouchableOpacity
                                style={signupStyles.continueButton}
                                onPress={handleContinue}
                                disabled={loading}
                                activeOpacity={0.85}
                            >
                                <Text style={signupStyles.continueButtonText}>
                                    {loading ? 'Opening...' : 'Continue to Dashboard'}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={signupStyles.backToLoginButton}
                                onPress={handleBackToLogin}
                                disabled={loading}
                                activeOpacity={0.85}
                            >
                                <Text style={signupStyles.backToLoginButtonText}>Back to Sign In</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
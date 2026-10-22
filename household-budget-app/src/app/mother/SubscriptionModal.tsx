// src/app/mother/SubscriptionModal.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../../lib/supabase';
import { subscriptionStyles } from '../../components/mother-css/subscriptionStyles';
import { useAppTheme } from '../../context/ThemeContext';
import { AppDialog } from '../../components/ui/AppDialog';

export interface PlanTier {
  id: 'free' | 'starter_10k' | 'plus_15k' | 'unlimited';
  name: string;
  capAmount: number;
  capDisplay: string;
  price: number;
  priceDisplay: string;
  duration: string;
  popular?: boolean;
  features: string[];
}

export const SUBSCRIPTION_PLANS: PlanTier[] = [
  {
    id: 'free',
    name: 'Free Basic Tier',
    capAmount: 5000,
    capDisplay: '₱ 5,000 / entry',
    price: 0,
    priceDisplay: 'Free',
    duration: 'Lifetime Free',
    features: [
      'Record income up to ₱ 5,000',
      'Track household expenses',
      'Basic budget planner & reminders',
    ],
  },
  {
    id: 'starter_10k',
    name: 'Starter Income Booster',
    capAmount: 10000,
    capDisplay: '₱ 10,000 / entry',
    price: 100,
    priceDisplay: '₱ 100',
    duration: '6 Months Access',
    popular: true,
    features: [
      'Record income up to ₱ 10,000',
      '6 Months uninterrupted access',
      'Priority export & financial audit',
      'Standard reminders & calendar',
    ],
  },
  {
    id: 'plus_15k',
    name: 'Plus Household Growth',
    capAmount: 15000,
    capDisplay: '₱ 15,000 / entry',
    price: 150,
    priceDisplay: '₱ 150',
    duration: '1 Month Access',
    features: [
      'Record income up to ₱ 15,000',
      '1 Month full high-cap recording',
      'Detailed monthly expenditure summary',
      'Smart calendar with due dates',
    ],
  },
  {
    id: 'unlimited',
    name: 'Unlimited Family Pro',
    capAmount: 1000000,
    capDisplay: 'No Limit (Unlimited)',
    price: 500,
    priceDisplay: '₱ 500',
    duration: '2 Years Access (Best Value)',
    features: [
      'No income limits (Unlimited ₱)',
      '2 Years uninterrupted premium access',
      'PDF Reports with official USTP stamp',
      'Full savings goal planner',
    ],
  },
];

export interface SubscriptionModalProps {
  visible?: boolean;
  onClose?: () => void;
  currentTier?: string;
  onSuccess?: (newTier: string, newCap: number) => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  visible = false,
  onClose = () => { },
  currentTier = 'free',
  onSuccess,
}) => {
  const { isDarkMode } = useAppTheme();
  const [activeTier, setActiveTier] = useState<string>(currentTier);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUpgradeSuccess, setShowUpgradeSuccess] = useState(false);
  const [upgradeSuccessMessage, setUpgradeSuccessMessage] = useState('');

  useEffect(() => {
    setActiveTier(currentTier);
  }, [currentTier]);

  const activePlan = SUBSCRIPTION_PLANS.find((p) => p.id === activeTier) || SUBSCRIPTION_PLANS[0];

  const handleAvailPlan = async (plan: PlanTier) => {
    if (plan.id === activeTier) {
      Alert.alert('Active Plan', `You are currently subscribed to the ${plan.name}.`);
      return;
    }

    Alert.alert(
      'Confirm Subscription',
      `Upgrade to "${plan.name}" for ${plan.priceDisplay} (${plan.duration})?\n\nThis increases your maximum income entry limit to ${plan.capDisplay}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm & Avail',
          onPress: async () => {
            setIsProcessing(true);
            try {
              const { data: { user } } = await supabase.auth.getUser();
              if (!user) {
                throw new Error('An authenticated user is required to activate a subscription.');
              }

              const targetUserId = user.id;
              const targetUserEmail = user.email || '';

              // Calculate expiration date
              const now = new Date();
              let expiresAt = new Date();
              if (plan.id === 'starter_10k') {
                expiresAt.setMonth(now.getMonth() + 6);
              } else if (plan.id === 'plus_15k') {
                expiresAt.setMonth(now.getMonth() + 1);
              } else if (plan.id === 'unlimited') {
                expiresAt.setFullYear(now.getFullYear() + 2);
              } else {
                expiresAt.setFullYear(now.getFullYear() + 10);
              }

              // 1. Update only the authenticated user's profile.
              await supabase
                .from('profiles')
                .update({
                  tier: plan.id,
                  income_cap: plan.capAmount,
                  tier_expires_at: expiresAt.toISOString(),
                  updated_at: new Date().toISOString(),
                })
                .eq('id', targetUserId);

              // 2. Record in Subscriptions table for Admin revenue & real-time monitoring
              if (plan.price > 0) {
                try {
                  await supabase.from('subscriptions').insert({
                    user_id: targetUserId,
                    user_email: targetUserEmail,
                    tier: plan.id,
                    plan_name: plan.name,
                    amount_paid: plan.price,
                    income_cap: plan.capAmount,
                    duration: plan.duration,
                    expires_at: expiresAt.toISOString(),
                  });
                } catch (subErr) {
                  console.log('Error recording subscription:', subErr);
                }

                // 3. Send automated activation notification to user
                try {
                  await supabase.from('notifications').insert({
                    user_id: targetUserId,
                    user_email: targetUserEmail,
                    title: `Upgrade Activated: ${plan.name}`,
                    message: `Congratulations! Your income limit has been upgraded to ${plan.capDisplay} (${plan.duration}).`,
                    type: 'upgrade',
                  });
                } catch (notifErr) {
                  console.log('Error creating notification:', notifErr);
                }
              }

              // 4. Cache locally in AsyncStorage
              await AsyncStorage.setItem(`user_subscription_tier:${targetUserId}`, plan.id);
              await AsyncStorage.setItem(`user_income_cap:${targetUserId}`, plan.capAmount.toString());
              await AsyncStorage.setItem(`user_tier_expires_at:${targetUserId}`, expiresAt.toISOString());
              await AsyncStorage.setItem(
                `last_availed_plan:${targetUserId}`,
                JSON.stringify({
                  tier: plan.id,
                  name: plan.name,
                  cap: plan.capAmount,
                  expires_at: expiresAt.toISOString(),
                  email: targetUserEmail,
                  timestamp: Date.now(),
                })
              );

              setActiveTier(plan.id);
              setIsProcessing(false);

              if (onSuccess) onSuccess(plan.id, plan.capAmount);

              setUpgradeSuccessMessage(
                `You have availed the "${plan.name}". Your income limit is now ${plan.capDisplay}.`
              );
              setShowUpgradeSuccess(true);
            } catch (err) {
              console.log('Error availing plan:', err);
              setIsProcessing(false);
              Alert.alert('Error', 'Unable to complete upgrade. Please check your connection.');
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <View style={subscriptionStyles.modalOverlay}>
          <View style={[subscriptionStyles.modalCard, isDarkMode && subscriptionStyles.modalCardDark]}>
            {/* Header */}
            <View style={subscriptionStyles.header}>
              <View style={subscriptionStyles.headerLeft}>
                <View style={[subscriptionStyles.headerIconBox, isDarkMode && { backgroundColor: '#334155' }]}>
                  <Ionicons name="sparkles" size={22} color="#D97706" />
                </View>
                <View>
                  <Text style={[subscriptionStyles.headerTitle, isDarkMode && subscriptionStyles.headerTitleDark]}>Avail Income Limit Upgrade</Text>
                  <Text style={[subscriptionStyles.headerSubtitle, isDarkMode && { color: '#94A3B8' }]}>
                    Unlock higher income records & premium perks
                  </Text>
                </View>
              </View>

              <TouchableOpacity style={[subscriptionStyles.closeBtn, isDarkMode && { backgroundColor: '#334155' }]} onPress={onClose}>
                <Ionicons name="close" size={20} color={isDarkMode ? "#F8FAFC" : "#003366"} />
              </TouchableOpacity>
            </View>

            {/* Active Status Banner */}
            <View style={[subscriptionStyles.activeTierBanner, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
              <View>
                <Text style={[subscriptionStyles.activeTierLabel, isDarkMode && { color: '#38BDF8' }]}>Current Active Plan</Text>
                <Text style={[subscriptionStyles.activeTierTitle, isDarkMode && { color: '#F8FAFC' }]}>{activePlan.name}</Text>
              </View>
              <View style={subscriptionStyles.activeCapBadge}>
                <Text style={subscriptionStyles.activeCapText}>{activePlan.capDisplay}</Text>
              </View>
            </View>

            {/* Plans List */}
            <ScrollView style={subscriptionStyles.planListScroll} showsVerticalScrollIndicator={false}>
              {SUBSCRIPTION_PLANS.map((plan) => {
                const isCurrent = plan.id === activeTier;
                return (
                  <View
                    key={plan.id}
                    style={[
                      subscriptionStyles.planCard,
                      isDarkMode && subscriptionStyles.planCardDark,
                      isCurrent && subscriptionStyles.planCardSelected,
                      plan.popular && !isCurrent && subscriptionStyles.planCardPopular,
                    ]}
                  >
                    {plan.popular && (
                      <View style={subscriptionStyles.popularTag}>
                        <Text style={subscriptionStyles.popularTagText}>Most Popular</Text>
                      </View>
                    )}

                    <View style={subscriptionStyles.planTopRow}>
                      <View>
                        <Text style={[subscriptionStyles.planName, isDarkMode && subscriptionStyles.planNameDark]}>{plan.name}</Text>
                        <Text style={[subscriptionStyles.planDuration, isDarkMode && { color: '#94A3B8' }]}>{plan.duration}</Text>
                      </View>
                      <View style={subscriptionStyles.planPriceBox}>
                        <Text style={[subscriptionStyles.planPriceText, isDarkMode && subscriptionStyles.planPriceTextDark]}>{plan.priceDisplay}</Text>
                        <Text style={[subscriptionStyles.planPriceSub, isDarkMode && { color: '#94A3B8' }]}>
                          {plan.price > 0 ? 'one-time' : ''}
                        </Text>
                      </View>
                    </View>

                    {/* Feature Points */}
                    <View style={subscriptionStyles.featureList}>
                      {plan.features.map((feat, idx) => (
                        <View key={idx} style={subscriptionStyles.featureItem}>
                          <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
                          <Text style={[subscriptionStyles.featureText, isDarkMode && subscriptionStyles.featureTextDark]}>{feat}</Text>
                        </View>
                      ))}
                    </View>

                    {/* Avail Button */}
                    <TouchableOpacity
                      style={[
                        subscriptionStyles.availBtn,
                        isCurrent && subscriptionStyles.availBtnDisabled,
                        plan.popular && !isCurrent && subscriptionStyles.availBtnPopular,
                      ]}
                      disabled={isCurrent || isProcessing}
                      onPress={() => handleAvailPlan(plan)}
                    >
                      {isProcessing ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <>
                          <Ionicons
                            name={isCurrent ? 'checkmark-done' : 'card-outline'}
                            size={16}
                            color="#FFFFFF"
                          />
                          <Text style={subscriptionStyles.availBtnText}>
                            {isCurrent ? 'Current Plan' : `Avail for ${plan.priceDisplay}`}
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>

            {/* Bottom Notice */}
            <View style={subscriptionStyles.bottomNotice}>
              <Text style={subscriptionStyles.noticeText}>
                All transactions are securely verified by the USTP Household Budgeting System.
                Subscriptions help maintain and improve the application for mothers.
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      <AppDialog
        visible={showUpgradeSuccess}
        title="Upgrade Successful"
        message={upgradeSuccessMessage}
        icon="sparkles-outline"
        tone="success"
        onRequestClose={() => {
          setShowUpgradeSuccess(false);
          onClose();
        }}
        actions={[{
          label: 'Great!',
          primary: true,
          onPress: () => {
            setShowUpgradeSuccess(false);
            onClose();
          },
        }]}
      />
    </>
  );
};

export default SubscriptionModal;

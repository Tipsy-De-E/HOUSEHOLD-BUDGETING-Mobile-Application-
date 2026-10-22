import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { addModalStyles } from '../../components/mother-css/addModalStyles';
import { supabase } from '../../../lib/supabase';
import { SubscriptionModal } from './SubscriptionModal';
import { useAppTheme } from '../../context/ThemeContext';
import { AppDialog } from '../../components/ui/AppDialog';

export interface TransactionRecord {
  id: string;
  user_id?: string;
  title: string;
  type: 'expense' | 'income';
  amount: number;
  category: string;
  description?: string;
  receipt_url?: string;
  date: string;
}

export const SHARED_EXPENSE_CATEGORIES = [
  'Food & Dining', 'Groceries', 'Utilities', 'Transportation', 'Education',
  'Healthcare', 'Shopping', 'Personal Care', 'Other',
];

export const SHARED_INCOME_CATEGORIES = [
  'Salary', 'Business', 'Allowance', 'Freelance', 'Savings', 'Other',
];

export interface AddTransactionModalProps {
  visible?: boolean;
  onClose?: () => void;
  onSuccess?: (newTx: TransactionRecord) => void;
  initialType?: 'expense' | 'income';
  initialDate?: string;
}

export function AddTransactionModal({
  visible = false,
  onClose = () => { },
  onSuccess = () => { },
  initialType = 'expense',
  initialDate,
}: AddTransactionModalProps) {
  const { isDarkMode } = useAppTheme();
  const [type, setType] = useState<'expense' | 'income'>(initialType);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(SHARED_EXPENSE_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userTier, setUserTier] = useState('free');
  const [userCap, setUserCap] = useState(5000);
  const [currentIncome, setCurrentIncome] = useState(0);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [isLoadingLimit, setIsLoadingLimit] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showExpenseBalanceDialog, setShowExpenseBalanceDialog] = useState(false);
  const [pendingExpenseAmount, setPendingExpenseAmount] = useState(0);
  const [showTransactionSuccess, setShowTransactionSuccess] = useState(false);
  const [transactionSuccessMessage, setTransactionSuccessMessage] = useState('');
  const [showLimitExceededModal, setShowLimitExceededModal] = useState(false);
  const [limitExceededInfo, setLimitExceededInfo] = useState({
    currentIncome: 0, attemptAmount: 0, prospectiveTotal: 0, cap: 5000, tier: 'free',
  });

  React.useEffect(() => {
    const fetchUserCap = async () => {
      try {
        let bestCap = 5000;
        let bestTier = 'free';
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setCurrentIncome(0);
          setCurrentBalance(0);
          setUserCap(5000);
          setUserTier('free');
          return;
        }

        const { data: transactionRows } = await supabase
          .from('transactions')
          .select('amount, type')
          .eq('user_id', user.id);
        const incomeTotal = (transactionRows || [])
          .filter((row) => row.type === 'income')
          .reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
        const expenseTotal = (transactionRows || [])
          .filter((row) => row.type === 'expense')
          .reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
        setCurrentIncome(incomeTotal);
        setCurrentBalance(incomeTotal - expenseTotal);

        const { data: profile } = await supabase
          .from('profiles')
          .select('tier, income_cap')
          .eq('id', user.id)
          .maybeSingle();
        if (profile) {
          const profileCap = Number(profile.income_cap);
          if (profileCap && !isNaN(profileCap)) bestCap = profileCap;
          if (profile.tier && profile.tier !== 'free' && profile.tier !== 'none') bestTier = profile.tier;
        }

        const { data: subData } = await supabase
          .from('subscriptions')
          .select('tier, income_cap, expires_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);
        const sub = subData?.[0];
        if (sub && (!sub.expires_at || new Date(sub.expires_at) > new Date())) {
          const subscriptionCap = Number(sub.income_cap);
          if (subscriptionCap && !isNaN(subscriptionCap) && subscriptionCap > bestCap) bestCap = subscriptionCap;
          if (sub.tier && sub.tier !== 'free') bestTier = sub.tier;
        }

        setUserCap(bestCap);
        setUserTier(bestTier);
        await AsyncStorage.setItem(`user_income_cap:${user.id}`, bestCap.toString());
        await AsyncStorage.setItem(`user_subscription_tier:${user.id}`, bestTier);
      } catch (error) {
        console.log('Error fetching user cap:', error);
      }
    };

    if (visible) {
      setIsLoadingLimit(true);
      fetchUserCap().finally(() => setIsLoadingLimit(false));
      if (initialType) {
        setType(initialType);
        setCategory(initialType === 'expense' ? SHARED_EXPENSE_CATEGORIES[0] : SHARED_INCOME_CATEGORIES[0]);
      }
    }
  }, [visible, initialType]);

  const categories = type === 'expense' ? SHARED_EXPENSE_CATEGORIES : SHARED_INCOME_CATEGORIES;
  const previewAmount = parseFloat(amount.replace(/[^0-9.]/g, '')) || 0;
  const previewTotal = currentIncome + previewAmount;
  const remainingIncome = Math.max(userCap - currentIncome, 0);
  const incomeProgress = userCap > 0 ? Math.min(previewTotal / userCap, 1) : 0;
  const incomeLimitReached = previewTotal > userCap;

  const handleTypeChange = (newType: 'expense' | 'income') => {
    setType(newType);
    setCategory(newType === 'expense' ? SHARED_EXPENSE_CATEGORIES[0] : SHARED_INCOME_CATEGORIES[0]);
  };

  const handlePickImage = async () => {
    try {
      Alert.alert('Upload Photo Proof / Receipt', 'Select image source', [
        {
          text: 'Take Photo 📸',
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission Needed', 'Camera permission is required to take a photo.');
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              quality: 0.6,
            });
            if (!result.canceled && result.assets[0]?.uri) {
              setReceiptImage(result.assets[0].uri);
            }
          },
        },
        {
          text: 'Choose from Gallery 🖼️',
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission Needed', 'Gallery permission is required to choose a photo.');
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              quality: 0.6,
            });
            if (!result.canceled && result.assets[0]?.uri) {
              setReceiptImage(result.assets[0].uri);
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
    } catch (e) {
      console.log('Image picker error:', e);
    }
  };

  const resetForm = () => {
    setTitle('');
    setAmount('');
    setDescription('');
    setReceiptImage(null);
    setType(initialType || 'expense');
    setCategory(SHARED_EXPENSE_CATEGORIES[0]);
    setIsSubmitting(false);
  };

  const handleSave = async (expenseConfirmed = false) => {
    if (!title.trim()) {
      Alert.alert('Required Field', 'Please enter an item name or reason.');
      return;
    }

    const parsedAmount = parseFloat(amount.replace(/[^0-9.]/g, ''));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than 0.');
      return;
    }

    if (type === 'income') {
      if (isLoadingLimit) {
        Alert.alert('Please Wait', 'Checking your current income limit. Try saving again in a moment.');
        return;
      }

      const prospectiveTotal = currentIncome + parsedAmount;
      if (prospectiveTotal > userCap) {
        setLimitExceededInfo({
          currentIncome,
          attemptAmount: parsedAmount,
          prospectiveTotal,
          cap: userCap,
          tier: userTier,
        });
        setShowLimitExceededModal(true);
        return;
      }
    }

    if (type === 'expense' && !expenseConfirmed && currentBalance < parsedAmount) {
      setPendingExpenseAmount(parsedAmount);
      setShowExpenseBalanceDialog(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const txDate = initialDate || new Date().toISOString().split('T')[0];
      const { data: { user } } = await supabase.auth.getUser();

      const newTx: TransactionRecord = {
        id: `tx-${Date.now()}`,
        user_id: user ? user.id : undefined,
        title: title.trim(),
        type,
        amount: parsedAmount,
        category,
        description: description.trim(),
        receipt_url: type === 'expense' ? receiptImage || undefined : undefined,
        date: txDate,
      };

      // 1. Save to Supabase. A rejected income must never fall back to local storage.
      const { data: inserted, error: dbErr } = await supabase
        .from('transactions')
        .insert({
          user_id: user ? user.id : null,
          title: newTx.title,
          type: newTx.type,
          amount: newTx.amount,
          category: newTx.category,
          description: newTx.description,
          date: newTx.date,
          receipt_url: newTx.receipt_url || null,
        })
        .select()
        .single();

      if (dbErr) {
        setIsSubmitting(false);
        if (type === 'income' && dbErr.message.toLowerCase().includes('income limit exceeded')) {
          setLimitExceededInfo({
            currentIncome,
            attemptAmount: parsedAmount,
            prospectiveTotal: currentIncome + parsedAmount,
            cap: userCap,
            tier: userTier,
          });
          setShowLimitExceededModal(true);
          return;
        }
        throw dbErr;
      }

      if (inserted) {
        newTx.id = inserted.id;
      }

      // 2. Save to AsyncStorage
      try {
        const cachedStr = await AsyncStorage.getItem('@household_transactions_v2');
        const list: TransactionRecord[] = cachedStr ? JSON.parse(cachedStr) : [];
        const updatedList = [newTx, ...list.filter((t) => t.id !== newTx.id)];
        await AsyncStorage.setItem('@household_transactions_v2', JSON.stringify(updatedList));
        await AsyncStorage.setItem('cached_transactions', JSON.stringify(updatedList));
      } catch (storageErr) {
        console.log('AsyncStorage save error:', storageErr);
      }

      setIsSubmitting(false);
      resetForm();
      onSuccess(newTx);
      setTransactionSuccessMessage(
        `Successfully recorded ₱ ${parsedAmount.toLocaleString()} as ${type === 'expense' ? 'expense' : 'income'}.`
      );
      setShowTransactionSuccess(true);
    } catch (err) {
      setIsSubmitting(false);
      Alert.alert('Error', 'Could not record transaction. Please try again.');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {
        if (!isSubmitting) onClose();
      }}
    >
      <View style={addModalStyles.modalOverlay}>
        <View style={[addModalStyles.modalContent, isDarkMode && addModalStyles.modalContentDark]}>
          {/* Header */}
          <View style={addModalStyles.modalHeader}>
            <Text style={[addModalStyles.modalTitle, isDarkMode && addModalStyles.modalTitleDark]}>
              Add {type === 'expense' ? 'Expense' : 'Income'}
            </Text>
            <TouchableOpacity
              onPress={() => {
                if (!isSubmitting) onClose();
              }}
            >
              <Ionicons name="close" size={24} color={isDarkMode ? "#F8FAFC" : "#003366"} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Step 1: Type Selector */}
            <View style={addModalStyles.typeSelectorContainer}>
              <TouchableOpacity
                style={[
                  addModalStyles.typeSelectBtn,
                  isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' },
                  type === 'expense' && addModalStyles.typeSelectBtnActiveExpense,
                ]}
                onPress={() => handleTypeChange('expense')}
              >
                <Ionicons
                  name="arrow-down-circle"
                  size={20}
                  color={type === 'expense' ? '#D32F2F' : isDarkMode ? '#94A3B8' : '#64748B'}
                />
                <Text
                  style={[
                    addModalStyles.typeSelectBtnText,
                    isDarkMode && { color: '#94A3B8' },
                    type === 'expense' && addModalStyles.typeSelectBtnTextExpense,
                  ]}
                >
                  Expense
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  addModalStyles.typeSelectBtn,
                  isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' },
                  type === 'income' && addModalStyles.typeSelectBtnActiveIncome,
                ]}
                onPress={() => handleTypeChange('income')}
              >
                <Ionicons
                  name="arrow-up-circle"
                  size={20}
                  color={type === 'income' ? '#2E7D32' : isDarkMode ? '#94A3B8' : '#64748B'}
                />
                <Text
                  style={[
                    addModalStyles.typeSelectBtnText,
                    isDarkMode && { color: '#94A3B8' },
                    type === 'income' && addModalStyles.typeSelectBtnTextIncome,
                  ]}
                >
                  Income
                </Text>
              </TouchableOpacity>
            </View>

            {/* Step 2: Item Name / Reason */}
            <Text style={[addModalStyles.inputLabel, isDarkMode && addModalStyles.inputLabelDark]}>
              {type === 'expense' ? 'What did you buy? / Reason *' : 'Income Source / Title *'}
            </Text>
            <TextInput
              style={[addModalStyles.inputField, isDarkMode && addModalStyles.inputFieldDark]}
              placeholder={
                type === 'expense'
                  ? 'e.g. Rice, Veggies, Meralco, School Fee'
                  : 'e.g. Monthly Salary, Sari-sari profit'
              }
              placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
              value={title}
              onChangeText={setTitle}
            />

            {/* Step 3: Amount (Php) */}
            <Text style={[addModalStyles.inputLabel, isDarkMode && addModalStyles.inputLabelDark]}>Amount (Php) *</Text>
            <TextInput
              style={[addModalStyles.inputField, isDarkMode && addModalStyles.inputFieldDark]}
              placeholder="0.00"
              placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />

            {type === 'income' && (
              <View style={[addModalStyles.incomeLimitHint, isDarkMode && addModalStyles.incomeLimitHintDark]}>
                <View style={addModalStyles.incomeLimitHintHeader}>
                  <Text style={[addModalStyles.incomeLimitHintLabel, isDarkMode && addModalStyles.incomeLimitHintLabelDark]}>
                    Income limit ({userTier === 'free' ? 'Free' : userTier})
                  </Text>
                  <Text style={[
                    addModalStyles.incomeLimitHintAmount,
                    isDarkMode && addModalStyles.incomeLimitHintAmountDark,
                    incomeLimitReached && addModalStyles.incomeLimitHintAmountExceeded,
                  ]}
                  >
                    ₱ {previewTotal.toLocaleString()} / ₱ {userCap.toLocaleString()}
                  </Text>
                </View>
                <View style={[addModalStyles.incomeLimitTrack, isDarkMode && addModalStyles.incomeLimitTrackDark]}>
                  <View
                    style={[
                      addModalStyles.incomeLimitFill,
                      { width: `${incomeProgress * 100}%` },
                      incomeLimitReached && addModalStyles.incomeLimitFillExceeded,
                    ]}
                  />
                </View>
                <Text style={[addModalStyles.incomeLimitHintText, isDarkMode && addModalStyles.incomeLimitHintTextDark]}>
                  {incomeLimitReached
                    ? `Over limit by ₱ ${(previewTotal - userCap).toLocaleString()}. Upgrade to continue.`
                    : `Remaining allowance: ₱ ${remainingIncome.toLocaleString()}`}
                </Text>
              </View>
            )}

            {/* Step 4: Category Picker */}
            <Text style={[addModalStyles.inputLabel, isDarkMode && addModalStyles.inputLabelDark]}>Category</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={addModalStyles.categoryScroll}
            >
              {categories.map((cat) => {
                const isSelected = category === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      addModalStyles.categoryPill,
                      isDarkMode && addModalStyles.categoryPillDark,
                      isSelected && addModalStyles.categoryPillActive,
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text
                      style={[
                        addModalStyles.categoryPillText,
                        isDarkMode && addModalStyles.categoryPillTextDark,
                        isSelected && addModalStyles.categoryPillTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Step 5: Proof / Receipt Photo (for Expenses only) */}
            {type === 'expense' && (
              <View style={addModalStyles.photoSection}>
                <Text style={[addModalStyles.inputLabel, isDarkMode && addModalStyles.inputLabelDark]}>Proof / Receipt Photo (Optional)</Text>
                {receiptImage ? (
                  <View style={addModalStyles.photoPreviewContainer}>
                    <View style={addModalStyles.photoPreviewLeft}>
                      <Image source={{ uri: receiptImage }} style={addModalStyles.photoThumbnail} />
                      <View style={addModalStyles.photoPreviewInfo}>
                        <Text style={[addModalStyles.photoPreviewTitle, isDarkMode && { color: '#F8FAFC' }]} numberOfLines={1}>
                          Receipt Attached
                        </Text>
                        <Text style={[addModalStyles.photoPreviewSubtitle, isDarkMode && { color: '#94A3B8' }]}>Ready to save with expense</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={addModalStyles.photoRemoveBtn}
                      onPress={() => setReceiptImage(null)}
                    >
                      <Ionicons name="trash-outline" size={18} color="#DC2626" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={[addModalStyles.photoUploadBtn, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' }]} onPress={handlePickImage}>
                    <Ionicons name="camera-outline" size={20} color={isDarkMode ? "#38BDF8" : "#003366"} />
                    <Text style={[addModalStyles.photoUploadBtnText, isDarkMode && { color: '#38BDF8' }]}>Attach Receipt / Proof Photo</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Step 6: Notes / Description */}
            <Text style={[addModalStyles.inputLabel, isDarkMode && addModalStyles.inputLabelDark]}>Description / Notes (Optional)</Text>
            <TextInput
              style={[addModalStyles.inputField, isDarkMode && addModalStyles.inputFieldDark, { height: 70, textAlignVertical: 'top' }]}
              placeholder="Additional details or receipt reference..."
              placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
              multiline
              numberOfLines={3}
              value={description}
              onChangeText={setDescription}
            />

            {/* Action Buttons */}
            <View style={addModalStyles.modalBtnContainer}>
              <TouchableOpacity
                style={addModalStyles.modalCancelBtn}
                onPress={() => {
                  if (!isSubmitting) onClose();
                }}
                disabled={isSubmitting}
              >
                <Text style={addModalStyles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={addModalStyles.modalSaveBtn}
                onPress={() => handleSave()}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={addModalStyles.modalSaveBtnText}>
                    Save {type === 'expense' ? 'Expense' : 'Income'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>

      {/* Enhanced Income Limit Exceeded Modal */}
      <Modal
        visible={showLimitExceededModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLimitExceededModal(false)}
      >
        <View style={addModalStyles.limitOverlay}>
          <View style={addModalStyles.limitCard}>
            <View style={addModalStyles.limitHeader}>
              <View style={addModalStyles.limitIconBox}>
                <Ionicons name="shield-outline" size={32} color="#D97706" />
              </View>
              <Text style={addModalStyles.limitTitle}>Income Limit Exceeded</Text>
              <Text style={addModalStyles.limitSubtitle}>
                Your account is currently on the{' '}
                <Text style={{ fontWeight: 'bold', color: '#003366' }}>
                  {limitExceededInfo.tier.toUpperCase()}
                </Text>{' '}
                plan with an income recording cap of Php {limitExceededInfo.cap.toLocaleString()}.
              </Text>
            </View>

            <View style={addModalStyles.limitStatsCard}>
              <View style={addModalStyles.limitStatRow}>
                <Text style={addModalStyles.limitStatLabel}>Current Total Income:</Text>
                <Text style={addModalStyles.limitStatVal}>
                  Php {limitExceededInfo.currentIncome.toLocaleString()}
                </Text>
              </View>
              <View style={addModalStyles.limitStatRow}>
                <Text style={addModalStyles.limitStatLabel}>Attempting to Add:</Text>
                <Text style={[addModalStyles.limitStatVal, { color: '#DC2626' }]}>
                  + Php {limitExceededInfo.attemptAmount.toLocaleString()}
                </Text>
              </View>
              <View style={addModalStyles.limitStatDivider} />
              <View style={addModalStyles.limitStatRow}>
                <Text style={[addModalStyles.limitStatLabel, { fontWeight: 'bold', color: '#0F172A' }]}>
                  Prospective Total:
                </Text>
                <Text style={addModalStyles.limitStatValExceeded}>
                  Php {limitExceededInfo.prospectiveTotal.toLocaleString()}
                </Text>
              </View>
              <View style={addModalStyles.limitStatRow}>
                <Text style={addModalStyles.limitStatLabel}>Your Allowed Cap:</Text>
                <Text style={addModalStyles.limitStatValCap}>
                  Php {limitExceededInfo.cap.toLocaleString()}
                </Text>
              </View>

              <View style={addModalStyles.limitProgressBarBg}>
                <View style={[addModalStyles.limitProgressBarFill, { width: '100%' }]} />
              </View>
              <Text style={{ fontSize: 11, color: '#DC2626', fontWeight: 'bold', textAlign: 'center', marginTop: 4 }}>
                Exceeds limit by Php {(limitExceededInfo.prospectiveTotal - limitExceededInfo.cap).toLocaleString()}
              </Text>
            </View>

            <View style={addModalStyles.limitActionRow}>
              <TouchableOpacity
                style={addModalStyles.limitUpgradeBtn}
                onPress={() => {
                  setShowLimitExceededModal(false);
                  setShowUpgradeModal(true);
                }}
              >
                <Ionicons name="sparkles" size={18} color="#F4C430" />
                <Text style={addModalStyles.limitUpgradeBtnText}>Avail Upgrade Plan 🚀</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={addModalStyles.limitCancelBtn}
                onPress={() => setShowLimitExceededModal(false)}
              >
                <Text style={addModalStyles.limitCancelBtnText}>Adjust Amount / Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Embedded Upgrade Modal */}
      <SubscriptionModal
        visible={showUpgradeModal}
        currentTier={userTier}
        onClose={() => setShowUpgradeModal(false)}
        onSuccess={(newTier, newCap) => {
          setUserTier(newTier);
          setUserCap(newCap);
          setShowUpgradeModal(false);
        }}
      />

      <AppDialog
        visible={showExpenseBalanceDialog}
        title="Insufficient Balance"
        message={
          currentBalance <= 0
            ? 'You currently have no available income balance. Are you sure you want to add this expense?'
            : `This expense is ₱ ${(pendingExpenseAmount - currentBalance).toLocaleString()} over your available balance. Are you sure you want to continue?`
        }
        icon="wallet-outline"
        tone="warning"
        onRequestClose={() => setShowExpenseBalanceDialog(false)}
        actions={[
          { label: 'Cancel', onPress: () => setShowExpenseBalanceDialog(false) },
          {
            label: 'Add Anyway',
            destructive: true,
            onPress: () => {
              setShowExpenseBalanceDialog(false);
              handleSave(true);
            },
          },
        ]}
      />

      <AppDialog
        visible={showTransactionSuccess}
        title="Transaction Recorded"
        message={transactionSuccessMessage}
        icon="checkmark-circle-outline"
        tone="success"
        onRequestClose={() => {
          setShowTransactionSuccess(false);
          onClose();
        }}
        actions={[{
          label: 'Done',
          primary: true,
          onPress: () => {
            setShowTransactionSuccess(false);
            onClose();
          },
        }]}
      />
    </Modal>
  );
}

export default AddTransactionModal;

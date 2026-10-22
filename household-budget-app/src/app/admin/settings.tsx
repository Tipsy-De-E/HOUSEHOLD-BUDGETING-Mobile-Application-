// src/app/admin/settings.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { adminSettingsStyles } from '../../components/admin-css/adminSettingsStyles';
import { supabase } from '../../../lib/supabase';
import { useAppTheme } from '../../context/ThemeContext';
import { SystemPlanConfig } from './index';

interface AdminInfo {
  name: string;
  email: string;
  phone: string;
  role_title: string;
}

export default function AdminSettingsScreen() {
  const { isDarkMode, toggleDarkMode } = useAppTheme();
  const isDark = isDarkMode;
  const router = useRouter();

  const [savingSettings, setSavingSettings] = useState(false);

  const [planConfigs, setPlanConfigs] = useState<SystemPlanConfig[]>([
    {
      id: 'starter_10k',
      name: 'Starter Income Booster',
      price: 100,
      capAmount: 10000,
      duration: '6 Months Access',
      durationMonths: 6,
      popular: true,
    },
    {
      id: 'plus_15k',
      name: 'Plus Household Growth',
      price: 150,
      capAmount: 15000,
      duration: '1 Month Access',
      durationMonths: 1,
      popular: false,
    },
    {
      id: 'unlimited',
      name: 'Unlimited Family Pro',
      price: 300,
      capAmount: 1000000,
      duration: '2 Years Full Access',
      durationMonths: 24,
      popular: false,
    },
  ]);

  const [adminInfo, setAdminInfo] = useState<AdminInfo>({
    name: 'System Administrator',
    email: 'admin@household.com',
    phone: '+63 912 345 6789',
    role_title: 'Lead Household Portal Admin',
  });

  const [aboutUsText, setAboutUsText] = useState(
    'The USTP Household Budgeting App is a comprehensive financial management ecosystem tailored for modern Filipino households. It empowers mothers and families to monitor real-time income, plan spending limits, and track bill reminders.'
  );

  const [rulesText, setRulesText] = useState(
    '1. Accurate Data Entry: All household expenses and income sources must be recorded truthfully.\n2. Income Tier Limits: Free accounts can record incomes up to ₱5,000 per transaction. To record higher entries, an upgrade tier must be availed.\n3. Account Integrity: Users must keep credentials confidential.'
  );

  const [howToUseText, setHowToUseText] = useState(
    '1. Adding Incomes & Expenses: Tap (+) to log purchases or earnings.\n2. Budget Planning: Navigate to Budget tab to set limits.\n3. Bill Reminders: Schedule upcoming bills in Reminders.\n4. Upgrades: If income entry exceeds ₱5,000, avail an upgrade tier.'
  );

  const loadSettings = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('system_settings')
        .select('*')
        .eq('id', 'global_settings')
        .maybeSingle();

      if (data) {
        if (data.plan_configs) setPlanConfigs(data.plan_configs);
        if (data.admin_info) setAdminInfo(data.admin_info);
        if (data.about_us) setAboutUsText(data.about_us);
        if (data.rules) setRulesText(data.rules);
        if (data.how_to_use) setHowToUseText(data.how_to_use);
      }
    } catch (e) {
      console.log('Error loading settings:', e);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const payload = {
        id: 'global_settings',
        plan_configs: planConfigs,
        admin_info: adminInfo,
        about_us: aboutUsText,
        rules: rulesText,
        how_to_use: howToUseText,
        updated_at: new Date().toISOString(),
      };

      await supabase.from('system_settings').upsert(payload, { onConflict: 'id' });
      Alert.alert('Settings Saved! ⚙️', 'All system upgrade plans, administrative profile, and system guidelines are updated.');
    } catch {
      Alert.alert('Error', 'Unable to save settings to cloud.');
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <View style={[adminSettingsStyles.container, isDark && adminSettingsStyles.containerDark]}>
      {/* Yellow Top Accent Bar */}
      <View style={adminSettingsStyles.bannerYellow} />

      {/* Header */}
      <View style={[adminSettingsStyles.header, isDark && adminSettingsStyles.headerDark]}>
        <View style={adminSettingsStyles.headerLeft}>
          <TouchableOpacity onPress={() => router.push('/admin')}>
            <Ionicons name="arrow-back" size={24} color="#000000" />
          </TouchableOpacity>
          <View>
            <Text style={adminSettingsStyles.headerTitle}>System Settings</Text>
            <Text style={{ fontSize: 11, color: '#334155', fontWeight: '500' }}>
              Configurations & Administration
            </Text>
          </View>
        </View>

        <View style={adminSettingsStyles.headerRight}>
          <TouchableOpacity
            style={adminSettingsStyles.headerIconBtn}
            onPress={() => toggleDarkMode(!isDarkMode)}
          >
            <Ionicons name={isDarkMode ? 'sunny' : 'moon'} size={20} color="#000000" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      >
        {/* Section 1: Upgrade Plans Configuration */}
        <View style={[adminSettingsStyles.settingsCard, isDark && adminSettingsStyles.cardDark]}>
          <View style={adminSettingsStyles.settingsCardHeader}>
            <Ionicons name="pricetags" size={20} color="#003366" />
            <Text style={[adminSettingsStyles.settingsCardTitle, isDark && adminSettingsStyles.textDark]}>
              Income Limit Upgrade Plans & Pricing
            </Text>
          </View>

          {planConfigs.map((plan, index) => (
            <View key={plan.id} style={adminSettingsStyles.settingsPlanBox}>
              <Text style={adminSettingsStyles.settingsPlanBoxTitle}>
                {plan.name} {plan.popular ? '🔥 (Most Popular)' : ''}
              </Text>

              <View style={adminSettingsStyles.settingsInputRow}>
                <View style={adminSettingsStyles.settingsInputFieldGroup}>
                  <Text style={adminSettingsStyles.settingsInputLabel}>Price (₱)</Text>
                  <TextInput
                    style={adminSettingsStyles.settingsTextInput}
                    keyboardType="numeric"
                    value={plan.price.toString()}
                    onChangeText={(txt) => {
                      const updated = [...planConfigs];
                      updated[index].price = Number(txt) || 0;
                      setPlanConfigs(updated);
                    }}
                  />
                </View>

                <View style={adminSettingsStyles.settingsInputFieldGroup}>
                  <Text style={adminSettingsStyles.settingsInputLabel}>Income Cap (₱)</Text>
                  <TextInput
                    style={adminSettingsStyles.settingsTextInput}
                    keyboardType="numeric"
                    value={plan.capAmount.toString()}
                    onChangeText={(txt) => {
                      const updated = [...planConfigs];
                      updated[index].capAmount = Number(txt) || 0;
                      setPlanConfigs(updated);
                    }}
                  />
                </View>

                <View style={adminSettingsStyles.settingsInputFieldGroup}>
                  <Text style={adminSettingsStyles.settingsInputLabel}>Duration (Mo.)</Text>
                  <TextInput
                    style={adminSettingsStyles.settingsTextInput}
                    keyboardType="numeric"
                    value={plan.durationMonths.toString()}
                    onChangeText={(txt) => {
                      const updated = [...planConfigs];
                      const m = Number(txt) || 1;
                      updated[index].durationMonths = m;
                      updated[index].duration = `${m} Month${m > 1 ? 's' : ''} Access`;
                      setPlanConfigs(updated);
                    }}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Section 2: Admin Information */}
        <View style={[adminSettingsStyles.settingsCard, isDark && adminSettingsStyles.cardDark]}>
          <View style={adminSettingsStyles.settingsCardHeader}>
            <Ionicons name="person-circle" size={20} color="#003366" />
            <Text style={[adminSettingsStyles.settingsCardTitle, isDark && adminSettingsStyles.textDark]}>
              Admin Profile Information
            </Text>
          </View>

          <View style={{ marginBottom: 10 }}>
            <Text style={adminSettingsStyles.settingsInputLabel}>Administrator Name</Text>
            <TextInput
              style={adminSettingsStyles.settingsTextInput}
              value={adminInfo.name}
              onChangeText={(txt) => setAdminInfo({ ...adminInfo, name: txt })}
            />
          </View>

          <View style={{ marginBottom: 10 }}>
            <Text style={adminSettingsStyles.settingsInputLabel}>Administrator Email</Text>
            <TextInput
              style={adminSettingsStyles.settingsTextInput}
              value={adminInfo.email}
              onChangeText={(txt) => setAdminInfo({ ...adminInfo, email: txt })}
            />
          </View>

          <View style={{ marginBottom: 10 }}>
            <Text style={adminSettingsStyles.settingsInputLabel}>Contact Phone</Text>
            <TextInput
              style={adminSettingsStyles.settingsTextInput}
              value={adminInfo.phone}
              onChangeText={(txt) => setAdminInfo({ ...adminInfo, phone: txt })}
            />
          </View>

          <View style={{ marginBottom: 10 }}>
            <Text style={adminSettingsStyles.settingsInputLabel}>System Role Title</Text>
            <TextInput
              style={adminSettingsStyles.settingsTextInput}
              value={adminInfo.role_title}
              onChangeText={(txt) => setAdminInfo({ ...adminInfo, role_title: txt })}
            />
          </View>
        </View>

        {/* Section 3: About Us */}
        <View style={[adminSettingsStyles.settingsCard, isDark && adminSettingsStyles.cardDark]}>
          <View style={adminSettingsStyles.settingsCardHeader}>
            <Ionicons name="information-circle" size={20} color="#003366" />
            <Text style={[adminSettingsStyles.settingsCardTitle, isDark && adminSettingsStyles.textDark]}>
              About Us Content
            </Text>
          </View>
          <TextInput
            style={adminSettingsStyles.settingsTextArea}
            multiline
            numberOfLines={4}
            value={aboutUsText}
            onChangeText={setAboutUsText}
          />
        </View>

        {/* Section 4: System Rules */}
        <View style={[adminSettingsStyles.settingsCard, isDark && adminSettingsStyles.cardDark]}>
          <View style={adminSettingsStyles.settingsCardHeader}>
            <Ionicons name="shield-checkmark" size={20} color="#003366" />
            <Text style={[adminSettingsStyles.settingsCardTitle, isDark && adminSettingsStyles.textDark]}>
              System Rules & Regulations
            </Text>
          </View>
          <TextInput
            style={adminSettingsStyles.settingsTextArea}
            multiline
            numberOfLines={4}
            value={rulesText}
            onChangeText={setRulesText}
          />
        </View>

        {/* Section 5: How To Use Guide */}
        <View style={[adminSettingsStyles.settingsCard, isDark && adminSettingsStyles.cardDark]}>
          <View style={adminSettingsStyles.settingsCardHeader}>
            <Ionicons name="book" size={20} color="#003366" />
            <Text style={[adminSettingsStyles.settingsCardTitle, isDark && adminSettingsStyles.textDark]}>
              How To Use Household Guide
            </Text>
          </View>
          <TextInput
            style={adminSettingsStyles.settingsTextArea}
            multiline
            numberOfLines={4}
            value={howToUseText}
            onChangeText={setHowToUseText}
          />
        </View>

        {/* Save Settings Action Button */}
        <TouchableOpacity
          style={[adminSettingsStyles.settingsSaveBtn, savingSettings && { opacity: 0.7 }]}
          disabled={savingSettings}
          onPress={handleSaveSettings}
        >
          {savingSettings ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Ionicons name="save" size={18} color="#FFFFFF" />
              <Text style={adminSettingsStyles.settingsSaveBtnText}>Save System Settings to Database</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={[adminSettingsStyles.bottomNav, isDark && adminSettingsStyles.bottomNavDark]}>
        <TouchableOpacity
          style={adminSettingsStyles.navItem}
          onPress={() => router.push('/admin')}
        >
          <Ionicons name="grid-outline" size={22} color="#94A3B8" />
          <Text style={adminSettingsStyles.navLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={adminSettingsStyles.navItem}
          onPress={() => router.push('/admin/users')}
        >
          <Ionicons name="people-outline" size={22} color="#94A3B8" />
          <Text style={adminSettingsStyles.navLabel}>Users</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={adminSettingsStyles.navItem}
          onPress={() => router.push('/admin/reports')}
        >
          <Ionicons name="bar-chart-outline" size={22} color="#94A3B8" />
          <Text style={adminSettingsStyles.navLabel}>Reports</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={adminSettingsStyles.navItem}
          onPress={() => {}}
        >
          <Ionicons name="settings" size={22} color="#003366" />
          <Text style={[adminSettingsStyles.navLabel, adminSettingsStyles.navLabelActive]}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

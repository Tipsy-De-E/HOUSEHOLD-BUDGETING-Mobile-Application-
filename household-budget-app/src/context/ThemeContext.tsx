// src/context/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ThemeColors {
  isDark: boolean;
  bg: string;
  cardBg: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  headerBg: string;
  headerText: string;
  navBg: string;
  navBorder: string;
  accentBlue: string;
  accentGold: string;
  inputBg: string;
  inputBorder: string;
  dangerBg: string;
  dangerText: string;
  successBg: string;
  successText: string;
}

export const LIGHT_THEME: ThemeColors = {
  isDark: false,
  bg: '#FFFFFF',
  cardBg: '#FFFFFF',
  cardBorder: '#E2E8F0',
  textPrimary: '#0F172A',
  textSecondary: '#334155',
  textMuted: '#64748B',
  headerBg: '#F4C430', // Yellow Header
  headerText: '#000000',
  navBg: '#FFFFFF',
  navBorder: '#E2E8F0',
  accentBlue: '#003366', // USTP Navy
  accentGold: '#F4C430',
  inputBg: '#F8FAFC',
  inputBorder: '#CBD5E1',
  dangerBg: '#FEE2E2',
  dangerText: '#DC2626',
  successBg: '#DCFCE7',
  successText: '#16A34A',
};

export const DARK_THEME: ThemeColors = {
  isDark: true,
  bg: '#0F172A', // Slate 900
  cardBg: '#1E293B', // Slate 800
  cardBorder: '#334155',
  textPrimary: '#F8FAFC',
  textSecondary: '#E2E8F0',
  textMuted: '#94A3B8',
  headerBg: '#1E293B', // Dark Header with gold accent strip
  headerText: '#F4C430',
  navBg: '#1E293B',
  navBorder: '#334155',
  accentBlue: '#38BDF8', // Cyan-blue accent for dark mode readability
  accentGold: '#F4C430',
  inputBg: '#0F172A',
  inputBorder: '#475569',
  dangerBg: '#7F1D1D',
  dangerText: '#FCA5A5',
  successBg: '#14532D',
  successText: '#86EFAC',
};

interface ThemeContextType {
  isDarkMode: boolean;
  theme: ThemeColors;
  toggleDarkMode: (val?: boolean) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  theme: LIGHT_THEME,
  toggleDarkMode: async () => {},
});

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem('app_dark_mode');
        if (saved !== null) {
          setIsDarkMode(saved === 'true');
        }
      } catch (e) {
        console.log('Error loading theme:', e);
      }
    };
    loadTheme();
  }, []);

  const toggleDarkMode = async (val?: boolean) => {
    try {
      const nextVal = val !== undefined ? val : !isDarkMode;
      setIsDarkMode(nextVal);
      await AsyncStorage.setItem('app_dark_mode', nextVal ? 'true' : 'false');
    } catch (e) {
      console.log('Error saving theme:', e);
    }
  };

  const theme = isDarkMode ? DARK_THEME : LIGHT_THEME;

  return (
    <ThemeContext.Provider value={{ isDarkMode, theme, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => useContext(ThemeContext);

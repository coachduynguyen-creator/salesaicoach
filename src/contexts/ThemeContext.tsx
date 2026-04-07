import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { applyDarkMode } from '../constants/colors';

const THEME_KEY = '@salescoach_theme';
const DARK_MODE_KEY = '@salescoach_dark_mode';

// ─── Bộ màu theme ────────────────────────────────────────────────────────────

export interface ThemeColors {
  PRIMARY: string;
  PRIMARY_LIGHT: string;
  PRIMARY_DARK: string;
  GRADIENT_END: string;
}

export interface ThemeOption {
  id: string;
  name: string;
  colors: ThemeColors;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'indigo',
    name: 'Indigo',
    colors: { PRIMARY: '#4F46E5', PRIMARY_LIGHT: '#818CF8', PRIMARY_DARK: '#3730A3', GRADIENT_END: '#7C3AED' },
  },
  {
    id: 'blue',
    name: 'Xanh dương',
    colors: { PRIMARY: '#2563EB', PRIMARY_LIGHT: '#60A5FA', PRIMARY_DARK: '#1D4ED8', GRADIENT_END: '#3B82F6' },
  },
  {
    id: 'emerald',
    name: 'Xanh ngọc',
    colors: { PRIMARY: '#059669', PRIMARY_LIGHT: '#34D399', PRIMARY_DARK: '#047857', GRADIENT_END: '#10B981' },
  },
  {
    id: 'rose',
    name: 'Hồng',
    colors: { PRIMARY: '#E11D48', PRIMARY_LIGHT: '#FB7185', PRIMARY_DARK: '#BE123C', GRADIENT_END: '#F43F5E' },
  },
  {
    id: 'amber',
    name: 'Vàng cam',
    colors: { PRIMARY: '#D97706', PRIMARY_LIGHT: '#FBBF24', PRIMARY_DARK: '#B45309', GRADIENT_END: '#F59E0B' },
  },
  {
    id: 'violet',
    name: 'Tím',
    colors: { PRIMARY: '#7C3AED', PRIMARY_LIGHT: '#A78BFA', PRIMARY_DARK: '#6D28D9', GRADIENT_END: '#8B5CF6' },
  },
  {
    id: 'slate',
    name: 'Xám đen',
    colors: { PRIMARY: '#334155', PRIMARY_LIGHT: '#64748B', PRIMARY_DARK: '#1E293B', GRADIENT_END: '#475569' },
  },
  {
    id: 'teal',
    name: 'Xanh lá',
    colors: { PRIMARY: '#0D9488', PRIMARY_LIGHT: '#2DD4BF', PRIMARY_DARK: '#0F766E', GRADIENT_END: '#14B8A6' },
  },
];

// ─── Dark mode colors ───────────────────────────────────────────────────────

const LIGHT_COLORS = {
  BACKGROUND: '#F8FAFC',
  CARD: '#FFFFFF',
  SURFACE: '#F1F5F9',
  TEXT: '#0F172A',
  TEXT_SECONDARY: '#475569',
  TEXT_LIGHT: '#94A3B8',
  BORDER: '#E2E8F0',
  DIVIDER: '#F1F5F9',
};

const DARK_COLORS = {
  BACKGROUND: '#0D1117',
  CARD: '#161B22',
  SURFACE: '#21262D',
  TEXT: '#F0F6FC',
  TEXT_SECONDARY: '#C9D1D9',
  TEXT_LIGHT: '#8B949E',
  BORDER: '#30363D',
  DIVIDER: '#21262D',
};

// ─── Context ─────────────────────────────────────────────────────────────────

export type DarkModeSetting = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeOption;
  setThemeById: (id: string) => void;
  darkMode: DarkModeSetting;
  setDarkMode: (mode: DarkModeSetting) => void;
  isDark: boolean;
}

const DEFAULT_THEME = THEME_OPTIONS[0];

const ThemeContext = createContext<ThemeContextType>({
  theme: DEFAULT_THEME,
  setThemeById: () => {},
  darkMode: 'light',
  setDarkMode: () => {},
  isDark: false,
});

export const useTheme = () => useContext(ThemeContext);

export const useColors = () => {
  const { theme, isDark } = useTheme();
  const base = isDark ? DARK_COLORS : LIGHT_COLORS;
  return {
    PRIMARY: theme.colors.PRIMARY,
    PRIMARY_LIGHT: theme.colors.PRIMARY_LIGHT,
    PRIMARY_DARK: theme.colors.PRIMARY_DARK,
    ACCENT: '#F59E0B',
    ACCENT_LIGHT: '#FCD34D',
    ...base,
    SUCCESS: '#10B981',
    SUCCESS_LIGHT: isDark ? '#064E3B' : '#D1FAE5',
    WARNING: '#F59E0B',
    WARNING_LIGHT: isDark ? '#78350F' : '#FEF3C7',
    DANGER: '#EF4444',
    DANGER_LIGHT: isDark ? '#7F1D1D' : '#FEE2E2',
    GRADIENT_START: theme.colors.PRIMARY,
    GRADIENT_END: theme.colors.GRADIENT_END,
  };
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [theme, setTheme] = useState<ThemeOption>(DEFAULT_THEME);
  const [darkMode, setDarkModeState] = useState<DarkModeSetting>('light');

  const isDark = darkMode === 'dark' || (darkMode === 'system' && systemScheme === 'dark');

  // Sync COLORS object cho StyleSheet.create() references
  applyDarkMode(isDark);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then(id => {
      if (id) {
        const found = THEME_OPTIONS.find(t => t.id === id);
        if (found) setTheme(found);
      }
    });
    AsyncStorage.getItem(DARK_MODE_KEY).then(val => {
      if (val === 'dark' || val === 'system') setDarkModeState(val);
    });
  }, []);

  const setThemeById = (id: string) => {
    const found = THEME_OPTIONS.find(t => t.id === id);
    if (found) {
      setTheme(found);
      AsyncStorage.setItem(THEME_KEY, id);
    }
  };

  const setDarkMode = (mode: DarkModeSetting) => {
    setDarkModeState(mode);
    AsyncStorage.setItem(DARK_MODE_KEY, mode);
  };

  return (
    <ThemeContext.Provider value={{ theme, setThemeById, darkMode, setDarkMode, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

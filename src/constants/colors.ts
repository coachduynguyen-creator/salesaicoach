// Màu động - cập nhật bởi ThemeContext khi dark mode thay đổi
// Tất cả StyleSheet.create() dùng COLORS sẽ tự động cập nhật khi re-render

export const COLORS: Record<string, string> = {
  // Primary palette
  PRIMARY: '#4F46E5',
  PRIMARY_LIGHT: '#818CF8',
  PRIMARY_DARK: '#3730A3',
  ACCENT: '#F59E0B',
  ACCENT_LIGHT: '#FCD34D',

  // Nền & Surface
  BACKGROUND: '#F8FAFC',
  CARD: '#FFFFFF',
  SURFACE: '#F1F5F9',

  // Text
  TEXT: '#0F172A',
  TEXT_SECONDARY: '#475569',
  TEXT_LIGHT: '#94A3B8',

  // Status
  SUCCESS: '#10B981',
  SUCCESS_LIGHT: '#D1FAE5',
  WARNING: '#F59E0B',
  WARNING_LIGHT: '#FEF3C7',
  DANGER: '#EF4444',
  DANGER_LIGHT: '#FEE2E2',

  // Border & Divider
  BORDER: '#E2E8F0',
  DIVIDER: '#F1F5F9',

  // Gradients
  GRADIENT_START: '#4F46E5',
  GRADIENT_END: '#7C3AED',
};

// Gọi bởi ThemeContext khi dark mode thay đổi
export function applyDarkMode(isDark: boolean) {
  if (isDark) {
    COLORS.BACKGROUND = '#0D1117';
    COLORS.CARD = '#161B22';
    COLORS.SURFACE = '#21262D';
    COLORS.TEXT = '#F0F6FC';
    COLORS.TEXT_SECONDARY = '#C9D1D9';
    COLORS.TEXT_LIGHT = '#8B949E';
    COLORS.BORDER = '#30363D';
    COLORS.DIVIDER = '#21262D';
    COLORS.SUCCESS_LIGHT = '#064E3B';
    COLORS.WARNING_LIGHT = '#78350F';
    COLORS.DANGER_LIGHT = '#7F1D1D';
  } else {
    COLORS.BACKGROUND = '#F8FAFC';
    COLORS.CARD = '#FFFFFF';
    COLORS.SURFACE = '#F1F5F9';
    COLORS.TEXT = '#0F172A';
    COLORS.TEXT_SECONDARY = '#475569';
    COLORS.TEXT_LIGHT = '#94A3B8';
    COLORS.BORDER = '#E2E8F0';
    COLORS.DIVIDER = '#F1F5F9';
    COLORS.SUCCESS_LIGHT = '#D1FAE5';
    COLORS.WARNING_LIGHT = '#FEF3C7';
    COLORS.DANGER_LIGHT = '#FEE2E2';
  }
}

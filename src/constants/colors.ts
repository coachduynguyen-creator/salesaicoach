// Màu mặc định (dùng cho static styles, fallback)
export const COLORS = {
  // Primary palette — sẽ bị override bởi theme
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

// Tạo bộ COLORS dynamic dựa trên theme
export const getThemedColors = (themeColors: {
  PRIMARY: string;
  PRIMARY_LIGHT: string;
  PRIMARY_DARK: string;
  GRADIENT_END: string;
}) => ({
  ...COLORS,
  PRIMARY: themeColors.PRIMARY,
  PRIMARY_LIGHT: themeColors.PRIMARY_LIGHT,
  PRIMARY_DARK: themeColors.PRIMARY_DARK,
  GRADIENT_START: themeColors.PRIMARY,
  GRADIENT_END: themeColors.GRADIENT_END,
});

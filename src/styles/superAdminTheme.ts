// Premium Light Mode Design System for Super Admin Dashboard

export const colors = {
  // Primary Brand Colors
  primary: "#6366F1", // Indigo - Primary actions
  primaryLight: "#818CF8", // Light indigo - Hover states
  primaryDark: "#4F46E5", // Dark indigo - Active states
  primaryBg: "#EEF2FF", // Very light indigo - Backgrounds

  // Neutral Colors
  white: "#FFFFFF",
  gray50: "#F9FAFB",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray300: "#D1D5DB",
  gray400: "#9CA3AF",
  gray500: "#6B7280",
  gray600: "#4B5563",
  gray700: "#374151",
  gray800: "#1F2937",
  gray900: "#111827",

  // Semantic Colors
  success: "#10B981",
  successLight: "#D1FAE5",
  successDark: "#059669",

  warning: "#F59E0B",
  warningLight: "#FEF3C7",
  warningDark: "#D97706",

  error: "#EF4444",
  errorLight: "#FEE2E2",
  errorDark: "#DC2626",

  info: "#3B82F6",
  infoLight: "#DBEAFE",
  infoDark: "#2563EB",

  // Role Colors
  superAdmin: "#8B5CF6", // Purple
  admin: "#6366F1", // Indigo
  pharmacist: "#10B981", // Green
  user: "#3B82F6", // Blue

  // Background Colors
  background: "#F9FAFB",
  surface: "#FFFFFF",
  surfaceHover: "#F9FAFB",

  // Text Colors
  textPrimary: "#111827",
  textSecondary: "#6B7280",
  textTertiary: "#9CA3AF",
  textDisabled: "#D1D5DB",

  // Border Colors
  border: "#E5E7EB",
  borderLight: "#F3F4F6",
  borderDark: "#D1D5DB",

  // Shadow Colors
  shadow: "rgba(0, 0, 0, 0.05)",
  shadowMedium: "rgba(0, 0, 0, 0.1)",
  shadowStrong: "rgba(0, 0, 0, 0.15)",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  massive: 48,
};

export const borderRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  full: 9999,
};

export const typography = {
  // Font Sizes
  xs: 11,
  sm: 12,
  base: 14,
  md: 15,
  lg: 16,
  xl: 18,
  xxl: 20,
  xxxl: 24,
  huge: 28,
  massive: 32,
  giant: 36,

  // Font Weights
  regular: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
  extrabold: "800" as const,

  // Line Heights
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
};

export const shadows = {
  sm: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: colors.shadowMedium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: colors.shadowMedium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: colors.shadowStrong,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const animations = {
  fast: 150,
  normal: 250,
  slow: 350,
};

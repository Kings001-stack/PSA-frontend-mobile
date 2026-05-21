/**
 * Enterprise Design System - PrimeChem
 * Professional blue theme with Google Material Design principles
 */

export const DesignSystem = {
  // Primary Blue Palette (Professional & Trust)
  colors: {
    // Primary Blues
    primary: {
      50: "#E3F2FD",
      100: "#BBDEFB",
      200: "#90CAF9",
      300: "#64B5F6",
      400: "#42A5F5",
      500: "#2196F3", // Main primary
      600: "#1E88E5",
      700: "#1976D2",
      800: "#1565C0",
      900: "#0D47A1",
    },

    // Accent Blues
    accent: {
      light: "#4FC3F7",
      main: "#0288D1",
      dark: "#01579B",
    },

    // Neutral Grays (Professional)
    neutral: {
      50: "#FAFAFA",
      100: "#F5F5F5",
      200: "#EEEEEE",
      300: "#E0E0E0",
      400: "#BDBDBD",
      500: "#9E9E9E",
      600: "#757575",
      700: "#616161",
      800: "#424242",
      900: "#212121",
    },

    // Semantic Colors
    success: {
      light: "#81C784",
      main: "#4CAF50",
      dark: "#388E3C",
    },
    warning: {
      light: "#FFB74D",
      main: "#FF9800",
      dark: "#F57C00",
    },
    error: {
      light: "#E57373",
      main: "#F44336",
      dark: "#D32F2F",
    },
    info: {
      light: "#64B5F6",
      main: "#2196F3",
      dark: "#1976D2",
    },

    // Background & Surface
    background: {
      default: "#FAFAFA",
      paper: "#FFFFFF",
      elevated: "#FFFFFF",
    },

    // Text
    text: {
      primary: "#212121",
      secondary: "#757575",
      disabled: "#BDBDBD",
      hint: "#9E9E9E",
    },

    // Borders & Dividers
    divider: "#E0E0E0",
    border: "#E0E0E0",
  },

  // Typography (Google-like)
  typography: {
    fontFamily: {
      regular: "System",
      medium: "System",
      semibold: "System",
      bold: "System",
    },
    fontSize: {
      xs: 11,
      sm: 13,
      base: 15,
      lg: 17,
      xl: 20,
      "2xl": 24,
      "3xl": 30,
      "4xl": 36,
    },
    fontWeight: {
      regular: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
      extrabold: "800",
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  // Spacing (8px base unit)
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    "2xl": 40,
    "3xl": 48,
    "4xl": 64,
  },

  // Border Radius
  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    "2xl": 20,
    "3xl": 24,
    full: 9999,
  },

  // Shadows (Material Design)
  shadows: {
    none: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 5,
    },
    xl: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.16,
      shadowRadius: 16,
      elevation: 8,
    },
  },

  // Component Specific
  components: {
    button: {
      height: {
        sm: 32,
        md: 40,
        lg: 48,
      },
      borderRadius: 8,
    },
    input: {
      height: 48,
      borderRadius: 8,
      borderWidth: 1,
    },
    card: {
      borderRadius: 12,
      padding: 16,
    },
    navbar: {
      height: 64,
      borderRadius: 24,
    },
  },
};

// Helper function to get color with opacity
export const withOpacity = (color: string, opacity: number): string => {
  return `${color}${Math.round(opacity * 255)
    .toString(16)
    .padStart(2, "0")}`;
};

// Predefined component styles
export const ComponentStyles = {
  // Primary Button
  primaryButton: {
    backgroundColor: DesignSystem.colors.primary[600],
    borderRadius: DesignSystem.borderRadius.md,
    paddingVertical: DesignSystem.spacing.md,
    paddingHorizontal: DesignSystem.spacing.lg,
    ...DesignSystem.shadows.md,
  },

  // Secondary Button
  secondaryButton: {
    backgroundColor: DesignSystem.colors.primary[50],
    borderRadius: DesignSystem.borderRadius.md,
    paddingVertical: DesignSystem.spacing.md,
    paddingHorizontal: DesignSystem.spacing.lg,
    borderWidth: 1,
    borderColor: DesignSystem.colors.primary[200],
  },

  // Card
  card: {
    backgroundColor: DesignSystem.colors.background.paper,
    borderRadius: DesignSystem.borderRadius.xl,
    padding: DesignSystem.spacing.md,
    ...DesignSystem.shadows.md,
    borderWidth: 1,
    borderColor: DesignSystem.colors.divider,
  },

  // Input
  input: {
    backgroundColor: DesignSystem.colors.background.paper,
    borderRadius: DesignSystem.borderRadius.md,
    borderWidth: 1,
    borderColor: DesignSystem.colors.border,
    paddingHorizontal: DesignSystem.spacing.md,
    height: DesignSystem.components.input.height,
    fontSize: DesignSystem.typography.fontSize.base,
    color: DesignSystem.colors.text.primary,
  },

  // Header
  header: {
    backgroundColor: DesignSystem.colors.primary[700],
    paddingVertical: DesignSystem.spacing.lg,
    paddingHorizontal: DesignSystem.spacing.md,
    ...DesignSystem.shadows.lg,
  },
};

export default DesignSystem;

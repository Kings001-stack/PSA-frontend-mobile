import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DesignSystem from "../theme/designSystem";

interface EnterpriseButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "text";
  size?: "sm" | "md" | "lg";
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: "left" | "right";
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

const EnterpriseButton: React.FC<EnterpriseButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  loading = false,
  disabled = false,
  fullWidth = false,
}) => {
  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[`button_${size}`]];

    if (fullWidth) baseStyle.push(styles.fullWidth);
    if (disabled) baseStyle.push(styles.disabled);

    switch (variant) {
      case "primary":
        return [...baseStyle, styles.primaryButton];
      case "secondary":
        return [...baseStyle, styles.secondaryButton];
      case "outline":
        return [...baseStyle, styles.outlineButton];
      case "text":
        return [...baseStyle, styles.textButton];
      default:
        return baseStyle;
    }
  };

  const getTextStyle = () => {
    const baseStyle = [styles.text, styles[`text_${size}`]];

    switch (variant) {
      case "primary":
        return [...baseStyle, styles.primaryText];
      case "secondary":
        return [...baseStyle, styles.secondaryText];
      case "outline":
        return [...baseStyle, styles.outlineText];
      case "text":
        return [...baseStyle, styles.textButtonText];
      default:
        return baseStyle;
    }
  };

  const iconSize = size === "sm" ? 16 : size === "lg" ? 20 : 18;
  const iconColor =
    variant === "primary" ? "#FFFFFF" : DesignSystem.colors.primary[600];

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={iconColor} size="small" />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === "left" && (
            <Ionicons
              name={icon}
              size={iconSize}
              color={iconColor}
              style={styles.iconLeft}
            />
          )}
          <Text style={getTextStyle()}>{title}</Text>
          {icon && iconPosition === "right" && (
            <Ionicons
              name={icon}
              size={iconSize}
              color={iconColor}
              style={styles.iconRight}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: DesignSystem.borderRadius.md,
  },
  button_sm: {
    height: 36,
    paddingHorizontal: DesignSystem.spacing.md,
  },
  button_md: {
    height: 44,
    paddingHorizontal: DesignSystem.spacing.lg,
  },
  button_lg: {
    height: 52,
    paddingHorizontal: DesignSystem.spacing.xl,
  },
  fullWidth: {
    width: "100%",
  },
  disabled: {
    opacity: 0.5,
  },
  primaryButton: {
    backgroundColor: DesignSystem.colors.primary[600],
    ...DesignSystem.shadows.md,
  },
  secondaryButton: {
    backgroundColor: DesignSystem.colors.primary[50],
    borderWidth: 1,
    borderColor: DesignSystem.colors.primary[200],
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: DesignSystem.colors.primary[600],
  },
  textButton: {
    backgroundColor: "transparent",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontWeight: "600",
  },
  text_sm: {
    fontSize: DesignSystem.typography.fontSize.sm,
  },
  text_md: {
    fontSize: DesignSystem.typography.fontSize.base,
  },
  text_lg: {
    fontSize: DesignSystem.typography.fontSize.lg,
  },
  primaryText: {
    color: "#FFFFFF",
  },
  secondaryText: {
    color: DesignSystem.colors.primary[700],
  },
  outlineText: {
    color: DesignSystem.colors.primary[700],
  },
  textButtonText: {
    color: DesignSystem.colors.primary[600],
  },
  iconLeft: {
    marginRight: DesignSystem.spacing.sm,
  },
  iconRight: {
    marginLeft: DesignSystem.spacing.sm,
  },
});

export default EnterpriseButton;

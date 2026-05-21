import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";

const ThemeSettingsScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, themeMode, setThemeMode } = useTheme();
  const colors = theme.colors;

  const themeOptions = [
    {
      id: "light" as const,
      label: "Light",
      icon: "sunny",
      description: "Always use light theme",
    },
    {
      id: "dark" as const,
      label: "Dark",
      icon: "moon",
      description: "Always use dark theme",
    },
    {
      id: "system" as const,
      label: "System",
      icon: "phone-portrait",
      description: "Follow system settings",
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={theme.mode === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.headerBg}
      />

      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 10, backgroundColor: colors.headerBg },
        ]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[
              styles.backBtn,
              { backgroundColor: `${colors.headerText}20` },
            ]}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={colors.headerText} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.headerText }]}>
            Theme Settings
          </Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Appearance
          </Text>
          <Text
            style={[styles.sectionDescription, { color: colors.textSecondary }]}
          >
            Choose how the app looks on your device
          </Text>

          {themeOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                {
                  backgroundColor: colors.surfaceVariant,
                  borderColor:
                    themeMode === option.id ? colors.primary : colors.border,
                  borderWidth: themeMode === option.id ? 2 : 1,
                },
              ]}
              onPress={() => setThemeMode(option.id)}
              activeOpacity={0.7}
            >
              <View style={styles.optionLeft}>
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor:
                        themeMode === option.id
                          ? colors.primary
                          : theme.mode === "dark"
                            ? colors.surface
                            : colors.background,
                    },
                  ]}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={24}
                    color={themeMode === option.id ? "#ffffff" : colors.primary}
                  />
                </View>
                <View style={styles.optionText}>
                  <Text style={[styles.optionLabel, { color: colors.text }]}>
                    {option.label}
                  </Text>
                  <Text
                    style={[
                      styles.optionDescription,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {option.description}
                  </Text>
                </View>
              </View>
              {themeMode === option.id && (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={colors.primary}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View
          style={[styles.previewSection, { backgroundColor: colors.surface }]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Preview
          </Text>
          <View
            style={[
              styles.previewCard,
              {
                backgroundColor: colors.surfaceVariant,
                borderColor: colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.previewHeader,
                { backgroundColor: colors.primary },
              ]}
            >
              <Text style={styles.previewHeaderText}>Sample Header</Text>
            </View>
            <View style={styles.previewBody}>
              <Text style={[styles.previewTitle, { color: colors.text }]}>
                Sample Title
              </Text>
              <Text
                style={[styles.previewText, { color: colors.textSecondary }]}
              >
                This is how text will appear in {theme.mode} mode
              </Text>
              <View style={styles.previewButtons}>
                <View
                  style={[
                    styles.previewButton,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <Text style={styles.previewButtonText}>Primary</Text>
                </View>
                <View
                  style={[
                    styles.previewButton,
                    {
                      backgroundColor: colors.surfaceVariant,
                      borderColor: colors.border,
                      borderWidth: 1,
                    },
                  ]}
                >
                  <Text
                    style={[styles.previewButtonText, { color: colors.text }]}
                  >
                    Secondary
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 20,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 13,
  },
  previewSection: {
    borderRadius: 16,
    padding: 20,
  },
  previewCard: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
  },
  previewHeader: {
    padding: 16,
  },
  previewHeaderText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  previewBody: {
    padding: 16,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  previewText: {
    fontSize: 14,
    marginBottom: 16,
  },
  previewButtons: {
    flexDirection: "row",
    gap: 12,
  },
  previewButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  previewButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default ThemeSettingsScreen;

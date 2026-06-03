import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SuccessModal from "../components/SuccessModal";
import DesignSystem from "../theme/designSystem";

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const { login, isLoading } = useContext(AuthContext);
  const insets = useSafeAreaInsets();
  const passwordInputRef = React.useRef<TextInput>(null);

  const handleEmailFocus = () => setEmailFocused(true);
  const handleEmailBlur = () => setEmailFocused(false);
  const handlePasswordFocus = () => setPasswordFocused(true);
  const handlePasswordBlur = () => setPasswordFocused(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage("Please enter both email and password");
      setShowError(true);
      return;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Please enter a valid email address");
      setShowError(true);
      return;
    }

    try {
      await login(email, password);
    } catch (e: any) {
      let errorMsg = "Invalid email or password";

      if (e?.response?.status === 422) {
        const errors = e?.response?.data?.errors;
        if (errors?.email && errors.email[0]) {
          const errorText = errors.email[0];
          if (errorText.toLowerCase().includes("suspended")) {
            errorMsg = errorText;
          }
        }
      } else if (e?.response?.status === 429) {
        errorMsg = "Too many login attempts. Please try again later.";
      }

      setErrorMessage(errorMsg);
      setShowError(true);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={DesignSystem.colors.background.default}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 40 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardDismissMode="none"
        >
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Ionicons
                name="medical"
                size={48}
                color={DesignSystem.colors.primary[600]}
              />
            </View>
            <Text style={styles.appName}>PrimeChem</Text>
            <Text style={styles.tagline}>Healthcare Management System</Text>
          </View>

          {/* Login Card */}
          <View style={styles.loginCard}>
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.subtitleText}>Sign in to continue</Text>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View
                style={[
                  styles.inputContainer,
                  emailFocused && styles.inputContainerFocused,
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={
                    emailFocused
                      ? DesignSystem.colors.primary[600]
                      : DesignSystem.colors.text.secondary
                  }
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={DesignSystem.colors.text.hint}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordInputRef.current?.focus()}
                  blurOnSubmit={false}
                  editable={!isLoading}
                  onFocus={handleEmailFocus}
                  onBlur={handleEmailBlur}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View
                style={[
                  styles.inputContainer,
                  passwordFocused && styles.inputContainerFocused,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={
                    passwordFocused
                      ? DesignSystem.colors.primary[600]
                      : DesignSystem.colors.text.secondary
                  }
                  style={styles.inputIcon}
                />
                <TextInput
                  ref={passwordInputRef}
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor={DesignSystem.colors.text.hint}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="password"
                  textContentType="password"
                  returnKeyType="go"
                  onSubmitEditing={handleLogin}
                  editable={!isLoading}
                  onFocus={handlePasswordFocus}
                  onBlur={handlePasswordBlur}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color={DesignSystem.colors.text.secondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                isLoading && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.loginButtonText}>Sign In</Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>

            {/* Footer Text */}
            <Text style={styles.footerText}>
              Secure healthcare management platform
            </Text>
          </View>

          {/* Version Info */}
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Error Modal */}
      <SuccessModal
        visible={showError}
        message={errorMessage}
        type="error"
        onClose={() => setShowError(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.background.default,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingBottom: DesignSystem.spacing["3xl"],
  },
  logoSection: {
    alignItems: "center",
    marginBottom: DesignSystem.spacing["3xl"],
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: DesignSystem.borderRadius["2xl"],
    backgroundColor: DesignSystem.colors.primary[50],
    justifyContent: "center",
    alignItems: "center",
    marginBottom: DesignSystem.spacing.md,
    ...DesignSystem.shadows.md,
  },
  appName: {
    fontSize: DesignSystem.typography.fontSize["3xl"],
    fontWeight: "700",
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.xs,
  },
  tagline: {
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.text.secondary,
    fontWeight: "500",
  },
  loginCard: {
    backgroundColor: DesignSystem.colors.background.paper,
    borderRadius: DesignSystem.borderRadius["2xl"],
    padding: DesignSystem.spacing.lg,
    ...DesignSystem.shadows.lg,
    borderWidth: 1,
    borderColor: DesignSystem.colors.divider,
  },
  welcomeText: {
    fontSize: DesignSystem.typography.fontSize["2xl"],
    fontWeight: "700",
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.xs,
  },
  subtitleText: {
    fontSize: DesignSystem.typography.fontSize.base,
    color: DesignSystem.colors.text.secondary,
    marginBottom: DesignSystem.spacing.xl,
  },
  inputGroup: {
    marginBottom: DesignSystem.spacing.lg,
  },
  label: {
    fontSize: DesignSystem.typography.fontSize.sm,
    fontWeight: "600",
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.sm,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DesignSystem.colors.background.paper,
    borderWidth: 1.5,
    borderColor: DesignSystem.colors.border,
    borderRadius: DesignSystem.borderRadius.md,
    paddingHorizontal: DesignSystem.spacing.md,
    height: 52,
  },
  inputContainerFocused: {
    borderColor: DesignSystem.colors.primary[600],
    ...DesignSystem.shadows.sm,
  },
  inputIcon: {
    marginRight: DesignSystem.spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: DesignSystem.typography.fontSize.base,
    color: DesignSystem.colors.text.primary,
    height: "100%",
    paddingVertical: 0,
  },
  eyeIcon: {
    padding: DesignSystem.spacing.xs,
  },
  loginButton: {
    backgroundColor: DesignSystem.colors.primary[600],
    height: 52,
    borderRadius: DesignSystem.borderRadius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: DesignSystem.spacing.md,
    marginBottom: DesignSystem.spacing.md,
    gap: DesignSystem.spacing.sm,
    ...DesignSystem.shadows.md,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: DesignSystem.typography.fontSize.base,
    fontWeight: "600",
  },
  footerText: {
    textAlign: "center",
    fontSize: DesignSystem.typography.fontSize.xs,
    color: DesignSystem.colors.text.hint,
    marginTop: DesignSystem.spacing.sm,
  },
  versionText: {
    textAlign: "center",
    fontSize: DesignSystem.typography.fontSize.xs,
    color: DesignSystem.colors.text.hint,
    marginTop: DesignSystem.spacing.xl,
  },
});

export default LoginScreen;

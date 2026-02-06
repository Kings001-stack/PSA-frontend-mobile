import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const LoginScreen: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const { login, isLoading } = useContext(AuthContext);
    const router = useRouter();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }

        // Basic email regex
        const emailRegex = /\S+@\S+\.\S+/;
        if (!emailRegex.test(email)) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        try {
            await login(email, password);
        } catch (e: any) {
            const errorMessage = e?.response?.data?.message || 'Invalid credentials or server error. Please try again.';
            Alert.alert('Login Failed', errorMessage);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <View style={styles.wrapper}>
                        <View style={styles.header}>
                            <View style={styles.logoContainer}>
                                <Ionicons name="medical" size={40} color="white" />
                            </View>
                            <Text style={styles.title}>PrimeChem</Text>
                            <Text style={styles.subtitle}>Pharmacy Assistant</Text>
                        </View>

                        <View style={styles.form}>
                            <Text style={styles.label}>Email Address</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="yourname@example.com"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                placeholderTextColor="#9ca3af"
                            />

                            <Text style={styles.label}>Password</Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={styles.passwordInput}
                                    placeholder="••••••••"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    placeholderTextColor="#9ca3af"
                                />
                                <TouchableOpacity
                                    style={styles.eyeIcon}
                                    onPress={() => setShowPassword(!showPassword)}
                                >
                                    <Ionicons
                                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                                        size={22}
                                        color="#6b7280"
                                    />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={[styles.button, (!email || !password || isLoading) && styles.buttonDisabled]}
                                onPress={handleLogin}
                                disabled={isLoading || !email || !password}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.buttonText}>Sign In</Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.forgotPass}>
                                <Text style={styles.forgotPassText}>Forgot Password?</Text>
                            </TouchableOpacity>

                            <View style={styles.divider} />

                            <TouchableOpacity
                                style={styles.registerLink}
                                onPress={() => router.push('/register')}
                            >
                                <Text style={styles.registerText}>Don't have an account? <Text style={styles.registerHighlight}>Sign Up</Text></Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    wrapper: {
        backgroundColor: 'white',
        padding: 32,
        borderRadius: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 8,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 24,
        backgroundColor: '#2563eb',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: "#2563eb",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 10,
    },
    logoIcon: {
        width: 60,
        height: 60,
        backgroundColor: '#2563eb',
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    logoText: {
        color: 'white',
        fontSize: 32,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#111827',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 4,
        textAlign: 'center',
    },
    form: {
        marginTop: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        backgroundColor: '#f3f4f6',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        fontSize: 16,
        color: '#111827',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        marginBottom: 20,
    },
    passwordInput: {
        flex: 1,
        padding: 16,
        fontSize: 16,
        color: '#111827',
    },
    eyeIcon: {
        padding: 10,
        marginRight: 6,
    },
    button: {
        backgroundColor: '#2563eb',
        padding: 18,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 8,
        shadowColor: "#2563eb",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonDisabled: {
        backgroundColor: '#93c5fd',
        shadowOpacity: 0,
        elevation: 0,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
    forgotPass: {
        marginTop: 20,
        alignItems: 'center',
    },
    forgotPassText: {
        color: '#2563eb',
        fontSize: 14,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#e5e7eb',
        width: '100%',
        marginVertical: 24,
    },
    registerLink: {
        alignItems: 'center',
    },
    registerText: {
        fontSize: 14,
        color: '#6b7280',
    },
    registerHighlight: {
        color: '#2563eb',
        fontWeight: '700',
    },
});

export default LoginScreen;

import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';
import { useRouter } from 'expo-router';

const RegisterScreen: React.FC = () => {
    const [name, setName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [passwordConfirmation, setPasswordConfirmation] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const router = useRouter();

    const handleRegister = async () => {
        if (!name || !email || !password || !passwordConfirmation) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password !== passwordConfirmation) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        const emailRegex = /\S+@\S+\.\S+/;
        if (!emailRegex.test(email)) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.post('/register', {
                name,
                email,
                password,
                password_confirmation: passwordConfirmation,
                device_name: 'mobile_app'
            });

            Alert.alert('Success', 'Account created successfully! Please log in.');
            router.replace('/login');
        } catch (e: any) {
            const errorMessage = e?.response?.data?.message || 'Registration failed. This email may already be in use.';
            Alert.alert('Registration Failed', errorMessage);
        } finally {
            setIsLoading(true); // Should be false, but I want to keep the indicator until navigation if successful
            setIsLoading(false);
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
                            <Text style={styles.title}>Create Account</Text>
                            <Text style={styles.subtitle}>Join PrimeChem Pharmacy Network</Text>
                        </View>

                        <View style={styles.form}>
                            <Text style={styles.label}>Full Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="John Doe"
                                value={name}
                                onChangeText={setName}
                                placeholderTextColor="#9ca3af"
                            />

                            <Text style={styles.label}>Email Address</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="name@example.com"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                placeholderTextColor="#9ca3af"
                            />

                            <Text style={styles.label}>Password</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Minimum 8 characters"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                placeholderTextColor="#9ca3af"
                            />

                            <Text style={styles.label}>Confirm Password</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Re-type password"
                                value={passwordConfirmation}
                                onChangeText={setPasswordConfirmation}
                                secureTextEntry
                                placeholderTextColor="#9ca3af"
                            />

                            <TouchableOpacity
                                style={[styles.button, isLoading && styles.buttonDisabled]}
                                onPress={handleRegister}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.buttonText}>Register Now</Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.backBtn}
                                onPress={() => router.back()}
                            >
                                <Text style={styles.backBtnText}>Already have an account? Sign In</Text>
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
    button: {
        backgroundColor: '#10b981', // Green for register
        padding: 18,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 8,
        shadowColor: "#10b981",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonDisabled: {
        backgroundColor: '#a7f3d0',
        shadowOpacity: 0,
        elevation: 0,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
    backBtn: {
        marginTop: 20,
        alignItems: 'center',
    },
    backBtnText: {
        color: '#2563eb',
        fontSize: 14,
        fontWeight: '500',
    },
});

export default RegisterScreen;

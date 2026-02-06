import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    StatusBar,
    Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const ProfileScreen: React.FC = () => {
    const { user, updateUserInfo } = useContext(AuthContext);
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
    });

    const handleUpdate = async () => {
        if (!formData.name.trim() || !formData.email.trim()) {
            Alert.alert("Error", "Name and Email are required.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.patch('/user/profile', formData);

            if (response.data.user) {
                await updateUserInfo(response.data.user);
            }

            Alert.alert("Success", "Profile updated successfully!");
            router.back();
        } catch (error: any) {
            console.error('Update failed', error);
            Alert.alert("Error", error.response?.data?.message || "Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <View style={[styles.header, { paddingTop: insets.top }]}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Edit Profile</Text>
                    <View style={{ width: 40 }} />
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.avatarSection}>
                    <View style={styles.avatarLarge}>
                        <Text style={styles.avatarText}>{formData.name.charAt(0).toUpperCase()}</Text>
                    </View>
                    <Text style={styles.userRole}>{user?.role?.toUpperCase()}</Text>
                </View>

                <View style={styles.formCard}>
                    <Text style={styles.label}>Full Name</Text>
                    <View style={styles.inputWrapper}>
                        <Ionicons name="person-outline" size={20} color="#64748b" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            value={formData.name}
                            onChangeText={(text) => setFormData({ ...formData, name: text })}
                            placeholder="Your Name"
                        />
                    </View>

                    <Text style={styles.label}>Email Address</Text>
                    <View style={styles.inputWrapper}>
                        <Ionicons name="mail-outline" size={20} color="#64748b" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            value={formData.email}
                            onChangeText={(text) => setFormData({ ...formData, email: text })}
                            placeholder="Email Address"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <Text style={styles.label}>Phone Number</Text>
                    <View style={styles.inputWrapper}>
                        <Ionicons name="call-outline" size={20} color="#64748b" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            value={formData.phone}
                            onChangeText={(text) => setFormData({ ...formData, phone: text })}
                            placeholder="Phone Number"
                            keyboardType="phone-pad"
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.saveBtn, isLoading && styles.disabledBtn]}
                        onPress={handleUpdate}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle-outline" size={20} color="white" />
                                <Text style={styles.saveBtnText}>Save Changes</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.infoBox}>
                    <Ionicons name="information-circle-outline" size={20} color="#1e3a8a" />
                    <Text style={styles.infoText}>
                        Only your display information can be changed here. Contact admin for role changes.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        backgroundColor: '#1e3a8a',
        paddingBottom: 24,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 10 : 20,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: 'white',
    },
    scrollContent: {
        padding: 24,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatarLarge: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#fbbf24',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    avatarText: {
        fontSize: 40,
        fontWeight: '800',
        color: '#1e3a8a',
    },
    userRole: {
        marginTop: 12,
        fontSize: 12,
        fontWeight: '800',
        color: '#64748b',
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 10,
        letterSpacing: 1,
    },
    formCard: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#1e3a8a',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 3,
    },
    label: {
        fontSize: 13,
        fontWeight: '700',
        color: '#475569',
        marginBottom: 8,
        marginTop: 16,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        paddingHorizontal: 16,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        height: 48,
        fontSize: 15,
        color: '#1e293b',
    },
    saveBtn: {
        backgroundColor: '#1d4ed8',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 52,
        borderRadius: 16,
        marginTop: 32,
        gap: 10,
        shadowColor: '#1d4ed8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    disabledBtn: {
        opacity: 0.6,
    },
    saveBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#eff6ff',
        padding: 16,
        borderRadius: 16,
        marginTop: 24,
        gap: 12,
        alignItems: 'center',
    },
    infoText: {
        flex: 1,
        fontSize: 12,
        color: '#1e3a8a',
        lineHeight: 18,
    },
});

export default ProfileScreen;

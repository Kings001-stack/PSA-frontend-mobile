import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, StatusBar, Platform, Alert, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AuthContext } from '../context/AuthContext';
import AdvertCarousel from '../components/AdvertCarousel';

const UserHomeScreen: React.FC = () => {
    const { user, logout } = useContext(AuthContext);
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const handleFeatureAlert = (title: string) => {
        Alert.alert(title, "This feature is coming soon to the PrimeChem mobile app!");
    };

    const handleCall = () => {
        Linking.openURL('tel:09071906688');
    };

    const navigateToChat = () => {
        router.push('/(user)/chat');
    };

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to log out?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Log Out", style: "destructive", onPress: logout }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* Layered Premium Header */}
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <View style={styles.headerContent}>
                    <View style={styles.headerTop}>
                        <View style={styles.brandRow}>
                            <View style={styles.logoCircle}>
                                <Ionicons name="medical" size={20} color="white" />
                            </View>
                            <View>
                                <Text style={styles.brandName}>PRIMECHEM</Text>
                                <Text style={styles.brandTagline}>YOUR HEALTH PARTNER</Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                            <Ionicons name="log-out-outline" size={22} color="white" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.welcomeSection}>
                        <View>
                            <Text style={styles.greeting}>Good day,</Text>
                            <Text style={styles.userName}>{user?.name?.split(' ')[0] || 'User'}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.profileBadge}
                            onPress={() => router.push('/(user)/profile')}
                        >
                            <Image
                                source={{ uri: `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=fbbf24&color=1e3a8a` }}
                                style={styles.avatarImg}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Adverts Carousel */}
                <View style={styles.carouselWrapper}>
                    <AdvertCarousel />
                </View>

                {/* AI Assistant Hero */}
                <TouchableOpacity
                    style={styles.heroCard}
                    onPress={() => navigateToChat()}
                >
                    <View style={styles.heroTextContainer}>
                        <View style={styles.aiBadge}>
                            <Ionicons name="sparkles" size={10} color="#2563eb" />
                            <Text style={styles.aiBadgeText}>AI ASSISTANT</Text>
                        </View>
                        <Text style={styles.heroTitle}>Health Concierge</Text>
                        <Text style={styles.heroSubtitle}>Check stock, refill orders, or get instant health advice.</Text>
                        <View style={styles.ctaButton}>
                            <Text style={styles.ctaText}>Start Consulting</Text>
                            <Ionicons name="chevron-forward" size={14} color="#2563eb" />
                        </View>
                    </View>
                    <View style={styles.heroIconWrapper}>
                        <View style={styles.heroIconInner}>
                            <Ionicons name="chatbubbles" size={32} color="#2563eb" />
                        </View>
                    </View>
                </TouchableOpacity>

                {/* Quick Actions Grid */}
                <Text style={styles.sectionTitle}>Essential Services</Text>
                <View style={styles.grid}>
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => router.push('/(user)/medications')}
                    >
                        <View style={[styles.iconBox, { backgroundColor: '#eff6ff' }]}>
                            <Ionicons name="search" size={22} color="#2563eb" />
                        </View>
                        <Text style={styles.cardTitle}>Find Meds</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => navigateToChat("I'd like to request a refill")}
                    >
                        <View style={[styles.iconBox, { backgroundColor: '#fff7ed' }]}>
                            <Ionicons name="refresh" size={22} color="#ea580c" />
                        </View>
                        <Text style={styles.cardTitle}>Refills</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => navigateToChat("Check status of my orders")}
                    >
                        <View style={[styles.iconBox, { backgroundColor: '#f0fdf4' }]}>
                            <Ionicons name="receipt" size={22} color="#16a34a" />
                        </View>
                        <Text style={styles.cardTitle}>Track Orders</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => handleFeatureAlert("Pharmacy Information")}
                    >
                        <View style={[styles.iconBox, { backgroundColor: '#fef2f2' }]}>
                            <Ionicons name="information-circle" size={22} color="#dc2626" />
                        </View>
                        <Text style={styles.cardTitle}>About Us</Text>
                    </TouchableOpacity>
                </View>

                {/* Status Card */}
                <View style={styles.statusSection}>
                    <View style={styles.statusCard}>
                        <View style={styles.statusInfo}>
                            <Ionicons name="time" size={20} color="#2563eb" />
                            <View>
                                <Text style={styles.statusTitle}>PrimeChem Central</Text>
                                <Text style={styles.statusText}>Open until 9:00 PM</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.callBtn} onPress={handleCall}>
                            <Ionicons name="call" size={18} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>

            </ScrollView>

            {/* Floating AI Health Widget */}
            <TouchableOpacity
                style={styles.floatingChatBtn}
                onPress={() => navigateToChat()}
            >
                <View style={styles.floatingIconShadow}>
                    <Ionicons name="sparkles" size={26} color="white" />
                </View>
                <View style={styles.onlineStatus} />
            </TouchableOpacity>
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
        paddingBottom: 40,
        borderBottomLeftRadius: 36,
        borderBottomRightRadius: 36,
        shadowColor: '#1e3a8a',
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 15,
    },
    headerContent: {
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 10 : 20,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 28,
    },
    brandRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    logoCircle: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    brandName: {
        fontSize: 16,
        fontWeight: '900',
        color: 'white',
        letterSpacing: 0.5,
    },
    brandTagline: {
        fontSize: 8,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.6)',
        letterSpacing: 1.5,
    },
    logoutBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
    },
    welcomeSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    greeting: {
        fontSize: 12,
        fontWeight: '800',
        color: 'rgba(255,255,255,0.6)',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    profileBadge: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.2)',
        padding: 2,
    },
    avatarImg: {
        width: '100%',
        height: '100%',
        borderRadius: 20,
    },
    scrollContent: {
        paddingTop: 24,
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    carouselWrapper: {
        marginBottom: 24,
    },
    heroCard: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#1e3a8a',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: 'rgba(30, 58, 138, 0.05)',
    },
    aiBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#eff6ff',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    aiBadgeText: {
        fontSize: 8,
        fontWeight: '900',
        color: '#2563eb',
    },
    heroTextContainer: {
        flex: 1,
    },
    heroTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 4,
    },
    heroSubtitle: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 16,
        lineHeight: 18,
    },
    ctaButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ctaText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#2563eb',
    },
    heroIconWrapper: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#eff6ff',
        padding: 4,
    },
    heroIconInner: {
        width: '100%',
        height: '100%',
        borderRadius: 30,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 16,
        paddingLeft: 4,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    card: {
        width: '48%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#1e3a8a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        borderWidth: 1,
        borderColor: 'rgba(30, 58, 138, 0.05)',
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 12,
        fontWeight: '800',
        color: '#475569',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statusSection: {
        marginBottom: 40,
    },
    statusCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    statusInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    statusTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1e293b',
    },
    statusText: {
        fontSize: 12,
        color: '#16a34a',
        fontWeight: '600',
    },
    callBtn: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: '#2563eb',
        justifyContent: 'center',
        alignItems: 'center',
    },
    floatingChatBtn: {
        position: 'absolute',
        bottom: 30,
        right: 25,
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#2563eb',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#1e3a8a',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 10,
    },
    floatingIconShadow: {
        width: '100%',
        height: '100%',
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2563eb',
    },
    onlineStatus: {
        position: 'absolute',
        top: 14,
        right: 14,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#10b981',
        borderWidth: 3,
        borderColor: 'white',
    },
});

export default UserHomeScreen;

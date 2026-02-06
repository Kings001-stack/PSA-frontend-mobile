import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    TextInput,
    FlatList,
    TouchableOpacity,
    StatusBar,
    Linking,
    Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '../services/api';

interface MedicationAvailability {
    name: string;
    dosage: string;
    form: string;
    availability: 'available' | 'limited' | 'out_of_stock';
}

const MedicationSearchScreen: React.FC = () => {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [medications, setMedications] = useState<MedicationAvailability[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const performSearch = useCallback(async (query: string) => {
        setIsLoading(true);
        try {
            const response = await api.get('/medications/search', {
                params: { query }
            });
            setMedications(response.data);
        } catch (error) {
            console.error('Search failed', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            performSearch(searchQuery);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, performSearch]);

    const getStatusDetails = (status: string) => {
        switch (status) {
            case 'available':
                return {
                    label: 'Available',
                    color: '#16a34a',
                    bg: '#f0fdf4',
                    icon: 'checkmark-circle'
                };
            case 'limited':
                return {
                    label: 'Limited Stock',
                    color: '#ea580c',
                    bg: '#fff7ed',
                    icon: 'alert-circle'
                };
            case 'out_of_stock':
                return {
                    label: 'Out of Stock',
                    color: '#dc2626',
                    bg: '#fee2e2',
                    icon: 'close-circle'
                };
            default:
                return {
                    label: 'Unknown',
                    color: '#64748b',
                    bg: '#f1f5f9',
                    icon: 'help-circle'
                };
        }
    };

    const handleCallPharmacy = () => {
        Linking.openURL('tel:09071906688');
    };

    const renderMedication = ({ item }: { item: MedicationAvailability }) => {
        const status = getStatusDetails(item.availability);
        const isOutOfStock = item.availability === 'out_of_stock';
        const isLimited = item.availability === 'limited';

        return (
            <View style={styles.card}>
                <View style={styles.cardMain}>
                    <View style={styles.medIconWrapper}>
                        <View style={[styles.medIcon, { backgroundColor: status.bg }]}>
                            <Ionicons name="medical" size={20} color={status.color} />
                        </View>
                    </View>

                    <View style={styles.medContent}>
                        <Text style={styles.medName}>{item.name}</Text>
                        <Text style={styles.medDetail}>{item.dosage} • {item.form}</Text>

                        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                            <Ionicons name={status.icon as any} size={12} color={status.color} />
                            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                        </View>
                    </View>

                    {isOutOfStock ? (
                        <TouchableOpacity
                            style={styles.callSmallBtn}
                            onPress={handleCallPharmacy}
                        >
                            <Ionicons name="call" size={16} color="white" />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={styles.infoBtn}
                            onPress={() => router.push('/(user)/chat')}
                        >
                            <Ionicons name="chatbubble-ellipses" size={20} color="#2563eb" />
                        </TouchableOpacity>
                    )}
                </View>

                {isOutOfStock && (
                    <View style={styles.advisoryBox}>
                        <Text style={styles.advisoryText}>
                            This medication is currently unavailable. Please contact our pharmacist to check for alternatives or restock dates.
                        </Text>
                    </View>
                )}

                {isLimited && (
                    <View style={[styles.advisoryBox, { backgroundColor: '#fff7ed', borderColor: '#fed7aa' }]}>
                        <Text style={[styles.advisoryText, { color: '#9a3412' }]}>
                            Stock is running low. We recommend contacting us or visiting soon to ensure availability.
                        </Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Premium Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={28} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Medication Search</Text>
                    <View style={{ width: 44 }} />
                </View>

                <View style={styles.searchSection}>
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={20} color="#94a3b8" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search by name (e.g. Paracetamol)"
                            placeholderTextColor="#94a3b8"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#2563eb" />
                        ) : searchQuery.length > 0 ? (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={20} color="#94a3b8" />
                            </TouchableOpacity>
                        ) : null}
                    </View>
                </View>
            </View>

            <FlatList
                data={medications}
                renderItem={renderMedication}
                keyExtractor={(item, index) => `${item.name}-${index}`}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconCircle}>
                            <Ionicons name="search-outline" size={48} color="#cbd5e1" />
                        </View>
                        <Text style={styles.emptyTitle}>
                            {searchQuery ? 'No Results Found' : 'Find Your Medication'}
                        </Text>
                        <Text style={styles.emptySubtitle}>
                            {searchQuery
                                ? `We couldn't find anything matching "${searchQuery}"`
                                : 'Enter a medication name to check its availability status in real-time.'}
                        </Text>
                    </View>
                }
            />

            {/* Support Action */}
            <TouchableOpacity
                style={[styles.floatingSupport, { bottom: insets.bottom + 20 }]}
                onPress={handleCallPharmacy}
            >
                <Ionicons name="call" size={20} color="white" />
                <Text style={styles.supportText}>Call Pharmacy</Text>
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
        paddingBottom: 24,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        shadowColor: '#1e3a8a',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 10,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: 'white',
        letterSpacing: 0.5,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchSection: {
        paddingHorizontal: 20,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: Platform.OS === 'ios' ? 14 : 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        color: '#1e293b',
        fontWeight: '500',
    },
    listContainer: {
        padding: 20,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(30, 58, 138, 0.05)',
        shadowColor: '#1e3a8a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 2,
    },
    cardMain: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    medIconWrapper: {
        marginRight: 16,
    },
    medIcon: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    medContent: {
        flex: 1,
    },
    medName: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 2,
    },
    medDetail: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 8,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
    },
    infoBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#eff6ff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    callSmallBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#dc2626',
        justifyContent: 'center',
        alignItems: 'center',
    },
    advisoryBox: {
        marginTop: 12,
        padding: 12,
        backgroundColor: '#fee2e2',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#fecaca',
    },
    advisoryText: {
        fontSize: 11,
        color: '#991b1b',
        lineHeight: 16,
        fontWeight: '500',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
        paddingHorizontal: 40,
    },
    emptyIconCircle: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 3,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 20,
    },
    floatingSupport: {
        position: 'absolute',
        right: 20,
        backgroundColor: '#1e3a8a',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 30,
        gap: 8,
        shadowColor: '#1e3a8a',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    supportText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 14,
    }
});

export default MedicationSearchScreen;

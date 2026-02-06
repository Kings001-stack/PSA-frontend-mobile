import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    TextInput,
    RefreshControl,
    TouchableOpacity,
    Modal,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StatusBar
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

interface Medication {
    id: number;
    name: string;
    description?: string;
}

interface InventoryItem {
    id: number;
    medication_id: number;
    quantity: number;
    reorder_level?: number;
    batch_number: string;
    expiry_date: string;
    medication?: Medication;
}

const InventoryScreen: React.FC = () => {
    const { user } = useContext(AuthContext);
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>('');

    // CRUD state
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [medications, setMedications] = useState<Medication[]>([]);

    const [formData, setFormData] = useState({
        medication_id: '',
        medication_name: '',
        quantity: '',
        batch_number: '',
        expiry_date: new Date().toISOString().split('T')[0],
        reorder_level: '20'
    });

    const fetchMedications = async () => {
        try {
            const response = await api.get('/medications');
            setMedications(response.data.data || response.data);
        } catch (error) {
            console.error('Failed to fetch medications', error);
        }
    };

    const fetchInventory = async (isRefresh = false) => {
        if (isRefresh) setIsRefreshing(true);
        else setIsLoading(true);

        try {
            const response = await api.get('/inventory');
            // Laravel-style pagination response: { data: { data: [...] } } or { data: [...] } depending on paginate vs get
            // Assuming response.data.data from previous observation
            const items = response.data.data || response.data;
            setInventory(items);
            setFilteredItems(items);
        } catch (error) {
            console.error('Failed to fetch inventory', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchInventory();
            if (user.role === 'admin' || user.role === 'pharmacist' || user.role === 'staff') {
                fetchMedications();
            }
        }
    }, [user]);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredItems(inventory);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = inventory.filter(item =>
                item.medication?.name.toLowerCase().includes(query) ||
                item.batch_number.toLowerCase().includes(query)
            );
            setFilteredItems(filtered);
        }
    }, [searchQuery, inventory]);

    const getStatusInfo = (item: InventoryItem) => {
        const today = new Date();
        const expiry = new Date(item.expiry_date);
        const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const isStaff = user?.role === 'admin' || user?.role === 'pharmacist' || user?.role === 'staff';

        if (item.quantity === 0) {
            return {
                label: isStaff ? 'OUT OF STOCK' : 'OUT OF STOCK',
                color: '#dc2626',
                bg: '#fee2e2'
            };
        }

        if (item.quantity < (item.reorder_level || 20)) {
            return {
                label: isStaff ? 'LOW STOCK' : 'AVAILABLE',
                color: '#ea580c',
                bg: '#fff7ed'
            };
        }

        if (isStaff && diffDays < 30) {
            return { label: 'EXPIRING SOON', color: '#b91c1c', bg: '#fef2f2' };
        }

        return {
            label: isStaff ? 'HIGH STOCK' : 'AVAILABLE',
            color: '#16a34a',
            bg: '#f0fdf4'
        };
    };

    const handleAdd = () => {
        setSelectedItem(null);
        setIsEditing(false);
        setFormData({
            medication_id: '',
            medication_name: '',
            quantity: '',
            batch_number: 'B-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
            expiry_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
            reorder_level: '20'
        });
        setIsModalVisible(true);
    };

    const handleEdit = (item: InventoryItem) => {
        setSelectedItem(item);
        setIsEditing(true);
        setFormData({
            medication_id: item.medication_id.toString(),
            medication_name: item.medication?.name || '',
            quantity: item.quantity.toString(),
            batch_number: item.batch_number,
            expiry_date: item.expiry_date,
            reorder_level: item.reorder_level?.toString() || '20'
        });
        setIsModalVisible(true);
    };

    const handleDelete = (id: number) => {
        Alert.alert(
            "Delete Stock",
            "Are you sure you want to remove this item from inventory?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await api.delete(`/admin/inventory/${id}`);
                            fetchInventory();
                        } catch (error) {
                            Alert.alert("Error", "Failed to delete item");
                        }
                    }
                }
            ]
        );
    };

    const handleSubmit = async () => {
        if ((!formData.medication_id && !formData.medication_name.trim()) || !formData.quantity || !formData.batch_number) {
            Alert.alert("Missing Fields", "Please provide a medication name and quantity.");
            return;
        }

        try {
            if (isEditing && selectedItem) {
                await api.patch(`/admin/inventory/${selectedItem.id}`, formData);
            } else {
                await api.post('/admin/inventory', formData);
            }
            setIsModalVisible(false);
            fetchInventory();
        } catch (error: any) {
            Alert.alert("Error", error.response?.data?.message || "Failed to save data");
        }
    };

    const renderItem = ({ item }: { item: InventoryItem }) => {
        const isStaff = user?.role === 'admin' || user?.role === 'pharmacist' || user?.role === 'staff';
        const status = getStatusInfo(item);

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.medIcon}>
                        <Ionicons name="bandage-outline" size={20} color="#2563eb" />
                    </View>
                    <View style={styles.medInfo}>
                        <Text style={styles.medName}>
                            {item.medication ? item.medication.name : 'Unknown Medication'}
                        </Text>
                        {isStaff && <Text style={styles.batchText}>Batch: {item.batch_number}</Text>}
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: status.bg }]} id={`status-${item.id}`}>
                        <Text style={[styles.statusLabel, { color: status.color }]}>
                            {status.label}
                        </Text>
                    </View>
                </View>

                {isStaff && (
                    <>
                        <View style={styles.actionRow}>
                            <TouchableOpacity style={styles.editBtn} onPress={() => handleEdit(item)}>
                                <Ionicons name="pencil-outline" size={18} color="#2563eb" />
                                <Text style={styles.editText}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                                <Ionicons name="trash-outline" size={18} color="#dc2626" />
                                <Text style={styles.deleteText}>Delete</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.cardDivider} />

                        <View style={styles.cardDetails}>
                            <View style={styles.detailItem}>
                                <Ionicons name="cube-outline" size={14} color="#6b7280" />
                                <Text style={styles.detailValue}>{item.quantity} units</Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Ionicons name="calendar-outline" size={14} color="#6b7280" />
                                <Text style={styles.detailValue}>
                                    Expires: {new Date(item.expiry_date).toLocaleDateString()}
                                </Text>
                            </View>
                        </View>
                    </>
                )}
            </View>
        );
    };

    if (isLoading && !isRefreshing) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.loadingText}>Fetching inventory data...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* Premium Header */}
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <View style={styles.headerContent}>
                    <View style={styles.headerTop}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                            <Ionicons name="arrow-back" size={22} color="white" />
                        </TouchableOpacity>
                        <View style={styles.brandContainer}>
                            <View style={styles.logoCircle}>
                                <Ionicons name="cube" size={20} color="white" />
                            </View>
                            <View>
                                <Text style={styles.headerTitle}>
                                    {user?.role === 'admin' ? 'Inventory' : 'Medications'}
                                </Text>
                                <Text style={styles.headerSubtitle}>
                                    {filteredItems.length} items in stock
                                </Text>
                            </View>
                        </View>
                        <View style={styles.headerActions}>
                            {user?.role === 'admin' && (
                                <>
                                    <TouchableOpacity
                                        style={styles.headerActionBtn}
                                        onPress={() => router.push('/(admin)/inventory-import')}
                                    >
                                        <Ionicons name="document-attach" size={20} color="white" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.headerActionBtn, styles.addBtnHeader]}
                                        onPress={handleAdd}
                                    >
                                        <Ionicons name="add" size={22} color="white" />
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    </View>

                    {/* Search Bar in Header */}
                    <View style={styles.searchBox}>
                        <Ionicons name="search" size={18} color="rgba(255,255,255,0.6)" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search by name or batch..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholderTextColor="rgba(255,255,255,0.5)"
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.6)" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>

            <FlatList
                data={filteredItems}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={() => fetchInventory(true)} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconWrapper}>
                            <Ionicons name="search-outline" size={48} color="#cbd5e1" />
                        </View>
                        <Text style={styles.emptyText}>
                            {searchQuery ? `No items matching "${searchQuery}"` : 'No inventory items found'}
                        </Text>
                        <Text style={styles.emptySubtext}>
                            {searchQuery ? 'Try a different search term' : 'Add items to get started'}
                        </Text>
                    </View>
                }
            />

            {/* Modal for Add/Edit */}
            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={styles.modalContent}
                    >
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{isEditing ? 'Edit Stock' : 'Add Stock'}</Text>
                            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.formContent} bounces={false}>
                            <Text style={styles.label}>Medication Name</Text>
                            {!isEditing ? (
                                <View>
                                    <TextInput
                                        style={styles.input}
                                        value={formData.medication_name}
                                        onChangeText={(text) => setFormData({ ...formData, medication_name: text, medication_id: '' })}
                                        placeholder="Type medication name..."
                                    />

                                    {formData.medication_name.length > 0 && medications.filter(m => m.name.toLowerCase().includes(formData.medication_name.toLowerCase())).length > 0 && (
                                        <View style={styles.suggestions}>
                                            {medications
                                                .filter(m => m.name.toLowerCase().includes(formData.medication_name.toLowerCase()))
                                                .slice(0, 3)
                                                .map(med => (
                                                    <TouchableOpacity
                                                        key={med.id}
                                                        style={styles.suggestionItem}
                                                        onPress={() => setFormData({ ...formData, medication_id: med.id.toString(), medication_name: med.name })}
                                                    >
                                                        <Ionicons name="medical-outline" size={14} color="#64748b" />
                                                        <Text style={styles.suggestionText}>{med.name}</Text>
                                                    </TouchableOpacity>
                                                ))
                                            }
                                        </View>
                                    )}
                                </View>
                            ) : (
                                <View style={styles.readOnlyContainer}>
                                    <Ionicons name="lock-closed-outline" size={14} color="#94a3b8" />
                                    <Text style={styles.readOnlyText}>{formData.medication_name}</Text>
                                </View>
                            )}

                            <Text style={styles.label}>Quantity</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.quantity}
                                onChangeText={(text) => setFormData({ ...formData, quantity: text })}
                                keyboardType="numeric"
                                placeholder="e.g. 50"
                            />

                            <Text style={styles.label}>Batch Number</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.batch_number}
                                onChangeText={(text) => setFormData({ ...formData, batch_number: text })}
                                placeholder="e.g. BATCH-123"
                            />

                            <Text style={styles.label}>Expiry Date (YYYY-MM-DD)</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.expiry_date}
                                onChangeText={(text) => setFormData({ ...formData, expiry_date: text })}
                                placeholder="2025-12-31"
                            />
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={styles.cancelLink} onPress={() => setIsModalVisible(false)}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                                <Text style={styles.submitBtnText}>{isEditing ? 'Update Stock' : 'Add to Inventory'}</Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
    },
    loadingText: {
        marginTop: 12,
        color: '#64748b',
        fontSize: 14,
        fontWeight: '500',
    },
    header: {
        backgroundColor: '#1e3a8a',
        paddingBottom: 28,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        shadowColor: '#1e3a8a',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.2,
        shadowRadius: 18,
        elevation: 12,
    },
    headerContent: {
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 10 : 20,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    brandContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 12,
        gap: 10,
    },
    logoCircle: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: 'white',
    },
    headerSubtitle: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '600',
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    headerActionBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addBtnHeader: {
        backgroundColor: '#10b981',
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 15,
        color: 'white',
        fontWeight: '500',
    },
    list: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    medIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#eff6ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    medInfo: {
        flex: 1,
    },
    medName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    batchText: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusLabel: {
        fontSize: 10,
        fontWeight: '700',
    },
    cardDivider: {
        height: 1,
        backgroundColor: '#f3f4f6',
        marginVertical: 12,
    },
    cardDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailValue: {
        fontSize: 13,
        color: '#4b5563',
        marginLeft: 6,
        fontWeight: '500',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 80,
        paddingHorizontal: 40,
    },
    emptyIconWrapper: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyText: {
        color: '#475569',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    emptySubtext: {
        marginTop: 6,
        color: '#94a3b8',
        fontSize: 13,
        textAlign: 'center',
    },
    actionRow: {
        flexDirection: 'row',
        marginTop: 12,
        gap: 12,
    },
    editBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#eff6ff',
        paddingVertical: 10,
        borderRadius: 8,
        gap: 6,
    },
    editText: {
        color: '#2563eb',
        fontWeight: '600',
        fontSize: 14,
    },
    deleteBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fef2f2',
        paddingVertical: 10,
        borderRadius: 8,
        gap: 6,
    },
    deleteText: {
        color: '#dc2626',
        fontWeight: '600',
        fontSize: 14,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
    },
    formContent: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
        marginTop: 12,
    },
    input: {
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
    },
    suggestions: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        marginTop: 4,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        gap: 10,
    },
    suggestionText: {
        fontSize: 14,
        color: '#1e293b',
        fontWeight: '500',
    },
    readOnlyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        gap: 8,
    },
    readOnlyText: {
        fontSize: 16,
        color: '#64748b',
        fontWeight: '600',
    },
    modalFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 40,
        paddingTop: 10,
        gap: 15,
    },
    cancelLink: {
        padding: 10,
    },
    cancelText: {
        color: '#6b7280',
        fontWeight: '600',
    },
    submitBtn: {
        flex: 1,
        backgroundColor: '#2563eb',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    submitBtnText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 16,
    },
});

export default InventoryScreen;

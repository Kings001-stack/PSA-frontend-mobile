import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Modal,
    ScrollView,
    TextInput,
    Alert,
    Image,
    Platform,
    KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import * as ImagePicker from 'expo-image-picker';

interface Advert {
    id: number;
    title: string;
    description: string;
    image_path: string | null;
    start_date: string;
    end_date: string;
    is_active: boolean;
    created_at: string;
}

const AdvertManagementScreen: React.FC = () => {
    const { user } = useContext(AuthContext);
    const router = useRouter();
    const [adverts, setAdverts] = useState<Advert[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedAdvert, setSelectedAdvert] = useState<Advert | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        is_active: true,
    });

    const fetchAdverts = async (isRefresh = false) => {
        if (isRefresh) setIsRefreshing(true);
        else setIsLoading(true);

        try {
            const response = await api.get('/admin/adverts');
            setAdverts(response.data);
        } catch (error) {
            console.error('Failed to fetch adverts', error);
            Alert.alert('Error', 'Failed to load adverts');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchAdverts();
        }
    }, [user]);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please grant camera roll permissions');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    const handleAdd = () => {
        setSelectedAdvert(null);
        setIsEditing(false);
        setSelectedImage(null);
        setFormData({
            title: '',
            description: '',
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            is_active: true,
        });
        setIsModalVisible(true);
    };

    const handleEdit = (advert: Advert) => {
        setSelectedAdvert(advert);
        setIsEditing(true);
        setSelectedImage(advert.image_path ? `http://192.168.43.177:8082/storage/${advert.image_path}` : null);
        setFormData({
            title: advert.title,
            description: advert.description || '',
            start_date: advert.start_date.split('T')[0],
            end_date: advert.end_date.split('T')[0],
            is_active: advert.is_active,
        });
        setIsModalVisible(true);
    };

    const handleDelete = (id: number) => {
        Alert.alert(
            "Delete Advert",
            "Are you sure you want to delete this advert?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await api.delete(`/admin/adverts/${id}`);
                            fetchAdverts();
                            Alert.alert('Success', 'Advert deleted successfully');
                        } catch (error) {
                            Alert.alert("Error", "Failed to delete advert");
                        }
                    }
                }
            ]
        );
    };

    const handleSubmit = async () => {
        if (!formData.title.trim()) {
            Alert.alert("Missing Fields", "Please enter a title");
            return;
        }

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('start_date', formData.start_date);
            formDataToSend.append('end_date', formData.end_date);
            formDataToSend.append('is_active', formData.is_active ? '1' : '0');

            if (selectedImage && !selectedImage.includes('http')) {
                const uriParts = selectedImage.split('.');
                const fileType = uriParts[uriParts.length - 1];

                formDataToSend.append('image', {
                    uri: selectedImage,
                    name: `advert.${fileType}`,
                    type: `image/${fileType}`,
                } as any);
            }

            if (isEditing) {
                formDataToSend.append('_method', 'PATCH');
            }

            if (isEditing && selectedAdvert) {
                await api.post(`/admin/adverts/${selectedAdvert.id}`, formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } else {
                await api.post('/admin/adverts', formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }

            setIsModalVisible(false);
            fetchAdverts();
            Alert.alert('Success', `Advert ${isEditing ? 'updated' : 'created'} successfully`);
        } catch (error: any) {
            console.error('Submit error:', error);
            Alert.alert("Error", error.response?.data?.message || "Failed to save advert");
        }
    };

    const getStatusColor = (advert: Advert) => {
        if (!advert.is_active) return { bg: '#fee2e2', text: '#dc2626', label: 'INACTIVE' };

        const now = new Date();
        const start = new Date(advert.start_date);
        const end = new Date(advert.end_date);

        if (now < start) return { bg: '#fef3c7', text: '#d97706', label: 'SCHEDULED' };
        if (now > end) return { bg: '#fee2e2', text: '#dc2626', label: 'EXPIRED' };
        return { bg: '#dcfce7', text: '#16a34a', label: 'ACTIVE' };
    };

    const renderAdvert = ({ item }: { item: Advert }) => {
        const status = getStatusColor(item);

        return (
            <View style={styles.advertCard}>
                {item.image_path && (
                    <Image
                        source={{ uri: `http://192.168.43.177:8082/storage/${item.image_path}` }}
                        style={styles.advertImage}
                        resizeMode="cover"
                    />
                )}
                <View style={styles.advertContent}>
                    <View style={styles.advertHeader}>
                        <Text style={styles.advertTitle}>{item.title}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                            <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
                        </View>
                    </View>
                    {item.description && (
                        <Text style={styles.advertDescription} numberOfLines={2}>{item.description}</Text>
                    )}
                    <View style={styles.dateRow}>
                        <View style={styles.dateItem}>
                            <Ionicons name="calendar-outline" size={14} color="#6b7280" />
                            <Text style={styles.dateText}>
                                {new Date(item.start_date).toLocaleDateString()} - {new Date(item.end_date).toLocaleDateString()}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.editBtn} onPress={() => handleEdit(item)}>
                            <Ionicons name="pencil" size={16} color="#1d4ed8" />
                            <Text style={styles.editText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                            <Ionicons name="trash" size={16} color="#dc2626" />
                            <Text style={styles.deleteText}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#1d4ed8" />
                <Text style={styles.loadingText}>Loading adverts...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#1f2937" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Adverts</Text>
                </View>
                <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
                    <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={adverts}
                renderItem={renderAdvert}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.list}
                onRefresh={fetchAdverts}
                refreshing={isRefreshing}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="megaphone-outline" size={48} color="#d1d5db" />
                        <Text style={styles.emptyText}>No adverts yet</Text>
                        <Text style={styles.emptySubtext}>Create your first promotional advert</Text>
                    </View>
                }
            />

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
                            <Text style={styles.modalTitle}>{isEditing ? 'Edit Advert' : 'Create Advert'}</Text>
                            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.formContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                            <Text style={styles.label}>Title *</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.title}
                                onChangeText={(text) => setFormData({ ...formData, title: text })}
                                placeholder="e.g., 20% Off All Vitamins"
                                placeholderTextColor="#9ca3af"
                            />

                            <Text style={styles.label}>Description</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={formData.description}
                                onChangeText={(text) => setFormData({ ...formData, description: text })}
                                placeholder="Add details about your offer..."
                                placeholderTextColor="#9ca3af"
                                multiline
                                numberOfLines={4}
                            />

                            <Text style={styles.label}>Image</Text>
                            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                                {selectedImage ? (
                                    <Image source={{ uri: selectedImage }} style={styles.previewImage} />
                                ) : (
                                    <View style={styles.imagePickerContent}>
                                        <Ionicons name="image-outline" size={32} color="#9ca3af" />
                                        <Text style={styles.imagePickerText}>Tap to select image</Text>
                                    </View>
                                )}
                            </TouchableOpacity>

                            <Text style={styles.label}>Start Date</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.start_date}
                                onChangeText={(text) => setFormData({ ...formData, start_date: text })}
                                placeholder="YYYY-MM-DD"
                            />

                            <Text style={styles.label}>End Date</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.end_date}
                                onChangeText={(text) => setFormData({ ...formData, end_date: text })}
                                placeholder="YYYY-MM-DD"
                            />

                            <TouchableOpacity
                                style={styles.toggleRow}
                                onPress={() => setFormData({ ...formData, is_active: !formData.is_active })}
                            >
                                <Text style={styles.label}>Active</Text>
                                <View style={[styles.toggle, formData.is_active && styles.toggleActive]}>
                                    <View style={[styles.toggleThumb, formData.is_active && styles.toggleThumbActive]} />
                                </View>
                            </TouchableOpacity>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsModalVisible(false)}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                                <Text style={styles.submitText}>{isEditing ? 'Update' : 'Create'}</Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        color: '#6b7280',
        fontSize: 14,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 15,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#111827',
    },
    backBtn: {
        padding: 4,
    },
    addBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: '#1d4ed8',
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        padding: 20,
        paddingBottom: 40,
    },
    advertCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    advertImage: {
        width: '100%',
        height: 180,
        backgroundColor: '#f3f4f6',
    },
    advertContent: {
        padding: 16,
    },
    advertHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    advertTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginRight: 12,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
    },
    advertDescription: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 12,
        lineHeight: 20,
    },
    dateRow: {
        marginBottom: 12,
    },
    dateItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dateText: {
        fontSize: 13,
        color: '#6b7280',
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    editBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#dbeafe',
        paddingVertical: 10,
        borderRadius: 8,
        gap: 6,
    },
    editText: {
        color: '#1d4ed8',
        fontWeight: '600',
        fontSize: 14,
    },
    deleteBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fee2e2',
        paddingVertical: 10,
        borderRadius: 8,
        gap: 6,
    },
    deleteText: {
        color: '#dc2626',
        fontWeight: '600',
        fontSize: 14,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 60,
    },
    emptyText: {
        marginTop: 12,
        color: '#9ca3af',
        fontSize: 16,
        fontWeight: '600',
    },
    emptySubtext: {
        marginTop: 4,
        color: '#d1d5db',
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
        maxHeight: '90%',
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
        color: '#111827',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    imagePicker: {
        height: 180,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e5e7eb',
        borderStyle: 'dashed',
        overflow: 'hidden',
    },
    imagePickerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
    },
    imagePickerText: {
        marginTop: 8,
        color: '#9ca3af',
        fontSize: 14,
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
    },
    toggle: {
        width: 50,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#e5e7eb',
        padding: 2,
    },
    toggleActive: {
        backgroundColor: '#1d4ed8',
    },
    toggleThumb: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'white',
    },
    toggleThumbActive: {
        transform: [{ translateX: 22 }],
    },
    modalFooter: {
        flexDirection: 'row',
        gap: 12,
        paddingBottom: 40,
        paddingTop: 10,
    },
    cancelBtn: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        alignItems: 'center',
    },
    cancelText: {
        color: '#6b7280',
        fontWeight: '600',
        fontSize: 16,
    },
    submitBtn: {
        flex: 1,
        backgroundColor: '#1d4ed8',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    submitText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 16,
    },
});

export default AdvertManagementScreen;

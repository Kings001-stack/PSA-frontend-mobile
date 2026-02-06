import React, { useState, useEffect, useRef, useContext } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    ActivityIndicator,
    Keyboard,
    Linking,
    StatusBar
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

interface Message {
    id: string;
    text: string;
    isUser: boolean;
    role?: 'user' | 'assistant' | 'system';
    isError?: boolean;
    timestamp: Date;
    escalate?: boolean;
    phone?: string;
}

const ChatScreen: React.FC = () => {
    const { user } = useContext(AuthContext);
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState<string>('');
    const [isTyping, setIsTyping] = useState<boolean>(false);
    const [isEscalated, setIsEscalated] = useState<boolean>(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        // Initial welcome message
        const welcome: Message = {
            id: 'welcome',
            text: `Hello ${user?.name || 'there'}! I'm your MediCare assistant. How can I help you regarding medications or our services today?`,
            isUser: false,
            role: 'assistant',
            timestamp: new Date(),
        };
        setMessages([welcome]);
    }, []);

    const sendMessage = async () => {
        if (!inputText.trim() || isTyping) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: inputText,
            isUser: true,
            role: 'user',
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsTyping(true);
        // Dismiss keyboard on send
        // Keyboard.dismiss();

        try {
            const response = await api.post('/chat/send', {
                message: userMsg.text,
                session_id: sessionId
            });

            const { message, session_id, escalate, phone } = response.data;

            if (!sessionId) setSessionId(session_id);
            if (escalate) setIsEscalated(true);

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: message,
                isUser: false,
                role: escalate ? 'system' : 'assistant',
                timestamp: new Date(),
                escalate: escalate,
                phone: phone,
            };
            setMessages(prev => [...prev, aiMsg]);

        } catch (error: any) {
            console.error(error);
            const serverMessage = error.response?.data?.message;
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: serverMessage || "I'm having trouble connecting to the medical database. Please check your connection and try again.",
                isUser: false,
                isError: true,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    const renderMessage = ({ item }: { item: Message }) => {
        const isSystem = item.role === 'system';

        return (
            <View style={[
                styles.messageRow,
                item.isUser ? styles.userRow : styles.aiRow
            ]}>
                {!item.isUser && (
                    <View style={[styles.avatar, isSystem && styles.systemAvatar]}>
                        <Ionicons
                            name={isSystem ? "alert-circle" : "medical"}
                            size={16}
                            color="white"
                        />
                    </View>
                )}
                <View style={[
                    styles.bubble,
                    item.isUser ? styles.userBubble : styles.aiBubble,
                    isSystem && styles.systemBubble,
                    item.isError && styles.errorBubble
                ]}>
                    {isSystem && <Text style={styles.systemHeader}>IMPORTANT GUIDANCE</Text>}
                    <Text style={[
                        styles.msgText,
                        item.isUser ? styles.userText : styles.aiText,
                        isSystem && styles.systemText
                    ]}>
                        {item.text}
                    </Text>
                    <Text style={[
                        styles.timeText,
                        item.isUser ? styles.userTime : styles.aiTime
                    ]}>
                        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>

                    {item.escalate && item.phone && (
                        <TouchableOpacity
                            style={styles.callButton}
                            onPress={() => Linking.openURL(`tel:${item.phone}`)}
                        >
                            <Ionicons name="call" size={18} color="white" />
                            <Text style={styles.callButtonText}>Call Pharmacist</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* Premium Header */}
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.backBtn}
                    >
                        <Ionicons name="chevron-back" size={22} color="white" />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <View style={styles.headerIcon}>
                            <Ionicons name="chatbubbles" size={20} color="white" />
                        </View>
                        <View>
                            <Text style={styles.headerTitle}>Pharmacy Assistant</Text>
                            <View style={styles.statusBadge}>
                                <View style={styles.statusDot} />
                                <Text style={styles.statusText}>AI Online</Text>
                            </View>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.moreBtn}>
                        <Ionicons name="ellipsis-vertical" size={18} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            {isTyping && (
                <View style={styles.typingContainer}>
                    <Text style={styles.typingText}>Pharmacist Assistant is thinking...</Text>
                </View>
            )}

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 20}
            >
                {isEscalated ? (
                    <View style={styles.escalatedNotice}>
                        <Ionicons name="lock-closed" size={16} color="#4b5563" />
                        <Text style={styles.escalatedNoticeText}>
                            Chat paused. Please contact us via phone for further assistance.
                        </Text>
                    </View>
                ) : (
                    <View style={styles.inputBar}>
                        <TextInput
                            style={styles.input}
                            value={inputText}
                            onChangeText={setInputText}
                            placeholder="Type your question..."
                            placeholderTextColor="#9ca3af"
                            multiline
                        />
                        <TouchableOpacity
                            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
                            onPress={sendMessage}
                            disabled={!inputText.trim() || isTyping}
                        >
                            <Ionicons name="send" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                )}
            </KeyboardAvoidingView>
            <View style={{ height: insets.bottom }} />
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
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.2,
        shadowRadius: 18,
        elevation: 12,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 10 : 20,
    },
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitleContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 12,
        gap: 10,
    },
    headerIcon: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: 'white',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#10b981',
    },
    statusText: {
        fontSize: 10,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.7)',
    },
    moreBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        padding: 16,
        paddingBottom: 24,
    },
    messageRow: {
        flexDirection: 'row',
        marginBottom: 16,
        alignItems: 'flex-end',
    },
    userRow: {
        justifyContent: 'flex-end',
    },
    aiRow: {
        justifyContent: 'flex-start',
    },
    avatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#2563eb',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
        marginBottom: 4,
    },
    systemAvatar: {
        backgroundColor: '#ea580c',
    },
    bubble: {
        padding: 12,
        borderRadius: 20,
        maxWidth: '75%',
    },
    userBubble: {
        backgroundColor: '#2563eb',
        borderBottomRightRadius: 4,
    },
    aiBubble: {
        backgroundColor: '#ffffff',
        borderBottomLeftRadius: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    systemBubble: {
        backgroundColor: '#fff7ed',
        borderColor: '#fdba74',
        borderWidth: 1,
    },
    errorBubble: {
        backgroundColor: '#fee2e2',
        borderColor: '#fecaca',
        borderWidth: 1,
    },
    systemHeader: {
        fontSize: 10,
        fontWeight: '800',
        color: '#ea580c',
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    msgText: {
        fontSize: 15,
        lineHeight: 20,
    },
    userText: {
        color: '#ffffff',
    },
    aiText: {
        color: '#1f2937',
    },
    systemText: {
        color: '#9a3412',
        fontWeight: '500',
    },
    timeText: {
        fontSize: 10,
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    userTime: {
        color: '#dbeafe',
    },
    aiTime: {
        color: '#9ca3af',
    },
    typingContainer: {
        paddingHorizontal: 20,
        paddingVertical: 8,
    },
    typingText: {
        fontSize: 12,
        color: '#6b7280',
        fontStyle: 'italic',
    },
    inputBar: {
        flexDirection: 'row',
        padding: 12,
        backgroundColor: 'white',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    input: {
        flex: 1,
        backgroundColor: '#f3f4f6',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 15,
        maxHeight: 100,
        color: '#111827',
    },
    sendBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#2563eb',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
    },
    sendBtnDisabled: {
        backgroundColor: '#93c5fd',
    },
    callButton: {
        flexDirection: 'row',
        backgroundColor: '#2563eb',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        gap: 8,
    },
    callButtonText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 14,
    },
    escalatedNotice: {
        backgroundColor: '#f9fafb',
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        gap: 8,
    },
    escalatedNoticeText: {
        color: '#4b5563',
        fontSize: 13,
        fontWeight: '500',
    },
});

export default ChatScreen;

import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    Dimensions,
    ScrollView,
    TouchableOpacity,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

interface Advert {
    id: number;
    title: string;
    description: string;
    image_path: string | null;
    start_date: string;
    end_date: string;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;

const AdvertCarousel: React.FC = () => {
    const [adverts, setAdverts] = useState<Advert[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollViewRef = useRef<ScrollView>(null);
    const fadeAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        fetchAdverts();
    }, []);

    useEffect(() => {
        if (adverts.length > 1) {
            const interval = setInterval(() => {
                Animated.sequence([
                    Animated.timing(fadeAnim, {
                        toValue: 0.7,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(fadeAnim, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                ]).start();

                setCurrentIndex((prevIndex) => {
                    const nextIndex = (prevIndex + 1) % adverts.length;
                    scrollViewRef.current?.scrollTo({
                        x: nextIndex * (CARD_WIDTH + 16),
                        animated: true,
                    });
                    return nextIndex;
                });
            }, 5000);

            return () => clearInterval(interval);
        }
    }, [adverts.length, fadeAnim]);

    const fetchAdverts = async () => {
        try {
            const response = await api.get('/adverts');
            setAdverts(response.data);
        } catch (error) {
            console.error('Failed to fetch adverts', error);
        }
    };

    if (adverts.length === 0) {
        return null;
    }

    const handleScroll = (event: any) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(contentOffsetX / (CARD_WIDTH + 16));
        setCurrentIndex(index);
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <View style={styles.headerLeft}>
                    <Ionicons name="megaphone" size={20} color="#eab308" />
                    <Text style={styles.sectionTitle}>Special Offers</Text>
                </View>
                <View style={styles.indicatorContainer}>
                    {adverts.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.indicator,
                                index === currentIndex && styles.indicatorActive,
                            ]}
                        />
                    ))}
                </View>
            </View>

            <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled={false}
                showsHorizontalScrollIndicator={false}
                snapToInterval={CARD_WIDTH + 16}
                decelerationRate="fast"
                contentContainerStyle={styles.scrollContent}
                onScroll={handleScroll}
                scrollEventThrottle={16}
            >
                {adverts.map((advert, index) => (
                    <Animated.View
                        key={advert.id}
                        style={[
                            styles.advertCard,
                            { opacity: index === currentIndex ? fadeAnim : 0.6 },
                        ]}
                    >
                        {advert.image_path ? (
                            <Image
                                source={{ uri: `http://192.168.43.177:8082/storage/${advert.image_path}` }}
                                style={styles.advertImage}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={styles.placeholderImage}>
                                <Ionicons name="image-outline" size={48} color="#d1d5db" />
                            </View>
                        )}
                        <View style={styles.gradientOverlay} />
                        <View style={styles.contentOverlay}>
                            <View style={styles.badge}>
                                <Ionicons name="star" size={12} color="#eab308" />
                                <Text style={styles.badgeText}>SPECIAL OFFER</Text>
                            </View>
                            <Text style={styles.advertTitle}>{advert.title}</Text>
                            {advert.description && (
                                <Text style={styles.advertDescription} numberOfLines={2}>
                                    {advert.description}
                                </Text>
                            )}
                            <View style={styles.dateRow}>
                                <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.8)" />
                                <Text style={styles.dateText}>
                                    Valid until {new Date(advert.end_date).toLocaleDateString()}
                                </Text>
                            </View>
                        </View>
                    </Animated.View>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    indicatorContainer: {
        flexDirection: 'row',
        gap: 6,
    },
    indicator: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#d1d5db',
    },
    indicatorActive: {
        backgroundColor: '#eab308',
        width: 20,
    },
    scrollContent: {
        paddingHorizontal: 20,
        gap: 16,
    },
    advertCard: {
        width: CARD_WIDTH,
        height: 200,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#1d4ed8',
        shadowColor: '#1d4ed8',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 10,
    },
    advertImage: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    placeholderImage: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        backgroundColor: '#1d4ed8',
        justifyContent: 'center',
        alignItems: 'center',
    },
    gradientOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '70%',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    contentOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(234, 179, 8, 0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#eab308',
        marginBottom: 8,
        gap: 4,
    },
    badgeText: {
        color: '#fef3c7',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    advertTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: 'white',
        marginBottom: 6,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    advertDescription: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: 8,
        lineHeight: 20,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dateText: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '500',
    },
});

export default AdvertCarousel;

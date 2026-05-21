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
import api, { STORAGE_URL } from '../services/api';

interface Advert {
    id: number;
    title: string;
    description: string;
    image_path: string | null;
    image_url: string | null;
    start_date: string;
    end_date: string;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;
const GAP = 12;

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
                        duration: 400,
                        useNativeDriver: true,
                    }),
                    Animated.timing(fadeAnim, {
                        toValue: 1,
                        duration: 400,
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
            }, 6000);

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
        const index = Math.round(contentOffsetX / (CARD_WIDTH + GAP));
        setCurrentIndex(index);
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <View style={styles.headerLeft}>
                    <View style={styles.titleIconBg}>
                        <Ionicons name="megaphone" size={16} color="white" />
                    </View>
                    <Text style={styles.sectionTitle}>Exclusive Offers</Text>
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
                snapToInterval={CARD_WIDTH + GAP}
                snapToAlignment="center"
                decelerationRate="fast"
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingHorizontal: (width - CARD_WIDTH) / 2 }
                ]}
                onScroll={handleScroll}
                scrollEventThrottle={16}
            >
                {adverts.map((advert, index) => (
                    <Animated.View
                        key={advert.id}
                        style={[
                            styles.advertCard,
                            {
                                opacity: index === currentIndex ? fadeAnim : 0.4,
                                transform: [{ scale: index === currentIndex ? 1 : 0.96 }]
                            },
                        ]}
                    >
                        {advert.image_url || advert.image_path ? (
                            <Image
                                source={{ uri: advert.image_url || `${STORAGE_URL}/${advert.image_path}` }}
                                style={styles.advertImage}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={styles.placeholderImage}>
                                <Ionicons name="sparkles" size={64} color="rgba(255,255,255,0.2)" />
                            </View>
                        )}
                        <View style={styles.gradientOverlay} />
                        <View style={styles.contentOverlay}>
                            <View style={styles.badge}>
                                <Ionicons name="flash" size={12} color="#fbbf24" />
                                <Text style={styles.badgeText}>LIMITED TIME</Text>
                            </View>
                            <Text style={styles.advertTitle} numberOfLines={1}>{advert.title}</Text>
                            {advert.description && (
                                <Text style={styles.advertDescription} numberOfLines={2}>
                                    {advert.description}
                                </Text>
                            )}
                            <View style={styles.footerRow}>
                                <View style={styles.dateRow}>
                                    <Ionicons name="stopwatch-outline" size={14} color="rgba(255,255,255,0.7)" />
                                    <Text style={styles.dateText}>
                                        Ends {new Date(advert.end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </Text>
                                </View>
                                <TouchableOpacity style={styles.viewBtn}>
                                    <Text style={styles.viewBtnText}>Details</Text>
                                </TouchableOpacity>
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
        marginBottom: 32,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    titleIconBg: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: '#f59e0b',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#f59e0b',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1e293b',
        letterSpacing: -0.5,
    },
    indicatorContainer: {
        flexDirection: 'row',
        gap: 4,
    },
    indicator: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#cbd5e1',
    },
    indicatorActive: {
        backgroundColor: '#f59e0b',
        width: 16,
    },
    scrollContent: {
        paddingBottom: 10,
    },
    advertCard: {
        width: CARD_WIDTH,
        height: 180,
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: '#1e3a8a',
        shadowColor: '#1e3a8a',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 15,
        elevation: 8,
        marginRight: GAP,
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
        backgroundColor: '#1e3a8a',
        justifyContent: 'center',
        alignItems: 'center',
    },
    gradientOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '80%',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    contentOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(251, 191, 36, 0.15)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(251, 191, 36, 0.3)',
        marginBottom: 10,
        gap: 4,
    },
    badgeText: {
        color: '#fbbf24',
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 1,
    },
    advertTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: 'white',
        marginBottom: 4,
        letterSpacing: -0.5,
    },
    advertDescription: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 12,
        lineHeight: 18,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dateText: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.7)',
        fontWeight: '600',
    },
    viewBtn: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    viewBtnText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '700',
    },
});

export default AdvertCarousel;

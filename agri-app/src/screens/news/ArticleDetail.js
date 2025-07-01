import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Share,
    ScrollView,
    SafeAreaView,
    StatusBar,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SwiperFlatList from 'react-native-swiper-flatlist';

// Format date function
const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return dateString; // Return original if invalid
    }

    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
};

const ArticleDetail = ({ route, navigation }) => {
    const { data, initialIndex, section } = route.params;
    const [imageError, setImageError] = useState({});

    // Handle sharing article
    const handleShare = async (item) => {
        try {
            await Share.share({
                message: `${item.title}\n\n${item.description}\n\nShared from PreciAgri App`,
                title: item.title,
            });
        } catch (error) {
            console.error('Error sharing article:', error.message);
        }
    };

    // Render each article
    const renderArticle = ({ item, index }) => {
        return (
            <SafeAreaView style={styles.safeArea}>
                <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                    {/* Header with navigation and share */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="arrow-back" size={24} color="#388e3c" />
                        </TouchableOpacity>

                        <Text style={styles.headerTitle} numberOfLines={1}>
                            {section === 'news' ? 'News Article' : 'Scheme Details'}
                        </Text>

                        <TouchableOpacity
                            style={styles.shareIconButton}
                            onPress={() => handleShare(item)}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="share-social-outline" size={22} color="#388e3c" />
                        </TouchableOpacity>
                    </View>

                    {/* Article Content */}
                    <View style={styles.contentContainer}>
                        <Text style={styles.title}>{item.title}</Text>

                        <View style={styles.metaInfo}>
                            <View style={styles.sourceContainer}>
                                <Ionicons name="newspaper-outline" size={14} color="#6e8b3d" />
                                <Text style={styles.source}>{item.source}</Text>
                            </View>

                            <View style={styles.dateContainer}>
                                <Ionicons name="calendar-outline" size={14} color="#6e8b3d" />
                                <Text style={styles.date}>{formatDate(item.date)}</Text>
                            </View>
                        </View>

                        {/* Image with loading and error handling */}
                        {item.image && !imageError[index] && (
                            <View style={styles.imageContainer}>
                                <Image
                                    source={{ uri: item.image }}
                                    style={styles.image}
                                    onError={() => {
                                        setImageError(prev => ({
                                            ...prev,
                                            [index]: true
                                        }));
                                    }}
                                    // defaultSource={require('../assets/images/placeholder/news.png')}
                                    resizeMode="cover"
                                    loadingIndicatorSource={
                                        <View style={styles.imageLoading}>
                                            <ActivityIndicator color="#388e3c" />
                                        </View>
                                    }
                                />
                            </View>
                        )}

                        <Text style={styles.description}>{item.description}</Text>

                        {/* Share button at bottom */}
                        <TouchableOpacity
                            style={styles.shareButton}
                            onPress={() => handleShare(item)}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="share-social-outline" size={20} color="white" />
                            <Text style={styles.shareButtonText}>Share this article</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    };

    return (
        <View style={styles.swiperContainer}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <SwiperFlatList
                data={data}
                renderItem={renderArticle}
                index={initialIndex}
                showPagination
                PaginationComponent={({ size, paginationIndex, scrollToIndex }) => (
                    <View style={styles.pagination}>
                        {Array.from({ length: size }).map((_, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.paginationDot,
                                    paginationIndex === index && styles.paginationDotActive
                                ]}
                                onPress={() => scrollToIndex({ index })}
                            />
                        ))}
                    </View>
                )}
            />
        </View>
    );
};

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    swiperContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        width,
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        backgroundColor: '#fff',
        elevation: 2,
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#f0f8f1',
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        color: '#2f4f2f',
        marginLeft: 10,
    },
    shareIconButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#f0f8f1',
    },
    contentContainer: {
        padding: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2f4f2f',
        marginBottom: 12,
        lineHeight: 28,
    },
    metaInfo: {
        flexDirection: 'row',
        marginBottom: 16,
        flexWrap: 'wrap',
    },
    sourceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
        marginBottom: 4,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    source: {
        fontSize: 14,
        color: '#6e8b3d',
        marginLeft: 4,
        fontWeight: '500',
    },
    date: {
        fontSize: 14,
        color: '#6e8b3d',
        marginLeft: 4,
    },
    imageContainer: {
        width: '100%',
        height: 220,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 16,
        backgroundColor: '#f5f5f5',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imageLoading: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        color: '#333',
        marginBottom: 20,
    },
    shareButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#388e3c',
        padding: 14,
        borderRadius: 8,
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    shareButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 10,
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ccc',
        margin: 4,
    },
    paginationDotActive: {
        backgroundColor: '#388e3c',
        width: 10,
        height: 10,
        borderRadius: 5,
    },
});

export default ArticleDetail;
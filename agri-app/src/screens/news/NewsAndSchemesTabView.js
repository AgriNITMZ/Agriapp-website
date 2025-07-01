import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CustomTopBar from '../../components/topBar/CustomTopBar';
import customFetch from '../../utils/axios';

// Function to format date to relative time
const formatRelativeDate = (dateString) => {
    const currentDate = new Date();
    const articleDate = new Date(dateString);

    const diffTime = Math.abs(currentDate - articleDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return 'Today';
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays <= 7) {
        return `${diffDays}d ago`;
    } else {
        // Format the date as DD/MM/YYYY for dates more than a week old
        return articleDate.toLocaleDateString();
    }
};

const ArticleList = ({ data, section }) => {
    const navigation = useNavigation();

    const [imageErrors, setImageErrors] = useState({});

    const handleError = (id) => {
        setImageErrors((prevErrors) => ({ ...prevErrors, [id]: true }));
    };
    // Handle empty state
    if (data.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No {section} available at the moment</Text>
            </View>
        );
    }

    const renderItem = ({ item }) => (
        <TouchableOpacity
            onPress={() =>
                navigation.navigate('ArticleDetail', { data: data, section: section, initialIndex: data.indexOf(item) })
            }
            style={styles.articleContainer}
        >
            <Image
                source={
                    imageErrors[item.id]
                        ? require('../../assets/images/placeholder/news.png')
                        : { uri: item.image }
                }
                style={styles.articleImage}
            // onError={() => handleError(item.id)}
            />
            <View style={styles.articleTextContainer}>
                <Text style={styles.articleTitle}>{item.title}</Text>
                <Text style={styles.articleDate}>
                    {formatRelativeDate(item.date)} • {item.source}
                </Text>
                <Text style={styles.articleDescription}>
                    {item.description && item.description.length > 70
                        ? `${item.description.substring(0, 70)}...`
                        : item.description}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return <FlatList
        data={data}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
    />;
};

export default function NewsAndSchemesTabView({ navigation }) {
    const [activeTab, setActiveTab] = useState('news');
    const [newsData, setNewsData] = useState([]);
    const [schemesData, setSchemesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch data from API
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                // Fetch news data
                const newsResponse = await customFetch.get('/news');
                if (newsResponse.data.success && Array.isArray(newsResponse.data.data)) {

                    setNewsData(newsResponse.data.data);
                } else {
                    // console.log('Invalid news data format:', newsResponse);
                    setNewsData([]);
                }

                // Fetch schemes data
                const schemesResponse = await customFetch.get('/scheme');
                if (schemesResponse.data.success && Array.isArray(schemesResponse.data.data)) {
                    setSchemesData(schemesResponse.data.data);
                } else {
                    // console.log('Invalid schemes data format:', schemesResponse);
                    setSchemesData([]);
                }
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Display loading indicator
    if (loading) {
        return (
            <View style={styles.container}>
                <CustomTopBar navigation={navigation} title={"Articles"} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#388e3c" />
                    <Text style={styles.loadingText}>Loading articles...</Text>
                </View>
            </View>
        );
    }

    // Display error message
    if (error) {
        return (
            <View style={styles.container}>
                <CustomTopBar navigation={navigation} title={"Articles"} />
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => {
                            setLoading(true);
                            setError(null);
                            fetchData();
                        }}
                    >
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const renderContent = () => {
        if (activeTab === 'news') return <ArticleList data={newsData} section="news" />;
        if (activeTab === 'schemes') return <ArticleList data={schemesData} section="schemes" />;
    };

    return (
        <View style={styles.container}>
            <CustomTopBar navigation={navigation} title={"Articles"} />
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'news' && styles.activeTab]}
                    onPress={() => setActiveTab('news')}
                >
                    <Text style={[styles.tabText, activeTab === 'news' && styles.activeTabText]}>
                        News
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'schemes' && styles.activeTab]}
                    onPress={() => setActiveTab('schemes')}
                >
                    <Text style={[styles.tabText, activeTab === 'schemes' && styles.activeTabText]}>
                        Schemes
                    </Text>
                </TouchableOpacity>
            </View>
            {renderContent()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#d4edda',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    tab: {
        flex: 1,
        padding: 15,
        alignItems: 'center',
    },
    activeTab: {
        borderBottomWidth: 3,
        borderBottomColor: '#388e3c',
    },
    tabText: {
        fontSize: 16,
        color: '#2f4f2f',
    },
    activeTabText: {
        fontWeight: 'bold',
        color: '#388e3c',
    },
    articleContainer: {
        flexDirection: 'row',
        padding: 10,
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        marginHorizontal: 10,
        marginVertical: 8,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    articleImage: {
        width: 80,
        height: 100,
        borderRadius: 10,
        marginRight: 10,
    },
    articleTextContainer: {
        flex: 1,
    },
    articleTitle: {
        fontWeight: 'bold',
        fontSize: 14,
        color: '#2f4f2f',
        marginBottom: 5,
    },
    articleDate: {
        color: '#6e8b3d',
        fontSize: 12,
        marginBottom: 5,
    },
    articleDescription: {
        color: '#555',
        fontSize: 13,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#388e3c',
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: '#d32f2f',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: '#388e3c',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        color: '#666',
        fontSize: 16,
        textAlign: 'center',
    },
});
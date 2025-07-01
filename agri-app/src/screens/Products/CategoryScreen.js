import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native';
import customFetch from '../../utils/axios';
import CustomTopBar from '../../components/topBar/CustomTopBar';
import ErrorView from '../../components/ErrorView';

/**
 * CategoryScreen displays a list of product categories and their subcategories
 * Features:
 * - Left sidebar for main category navigation
 * - Right panel for subcategory display with images
 * - Loading state handling
 * - Error state handling with retry functionality
 */
const CategoryScreen = ({ navigation }) => {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch categories on component mount
    useEffect(() => {
        fetchCategories();
    }, []);

    // Function to fetch category data from API
    const fetchCategories = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await customFetch.get('/products/getcategorylist');
            if (response && response.data.data) {
                setCategories(response.data.data);
                // Set the first category as selected by default
                if (response.data.data.length > 0) {
                    setSelectedCategory(response.data.data[0]);
                }
            } else {
                throw new Error('Invalid response format');
            }
        } catch (err) {
            console.error('Error fetching categories:', err);
            setError(err.message || 'Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    // Handle category selection
    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
    };

    // Render loading state
    if (loading) {
        return (
            <>
                <CustomTopBar navigation={navigation} title="Categories" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2E7D32" />
                    <Text style={styles.loadingText}>Loading categories...</Text>
                </View>
            </>
        );
    }

    // Render error state
    if (error) {
        return (
            <>
                <CustomTopBar navigation={navigation} title="Categories" />
                <ErrorView
                    message={`Couldn't load categories: ${error}`}
                    onRetry={fetchCategories}
                />
            </>
        );
    }

    // Render empty state
    if (categories.length === 0) {
        return (
            <>
                <CustomTopBar navigation={navigation} title="Categories" />
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No categories found</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchCategories}>
                        <Text style={styles.retryButtonText}>Refresh</Text>
                    </TouchableOpacity>
                </View>
            </>
        );
    }

    return (
        <>
            <CustomTopBar navigation={navigation} title="Categories" />

            <View style={styles.container}>
                {/* Sidebar - Main Categories */}
                <View style={styles.sidebar}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {categories.map((category) => (
                            <TouchableOpacity
                                key={category._id}
                                style={[
                                    styles.sidebarItem,
                                    selectedCategory?._id === category._id && styles.sidebarItemSelected,
                                ]}
                                onPress={() => handleCategorySelect(category)}
                                activeOpacity={0.7}
                            >
                                <Image
                                    source={{ uri: category.image }}
                                    style={styles.categoryImage}
                                    defaultSource={require('../../assets/images/placeholder/product.png')}
                                />
                                <Text
                                    style={[
                                        styles.sidebarItemText,
                                        selectedCategory?._id === category._id && styles.sidebarItemTextSelected,
                                    ]}
                                    numberOfLines={2}
                                >
                                    {category.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Main Content - Subcategories */}
                <View style={styles.mainContent}>
                    <Text style={styles.mainCategoryTitle}>{selectedCategory?.name}</Text>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.subcategoriesContainer}>
                            {selectedCategory?.subcategories?.map((subcategory) => (
                                <TouchableOpacity
                                    key={subcategory._id}
                                    style={styles.subcategoryItem}
                                    onPress={() => navigation.navigate('Shop', {
                                        subcategory: subcategory._id
                                    })}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.subcategoryImageContainer}>
                                        <Image
                                            source={{ uri: subcategory.image }}
                                            style={styles.subcategoryImage}
                                            defaultSource={require('../../assets/images/placeholder/product.png')}
                                        />
                                    </View>
                                    <Text style={styles.subcategoryLabel} numberOfLines={2}>
                                        {subcategory.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </View>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
    },
    // Loading state styles
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#555555',
    },
    // Error state styles
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        color: '#555555',
        marginBottom: 20,
    },
    retryButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: '#2E7D32',
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    // Sidebar styles
    sidebar: {
        width: '28%',
        backgroundColor: '#F6F8FA',
        borderRightWidth: 1,
        borderRightColor: '#E0E0E0',
        elevation: 2,
    },
    sidebarItem: {
        paddingVertical: 16,
        paddingHorizontal: 10,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    sidebarItemSelected: {
        backgroundColor: '#E8F5E9',
        borderLeftWidth: 4,
        borderLeftColor: '#2E7D32',
    },
    categoryImage: {
        width: 46,
        height: 46,
        borderRadius: 23,
        resizeMode: 'cover',
        backgroundColor: '#F0F0F0',
    },
    sidebarItemText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#424242',
        textAlign: 'center',
        marginTop: 8,
    },
    sidebarItemTextSelected: {
        color: '#2E7D32',
        fontWeight: 'bold',
    },
    // Main content styles
    mainContent: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
    },
    mainCategoryTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#212121',
        marginBottom: 16,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    subcategoriesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-evenly',
    },
    subcategoryItem: {
        width: '32%',
        marginBottom: 20,
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    subcategoryImageContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        overflow: 'hidden',
    },
    subcategoryImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        resizeMode: 'cover',
        backgroundColor: '#fff'
    },
    subcategoryLabel: {
        textAlign: 'center',
        fontSize: 11,
        fontWeight: '500',
        color: '#424242',
        marginTop: 4,
    },
});

export default CategoryScreen;
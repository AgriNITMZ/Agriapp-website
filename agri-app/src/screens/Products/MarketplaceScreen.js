import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    SafeAreaView,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProductCard from '../../components/product/ProductCardMini';
import SearchTopBar from '../../components/topBar/SearchTopBar';
import customFetch from '../../utils/axios';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const MarketplaceScreen = ({ navigation, route }) => {
    const [parentCategories, setParentCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [subcategories, setSubcategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [productsLoading, setProductsLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        fetchParentCategories();
        if (route?.params?.categoryId) {
            handleCategorySelect(route.params.categoryId);
        }
        if (route?.params?.subcategoryId) {
            handleSubcategorySelect(route.params.subcategoryId);
        }
        if (route?.params?.search) {
            handleSearch(route.params.search);
        }
    }, []);

    const fetchParentCategories = async () => {
        try {
            setLoading(true);
            const response = await customFetch.get('/products/getallparentcategory');
            setParentCategories(response.data.data || []);
        } catch (error) {
            console.error('Error fetching parent categories:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch subcategories when parent category is selected
    const handleCategorySelect = async (categoryId) => {
        try {
            setSelectedCategory(categoryId);
            setProductsLoading(true);
            const response = await customFetch.post('/products/getonecategory', {
                parentCategoryId: categoryId
            });
            setSubcategories(response.data.data.subcategories || []);
            
            // Show all products from all subcategories initially
            const allProducts = response.data.data.subcategories.flatMap(cat => cat.product || []);
            setProducts(allProducts);
        } catch (error) {
            console.error('Error fetching subcategories:', error);
        } finally {
            setProductsLoading(false);
        }
    };

    // Fetch products for specific subcategory
    const handleSubcategorySelect = async (subcategoryId) => {
        try {
            setProductsLoading(true);
            const response = await customFetch.post('/products/particularcreatecategory', {
                categoryId: subcategoryId
            });
            setProducts(response.data.data.product || []);
            // Set selected category to show subcategory context
            setSelectedCategory('subcategory');
            setSubcategories([]);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setProductsLoading(false);
        }
    };

    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }
        
        try {
            setSearchLoading(true);
            const response = await customFetch.get(`/products/searchproducts?search=${encodeURIComponent(query)}`);
            setSearchResults(response.data.products || []);
        } catch (error) {
            console.error('Error searching products:', error);
            setSearchResults([]);
        } finally {
            setSearchLoading(false);
        }
    };

    // Render parent category item
    const renderCategoryItem = ({ item }) => (
        <TouchableOpacity
            style={styles.categoryItem}
            onPress={() => handleCategorySelect(item._id)}
        >
            <View style={styles.categoryImageContainer}>
                <Image
                    source={{ uri: item.image }}
                    style={styles.categoryImage}
                    defaultSource={require('../../assets/images/image.png')}
                />
            </View>
            <Text style={styles.categoryName}>{item.name}</Text>
        </TouchableOpacity>
    );

    // Render subcategory item
    const renderSubcategoryItem = ({ item }) => (
        <TouchableOpacity
            style={styles.subcategoryItem}
            onPress={() => handleSubcategorySelect(item._id)}
        >
            <Image
                source={{ uri: item.image }}
                style={styles.subcategoryImage}
                defaultSource={require('../../assets/images/image.png')}
            />
            <Text style={styles.subcategoryName}>{item.name}</Text>
        </TouchableOpacity>
    );

    // Render product item
    const renderProductItem = ({ item }) => (
        <ProductCard product={item} navigation={navigation} />
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <SearchTopBar navigation={navigation} setSearch={handleSearch} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4CAF50" />
                    <Text style={styles.loadingText}>Loading marketplace...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <SearchTopBar navigation={navigation} setSearch={handleSearch} />
            
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Categories Section */}
                {!searchQuery.trim() && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Shop by Category</Text>
                        <FlatList
                            data={parentCategories}
                            renderItem={renderCategoryItem}
                            keyExtractor={(item) => item._id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.categoriesList}
                        />
                    </View>
                )}

                {/* Subcategories Section */}
                {selectedCategory && subcategories.length > 0 && !searchQuery.trim() && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Subcategories</Text>
                            <TouchableOpacity
                                onPress={() => {
                                    setSelectedCategory(null);
                                    setSubcategories([]);
                                    setProducts([]);
                                }}
                            >
                                <Ionicons name="close-circle" size={24} color="#777" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={subcategories}
                            renderItem={renderSubcategoryItem}
                            keyExtractor={(item) => item._id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.subcategoriesList}
                        />
                    </View>
                )}

                {/* Products Section */}
                {selectedCategory && !searchQuery.trim() && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            Products {products.length > 0 && `(${products.length})`}
                        </Text>
                        
                        {productsLoading ? (
                            <View style={styles.productsLoadingContainer}>
                                <ActivityIndicator size="small" color="#4CAF50" />
                                <Text style={styles.loadingText}>Loading products...</Text>
                            </View>
                        ) : products.length > 0 ? (
                            <FlatList
                                data={products}
                                renderItem={renderProductItem}
                                keyExtractor={(item, index) => item._id || `product-${index}`}
                                numColumns={2}
                                columnWrapperStyle={styles.productRow}
                                contentContainerStyle={styles.productsList}
                                scrollEnabled={false}
                            />
                        ) : (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="cube-outline" size={64} color="#ccc" />
                                <Text style={styles.emptyText}>No products found</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Search Results */}
                {searchQuery.trim() && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            Search Results for "{searchQuery}" {searchResults.length > 0 && `(${searchResults.length})`}
                        </Text>
                        
                        {searchLoading ? (
                            <View style={styles.productsLoadingContainer}>
                                <ActivityIndicator size="small" color="#4CAF50" />
                                <Text style={styles.loadingText}>Searching...</Text>
                            </View>
                        ) : searchResults.length > 0 ? (
                            <FlatList
                                data={searchResults}
                                renderItem={renderProductItem}
                                keyExtractor={(item, index) => item._id || `search-${index}`}
                                numColumns={2}
                                columnWrapperStyle={styles.productRow}
                                contentContainerStyle={styles.productsList}
                                scrollEnabled={false}
                            />
                        ) : (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="search-outline" size={64} color="#ccc" />
                                <Text style={styles.emptyText}>No products found for "{searchQuery}"</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Default message when no category selected and no search */}
                {!selectedCategory && !searchQuery.trim() && (
                    <View style={styles.welcomeContainer}>
                        <Ionicons name="storefront-outline" size={80} color="#4CAF50" />
                        <Text style={styles.welcomeTitle}>Welcome to Marketplace</Text>
                        <Text style={styles.welcomeText}>
                            Select a category above to explore products
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        flex: 1,
    },
    section: {
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    
    // Categories
    categoriesList: {
        paddingHorizontal: 12,
    },
    categoryItem: {
        alignItems: 'center',
        marginHorizontal: 8,
        width: 80,
    },
    categoryImageContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#e8f5e9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    categoryImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    categoryName: {
        fontSize: 12,
        fontWeight: '500',
        color: '#333',
        textAlign: 'center',
    },

    // Subcategories
    subcategoriesList: {
        paddingHorizontal: 12,
    },
    subcategoryItem: {
        alignItems: 'center',
        marginHorizontal: 8,
        width: 70,
    },
    subcategoryImage: {
        width: 56,
        height: 56,
        borderRadius: 28,
        marginBottom: 6,
    },
    subcategoryName: {
        fontSize: 11,
        fontWeight: '500',
        color: '#555',
        textAlign: 'center',
    },

    // Products
    productsList: {
        paddingHorizontal: 8,
    },
    productRow: {
        justifyContent: 'space-between',
        paddingHorizontal: 8,
    },

    // Loading states
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    productsLoadingContainer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#777',
    },

    // Empty states
    emptyContainer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    emptyText: {
        marginTop: 10,
        fontSize: 16,
        color: '#777',
    },
    welcomeContainer: {
        paddingVertical: 60,
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    welcomeTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 16,
        marginBottom: 8,
    },
    welcomeText: {
        fontSize: 16,
        color: '#777',
        textAlign: 'center',
    },
});

export default MarketplaceScreen;
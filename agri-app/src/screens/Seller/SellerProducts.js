import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, Image, Alert } from 'react-native';
import { Text, Card, Button, Searchbar, FAB } from 'react-native-paper';
import customFetch from '../../utils/axios';
import { Edit, Trash2, Package } from 'lucide-react-native';
import SellerTopBar from '../../components/seller/SellerTopBar';
import SellerFooterNavigation from '../../components/seller/SellerFooterNavigation';

const SellerProducts = ({ navigation }) => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchProducts = async () => {
        try {
            const response = await customFetch.get('/products/sellerProductt');
            setProducts(response.data.products);
            setFilteredProducts(response.data.products);
        } catch (error) {
            console.error('Error fetching products:', error);
            Alert.alert('Error', 'Failed to fetch products');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchProducts();
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        if (query.trim() === '') {
            setFilteredProducts(products);
        } else {
            const filtered = products.filter(product =>
                product.name.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredProducts(filtered);
        }
    };

    const handleDelete = (productId, productName) => {
        Alert.alert(
            'Delete Product',
            `Are you sure you want to delete "${productName}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await customFetch.delete(`/products/product/delete/${productId}`);
                            Alert.alert('Success', 'Product deleted successfully');
                            fetchProducts();
                        } catch (error) {
                            console.error('Error deleting product:', error);
                            Alert.alert('Error', 'Failed to delete product');
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Loading Products...</Text>
            </View>
        );
    }

    return (
        <>
            <SellerTopBar navigation={navigation} title="My Products" />
            <View style={styles.container}>
                <Searchbar
                    placeholder="Search products..."
                    onChangeText={handleSearch}
                    value={searchQuery}
                    style={styles.searchBar}
                />

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    contentContainerStyle={styles.scrollContent}
                >
                    {filteredProducts.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Package size={64} color="#ccc" />
                            <Text style={styles.emptyText}>No products found</Text>
                            <Button
                                mode="contained"
                                onPress={() => navigation.navigate('AddPost')}
                                style={styles.addButton}
                            >
                                Add Your First Product
                            </Button>
                        </View>
                    ) : (
                        filteredProducts.map((product) => (
                            <Card key={product._id} style={styles.productCard}>
                                <View style={styles.productContent}>
                                    <Image
                                        source={{ uri: product.images[0] || 'https://via.placeholder.com/100' }}
                                        style={styles.productImage}
                                    />
                                    <View style={styles.productInfo}>
                                        <Text style={styles.productName} numberOfLines={2}>
                                            {product.name}
                                        </Text>
                                        <Text style={styles.productCategory}>{product.category}</Text>
                                        <Text style={styles.productPrice}>₹{product.price}</Text>
                                        <Text style={styles.productStock}>
                                            Stock: {product.stock} units
                                        </Text>
                                    </View>
                                    <View style={styles.actions}>
                                        <TouchableOpacity
                                            style={styles.actionIcon}
                                            onPress={() => navigation.navigate('EditPost', { productId: product._id })}
                                        >
                                            <Edit size={20} color="#4CAF50" />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.actionIcon}
                                            onPress={() => handleDelete(product._id, product.name)}
                                        >
                                            <Trash2 size={20} color="#f44336" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </Card>
                        ))
                    )}
                </ScrollView>

                <FAB
                    icon="plus"
                    style={styles.fab}
                    onPress={() => navigation.navigate('AddPost')}
                    color="#fff"
                />

                <SellerFooterNavigation navigation={navigation} activePage="Products" />
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchBar: {
        margin: 15,
        elevation: 2,
    },
    scrollContent: {
        padding: 15,
        paddingBottom: 80,
    },
    productCard: {
        marginBottom: 15,
        elevation: 2,
    },
    productContent: {
        flexDirection: 'row',
        padding: 15,
    },
    productImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
    },
    productInfo: {
        flex: 1,
        marginLeft: 15,
        justifyContent: 'center',
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    productCategory: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    productPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4CAF50',
        marginBottom: 4,
    },
    productStock: {
        fontSize: 12,
        color: '#666',
    },
    actions: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionIcon: {
        padding: 8,
        marginVertical: 4,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 100,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        marginTop: 16,
        marginBottom: 24,
    },
    addButton: {
        backgroundColor: '#4CAF50',
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 70,
        backgroundColor: '#4CAF50',
    },
});

export default SellerProducts;

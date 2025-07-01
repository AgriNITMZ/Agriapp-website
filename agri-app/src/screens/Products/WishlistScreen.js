import React, { useState, useEffect, useContext, memo } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Text } from 'react-native';
import { WishlistContext } from '../../context/WishlistContext';
import ProductCardWishlist from '../../components/product/ProductCardWishlist';
import CustomTopBar from '../../components/topBar/CustomTopBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import customFetch from '../../utils/axios';

const WishlistPage = ({ navigation }) => {
    const [wishlistProducts, setWishlistProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { wishlist, toggleWishlist } = useContext(WishlistContext);

    // Fetch wishlist products from the API
    const fetchWishlistProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await customFetch.get('products/getminimalwishlist');
            setWishlistProducts(response.data.products || []);
        } catch (err) {
            setError('Failed to load wishlist. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlistProducts();
    }, [wishlist]); // Refetch whenever wishlist changes

    // Remove a product from wishlist and update the state
    const removeFromWishlist = (productId) => {
        toggleWishlist(productId); // Remove from context
        setWishlistProducts(prevProducts => prevProducts.filter(item => item._id !== productId));
    };

    const MemoizedProductCard = memo(({ item }) => (
        <TouchableOpacity onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}>
            <ProductCardWishlist product={item} navigation={navigation} onRemove={removeFromWishlist} />
        </TouchableOpacity>
    ));

    return (
        <>
            <CustomTopBar navigation={navigation} title={"Wishlist"} />
            <View style={styles.container}>
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="green" />
                        <Text style={styles.loadingText}>Loading wishlist...</Text>
                    </View>
                ) : error ? (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : wishlistProducts.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Your wishlist is empty.</Text>
                    </View>
                ) : (
                    <FlatList
                        data={wishlistProducts}
                        keyExtractor={(item) => item._id}
                        renderItem={({ item }) => <MemoizedProductCard item={item} />}
                        numColumns={2}
                        columnWrapperStyle={styles.row}
                    />
                )}
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10, backgroundColor: '#f5f5f5' },
    row: { justifyContent: 'space-evenly' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 10, fontSize: 16, color: '#555' },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { color: 'red', fontSize: 16 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { fontSize: 18, color: '#777' }
});

export default WishlistPage;

import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import customFetch from '../../utils/axios';
import { CartContext } from '../../context/CartContext';

import ProductImages from '../../components/productDetail/Images';
import ProductInfo from '../../components/productDetail/ProductInfo';
import SizeSelector from '../../components/productDetail/SizeSelector';
import QuantitySelector from '../../components/productDetail/QuantitySelector';
import WishlistButton from '../../components/productDetail/Wishlist';
import SellerSelector from '../../components/productDetail/SellerSelector';
import RatingComponent from '../../components/rating/Rating';
import ProductReviews from '../../components/rating/Review';
import ProductList from '../../components/product/ProductList';

const ProductDetailScreen = ({ navigation, route }) => {
    const { productId } = route.params;
    const { isProductInCart, addToCart } = useContext(CartContext);

    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedSellerIndex, setSelectedSellerIndex] = useState(0);
    const [selectedSize, setSelectedSize] = useState(0);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await customFetch.get(`/products/getproductbyId/${productId}`);
                setProduct(response.data.product);
                const similarResponse = await customFetch.get(`/products/filteredproducts?category=${response.data.product.category}`);
                setSimilarProducts(similarResponse.data.data.products);
            } catch (err) {
                setError('Failed to load product details. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId]);

    // Reset selected size when seller changes
    useEffect(() => {
        setSelectedSize(0);
        setQuantity(1);
    }, [selectedSellerIndex]);

    const getCurrentSeller = () => {
        return product?.sellers?.[selectedSellerIndex] || null;
    };

    const getCurrentPriceSize = () => {
        const seller = getCurrentSeller();
        return seller?.price_size || [];
    };

    const handleBuyNow = async () => {
        if (!product) return;
        try {
            const seller = getCurrentSeller();
            await addToCart(product, quantity, selectedSize, seller);
            navigation.navigate('Cart');
        } catch (error) {
            console.error('Error handling Buy Now:', error);
        }
    };

    const handleAddToCart = async () => {
        console.log('Adding to cart:', product, quantity, selectedSize);
        if (!product) return;
        try {
            const seller = getCurrentSeller();
            await addToCart(product, quantity, selectedSize, seller);
        } catch (error) {
            console.error('Error adding to cart:', error);
        }
    };

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="green" />
                <Text>Loading product details...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.errorButton}>
                    <Text style={styles.buttonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const currentPriceSize = getCurrentPriceSize();
    const maxQuantity = currentPriceSize[selectedSize]?.quantity || 0;

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <ProductImages images={product.images} />
                <TouchableOpacity style={styles.backIcon} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={28} color="black" />
                </TouchableOpacity>
                <WishlistButton productId={product._id} />

                <View style={styles.productDetail}>
                    <ProductInfo
                        product={product}
                        selectedSize={selectedSize}
                        priceSize={currentPriceSize}
                    />
                    <View style={styles.divider} />

                    <SellerSelector
                        sellers={product.sellers}
                        selectedSellerIndex={selectedSellerIndex}
                        setSelectedSellerIndex={setSelectedSellerIndex}
                    />
                    <View style={styles.divider} />

                    <SizeSelector
                        priceSize={currentPriceSize}
                        selectedSize={selectedSize}
                        setSelectedSize={setSelectedSize}
                    />
                    <View style={styles.divider} />

                    <QuantitySelector
                        quantity={quantity}
                        setQuantity={setQuantity}
                        maxQuantity={maxQuantity}
                    />
                    <View style={styles.divider} />
                </View>

                <View style={styles.descriptionContainer}>
                    <Text style={styles.sectionTitle}>Product Description</Text>
                    {product.description ? (
                        <WebView
                            originWhitelist={['*']}
                            source={{ html: `<html><body>${product.description}</body></html>` }}
                            style={{ height: 300 }}
                        />
                    ) : (
                        <Text>No description available</Text>
                    )}
                </View>

                <Text style={styles.sectionTitle}>Ratings & Reviews</Text>
                <RatingComponent ratings={product.ratings} />
                <ProductReviews productId={product._id} />

                {similarProducts.length > 0 && (
                    <ProductList title="Similar Products" products={similarProducts} navigation={navigation} />
                )}
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.addToCartButton}
                    onPress={() => isProductInCart(productId) ? navigation.navigate("Cart") : handleAddToCart()}
                >
                    <Text style={styles.buttonText}>
                        {isProductInCart(productId) ? "GO TO CART" : "ADD TO CART"}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buyNowButton} onPress={handleBuyNow}>
                    <Text style={styles.buttonText}>BUY NOW</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    scrollContent: { paddingBottom: 100 },
    backIcon: { position: 'absolute', top: 20, left: 7 },
    productDetail: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
    sectionTitle: { paddingLeft: 15, fontSize: 20, fontWeight: 'bold', marginBottom: 8, color: '#333' },
    descriptionContainer: { padding: 16 },
    divider: { height: 1, backgroundColor: '#ddd', marginVertical: 5 },
    footer: { position: 'absolute', bottom: 0, flexDirection: 'row', padding: 7, backgroundColor: '#fff' },
    addToCartButton: { backgroundColor: 'orange', padding: 16, borderRadius: 8, flex: 1, marginRight: 8 },
    buyNowButton: { backgroundColor: 'green', padding: 16, borderRadius: 8, flex: 1 },
    buttonText: { color: '#fff', textAlign: 'center' },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { color: 'red', fontSize: 16 },
    errorButton: { marginTop: 10, backgroundColor: 'red', padding: 10, borderRadius: 5 },
});

export default ProductDetailScreen;
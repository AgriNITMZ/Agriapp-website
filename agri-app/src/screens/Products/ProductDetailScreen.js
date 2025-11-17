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
                const productData = response.data.product;
                
                // Use allSellers if available (new format), otherwise fallback to sellers
                if (productData.allSellers && productData.allSellers.length > 0) {
                    productData.sellers = productData.allSellers;
                } else if (productData.sellers && productData.sellers.length > 0) {
                    // Keep existing sellers but ensure they have proper structure
                    productData.sellers = productData.sellers.map((seller, index) => ({
                        ...seller,
                        sellerName: seller.sellerName || 
                                   seller.fullShopDetails || 
                                   (seller.sellerId?.shopName) ||
                                   (seller.sellerId?.firstName ? `${seller.sellerId.firstName} ${seller.sellerId.lastName || ''}`.trim() : null) ||
                                   'Shop ' + (index + 1),
                        fullShopDetails: seller.fullShopDetails || 'Shop Details'
                    }));
                }
                
                // Ensure sellers array exists and has valid data
                if (!productData.sellers || productData.sellers.length === 0) {
                    productData.sellers = [{
                        sellerId: null,
                        sellerName: 'Default Shop',
                        price_size: productData.price_size || [],
                        fullShopDetails: productData.fullShopDetails || 'Shop Details',
                        deliveryInfo: 'Standard delivery',
                        warranty: 'No warranty'
                    }];
                }
                
                setProduct(productData);
                const similarResponse = await customFetch.get(`/products/filteredproducts?category=${productData.category}`);
                setSimilarProducts(similarResponse.data.data.products);
            } catch (err) {
                setError('Failed to load product details. Please try again.');
                console.error('Error fetching product:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId]);

    // Reset selected size when seller changes
    useEffect(() => {
        const currentPriceSize = getCurrentPriceSize();
        // Only reset if there are sizes available
        if (currentPriceSize.length > 0) {
            setSelectedSize(0);
            setQuantity(1);
        }
    }, [selectedSellerIndex, product]);

    const getCurrentSeller = () => {
        if (!product?.sellers || product.sellers.length === 0) return null;
        // Ensure selectedSellerIndex is within bounds
        const index = Math.min(selectedSellerIndex, product.sellers.length - 1);
        return product.sellers[index] || null;
    };

    const getCurrentPriceSize = () => {
        const seller = getCurrentSeller();
        if (!seller?.price_size || !Array.isArray(seller.price_size)) return [];
        return seller.price_size;
    };

    const handleBuyNow = async () => {
        if (!product) return;
        try {
            const seller = getCurrentSeller();
            if (!seller) {
                console.error('No seller available');
                return;
            }
            const currentPriceSize = getCurrentPriceSize();
            const safeSize = Math.min(selectedSize, Math.max(0, currentPriceSize.length - 1));
            await addToCart(product, quantity, safeSize, seller);
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
            if (!seller) {
                console.error('No seller available');
                return;
            }
            const currentPriceSize = getCurrentPriceSize();
            const safeSize = Math.min(selectedSize, Math.max(0, currentPriceSize.length - 1));
            await addToCart(product, quantity, safeSize, seller);
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
    // Ensure selectedSize is within bounds
    const safeSelectedSize = Math.min(selectedSize, Math.max(0, currentPriceSize.length - 1));
    const maxQuantity = currentPriceSize[safeSelectedSize]?.quantity || 0;

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
                        selectedSize={safeSelectedSize}
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
                        selectedSize={safeSelectedSize}
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
                            source={{ 
                                html: `
                                    <html>
                                        <head>
                                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                            <style>
                                                body {
                                                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                                    font-size: 16px;
                                                    line-height: 1.6;
                                                    color: #333;
                                                    margin: 0;
                                                    padding: 10px;
                                                    word-wrap: break-word;
                                                }
                                                * {
                                                    max-width: 100%;
                                                }
                                                img {
                                                    height: auto;
                                                }
                                            </style>
                                        </head>
                                        <body>${product.description}</body>
                                    </html>
                                ` 
                            }}
                            style={styles.webView}
                            scrollEnabled={false}
                            showsVerticalScrollIndicator={false}
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
    webView: { height: 400, backgroundColor: 'transparent' },
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
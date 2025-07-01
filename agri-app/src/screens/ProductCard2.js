import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

const ProductCard = ({ navigation, product, isInWishlist, toggleWishlist }) => {
    const productPrice = product.sizes?.[0]?.discountedPrice || 0;
    const originalPrice = product.sizes?.[0]?.price || 0;
    const primaryImageUrl = product.imagesUrl[0];
    // Calculate discount and discount amount
    const discountPercentage = originalPrice
        ? Math.ceil(((originalPrice - productPrice) / originalPrice) * 100)
        : 0;
    const discountAmount = originalPrice - productPrice;

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ProductDetail', { product: product })}
        >
            {/* Wishlist Icon */}
            <TouchableOpacity style={styles.wishlistIcon} onPress={toggleWishlist}>
                <Ionicons
                    name="heart"
                    size={28}
                    color="red"
                    style={styles.outline}
                />
                <Ionicons
                    name="heart"
                    size={22}
                    color={isInWishlist ? 'red' : 'white'}
                    style={styles.innerHeart}
                    aria-hidden="true"
                />
            </TouchableOpacity>

            {/* Product Image */}
            <Image source={{ uri: primaryImageUrl }} style={styles.productImage} />

            {/* Product Name */}
            <Text style={styles.productName}>{product.title}</Text>

            {/* Price and Discount */}
            <View style={styles.priceContainer}>
                <Ionicons name="arrow-down" size={16} color="green" />
                <Text style={styles.discountText}>{discountPercentage}%</Text>
                <Text style={styles.currentPrice}>₹{productPrice}</Text>
                <Text style={styles.originalPrice}>₹{originalPrice}</Text>
            </View>

            {/* Rating and Discount Amount */}
            <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.rating}>
                    {product.ratings?.average || 0}
                </Text>
                <Text style={styles.discountAmount}>Discount: ₹{discountAmount}</Text>
            </View>

            {/* Buy Now Button */}
            <TouchableOpacity
                style={styles.buyButton}
                onPress={() => navigation.navigate('ProductDetail', { product: product })}
            >
                <Text style={styles.buyButtonText}>View Product</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );
};

export default ProductCard;

const styles = StyleSheet.create({
    card: {
        width: '45%',
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 8,
        marginHorizontal: 5,
        marginVertical: 5,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    wishlistIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 2,
        width: 30,
        height: 30,
    },
    outline: {
        fontWeight: 800,
        position: 'absolute',
        top: 0,
        left: 0,
    },
    innerHeart: {
        position: 'absolute',
        top: 3,
        left: 3,
    },
    productImage: {
        width: '100%',
        height: 120,
        resizeMode: 'contain',
        marginBottom: 10,
    },
    productName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
        textAlign: 'center',
    },
    priceContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    discountText: {
        color: 'green',
        fontWeight: 'bold',
        fontSize: 14,
        paddingRight: 7,
    },
    currentPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        marginRight: 10,
    },
    originalPrice: {
        fontSize: 14,
        color: '#777',
        textDecorationLine: 'line-through',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 5,
    },
    rating: {
        marginHorizontal: 5,
        fontWeight: 'bold',
    },
    discountAmount: {
        color: 'red',
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 5,
    },
    buyButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 8,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },
    buyButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

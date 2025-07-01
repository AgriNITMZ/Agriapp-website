import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ProductInfo = ({ product, selectedSize, priceSize }) => {
    const getCurrentPrice = () => {
        if (!priceSize || priceSize.length === 0) return null;
        return priceSize[selectedSize] || priceSize[0];
    };

    const currentPriceInfo = getCurrentPrice();

    return (
        <View style={styles.productInfo}>
            <Text style={styles.productName}>{product.name}</Text>

            {currentPriceInfo && (
                <View style={styles.priceContainer}>
                    <Text style={styles.currentPrice}>
                        ₹{currentPriceInfo.discountedPrice || currentPriceInfo.price}
                    </Text>
                    {currentPriceInfo.discountedPrice && currentPriceInfo.discountedPrice !== currentPriceInfo.price && (
                        <>
                            <Text style={styles.originalPrice}>₹{currentPriceInfo.price}</Text>
                            <Text style={styles.discount}>
                                {Math.round(((currentPriceInfo.price - currentPriceInfo.discountedPrice) / currentPriceInfo.price) * 100)}% OFF
                            </Text>
                        </>
                    )}
                </View>
            )}

            {currentPriceInfo?.size && (
                <Text style={styles.sizeInfo}>Size: {currentPriceInfo.size}</Text>
            )}

            {currentPriceInfo && (
                <View style={styles.stockContainer}>
                    {currentPriceInfo.quantity > 0 ? (
                        <Text style={styles.inStock}>
                            ✓ In Stock ({currentPriceInfo.quantity} available)
                        </Text>
                    ) : (
                        <Text style={styles.outOfStock}>✗ Out of Stock</Text>
                    )}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    productInfo: {
        padding: 15,
        backgroundColor: '#fff',
    },
    productName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
        lineHeight: 28,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        flexWrap: 'wrap',
    },
    currentPrice: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#E65100',
        marginRight: 10,
    },
    originalPrice: {
        fontSize: 18,
        color: '#999',
        textDecorationLine: 'line-through',
        marginRight: 8,
    },
    discount: {
        fontSize: 14,
        backgroundColor: '#4CAF50',
        color: 'white',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        fontWeight: 'bold',
    },
    sizeInfo: {
        fontSize: 16,
        color: '#666',
        marginBottom: 8,
        fontWeight: '500',
    },
    stockContainer: {
        marginBottom: 12,
    },
    inStock: {
        fontSize: 14,
        color: '#4CAF50',
        fontWeight: '600',
    },
    outOfStock: {
        fontSize: 14,
        color: '#F44336',
        fontWeight: '600',
    },
    badgeContainer: {
        marginBottom: 10,
    },
    badge: {
        fontSize: 14,
        backgroundColor: '#2196F3',
        color: 'white',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 15,
        alignSelf: 'flex-start',
        fontWeight: 'bold',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    tagsLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
    },
    tags: {
        fontSize: 14,
        color: '#666',
        flex: 1,
    },
});

export default ProductInfo;
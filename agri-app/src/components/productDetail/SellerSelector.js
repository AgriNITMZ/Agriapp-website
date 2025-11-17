import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

const SellerSelector = ({ sellers, selectedSellerIndex, setSelectedSellerIndex }) => {
    if (!sellers || sellers.length === 0) {
        return <Text style={styles.errorText}>No sellers available</Text>;
    }

    // If only one seller, show it as selected without options
    if (sellers.length === 1) {
        return (
            <View style={styles.sellerSection}>
                <Text style={styles.sectionLabel}>Seller:</Text>
                <View style={styles.singleSellerContainer}>
                    <View style={styles.sellerCard}>
                        <View style={styles.sellerHeader}>
                            <Ionicons name="storefront-outline" size={20} color="#2E7D32" />
                            <Text style={styles.sellerName}>{sellers[0].fullShopDetails || sellers[0].sellerName || 'Unknown Seller'}</Text>
                        </View>
                        <Text style={styles.priceRangeText}>
                            {getPriceRange(sellers[0].price_size)}
                        </Text>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.sellerSection}>
            <Text style={styles.sectionLabel}>Choose Seller:</Text>
            <View style={styles.sellersContainer}>
                {sellers.map((seller, index) => (
                    <TouchableOpacity
                        key={`seller-${index}-${seller._id || ''}`}
                        style={[
                            styles.sellerCard,
                            selectedSellerIndex === index && styles.selectedSellerCard,
                        ]}
                        onPress={() => setSelectedSellerIndex(index)}
                    >
                        <View style={styles.sellerHeader}>
                            <Ionicons
                                name="storefront-outline"
                                size={20}
                                color={selectedSellerIndex === index ? '#2E7D32' : '#666'}
                            />
                            <Text
                                style={[
                                    styles.sellerName,
                                    selectedSellerIndex === index && styles.selectedSellerName,
                                ]}
                                numberOfLines={3}
                            >
                                {seller.fullShopDetails || seller.sellerName || 'Unknown Seller'}
                            </Text>
                        </View>
                        <Text style={styles.priceRangeText}>
                            {getPriceRange(seller.price_size)}
                        </Text>
                        <Text style={styles.sizesAvailableText}>
                            {seller.price_size.length} size{seller.price_size.length !== 1 ? 's' : ''} available
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

// Helper function to get price range for a seller
const getPriceRange = (priceSize) => {
    if (!priceSize || priceSize.length === 0) return 'Price not available';

    const prices = priceSize.map(item => item.discountedPrice || item.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    if (minPrice === maxPrice) {
        return `₹${minPrice}`;
    }
    return `₹${minPrice} - ₹${maxPrice}`;
};

const styles = StyleSheet.create({
    sellerSection: {
        marginHorizontal: 10,
        padding: 10,
    },
    sectionLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    sellersContainer: {
        gap: 10,
    },
    singleSellerContainer: {
        opacity: 1,
    },
    sellerCard: {
        padding: 15,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: '#ddd',
        backgroundColor: '#f9f9f9',
    },
    selectedSellerCard: {
        borderColor: '#2E7D32',
        backgroundColor: '#f0f8f0',
        shadowColor: '#2E7D32',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sellerHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
        gap: 8,
    },
    sellerName: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        lineHeight: 20,
    },
    selectedSellerName: {
        color: '#2E7D32',
    },
    priceRangeText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#E65100',
        marginBottom: 4,
    },
    sizesAvailableText: {
        fontSize: 13,
        color: '#666',
        fontStyle: 'italic',
    },
    errorText: {
        textAlign: 'center',
        color: 'red',
        fontSize: 16,
        marginTop: 10,
    },
});

export default SellerSelector;
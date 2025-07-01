import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import ProductCardMini from './ProductCardMini';

const ProductList = ({ title = 'Products', products = [], navigation }) => {
    return (
        <View style={styles.productList}>
            <Text style={styles.sectionTitle}>{title}</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {Array.isArray(products) && products.length > 0 ? (
                    products.map((product, index) => {
                        const key = product?.price_size?.[0]?._id || `${product?._id || 'unknown'}-${index}`;
                        return (
                            <ProductCardMini
                                key={key}
                                product={product}
                                navigation={navigation}
                            />
                        );
                    })
                ) : (
                    <Text style={{ marginLeft: 10, color: 'gray' }}>No products available</Text>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    productList: {
        backgroundColor: '#fff',
        marginVertical: 10,
        paddingBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
    },
    sectionTitle: {
        backgroundColor: '#fff',
        marginLeft: 10,
        marginTop: 5,
        marginBottom: 5,
        fontSize: 20,
        fontWeight: 'bold',
    },
});

export default ProductList;

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SellerInfo = ({ shopDetails }) => {
    return (
        <View style={styles.sellerInfo}>
            <Text style={styles.sellerLabel}>Seller Information</Text>
            <Text style={styles.sellerDetail}>{shopDetails}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    sellerInfo: {
        padding: 10,
        paddingLeft: 15,
        backgroundColor: '#f5f5f5',
        marginVertical: 10,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    sellerLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2E7D32',
    },
    sellerDetail: {
        fontSize: 15,
        color: '#555',
        marginTop: 4,
    },
});

export default SellerInfo;

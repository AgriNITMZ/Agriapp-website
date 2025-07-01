import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const SizeSelector = ({ priceSize, selectedSize, setSelectedSize }) => {
    if (!priceSize || priceSize.length === 0) {
        return <Text style={styles.errorText}>Sizes not available</Text>;
    }

    return (
        <View style={styles.sizeSection}>
            <Text style={styles.sectionLabel}>Select Size:</Text>
            <View style={styles.sizeContainer}>
                {priceSize.map((size, index) => (
                    <TouchableOpacity
                        key={size._id}
                        style={[
                            styles.sizeBox,
                            selectedSize === index && styles.selectedSizeBox, // Highlight selected size
                        ]}
                        onPress={() => setSelectedSize(index)} // Update selected size
                    >
                        <Text
                            style={[
                                styles.sizeText,
                                selectedSize === index && styles.selectedSizeText, // Highlight text if selected
                            ]}
                        >
                            {size.size}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    sizeSection: {
        marginHorizontal: 10,
        padding: 10,
    },
    sectionLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    sizeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap', // Wrap items in case of overflow
        gap: 8, // Space between buttons
    },
    sizeBox: {
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#f9f9f9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedSizeBox: {
        borderColor: 'green', // Highlight selected size
        backgroundColor: '#dfffde',
    },
    sizeText: {
        fontSize: 16,
        color: '#333',
    },
    selectedSizeText: {
        color: 'green', // Highlight text for selected size
        fontWeight: 'bold',
    },
    errorText: {
        textAlign: 'center',
        color: 'red',
        fontSize: 16,
        marginTop: 10,
    },
});

export default SizeSelector;

import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
const QuantitySelector = ({ quantity, setQuantity, maxQuantity }) => {
    // Handle Quantity Change
    const handleQuantityChange = (type) => {
        if (!maxQuantity) return;
        setQuantity((prevQuantity) =>
            type === 'inc' ? Math.min(prevQuantity + 1, maxQuantity) : Math.max(1, prevQuantity - 1)
        );
    };

    return (
        <View style={styles.quantitySection}>
            <Text style={styles.sectionLabel}>Order Quantity:</Text>
            <View style={styles.quantityControls}>
                {/* Decrease Button */}
                <TouchableOpacity onPress={() => handleQuantityChange('dec')} disabled={quantity <= 1}>
                    <Ionicons
                        name="remove-circle-outline"
                        size={30}
                        color={quantity > 1 ? '#333' : '#ccc'} // Greyed out if at min
                    />
                </TouchableOpacity>

                {/* Quantity Display */}
                <TextInput value={String(quantity)} style={styles.quantityInput} editable={false} />

                {/* Increase Button */}
                <TouchableOpacity onPress={() => handleQuantityChange('inc')} disabled={quantity >= maxQuantity}>
                    <Ionicons
                        name="add-circle-outline"
                        size={30}
                        color={quantity < maxQuantity ? '#333' : '#ccc'} // Greyed out if at max
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    quantitySection: {
        marginHorizontal: 10,
        padding: 10,
    },
    sectionLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: 140, // Adjust width for better alignment
        backgroundColor: '#f9f9f9',
        padding: 8,
        borderRadius: 8,
    },
    quantityInput: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        width: 40,
        color: '#333',
    },
});

export default QuantitySelector;

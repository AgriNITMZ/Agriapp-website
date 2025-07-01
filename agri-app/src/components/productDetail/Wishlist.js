import React, { useContext } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WishlistContext } from '../../context/WishlistContext';

const WishlistButton = ({ productId }) => {
    const { wishlist, toggleWishlist } = useContext(WishlistContext);

    return (
        <TouchableOpacity style={styles.wishlistIcon} onPress={() => toggleWishlist(productId)}>
            <Ionicons
                name={wishlist.has(productId) ? 'heart' : 'heart-outline'}
                size={28}
                color="#E53935"
            />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    wishlistIcon: {
        position: 'absolute',
        top: 20,
        right: 20,
        backgroundColor: '#ffffff',
        padding: 8,
        borderRadius: 20,
        elevation: 3, // Slight shadow for better visibility
    },
});

export default WishlistButton;

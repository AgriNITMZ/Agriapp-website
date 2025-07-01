import React, { useMemo, useContext, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import CustomTopBar from '../../components/topBar/CustomTopBar';
import { CartContext } from '../../context/CartContext';
import { debounce } from 'lodash';

/**
 * CartPage Component
 * Displays the user's shopping cart with product details, quantity controls,
 * price breakdown, and checkout options.
 * 
 * @param {Object} navigation - React Navigation object for screen transitions
 */
const CartPage = ({ navigation }) => {
    // Access cart context methods and state
    const { cart, removeFromCart, updateQuantity, clearCart } = useContext(CartContext);
    console.log('Cart:', cart);

    // Constants for shipping and other fees
    const SHIPPING_CHARGE = 40;
    const FREE_SHIPPING_THRESHOLD = 0;

    const priceDetails = useMemo(() => {
        // Calculate if user gets free shipping
        const isFreeShipping = cart.totalDiscountedPrice >= FREE_SHIPPING_THRESHOLD;
        const finalShippingCharge = isFreeShipping ? 0 : SHIPPING_CHARGE;

        // Calculate final amount to be paid
        const finalAmount = cart.totalDiscountedPrice + finalShippingCharge;

        // Calculate total discount amount
        const totalDiscount = cart.totalPrice - cart.totalDiscountedPrice;

        return {
            isFreeShipping,
            finalShippingCharge,
            finalAmount,
            totalDiscount
        };
    }, [cart.totalDiscountedPrice, cart.totalPrice, SHIPPING_CHARGE, FREE_SHIPPING_THRESHOLD]);



    /**
     * Debounced function for quantity update to prevent excessive API calls
     * Waits 500ms before actually performing the update
     */
    const handleQuantityUpdate = useCallback(
        debounce((item, newQuantity) => {
            try {
                if (newQuantity >= 1) {
                    updateQuantity(item, newQuantity);
                }
            } catch (err) {
                Alert.alert('Error', 'Failed to update quantity. Please try again.');
            }
        }, 300),
        [updateQuantity]
    );

    /**
     * Handles removing an item from cart with confirmation
     * @param {string} itemId - ID of the item to remove
     */
    const handleRemoveItem = (itemId) => {
        Alert.alert(
            'Remove Item',
            'Are you sure you want to remove this item from your cart?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => {
                        try {
                            removeFromCart(itemId);
                        } catch (err) {
                            Alert.alert('Error', 'Failed to remove item. Please try again.');
                        }
                    }
                }
            ]
        );
    };

    /**
     * Handles clearing the entire cart with confirmation
     */
    const handleClearCart = () => {
        if (cart.items.length === 0) {
            Alert.alert('Cart Empty', 'Your cart is already empty.');
            return;
        }

        Alert.alert(
            'Clear Cart',
            'Are you sure you want to remove all items from your cart?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear All',
                    style: 'destructive',
                    onPress: () => {
                        try {
                            clearCart();
                        } catch (err) {
                            Alert.alert('Error', 'Failed to clear cart. Please try again.');
                        }
                    }
                }
            ]
        );
    };

    /**
     * Render each cart item
     * @param {Object} param0 - Item to render
     * @returns {JSX.Element} - Rendered cart item component
     */
    const renderItem = ({ item }) => (
        <View style={styles.cartItem}>
            <Image
                source={{ uri: item.productImage }}
                style={styles.productImage}
            />
            <View style={styles.productDetails}>
                <Text style={styles.productName}>{item.productName}</Text>
                <Text style={styles.sizeText}>Size: {item.selectedsize}</Text>
                <Text style={styles.productPrice}>
                    ₹ {item.selecetedDiscountedPrice}{' '}
                    {item.selectedPrice !== item.selecetedDiscountedPrice && (
                        <Text style={styles.originalPrice}>₹ {item.selectedPrice}</Text>
                    )}
                </Text>
                <View style={styles.quantityContainer}>
                    <TouchableOpacity
                        onPress={() => handleQuantityUpdate(item, item.quantity - 1)}
                        style={[
                            styles.quantityButton,
                            item.quantity <= 1 && styles.quantityButtonDisabled
                        ]}
                        disabled={item.quantity <= 1}>
                        <Text style={[
                            styles.quantityButtonText,
                            item.quantity <= 1 && styles.quantityButtonTextDisabled
                        ]}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity
                        onPress={() => handleQuantityUpdate(item, item.quantity + 1)}
                        style={styles.quantityButton}>
                        <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleRemoveItem(item._id)}
                        style={styles.removeButton}>
                        <Text style={styles.removeText}>Remove</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );


    return (
        <>
            <CustomTopBar navigation={navigation} title="My Cart" />
            <View style={styles.container}>
                {cart.items.length === 0 ? (
                    <View style={styles.emptyCartContainer}>
                        <Text style={styles.emptyCartText}>Your cart is empty.</Text>
                        <TouchableOpacity
                            style={styles.continueShoppingButton}
                            onPress={() => navigation.navigate('HomePage')}>
                            <Text style={styles.continueShoppingText}>Continue Shopping</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        <View style={styles.headerContainer}>
                            {priceDetails.totalDiscount > 0 && (
                                <Text style={styles.savingsText}>
                                    You save ₹ {priceDetails.totalDiscount} on this order!
                                </Text>
                            )}
                            <TouchableOpacity
                                style={styles.clearCartButton}
                                onPress={handleClearCart}>
                                <Text style={styles.clearCartText}>Clear Cart</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={cart.items}
                            renderItem={renderItem}
                            keyExtractor={(item) => item._id}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                        />
                    </>
                )}

                {cart.items.length > 0 && (
                    <View style={styles.summaryContainer}>
                        <View style={styles.priceRow}>
                            <Text style={styles.priceLabel}>Subtotal:</Text>
                            <Text style={styles.priceValue}>₹ {cart.totalPrice}</Text>
                        </View>

                        {priceDetails.totalDiscount > 0 && (
                            <View style={styles.priceRow}>
                                <Text style={styles.priceLabel}>Discount:</Text>
                                <Text style={styles.discountValue}>- ₹ {priceDetails.totalDiscount}</Text>
                            </View>
                        )}

                        <View style={styles.priceRow}>
                            <Text style={styles.priceLabel}>Shipping:</Text>
                            <Text style={styles.priceValue}>
                                {priceDetails.isFreeShipping ? (
                                    <Text style={styles.freeShippingText}>FREE</Text>
                                ) : (
                                    `₹ ${SHIPPING_CHARGE}`
                                )}
                            </Text>
                        </View>

                        {/* {priceDetails.isFreeShipping && (
                            <Text style={styles.freeShippingNote}>
                                Free shipping on orders above ₹ {FREE_SHIPPING_THRESHOLD}
                            </Text>
                        )} */}

                        <View style={styles.divider} />

                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Total Amount:</Text>
                            <Text style={styles.totalValue}>₹ {priceDetails.finalAmount}</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.checkoutButton}
                            onPress={() => navigation.navigate('SelectAddress', { cart: cart })}>
                            <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </>
    );
};

const styles = StyleSheet.create({

    // Main container styles
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
    },
    clearCartButton: {
        padding: 8
    },
    clearCartText: {
        color: '#ff3b30',
        fontWeight: 'bold'
    },
    listContent: {
        paddingHorizontal: 15,
        paddingBottom: 20
    },

    // Empty cart styles
    emptyCartContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    emptyCartText: {
        textAlign: 'center',
        marginBottom: 20,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#888'
    },
    continueShoppingButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8
    },
    continueShoppingText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    },

    // Cart item styles
    cartItem: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 6,
        marginVertical: 6,
        borderRadius: 4,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3
    },
    productImage: {
        width: 90,
        height: 90,
        borderRadius: 4
    },
    productDetails: {
        flex: 1,
        marginLeft: 15
    },
    productName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333'
    },
    sizeText: {
        fontSize: 12,
        color: '#666'
    },
    productPrice: {
        fontSize: 14,
        color: '#000',
        marginTop: 5
    },
    originalPrice: {
        textDecorationLine: 'line-through',
        color: '#888',
        marginLeft: 8
    },

    // Quantity control styles
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5
    },
    quantityButton: {
        borderWidth: 1,
        borderColor: '#888',
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        backgroundColor: '#f1f1f1'
    },
    quantityButtonDisabled: {
        backgroundColor: '#e0e0e0',
        borderColor: '#ccc'
    },
    quantityButtonText: {
        fontSize: 12,
        fontWeight: 'bold'
    },
    quantityButtonTextDisabled: {
        color: '#aaa'
    },
    quantityText: {
        marginHorizontal: 10,
        fontSize: 14,
        fontWeight: 'bold'
    },
    removeButton: {
        marginLeft: 15
    },
    removeText: {
        color: '#ff3b30',
        fontSize: 14,
        fontWeight: 'bold'
    },

    // Savings notification
    savingsText: {
        color: 'green',
        fontSize: 16,
        fontWeight: 'bold'
    },

    // Price summary styles
    summaryContainer: {
        backgroundColor: '#fff',
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 5
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8
    },
    priceLabel: {
        fontSize: 15,
        color: '#555'
    },
    priceValue: {
        fontSize: 15,
        color: '#333',
        fontWeight: '500'
    },
    discountValue: {
        fontSize: 15,
        color: 'green',
        fontWeight: '500'
    },
    divider: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginVertical: 10
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000'
    },
    totalValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000'
    },
    freeShippingText: {
        color: 'green',
        fontWeight: 'bold'
    },
    freeShippingNote: {
        fontSize: 12,
        color: 'green',
        marginTop: -5,
        marginBottom: 5,
        textAlign: 'right'
    },

    // Checkout button
    checkoutButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center'
    },
    checkoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    }
});

export default CartPage;
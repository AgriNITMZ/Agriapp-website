import React, { useState, useContext } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, SafeAreaView } from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import Toast from 'react-native-toast-message';
import CustomTopBar from '../../components/topBar/CustomTopBar';
import customFetch from '../../utils/axios';
import { CartContext } from '../../context/CartContext';

// Component for individual order items
const OrderItem = ({ item }) => (
    <View style={styles.orderItem}>
        <Image source={{ uri: item.productImage }} style={styles.productImage} />
        <View style={styles.productDetails}>
            <Text style={styles.productName}>{item.productName}</Text>
            <Text style={styles.productSize}>{item.selectedsize}</Text>
            <Text style={styles.productPrice}>
                ₹ {item.selectedDiscountedPrice}
                {item.selectedPrice > item.selectedDiscountedPrice && (
                    <Text style={styles.originalPrice}> ₹ {item.selectedPrice}</Text>
                )}
            </Text>
            <Text style={styles.productQuantity}>Quantity: {item.quantity}</Text>
        </View>
    </View>
);

// Component for displaying address details
const AddressCard = ({ address }) => (
    <View style={styles.deliveryDetails}>
        <Text style={styles.deliveryTitle}>Delivery Address</Text>
        <Text style={styles.addressText}>{address.Name}</Text>
        <Text style={styles.addressText}>{address.streetAddress}, {address.city}, {address.state} - {address.zipCode}</Text>
        <Text style={styles.addressText}>Mobile: {address.mobile}</Text>
    </View>
);

// Component for payment method selection
const PaymentMethodSelector = ({ selectedMethod, onSelect }) => (
    <View style={styles.paymentMethodContainer}>
        <Text style={styles.paymentTitle}>Select Payment Method</Text>
        <View style={styles.paymentOptions}>
            <TouchableOpacity
                style={[
                    styles.paymentOption,
                    selectedMethod === 'cod' && styles.selectedPaymentOption
                ]}
                onPress={() => onSelect('cod')}
            >
                <Text style={styles.paymentOptionText}>Cash on Delivery</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[
                    styles.paymentOption,
                    selectedMethod === 'online' && styles.selectedPaymentOption
                ]}
                onPress={() => onSelect('online')}
            >
                <Text style={styles.paymentOptionText}>Pay Online</Text>
            </TouchableOpacity>
        </View>
    </View>
);

// Component for order summary details
const OrderSummaryDetails = ({ cart }) => (
    <View style={styles.orderSummary}>
        <Text style={styles.summaryTitle}>Order Summary</Text>
        <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>Total MRP</Text>
            <Text style={styles.summaryText}>₹ {cart.totalPrice}</Text>
        </View>
        <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>Discount</Text>
            <Text style={styles.summaryText}>₹ {cart.totalPrice - cart.totalDiscountedPrice}</Text>
        </View>
        <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>Shipping Charges</Text>
            <Text style={styles.summaryText}>₹ 0.00</Text>
        </View>
        <View style={styles.summaryRow}>
            <Text style={styles.grandTotalText}>Grand Total</Text>
            <Text style={styles.grandTotalText}>₹ {cart.totalDiscountedPrice}</Text>
        </View>
    </View>
);

// Main component
const OrderSummaryPage = ({ navigation, route }) => {
    const { clearCart } = useContext(CartContext);
    const { cart, selectedAddress } = route.params;
    const [isLoading, setIsLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [orderError, setOrderError] = useState(null);

    // Function to handle order creation
    const handleCreateOrder = async () => {
        setIsLoading(true);
        setOrderError(null);

        try {
            // Validate payment method
            if (paymentMethod === '') {
                Toast.show({
                    type: 'error',
                    text1: 'Please select a Payment Method',
                });
                setIsLoading(false);
                return;
            }

            // Validate cart has items
            if (!cart || !cart.items || cart.items.length === 0) {
                Toast.show({
                    type: 'error',
                    text1: 'Cart is empty',
                    text2: 'Please add items to your cart first'
                });
                setIsLoading(false);
                return;
            }

            // Validate address
            if (!selectedAddress || !selectedAddress._id) {
                Toast.show({
                    type: 'error',
                    text1: 'Invalid Address',
                    text2: 'Please select a delivery address'
                });
                setIsLoading(false);
                return;
            }

            // Prepare order data
            const orderData = {
                addressId: selectedAddress._id,
                paymentMethod,
                paymentLinkId: '',
            };

            console.log('Sending order data:', orderData);
            console.log('Cart items count:', cart.items.length);

            const response = await customFetch.post('order/createorder', orderData);

            console.log('Order creation response:', response.data);

            if (response.data && response.data.success) {
                // For COD orders, navigate to success page
                if (paymentMethod === 'cod') {
                    Toast.show({
                        type: 'success',
                        text1: 'Order Placed Successfully',
                        text2: 'Your order will be delivered soon!'
                    });
                    clearCart();
                    navigation.navigate('OrderSuccess', { 
                        orderId: response.data.order._id, 
                        amount: 0, 
                        paymentId: '', 
                        orderDate: response.data.order.updatedAt 
                    });
                } else {
                    // For online payment, initiate Razorpay
                    initiateRazorpayPayment(response.data.order._id);
                }
            } else {
                throw new Error(response.data?.message || 'Failed to create order');
            }
        } catch (error) {
            console.error('Order creation error:', error);
            console.error('Error response:', error.response?.data);
            
            const errorMessage = error.response?.data?.message || error.message || 'Something went wrong';
            
            setOrderError(errorMessage);
            Toast.show({
                type: 'error',
                text1: 'Order Failed',
                text2: errorMessage
            });
            
            navigation.navigate('OrderFailed', { 
                cart, 
                selectedAddress, 
                errorMessage 
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Create Razorpay payment order
    const createPaymentOrder = async (amount) => {
        try {
            console.log('Creating payment order for amount:', amount);

            const response = await customFetch.post('order/create-payment-app', {
                amount: amount,
            });

            if (!response.data || !response.data.order) {
                throw new Error('Invalid response from payment service');
            }

            console.log('Payment order created:', response.data.order);
            return response.data.order;
        } catch (error) {
            console.error('Error creating payment order:', error);
            Toast.show({
                type: 'error',
                text1: 'Payment Error',
                text2: error.response?.data?.message || 'Failed to create payment order'
            });
            throw error;
        }
    };

    // Verify payment with backend
    const verifyPayment = async (paymentData, orderId) => {
        try {
            console.log('Verifying payment with backend...');
            
            const verificationData = {
                ...paymentData,
                orderId: orderId
            };

            const response = await customFetch.post('order/verify-payment-app', verificationData);

            if (response.data && response.data.success) {
                console.log('Payment verified successfully');
                return true;
            } else {
                throw new Error(response.data?.message || 'Payment verification failed');
            }
        } catch (error) {
            console.error('Error verifying payment:', error);
            Toast.show({
                type: 'error',
                text1: 'Verification Failed',
                text2: error.response?.data?.message || 'Payment could not be verified'
            });
            return false;
        }
    };

    // Function to handle Razorpay payment
    const initiateRazorpayPayment = async (orderId) => {
        try {
            console.log("Initiating Razorpay payment for order:", orderId);

            // Create a Razorpay payment order
            const paymentOrder = await createPaymentOrder(cart.totalDiscountedPrice);

            if (!paymentOrder || !paymentOrder.id) {
                throw new Error('Failed to create payment order');
            }

            console.log("Payment order created:", paymentOrder.id);

            // Configure Razorpay options
            const options = {
                description: 'PreciAgri Order Payment',
                image: 'https://res.cloudinary.com/daon246ck/image/upload/c_thumb,w_200,g_face/v1742024476/app_icon_lcrihw.png',
                currency: 'INR',
                key: 'rzp_test_bCwRAS88ZwEfxA',
                amount: (cart.totalDiscountedPrice * 100).toString(),
                name: 'PreciAgri',
                order_id: paymentOrder.id,
                prefill: {
                    email: '',
                    contact: selectedAddress.mobile,
                    name: selectedAddress.Name
                },
                theme: { color: '#4CAF50' }
            };

            // Open Razorpay checkout
            RazorpayCheckout.open(options)
                .then(async (data) => {
                    console.log("Payment successful:", data);

                    // Prepare verification data
                    const verificationData = {
                        razorpay_order_id: data.razorpay_order_id,
                        razorpay_payment_id: data.razorpay_payment_id,
                        razorpay_signature: data.razorpay_signature
                    };

                    // Verify payment with backend
                    const isVerified = await verifyPayment(verificationData, orderId);

                    if (isVerified) {
                        // Payment verified successfully
                        Toast.show({
                            type: 'success',
                            text1: 'Payment Successful',
                            text2: `Payment ID: ${data.razorpay_payment_id}`
                        });
                        clearCart();
                        navigation.navigate('OrderSuccess', { 
                            orderId: orderId, 
                            amount: cart.totalDiscountedPrice, 
                            paymentId: data.razorpay_payment_id, 
                            orderDate: Date.now() 
                        });
                    } else {
                        // Payment verification failed
                        Toast.show({
                            type: 'error',
                            text1: 'Payment Failed',
                            text2: 'Payment verification failed'
                        });
                        navigation.navigate('OrderFailed', { 
                            cart, 
                            selectedAddress, 
                            errorMessage: 'Payment verification failed' 
                        });
                    }
                })
                .catch((error) => {
                    // Handle payment failure
                    console.error('Razorpay error:', error);
                    Toast.show({
                        type: 'error',
                        text1: 'Payment Failed',
                        text2: error.description || 'Please try again later'
                    });
                    navigation.navigate('OrderFailed', { 
                        cart, 
                        selectedAddress, 
                        errorMessage: error.description 
                    });
                });
        } catch (error) {
            console.error('Error initiating payment:', error);
            Toast.show({
                type: 'error',
                text1: 'Payment Error',
                text2: error.message || 'Failed to initiate payment'
            });
            navigation.navigate('OrderFailed', { 
                cart, 
                selectedAddress, 
                errorMessage: error.message 
            });
        }
    };

    // Render the order items
    const renderOrderItems = () => (
        <View style={styles.orderItemsContainer}>
            {cart.items.map(item => (
                <OrderItem key={item._id} item={item} />
            ))}
            {cart.items.length === 0 && (
                <Text style={styles.emptyCartText}>No items in your cart</Text>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <CustomTopBar navigation={navigation} title="Order Summary" />
            <View style={styles.rootContainer}>
                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
                    <AddressCard address={selectedAddress} />
                    {renderOrderItems()}
                    <OrderSummaryDetails cart={cart} />
                    <PaymentMethodSelector
                        selectedMethod={paymentMethod}
                        onSelect={setPaymentMethod}
                    />
                    {orderError && (
                        <Text style={styles.errorText}>{orderError}</Text>
                    )}
                    <View style={styles.bottomPadding} />
                </ScrollView>

                <View style={styles.fixedButtonContainer}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleCreateOrder}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.actionButtonText}>
                                {paymentMethod === 'cod'
                                    ? 'Confirm Order'
                                    : `Pay ₹${cart.totalDiscountedPrice}`}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
            <Toast />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    rootContainer: {
        flex: 1,
        position: 'relative',
    },
    scrollView: {
        flex: 1,
    },
    scrollViewContent: {
        padding: 5,
        paddingBottom: 24,
    },
    orderItemsContainer: {
        marginBottom: 10,
    },
    deliveryDetails: {
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 8,
        marginBottom: 10,
        elevation: 2,
    },
    deliveryTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    addressText: {
        fontSize: 14,
        color: '#555',
        marginBottom: 4,
    },
    orderItem: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        padding: 12,
        marginBottom: 4,
    },
    productImage: {
        width: 80,
        height: 80,
        borderRadius: 4,
        marginRight: 12,
    },
    productDetails: {
        flex: 1,
        justifyContent: 'space-between',
    },
    productName: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    productSize: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    productPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2e7d32',
        marginBottom: 4,
    },
    originalPrice: {
        fontSize: 14,
        fontWeight: 'normal',
        color: '#999',
        textDecorationLine: 'line-through',
    },
    productQuantity: {
        fontSize: 14,
        color: '#666',
    },
    orderSummary: {
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
        elevation: 2,
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryText: {
        fontSize: 14,
        color: '#555',
    },
    grandTotalText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2e7d32',
    },
    paymentMethodContainer: {
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
        elevation: 2,
    },
    paymentTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    paymentOptions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    paymentOption: {
        flex: 1,
        padding: 12,
        marginHorizontal: 4,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#ddd',
        alignItems: 'center',
    },
    selectedPaymentOption: {
        borderColor: '#4CAF50',
        backgroundColor: '#E8F5E9',
    },
    paymentOptionText: {
        fontWeight: '500',
    },
    fixedButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#f8f8f8',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        elevation: 4,
    },
    actionButton: {
        backgroundColor: '#4CAF50',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    actionButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    errorText: {
        color: '#d32f2f',
        textAlign: 'center',
        marginBottom: 12,
    },
    emptyCartText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#999',
        padding: 20,
    },
    bottomPadding: {
        height: 50,
    }
});

export default OrderSummaryPage;
import React, { useState, useContext } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, SafeAreaView, Modal } from 'react-native';
import { WebView } from 'react-native-webview';
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
const OrderSummaryDetails = ({ cart, shippingCost, loadingShipping, shippingInfo }) => (
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
            {loadingShipping ? (
                <ActivityIndicator size="small" color="#4CAF50" />
            ) : (
                <Text style={styles.summaryText}>₹ {shippingCost.toFixed(2)}</Text>
            )}
        </View>
        {shippingInfo && (
            <View style={styles.summaryRow}>
                <Text style={styles.shippingInfoText}>Est. Delivery: {shippingInfo.estimatedDays} days</Text>
                <Text style={styles.shippingInfoText}>{shippingInfo.courierName}</Text>
            </View>
        )}
        <View style={styles.summaryRow}>
            <Text style={styles.grandTotalText}>Grand Total</Text>
            <Text style={styles.grandTotalText}>₹ {(cart.totalDiscountedPrice + shippingCost).toFixed(2)}</Text>
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
    
    // WebView states
    const [showWebView, setShowWebView] = useState(false);
    const [razorpayHTML, setRazorpayHTML] = useState('');
    const [currentOrderId, setCurrentOrderId] = useState(null);
    const [currentOrderAmount, setCurrentOrderAmount] = useState(0);
    
    // Shiprocket states
    const [shippingCost, setShippingCost] = useState(0);
    const [shippingInfo, setShippingInfo] = useState(null);
    const [loadingShipping, setLoadingShipping] = useState(false);

    // Calculate shipping cost when address is available
    React.useEffect(() => {
        const calculateShipping = async () => {
            if (!selectedAddress || !selectedAddress.zipCode) {
                return;
            }

            setLoadingShipping(true);
            try {
                const response = await customFetch.post('shiprocket/check-serviceability', {
                    pincode: selectedAddress.zipCode,
                    pickupPincode: '110001',
                    weight: 0.5,
                    cod: paymentMethod === 'cod' ? 1 : 0,
                });

                if (response.data.success && response.data.serviceable) {
                    setShippingCost(response.data.shippingCost || 0);
                    setShippingInfo({
                        cost: response.data.shippingCost || 0,
                        estimatedDays: response.data.estimatedDays || '5-7',
                        courierName: response.data.courierName || 'Standard',
                    });
                } else {
                    setShippingCost(0);
                    setShippingInfo(null);
                }
            } catch (error) {
                console.error('Error calculating shipping:', error);
                setShippingCost(0);
                setShippingInfo(null);
            } finally {
                setLoadingShipping(false);
            }
        };

        calculateShipping();
    }, [selectedAddress, paymentMethod]);

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

    // Handle WebView messages
    const handleWebViewMessage = async (event) => {
        try {
            const message = JSON.parse(event.nativeEvent.data);
            console.log('WebView message received:', message);
            
            if (message.type === 'success') {
                setShowWebView(false);
                setIsLoading(true);
                
                const verificationData = {
                    razorpay_order_id: message.data.razorpay_order_id,
                    razorpay_payment_id: message.data.razorpay_payment_id,
                    razorpay_signature: message.data.razorpay_signature
                };

                const isVerified = await verifyPayment(verificationData, currentOrderId);

                if (isVerified) {
                    Toast.show({
                        type: 'success',
                        text1: 'Payment Successful',
                        text2: `Payment ID: ${message.data.razorpay_payment_id}`
                    });
                    clearCart();
                    navigation.navigate('OrderSuccess', { 
                        orderId: currentOrderId, 
                        amount: currentOrderAmount,
                        paymentId: message.data.razorpay_payment_id, 
                        orderDate: Date.now() 
                    });
                } else {
                    navigation.navigate('OrderFailed', { 
                        cart, 
                        selectedAddress, 
                        errorMessage: 'Payment verification failed' 
                    });
                }
                setIsLoading(false);
            } else if (message.type === 'error') {
                setShowWebView(false);
                Toast.show({
                    type: 'error',
                    text1: 'Payment Failed',
                    text2: message.data.description || 'Please try again'
                });
                navigation.navigate('OrderFailed', { 
                    cart, 
                    selectedAddress, 
                    errorMessage: message.data.description || 'Payment failed'
                });
            } else if (message.type === 'dismiss') {
                setShowWebView(false);
                Toast.show({
                    type: 'info',
                    text1: 'Payment Cancelled',
                    text2: 'You cancelled the payment'
                });
            }
        } catch (error) {
            console.error('Error handling payment response:', error);
            setShowWebView(false);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to process payment response'
            });
        }
    };

    // Function to handle Razorpay payment using WebView
    const initiateRazorpayPayment = async (orderId, orderTotalAmount) => {
        try {
            console.log("Initiating Razorpay payment for order:", orderId);
            console.log("Order total amount:", orderTotalAmount);

            // Validate amount is not 0
            if (!orderTotalAmount || orderTotalAmount === 0) {
                throw new Error('Invalid order amount: Amount cannot be 0');
            }

            // Create a Razorpay payment order
            const paymentOrder = await createPaymentOrder(orderTotalAmount);

            if (!paymentOrder || !paymentOrder.id) {
                throw new Error('Failed to create payment order');
            }

            console.log("Payment order created:", paymentOrder.id);

            // Store order details
            setCurrentOrderId(orderId);
            setCurrentOrderAmount(orderTotalAmount);

            // Create HTML for Razorpay Checkout
            const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        margin: 0;
                        background-color: #f5f5f5;
                    }
                    .loading {
                        text-align: center;
                    }
                    .spinner {
                        border: 4px solid #f3f3f3;
                        border-top: 4px solid #4CAF50;
                        border-radius: 50%;
                        width: 40px;
                        height: 40px;
                        animation: spin 1s linear infinite;
                        margin: 0 auto 20px;
                    }
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            </head>
            <body>
                <div class="loading">
                    <div class="spinner"></div>
                    <p>Opening Payment Gateway...</p>
                </div>
                <script>
                    try {
                        var options = {
                            "key": "rzp_test_bCwRAS88ZwEfxA",
                            "amount": ${orderTotalAmount * 100},
                            "currency": "INR",
                            "name": "PreciAgri",
                            "description": "Order Payment",
                            "image": "https://res.cloudinary.com/daon246ck/image/upload/c_thumb,w_200,g_face/v1742024476/app_icon_lcrihw.png",
                            "order_id": "${paymentOrder.id}",
                            "prefill": {
                                "name": "${selectedAddress.Name}",
                                "contact": "${selectedAddress.mobile}"
                            },
                            "theme": {
                                "color": "#4CAF50"
                            },
                            "handler": function (response) {
                                window.ReactNativeWebView.postMessage(JSON.stringify({
                                    type: 'success',
                                    data: response
                                }));
                            },
                            "modal": {
                                "ondismiss": function() {
                                    window.ReactNativeWebView.postMessage(JSON.stringify({
                                        type: 'dismiss'
                                    }));
                                }
                            }
                        };
                        
                        var rzp = new Razorpay(options);
                        
                        rzp.on('payment.failed', function (response){
                            window.ReactNativeWebView.postMessage(JSON.stringify({
                                type: 'error',
                                data: response.error
                            }));
                        });
                        
                        rzp.open();
                    } catch (error) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: 'error',
                            data: { description: error.message }
                        }));
                    }
                </script>
            </body>
            </html>
            `;

            setRazorpayHTML(html);
            setShowWebView(true);

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

            // Prepare order data with shipping info
            const orderData = {
                addressId: selectedAddress._id,
                paymentMethod,
                paymentLinkId: '',
                shippingCost: shippingCost,
                shippingInfo: shippingInfo,
            };

            console.log('Sending order data:', orderData);
            console.log('Cart items count:', cart.items.length);
            console.log('Shipping cost:', shippingCost);

            const response = await customFetch.post('order/createorder', orderData);

            console.log('Order creation response:', response.data);

            if (response.data && response.data.success) {
                const createdOrder = response.data.order;
                
                console.log('Created order total amount:', createdOrder.totalAmount);
                
                // For COD orders, navigate to success page
                if (paymentMethod === 'cod') {
                    Toast.show({
                        type: 'success',
                        text1: 'Order Placed Successfully',
                        text2: 'Your order will be delivered soon!'
                    });
                    clearCart();
                    navigation.navigate('OrderSuccess', { 
                        orderId: createdOrder._id, 
                        amount: 0, 
                        paymentId: '', 
                        orderDate: createdOrder.updatedAt 
                    });
                } else {
                    // For online payment, use WebView approach
                    setIsLoading(false); // Stop loading before opening payment
                    await initiateRazorpayPayment(createdOrder._id, createdOrder.totalAmount);
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
            if (paymentMethod === 'cod') {
                setIsLoading(false);
            }
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
                    <OrderSummaryDetails 
                        cart={cart} 
                        shippingCost={shippingCost}
                        loadingShipping={loadingShipping}
                        shippingInfo={shippingInfo}
                    />
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

            {/* Razorpay WebView Modal */}
            <Modal
                visible={showWebView}
                animationType="slide"
                onRequestClose={() => {
                    setShowWebView(false);
                    Toast.show({
                        type: 'info',
                        text1: 'Payment Cancelled'
                    });
                }}
            >
                <SafeAreaView style={styles.webViewContainer}>
                    <View style={styles.webViewHeader}>
                        <Text style={styles.webViewTitle}>Complete Payment</Text>
                        <TouchableOpacity
                            onPress={() => {
                                setShowWebView(false);
                                Toast.show({
                                    type: 'info',
                                    text1: 'Payment Cancelled'
                                });
                            }}
                            style={styles.closeButton}
                        >
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>
                    <WebView
                        source={{ html: razorpayHTML }}
                        onMessage={handleWebViewMessage}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        startInLoadingState={true}
                        scalesPageToFit={true}
                    />
                </SafeAreaView>
            </Modal>

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
    shippingInfoText: {
        fontSize: 12,
        color: '#16a34a',
        fontStyle: 'italic',
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
    },
    webViewContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    webViewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#4CAF50',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    webViewTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    closeButton: {
        padding: 8,
    },
    closeButtonText: {
        fontSize: 24,
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default OrderSummaryPage;
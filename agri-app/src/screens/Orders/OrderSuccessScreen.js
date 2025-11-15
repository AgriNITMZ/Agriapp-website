import React, { useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, Animated, ScrollView } from 'react-native';
import { formatDate } from '../../utils/dateFormatter';
import { Ionicons } from '@expo/vector-icons';

const OrderSuccessScreen = ({ navigation, route }) => {
    const { orderId, amount, paymentId, orderDate } = route.params || {};

    // Animation values
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        // Animate checkmark
        Animated.sequence([
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    }, []);

    // Format the date properly
    const formattedDate = formatDate(orderDate);
    
    // Determine payment method
    const isCOD = !amount || amount === 0 || amount === '0';
    const displayAmount = amount ? parseFloat(amount) : 0;

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar backgroundColor="#4CAF50" barStyle="light-content" />
            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Success Animation */}
                <Animated.View 
                    style={[
                        styles.successContainer,
                        { transform: [{ scale: scaleAnim }] }
                    ]}
                >
                    <View style={styles.checkmarkCircle}>
                        <Ionicons name="checkmark" size={60} color="white" />
                    </View>
                    <Text style={styles.successTitle}>Order Placed Successfully!</Text>
                    <Text style={styles.successSubtitle}>
                        Thank you for your order. Your farming supplies will be delivered soon.
                    </Text>
                </Animated.View>

                {/* Order Details Card */}
                <Animated.View 
                    style={[
                        styles.card,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <View style={styles.cardHeader}>
                        <Ionicons name="receipt-outline" size={24} color="white" />
                        <Text style={styles.cardHeaderText}>Order Details</Text>
                    </View>

                    <View style={styles.cardContent}>
                        <View style={styles.detailRow}>
                            <View style={styles.detailLabelContainer}>
                                <Ionicons name="document-text-outline" size={20} color="#666" />
                                <Text style={styles.detailLabel}>Order ID</Text>
                            </View>
                            <Text style={styles.detailValue} numberOfLines={1}>
                                #{orderId?.slice(-8) || 'N/A'}
                            </Text>
                        </View>

                        <View style={styles.separator} />

                        <View style={styles.detailRow}>
                            <View style={styles.detailLabelContainer}>
                                <Ionicons name="calendar-outline" size={20} color="#666" />
                                <Text style={styles.detailLabel}>Order Date</Text>
                            </View>
                            <Text style={styles.detailValue}>{formattedDate}</Text>
                        </View>

                        <View style={styles.separator} />

                        <View style={styles.detailRow}>
                            <View style={styles.detailLabelContainer}>
                                <Ionicons name="cash-outline" size={20} color="#666" />
                                <Text style={styles.detailLabel}>Payment Method</Text>
                            </View>
                            <Text style={styles.detailValue}>
                                {isCOD ? 'Cash on Delivery' : 'Online Payment'}
                            </Text>
                        </View>

                        {!isCOD && (
                            <>
                                <View style={styles.separator} />
                                <View style={styles.detailRow}>
                                    <View style={styles.detailLabelContainer}>
                                        <Ionicons name="card-outline" size={20} color="#666" />
                                        <Text style={styles.detailLabel}>Amount Paid</Text>
                                    </View>
                                    <Text style={[styles.detailValue, styles.amountPaid]}>
                                        ₹{displayAmount.toLocaleString('en-IN')}
                                    </Text>
                                </View>
                            </>
                        )}

                        {paymentId && (
                            <>
                                <View style={styles.separator} />
                                <View style={styles.detailRow}>
                                    <View style={styles.detailLabelContainer}>
                                        <Ionicons name="shield-checkmark-outline" size={20} color="#666" />
                                        <Text style={styles.detailLabel}>Payment ID</Text>
                                    </View>
                                    <Text style={styles.detailValue} numberOfLines={1}>
                                        {paymentId.slice(-12)}
                                    </Text>
                                </View>
                            </>
                        )}
                    </View>
                </Animated.View>

                {/* Delivery Info */}
                <Animated.View 
                    style={[
                        styles.deliveryInfo,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <View style={styles.deliveryIconContainer}>
                        <Ionicons name="cube-outline" size={28} color="#4CAF50" />
                    </View>
                    <View style={styles.deliveryTextContainer}>
                        <Text style={styles.deliveryTitle}>Estimated Delivery</Text>
                        <Text style={styles.deliveryText}>3-4 business days</Text>
                    </View>
                </Animated.View>

                {/* Action Buttons */}
                <Animated.View 
                    style={[
                        styles.buttonContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() => navigation.navigate('MyOrders')}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="list-outline" size={20} color="white" />
                        <Text style={styles.primaryButtonText}>Track Order</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={() => navigation.navigate('HomePage')}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="home-outline" size={20} color="#4CAF50" />
                        <Text style={styles.secondaryButtonText}>Continue Shopping</Text>
                    </TouchableOpacity>
                </Animated.View>

                {/* Help Section */}
                <View style={styles.helpSection}>
                    <Text style={styles.helpText}>Need help with your order?</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('ContactUs')}>
                        <Text style={styles.helpLink}>Contact Support</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    successContainer: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 30,
    },
    checkmarkCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        elevation: 8,
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    successTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#2E7D32',
        marginBottom: 8,
        textAlign: 'center',
    },
    successSubtitle: {
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
        paddingHorizontal: 20,
        lineHeight: 22,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        marginBottom: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        overflow: 'hidden',
    },
    cardHeader: {
        backgroundColor: '#4CAF50',
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardHeaderText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    cardContent: {
        padding: 16,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    detailLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    detailLabel: {
        fontSize: 15,
        color: '#666',
        marginLeft: 8,
        fontWeight: '500',
    },
    detailValue: {
        fontSize: 15,
        color: '#333',
        fontWeight: '600',
        flex: 1,
        textAlign: 'right',
    },
    amountPaid: {
        color: '#4CAF50',
        fontSize: 18,
        fontWeight: 'bold',
    },
    separator: {
        height: 1,
        backgroundColor: '#F0F0F0',
    },
    deliveryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#4CAF50',
    },
    deliveryIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    deliveryTextContainer: {
        flex: 1,
    },
    deliveryTitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    deliveryText: {
        color: '#2E7D32',
        fontSize: 16,
        fontWeight: 'bold',
    },
    buttonContainer: {
        marginTop: 10,
    },
    primaryButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 20,
        alignItems: 'center',
        marginBottom: 12,
        elevation: 3,
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    primaryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    secondaryButton: {
        backgroundColor: 'white',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 20,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#4CAF50',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    secondaryButtonText: {
        color: '#4CAF50',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    helpSection: {
        alignItems: 'center',
        marginTop: 30,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    helpText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    helpLink: {
        fontSize: 15,
        color: '#4CAF50',
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
});

export default OrderSuccessScreen;
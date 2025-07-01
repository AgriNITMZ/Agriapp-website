import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { formatDate } from '../../utils/dateFormatter';

const OrderSuccessScreen = ({ navigation, route }) => {
    const { orderId, amount, paymentId, orderDate } = route.params || {};

    // Format the date properly
    const formattedDate = formatDate(orderDate);

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar backgroundColor="#4CAF50" barStyle="light-content" />
            <View style={styles.container}>
                <View style={styles.successContainer}>
                    <View style={styles.checkmarkCircle}>
                        <Image
                            source={require('../../assets/images/placeholder/checkIcon.png')}
                            style={styles.checkmark}
                            resizeMode="contain"
                        />
                    </View>
                    <Text style={styles.successTitle}>Order Confirmed!</Text>
                    <Text style={styles.successSubtitle}>Your farming supplies are on the way</Text>
                </View>

                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardHeaderText}>Order Summary</Text>
                    </View>

                    <View style={styles.cardContent}>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Order ID</Text>
                            <Text style={styles.detailValue}>{orderId}</Text>
                        </View>

                        <View style={styles.separator} />

                        <View style={styles.detailRow}>
                            {amount == 0 ? <>
                                <Text style={styles.detailLabel}>Amount Paid</Text>
                                <Text style={styles.detailValue}>₹{parseFloat(amount).toLocaleString('en-IN')}</Text>
                            </>
                                : <Text style={styles.detailLabel}>Cash on Delivery</Text>}
                        </View>

                        <View style={styles.separator} />

                        {paymentId && <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Payment ID</Text>
                            <Text style={styles.detailValue}>{paymentId}</Text>
                        </View>}

                        <View style={styles.separator} />

                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Order Date</Text>
                            <Text style={styles.detailValue}>{formattedDate}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.deliveryInfo}>
                    <Image source={require('../../assets/images/truck.png')} style={styles.deliveryIcon} />
                    <Text style={styles.deliveryText}>Estimated delivery in 3-4 business days</Text>
                </View>

                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => navigation.navigate('MyOrders')}
                >
                    <Text style={styles.primaryButtonText}>View My Orders</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => navigation.navigate('HomePage')}
                >
                    <Text style={styles.secondaryButtonText}>Continue Shopping</Text>
                </TouchableOpacity>

                {/* <TouchableOpacity
                    style={styles.helpLink}
                    onPress={() => navigation.navigate('Contact-us')}
                >
                    <Text style={styles.helpLinkText}>Need help with your order?</Text>
                </TouchableOpacity> */}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    container: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
    },
    successContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    checkmarkCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        elevation: 5,
    },
    checkmark: {
        width: 50,
        height: 50,
        tintColor: 'white',
    },
    successTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2E7D32',
        marginBottom: 8,
    },
    successSubtitle: {
        fontSize: 16,
        color: '#5A5A5A',
        textAlign: 'center',
        marginBottom: 20,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        width: '100%',
        marginVertical: 16,
        elevation: 3,
        overflow: 'hidden',
    },
    cardHeader: {
        backgroundColor: '#4CAF50',
        padding: 15,
    },
    cardHeaderText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    cardContent: {
        padding: 15,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
    },
    detailLabel: {
        fontSize: 16,
        color: '#5A5A5A',
        fontWeight: '500',
    },
    detailValue: {
        fontSize: 16,
        color: '#333333',
        fontWeight: 'bold',
    },
    separator: {
        height: 1,
        backgroundColor: '#E0E0E0',
    },
    deliveryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        borderRadius: 8,
        padding: 12,
        marginVertical: 12,
        width: '100%',
    },
    deliveryIcon: {
        width: 24,
        height: 24,
        marginRight: 10,
        tintColor: '#4CAF50',
    },
    deliveryText: {
        color: '#2E7D32',
        fontSize: 14,
        fontWeight: '500',
    },
    primaryButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 8,
        paddingVertical: 14,
        paddingHorizontal: 20,
        width: '100%',
        alignItems: 'center',
        marginVertical: 8,
        elevation: 2,
    },
    primaryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryButton: {
        backgroundColor: 'white',
        borderRadius: 8,
        paddingVertical: 14,
        paddingHorizontal: 20,
        width: '100%',
        alignItems: 'center',
        marginVertical: 8,
        borderWidth: 1,
        borderColor: '#4CAF50',
        elevation: 1,
    },
    secondaryButtonText: {
        color: '#4CAF50',
        fontSize: 16,
        fontWeight: 'bold',
    },
    helpLink: {
        marginTop: 15,
        padding: 5,
    },
    helpLinkText: {
        color: '#4CAF50',
        fontSize: 14,
        textDecorationLine: 'underline',
    },
});

export default OrderSuccessScreen;
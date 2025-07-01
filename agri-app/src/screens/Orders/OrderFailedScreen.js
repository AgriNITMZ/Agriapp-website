import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const OrderFailedScreen = ({ route }) => {
    const navigation = useNavigation();
    const { cart, selectedAddress, errorMessage } = route.params || {};

    // Default error message if none provided
    const displayErrorMessage = errorMessage || "Your payment couldn't be processed. Please try again.";

    const handleRetry = () => {
        // Navigate back to order summary with the same cart and address
        navigation.navigate('OrderSummary', {
            cart,
            selectedAddress
        });
    };

    const handleGoToCart = () => {
        // Navigate to cart screen
        navigation.navigate('Cart');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar backgroundColor="#F44336" barStyle="light-content" />
            <View style={styles.container}>
                <View style={styles.failedContainer}>
                    <View style={styles.errorCircle}>
                        <Image
                            source={require('../../assets/images/placeholder/error.png')}
                            style={styles.errorIcon}
                            resizeMode="contain"
                        />
                    </View>
                    <Text style={styles.failedTitle}>Payment Failed</Text>
                    <Text style={styles.failedSubtitle}>{displayErrorMessage}</Text>
                </View>

                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardHeaderText}>What happened?</Text>
                    </View>

                    <View style={styles.cardContent}>
                        <View style={styles.reasonItem}>
                            <View style={styles.reasonBullet} />
                            <Text style={styles.reasonText}>The payment might have been declined by your bank</Text>
                        </View>

                        <View style={styles.reasonItem}>
                            <View style={styles.reasonBullet} />
                            <Text style={styles.reasonText}>There might have been a temporary network issue</Text>
                        </View>

                        <View style={styles.reasonItem}>
                            <View style={styles.reasonBullet} />
                            <Text style={styles.reasonText}>The payment gateway might be experiencing problems</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.actionInfo}>
                    <Image source={require('../../assets/images/placeholder/info.png')} style={styles.infoIcon} />
                    <Text style={styles.infoText}>Don't worry! Your cart items are still saved</Text>
                </View>

                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handleRetry}
                >
                    <Text style={styles.primaryButtonText}>Retry Payment</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={handleGoToCart}
                >
                    <Text style={styles.secondaryButtonText}>Return to Cart</Text>
                </TouchableOpacity>

                {/* <TouchableOpacity 
          style={styles.helpLink} 
          onPress={() => navigation.navigate('Support')}
        >
          <Text style={styles.helpLinkText}>Contact support for assistance</Text>
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
        padding: 10,
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
    },
    failedContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    errorCircle: {
        width: 80,
        height: 80,
        borderRadius: 50,
        backgroundColor: '#F44336',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        elevation: 5,
    },
    errorIcon: {
        width: 50,
        height: 50,
        tintColor: 'white',
    },
    failedTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#D32F2F',
        marginBottom: 8,
    },
    failedSubtitle: {
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
        backgroundColor: '#F44336',
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
    reasonItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
    },
    reasonBullet: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#F44336',
        marginRight: 10,
    },
    reasonText: {
        fontSize: 15,
        color: '#5A5A5A',
        flex: 1,
    },
    actionInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFEBEE',
        borderRadius: 8,
        padding: 12,
        marginVertical: 12,
        width: '100%',
    },
    infoIcon: {
        width: 24,
        height: 24,
        marginRight: 10,
        tintColor: '#F44336',
    },
    infoText: {
        color: '#D32F2F',
        fontSize: 14,
        fontWeight: '500',
    },
    primaryButton: {
        backgroundColor: '#4CAF50', // Keeping the primary brand color from the success screen
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
        color: '#F44336',
        fontSize: 14,
        textDecorationLine: 'underline',
    },
});

export default OrderFailedScreen;
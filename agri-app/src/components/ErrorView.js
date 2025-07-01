import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

/**
 * ErrorView displays an error state with retry functionality
 * 
 * @param {Object} props
 * @param {string} props.message - Error message to display
 * @param {Function} props.onRetry - Function to call when retry button is pressed
 * @param {string} [props.imageSource] - Optional custom error image source
 */
const ErrorView = ({ message, onRetry, imageSource }) => {
    return (
        <View style={styles.container}>
            <Image
                source={imageSource || require('../assets/images/placeholder/error.png')}
                style={styles.errorImage}
            />
            <Text style={styles.errorText}>{message}</Text>
            <TouchableOpacity
                style={styles.retryButton}
                onPress={onRetry}
                activeOpacity={0.7}
            >
                <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 20,
    },
    errorImage: {
        width: 100,
        height: 100,
        marginBottom: 20,
        tintColor: '#FF5252',
    },
    errorText: {
        fontSize: 16,
        color: '#555555',
        textAlign: 'center',
        marginBottom: 24,
        maxWidth: '80%',
    },
    retryButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: '#2E7D32',
        borderRadius: 8,
        elevation: 2,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ErrorView;
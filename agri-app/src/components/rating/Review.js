import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import customFetch from '../../utils/axios';
import { MaterialIcons } from '@expo/vector-icons';

/**
 * ProductReviews Component
 * Fetches and displays customer reviews for a specific product.
 *
 * @param {string} productId - The ID of the product to fetch reviews for.
 */
const ProductReviews = ({ productId }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await customFetch.get(`products/${productId}`);
                setReviews(response.data.data); // Assuming reviews are inside response.data.data
            } catch (err) {
                setError('Failed to fetch reviews');
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [productId]);

    // Show loading animation while fetching data
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.loadingText}>Loading Reviews...</Text>
            </View>
        );
    }

    // Show error message if API request fails
    if (error) {
        return <Text style={styles.error}>{error}</Text>;
    }

    // Show message if there are no reviews
    if (!reviews.length) {
        return <Text style={styles.noReviews}>No reviews yet.</Text>;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Customer Reviews</Text>
            {reviews.map((review) => (
                <ReviewCard key={review._id} review={review} />
            ))}
        </View>
    );
};

/**
 * ReviewCard Component
 * Displays individual customer review details including rating, review text, and user info.
 *
 * @param {Object} review - The review object containing rating, review text, user, and createdAt.
 */
const ReviewCard = ({ review }) => {
    const formattedDate = new Date(review.createdAt).toLocaleDateString();

    return (
        <View style={styles.reviewCard}>
            {/* Star Rating Display */}
            <View style={styles.ratingContainer}>
                {[...Array(5)].map((_, i) => (
                    <MaterialIcons
                        key={i}
                        name={i < review.rating ? "star" : "star-border"}
                        size={18}
                        color="#FFD700" // Gold color for stars
                    />
                ))}
            </View>

            {/* Review Text */}
            <Text style={styles.review}>{review.review}</Text>

            {/* User Info & Date */}
            <View style={styles.footer}>
                <Text style={styles.userName}>{review.user?.Name || 'Anonymous'}</Text>
                <Text style={styles.date}>{formattedDate}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 8,
        marginTop: 10,
        elevation: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    reviewCard: {
        padding: 12,
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    review: {
        fontSize: 16,
        fontWeight: '500',
        color: '#444',
        marginVertical: 6,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 5,
    },
    userName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    date: {
        fontSize: 12,
        color: '#777',
    },
    error: {
        color: 'red',
        textAlign: 'center',
        fontSize: 16,
    },
    noReviews: {
        padding: 15,
        fontSize: 16,
        textAlign: 'center',
        color: '#444',
    },
    loadingContainer: {
        padding: 16,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 8,
        fontSize: 16,
        color: '#4CAF50',
    },
});

export default ProductReviews;

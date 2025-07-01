import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

/**
 * RatingComponent
 * Displays customer rating statistics including average rating and rating distribution.
 *
 * @param {Object} ratings - The ratings data containing:
 *  - distribution: Object showing number of ratings per star level
 *  - average: Number representing the average rating
 *  - count: Total number of ratings
 */
const RatingComponent = ({ ratings }) => {

    // Extract data from ratings prop
    const { distribution, average, count } = ratings;
    const totalRatings = count || 0; // Total number of ratings
    const rating = average ? average.toFixed(1) : "0.0"; // Format average rating

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Customer Ratings</Text>

            {/* Average Rating Display */}
            <View style={styles.ratingContainer}>
                <View style={styles.ratingInfo}>
                    <View style={styles.ratingBox}>
                        <Text style={styles.ratingText}>{rating}</Text>
                        <FontAwesome name="star" size={20} color="white" />
                    </View>
                    <Text style={styles.totalRatings}>{totalRatings} Ratings</Text>
                </View>

                {/* Star Ratings Breakdown */}
                <View style={styles.starsContainer}>
                    {Object.entries(distribution)
                        .reverse() // Ensure 5 stars at the top
                        .map(([starLevel, starCount], index) => {
                            const percentage = totalRatings > 0 ? (starCount / totalRatings) * 100 : 0;
                            return (
                                <View key={index} style={styles.starRow}>
                                    <Text style={styles.starLabel}>{starLevel}</Text>
                                    <FontAwesome name="star" size={16} color="black" />
                                    <View style={styles.progressBar}>
                                        <View style={[styles.progressBarFilled, { width: `${percentage}%` }]} />
                                    </View>
                                    <Text style={styles.starCount}>{starCount}</Text>
                                </View>
                            );
                        })}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 8,
        elevation: 4,
        alignItems: 'center',
        marginVertical: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    ratingContainer: {
        paddingTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    ratingInfo: {
        alignItems: 'center',
        marginRight: 16,
    },
    ratingBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4CAF50',
        padding: 8,
        borderRadius: 8,
        marginBottom: 4,
    },
    ratingText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        marginRight: 4,
    },
    totalRatings: {
        color: '#333',
    },
    starsContainer: {
        flex: 1,
    },
    starRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    starLabel: {
        paddingRight: 10,
        fontWeight: 'bold',
    },
    progressBar: {
        flex: 1,
        height: 8,
        backgroundColor: '#e0e0e0',
        borderRadius: 4,
        marginHorizontal: 8,
    },
    progressBarFilled: {
        height: '100%',
        backgroundColor: '#4CAF50',
        borderRadius: 4,
    },
    starCount: {
        width: 20,
        textAlign: 'right',
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

export default RatingComponent;

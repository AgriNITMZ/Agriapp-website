import React, { useRef, useState } from 'react';
import { View, Image, ScrollView, Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');

const ProductImages = ({ images }) => {
    const scrollViewRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);

    // Function to update the active dot index when scrolling
    const handleScroll = (event) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(contentOffsetX / width);
        setActiveIndex(index);
    };

    return (
        <View style={styles.container}>
            {/* Horizontal Scrollable Images */}
            <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
            >
                {images.map((url, index) => (
                    <Image key={index} source={{ uri: url }} style={styles.productImage} />
                ))}
            </ScrollView>

            {/* Dots Indicator */}
            <View style={styles.dotContainer}>
                {images.map((_, index) => (
                    <View
                        key={index}
                        style={[styles.dot, activeIndex === index && styles.activeDot]}
                    />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginVertical: 10,
    },
    productImage: {
        width: width,
        height: 300,
        backgroundColor: '#fff',
        resizeMode: 'contain',
        borderRadius: 10,
    },
    dotContainer: {
        flexDirection: 'row',
        marginTop: 8,
        justifyContent: 'center',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ccc',
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: '#2E7D32',
        width: 10,
        height: 10,
    },
});

export default ProductImages;

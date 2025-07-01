import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';

const services = [
    { id: '1', name: 'Weather', image: require('../../assets/images/weather.png') },
    { id: '5', name: 'Shop', image: require('../../assets/images/shop.png') },
    { id: '6', name: 'Sensor', image: require('../../assets/images/icons/sensor.png') },
    { id: '3', name: 'News', image: require('../../assets/images/icons/article.png') },
    { id: '4', name: 'Farming Tips', image: require('../../assets/images/tips.png') },
    { id: '2', name: 'Loan', image: require('../../assets/images/loan.png') },
];

const Services = ({ navigation }) => {
    const handlePress = (service) => {
        navigation.navigate(service.name.replace(/\s+/g, '')); // Navigate based on title
    };

    return (
        <View>
            <Text style={styles.sectionTitle}>Explore Our Services</Text>
            <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={services}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.serviceCard} onPress={() => handlePress(item)}>
                        <Image source={item.image} style={styles.serviceImage} />
                        <Text style={styles.serviceName}>{item.name}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    sectionTitle: {
        marginLeft: 10,
        marginTop: 20,
        marginBottom: 10,
        fontSize: 20,
        fontWeight: 'bold',
    },
    serviceCard: {
        width: 85,
        marginRight: 15,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: "#F0F8FF",
        paddingVertical: 10,
        marginBottom: 10,
        borderRadius: 10,
    },
    serviceImage: {
        width: 35,
        height: 35,
    },
    serviceName: {
        fontSize: 12,
    },
});

export default Services;

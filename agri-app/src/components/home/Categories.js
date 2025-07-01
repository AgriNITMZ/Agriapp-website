import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';

const categories = [
    { id: '1', name: 'Seeds', image: require('../../assets/images/seed.png') },
    { id: '2', name: 'Fertilizer', image: require('../../assets/images/fertilizer.png') },
    { id: '3', name: 'Pesticide', image: require('../../assets/images/pesticide.png') },
    { id: '4', name: 'Pump', image: require('../../assets/images/icons/category/water-pump.png') },
    { id: '5', name: 'Trowel', image: require('../../assets/images/tools.png') },
    { id: '6', name: 'Machine', image: require('../../assets/images/icons/category/machine.png') },
];

const Categories = ({ navigation }) => {
    const handlePress = (category) => {
        navigation.navigate('Shop', { search: category.name });
    };

    return (
        <View >
            <Text style={styles.sectionTitle}>Find What You Need</Text>
            <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={categories}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.categoryCard} onPress={() => handlePress(item)}>
                        <Image source={item.image} style={styles.categoryImage} />
                        <Text style={styles.categoryName}>{item.name}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    sectionTitle: {
        marginLeft: 10,
        marginVertical: 10,
        fontSize: 20,
        fontWeight: 'bold',
    },
    categoryCard: {
        width: 85,
        marginRight: 15,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: "#DAF9DA",
        paddingVertical: 10,
        borderRadius: 10,
    },
    categoryImage: {
        width: 35,
        height: 35,
    },
    categoryName: {
        fontSize: 12,
    },
});

export default Categories;

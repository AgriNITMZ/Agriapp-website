import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Image,
    ScrollView,
    Dimensions,
    SafeAreaView,
    Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomTopBar from '../../components/topBar/CustomTopBar';

const FarmingTipsPage = ({ navigation }) => {

    const [tips] = useState([
        {
            id: '1',
            title: 'Jhum Cultivation Improvement',
            summary: 'Modern approaches to traditional shifting cultivation',
            content:
                'While jhum (shifting cultivation) is traditional in Mizoram, consider these improvements:\n\n• Reduce rotation cycles to 8-10 years instead of traditional 3-5 years to allow better forest regeneration\n\n• Implement contour farming on sloped areas to prevent erosion\n\n• Introduce nitrogen-fixing plants like beans and peas between crop cycles\n\n• Try alder-based farming system where alder trees (Alnus nepalensis) are grown alongside crops to improve soil quality\n\n• Use organic mulching to retain soil moisture on hillsides',
            imageUrl: 'https://thinkwildlifefoundation.com/wp-content/uploads/2023/04/Bekas_areal_terbakar_15.jpg',
            category: 'traditional'
        },
        {
            id: '2',
            title: 'High-Value Crops for Mizoram Climate',
            summary: 'Suitable cash crops for the region\'s weather conditions',
            content:
                'Mizoram\'s climate is ideal for various high-value crops:\n\n• Dragon Fruit: Thrives in Mizoram\'s climate, particularly in Thenzawl area (28-32°C with moderate rainfall)\n\n• Bird\`\'s Eye Chili: Native variety that can fetch premium prices in national markets\n\n• Anthurium & Orchids: Floriculture opportunities in higher elevations(Champhai, Aizawl) \n\n• Coffee Arabica: Suitable for elevations above 900m(Lunglei, Serchhip districts) \n\n• Black Pepper: Excellent intercrop with arecanut in lower elevations(Mamit, Lawngtlai areas) \n\n• Passion Fruit: Thrives in moderate temperatures of central Mizoram',
            imageUrl: 'https://rogitex.com/cdn/shop/articles/high-value-high-nutrition-crops-to-grow-at-home-1900_1600x450_crop_center.jpg?v=1686585711',
            category: 'cash-crops'
        },
        {
            id: '3',
            title: 'Water Management for Hilly Terrain',
            summary: 'Smart irrigation solutions for Mizoram\'s topography',
            content:
                'Water management is critical in Mizoram\'s hilly terrain:\n\n• Create small check dams along seasonal water sources to collect rainwater\n\n• Implement micro-irrigation systems like drip irrigation to minimize water wastage on slopes\n\n• Use mulching with rice straw or forest leaves to retain soil moisture\n\n• Construct jalkunds (small water harvesting structures) of 30,000-50,000 liter capacity lined with silpaulin sheets\n\n• Install rain gutters on homes and farm buildings to direct rainwater to storage tanks\n\n• Use bamboo pipes (traditional method) for gravity-based irrigation on terraced fields',
            imageUrl: 'https://natraj.org/wp-content/uploads/2020/04/Step-Farming.jpg',
            category: 'water'
        },
        {
            id: '4',
            title: 'Climate-Resilient Farming Techniques',
            summary: 'Preparing for changing weather patterns in the region',
            content:
                'Mizoram is experiencing changing rainfall patterns. Adapt with these techniques:\n\n• Implement agroforestry by combining tree crops (like bamboo, broom grass) with annual crops\n\n• Use plastic mulching to protect soil from heavy monsoon rainfall (June-September)\n\n• Create windbreaks using bamboo or fast-growing trees to protect crops during storms\n\n• Practice crop diversification rather than monoculture to reduce risk\n\n• Use early maturing rice varieties (Bhum Dhan) developed by ICAR for Mizoram\n\n• Install low-cost polyhouses for vegetables to protect from excessive rainfall',
            imageUrl: 'https://thinkwildlifefoundation.com/wp-content/uploads/2023/04/Bekas_areal_terbakar_15.jpg',
            category: 'resilience'
        },
        {
            id: '5',
            title: 'Organic Pest Management',
            summary: 'Natural solutions for common Mizoram crop pests',
            content:
                'Control pests with these organic methods suited for Mizoram:\n\n• Neem oil spray (20ml per liter of water) effective against aphids on beans and cabbage\n\n• Pheromone traps for fruit flies affecting dragon fruit and passion fruit\n\n• Plant marigold as border crops to repel nematodes\n\n• Use garlic-chili spray for soft-bodied insects (crush 100g garlic, 50g chili in 2L water, dilute 1:10)\n\n• Introduce beneficial insects like ladybugs to control aphids\n\n• Practice crop rotation to break pest cycles, especially for vegetables\n\n• Set bamboo perches for birds that eat insects',
            imageUrl: 'https://thinkwildlifefoundation.com/wp-content/uploads/2023/04/Bekas_areal_terbakar_15.jpg',
            category: 'organic'
        },
        {
            id: '6',
            title: 'Government Schemes for Mizoram Farmers',
            summary: 'Access support programs available specifically for the state',
            content:
                'Take advantage of these government initiatives:\n\n• New Land Use Policy (NLUP): Provides financial assistance for sustainable agriculture practices\n\n• Focus on Bamboo Mission: Supports bamboo cultivation with subsidies and technical guidance\n\n• Mizoram Organic Farming Support Scheme: Helps transition to organic certification\n\n• KVK Training Programs: Free skill development for modern farming techniques\n\n• Family-Oriented Farm Development Scheme: Supports small-scale integrated farming\n\n• Dragon Fruit Development Scheme: Special support for dragon fruit cultivation including subsidized planting material\n\n• Visit your nearest Agriculture Extension Officer for application details',
            imageUrl: 'https://thinkwildlifefoundation.com/wp-content/uploads/2023/04/Bekas_areal_terbakar_15.jpg',
            category: 'support'
        },
    ]); const [selectedTip, setSelectedTip] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');
    // Create a new fadeAnim value whenever category changes
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // useEffect to handle animation reset when category changes
    useEffect(() => {
        // Reset animation value
        fadeAnim.setValue(0);
        // Start fade-in animation
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true
        }).start();
    }, [selectedCategory]);

    const categories = [
        { id: 'all', name: 'All Tips' },
        { id: 'traditional', name: 'Traditional' },
        { id: 'cash-crops', name: 'Cash Crops' },
        { id: 'water', name: 'Water Management' },
        { id: 'resilience', name: 'Climate Resilience' },
        { id: 'organic', name: 'Organic Farming' },
        { id: 'support', name: 'Govt. Support' },
    ];

    const filteredTips = selectedCategory === 'all'
        ? tips
        : tips.filter(tip => tip.category === selectedCategory);

    const renderCategoryItem = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.categoryButton,
                selectedCategory === item.id && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(item.id)}
        >
            <Text
                style={[
                    styles.categoryButtonText,
                    selectedCategory === item.id && styles.categoryButtonTextActive
                ]}
            >
                {item.name}
            </Text>
        </TouchableOpacity>
    );

    const renderTip = ({ item, index }) => {
        return (
            <Animated.View
                style={{
                    opacity: fadeAnim,
                    transform: [{
                        translateY: fadeAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [50, 0]
                        })
                    }],
                }}
            >
                <TouchableOpacity
                    style={styles.tipCard}
                    onPress={() => setSelectedTip(item)}
                    activeOpacity={0.8}
                >
                    <Image
                        source={{ uri: item.imageUrl }}
                        style={styles.tipImage}
                        defaultSource={require('../../assets/images/placeholder/product.png')}
                    />
                    <View style={styles.tipContent}>
                        <Text style={styles.tipTitle}>{item.title}</Text>
                        <Text style={styles.tipSummary}>{item.summary}</Text>
                        <View style={styles.readMoreContainer}>
                            <Text style={styles.readMoreText}>Read more</Text>
                            <Ionicons name="chevron-forward" size={16} color="#388e3c" />
                        </View>
                    </View>

                    <View style={styles.categoryTag}>
                        <Text style={styles.categoryTagText}>
                            {categories.find(cat => cat.id === item.category)?.name || ''}
                        </Text>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    const renderTipFooter = () => {
        return (
            <View style={styles.tipFooter}>
                <Text style={styles.footerText}>
                    Need personalized advice? Contact your local Agricultural Extension Officer
                </Text>
            </View>
        );
    };

    const renderSelectedTip = () => (
        <ScrollView style={styles.detailScrollView}>
            <View style={styles.detailContainer}>
                <Image
                    source={{ uri: selectedTip.imageUrl }}
                    style={styles.detailImage}
                    defaultSource={require('../../assets/images/placeholder/product.png')}
                />

                <View style={styles.detailContent}>
                    <Text style={styles.detailTitle}>{selectedTip.title}</Text>
                    <View style={styles.detailCategoryContainer}>
                        <View style={styles.detailCategoryTag}>
                            <Text style={styles.detailCategoryTagText}>
                                {categories.find(cat => cat.id === selectedTip.category)?.name || ''}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.detailDescription}>{selectedTip.content}</Text>

                    {/* Share and Save buttons removed as requested */}

                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => setSelectedTip(null)}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="arrow-back" size={18} color="#fff" style={styles.backButtonIcon} />
                        <Text style={styles.backButtonText}>Back to Tips</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <CustomTopBar navigation={navigation} title={selectedTip ? "Farming Tip" : "Farming Tips"} />

            <View style={styles.container}>
                {selectedTip ? (
                    renderSelectedTip()
                ) : (
                    <>
                        {/* <View style={styles.headerContainer}>
                            <Text style={styles.pageTitle}>Farming Tips</Text>
                            <Text style={styles.pageSubtitle}>
                                Expert farming advice tailored for Mizoram
                            </Text>
                        </View> */}

                        {/* Search container removed as requested */}

                        <View style={styles.categoriesContainer}>
                            <FlatList
                                data={categories}
                                renderItem={renderCategoryItem}
                                keyExtractor={(item) => item.id}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.categoryList}
                            />
                        </View>

                        <FlatList
                            data={filteredTips}
                            renderItem={renderTip}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.tipList}
                            showsVerticalScrollIndicator={false}
                            ListFooterComponent={renderTipFooter}
                        />
                    </>
                )}
            </View>
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    headerContainer: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 6,
    },
    pageTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#2d3a32',
        marginBottom: 4,
    },
    pageSubtitle: {
        fontSize: 15,
        color: '#666',
        marginBottom: 8,
        fontStyle: 'italic',
    },
    searchContainer: {
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    searchBox: {
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    searchPlaceholder: {
        color: '#aaa',
        marginLeft: 8,
        fontSize: 14,
    },
    categoriesContainer: {
        marginVertical: 10,
    },
    categoryList: {
        paddingHorizontal: 12,
    },
    categoryButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#f0f8f1',
        borderRadius: 20,
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    categoryButtonActive: {
        backgroundColor: '#388e3c',
        borderColor: '#388e3c',
    },
    categoryButtonText: {
        fontSize: 14,
        color: '#2f4f2f',
    },
    categoryButtonTextActive: {
        color: '#fff',
        fontWeight: '500',
    },
    tipList: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    tipCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    tipImage: {
        height: 140,
        width: '100%',
        resizeMode: 'cover',
    },
    tipContent: {
        padding: 16,
    },
    tipTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 6,
    },
    tipSummary: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 10,
    },
    readMoreContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    readMoreText: {
        fontSize: 14,
        color: '#388e3c',
        fontWeight: '500',
    },
    categoryTag: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(56, 142, 60, 0.85)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 16,
    },
    categoryTagText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
    },
    tipFooter: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        paddingHorizontal: 30,
    },
    detailScrollView: {
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    detailContainer: {
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    detailImage: {
        height: 200,
        width: '100%',
        resizeMode: 'cover',
    },
    detailContent: {
        padding: 16,
    },
    detailTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    detailCategoryContainer: {
        marginBottom: 16,
    },
    detailCategoryTag: {
        backgroundColor: '#388e3c',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 16,
        alignSelf: 'flex-start',
    },
    detailCategoryTagText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
    },
    detailDescription: {
        fontSize: 16,
        color: '#444',
        lineHeight: 24,
        marginBottom: 20,
    },
    actionButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    shareButton: {
        backgroundColor: '#388e3c',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        marginRight: 8,
    },
    shareButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 8,
    },
    saveButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        marginLeft: 8,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 8,
    },
    backButton: {
        backgroundColor: '#555',
        paddingVertical: 12,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    backButtonIcon: {
        marginRight: 6,
    },
    backButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    }
});

export default FarmingTipsPage;
import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import CustomTopBar from '../../components/topBar/CustomTopBar';

const AboutUsPage = ({ navigation }) => {
    return (
        <ScrollView style={styles.container}>
            <CustomTopBar navigation={navigation} title={"About Us"} />
            {/* Header Section */}
            <View style={styles.headerSection}>
                <Image
                    source={{ uri: "https://img.freepik.com/premium-photo/green-hills-background_901003-6551.jpg" }} // Replace with the appropriate image
                    style={styles.bannerImage}
                />
                {/* <Text style={styles.appName}>
                    <Text style={{ color: '#4A90E2' }}>Preci</Text>
                    <Text style={{ color: '#4CAF50' }}>Agri</Text>
                </Text> */}
                {/* <Text style={styles.subtitle}>Empowering Farmers</Text> */}
            </View>

            {/* Vision and Mission Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Our Vision and Mission</Text>
                <View style={styles.twoColumnLayout}>
                    <Text style={styles.textContent}>
                        <Text style={styles.bold}>Vision:</Text> To revolutionize farming in Mizoram by integrating AI and fintech solutions,
                        fostering growth, and ensuring sustainability for every farmer. {'\n\n'}
                        <Text style={styles.bold}>Mission:</Text> To provide end-to-end assistance, enabling farmers to access essential tools,
                        markets, and financial services conveniently through a user-friendly platform.
                    </Text>
                    <Image
                        source={require('../../assets/images/image.png')} // Replace with the appropriate image
                        style={styles.sectionImage}
                    />
                </View>
            </View>

            {/* Features Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>What We Offer</Text>
                <View style={styles.featuresGrid}>
                    <View style={styles.featureCard}>
                        <Image
                            source={require('../../assets/images/market.png')} // Replace with the appropriate image
                            style={styles.featureIcon}
                        />
                        <Text style={styles.featureTitle}>Online Marketplace</Text>
                        <Text style={styles.featureDescription}>
                            Connect with sellers for tools, fertilizers, and other essentials.
                        </Text>
                    </View>

                    <View style={styles.featureCard}>
                        <Image
                            source={require('../../assets/images/weather.png')} // Replace with the appropriate image
                            style={styles.featureIcon}
                        />
                        <Text style={styles.featureTitle}>Farming Insights</Text>
                        <Text style={styles.featureDescription}>
                            Access farming tips, weather updates, and news bulletins.
                        </Text>
                    </View>

                    <View style={styles.featureCard}>
                        <Image
                            source={require('../../assets/images/loan.png')} // Replace with the appropriate image
                            style={styles.featureIcon}
                        />
                        <Text style={styles.featureTitle}>Loan Assistance</Text>
                        <Text style={styles.featureDescription}>
                            Secure loans easily to boost your farming activities.
                        </Text>
                    </View>

                    <View style={styles.featureCard}>
                        <Image
                            source={require('../../assets/images/tips.png')} // Replace with the appropriate image
                            style={styles.featureIcon}
                        />
                        <Text style={styles.featureTitle}>AI-Driven Solutions</Text>
                        <Text style={styles.featureDescription}>
                            Utilize AI tools for better yield and efficiency.
                        </Text>
                    </View>
                </View>
            </View>

            {/* Testimonials Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>What Farmers Are Saying</Text>
                <View style={styles.testimonialCard}>
                    <Image
                        source={require('../../assets/images/placeholder/user_icon.png')} // Replace with the appropriate image
                        style={styles.testimonialImage}
                    />
                    <Text style={styles.testimonialText}>
                        "This app has transformed my farming experience. The online market and loan options are a game-changer!"
                    </Text>
                    <Text style={styles.testimonialAuthor}>- A Farmer from Mizoram</Text>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    headerSection: {
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        paddingVertical: 0,
    },
    bannerImage: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
    appName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2E7D32',
        marginVertical: 5,
    },
    subtitle: {
        fontSize: 16,
        color: '#4CAF50',
        textAlign: 'center',
    },
    section: {
        padding: 20,
        backgroundColor: '#FFFFFF',
        marginBottom: 10,
        paddingRight: 5
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2E7D32',
        marginBottom: 10,
    },
    twoColumnLayout: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    textContent: {
        flex: 1,
        fontSize: 16,
        color: '#555555',
        marginRight: 10,
    },
    bold: {
        fontWeight: 'bold',
    },
    sectionImage: {
        width: 120,
        height: 220,
        resizeMode: 'cover',
    },
    featuresGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    featureCard: {
        width: '48%',
        backgroundColor: '#E8F5E9',
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
        alignItems: 'center',
    },
    featureIcon: {
        width: 50,
        height: 50,
        marginBottom: 10,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#388E3C',
        marginBottom: 5,
    },
    featureDescription: {
        fontSize: 14,
        color: '#555555',
        textAlign: 'center',
    },
    testimonialCard: {
        backgroundColor: '#E8F5E9',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    testimonialImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 10,
    },
    testimonialText: {
        fontSize: 16,
        color: '#555555',
        fontStyle: 'italic',
        textAlign: 'center',
        marginBottom: 5,
    },
    testimonialAuthor: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#388E3C',
    },
});

export default AboutUsPage;

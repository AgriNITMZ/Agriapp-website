import React, { useState } from "react";
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    ScrollView,
    ToastAndroid
} from "react-native";
import CustomTopBar from '../../components/topBar/CustomTopBar';
const ContactUs = ({ navigation }) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const handleSend = () => {
        // Implement the logic for sending the message
        ToastAndroid.show('Message Sent successfully!', ToastAndroid.SHORT);
        setName("")
        setEmail("")
        setMessage("")
    };

    return (
        <><CustomTopBar navigation={navigation} title={"Contact Us"} />
            <ScrollView style={styles.container}>

                {/* Header Section */}
                <View style={styles.header}>
                    <Image
                        source={{ uri: "https://img.freepik.com/premium-photo/green-hills-background_901003-6551.jpg" }} // Replace with a banner image (e.g., farming-relevant image)
                        style={styles.headerImage}
                    />
                    <Text style={styles.subHeaderText}>
                        We're here to help and answer your questions.
                    </Text>
                </View>

                {/* Contact Details Section */}
                <View style={styles.contactDetails}>
                    <Text style={styles.sectionTitle}>Contact Information</Text>
                    <View style={styles.contactItem}>
                        <Image
                            source={require("../../assets/images/contact.png")}
                            style={styles.icon}
                        />
                        <Text style={styles.contactText}>+91 9876543210</Text>
                    </View>
                    <View style={styles.contactItem}>
                        <Image
                            source={require("../../assets/images/email.png")}
                            style={styles.icon}
                        />
                        <Text style={styles.contactText}>support@preciargi.com</Text>
                    </View>
                    <View style={styles.contactItem}>
                        <Image
                            source={require("../../assets/images/location.png")}
                            style={styles.icon}
                        />
                        <Text style={styles.contactText}>
                            ABC, XYZ Road, Chaltlang, Aizawl, Mizoram
                        </Text>
                    </View>
                </View>

                {/* Feedback Section */}
                <View style={styles.feedbackSection}>
                    <Text style={styles.sectionTitle}>Send Us a Message</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Your Name"
                        value={name}
                        onChangeText={setName}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Your Email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                    />
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Your Message"
                        value={message}
                        onChangeText={setMessage}
                        multiline
                    />
                    <TouchableOpacity style={styles.button} onPress={handleSend}>
                        <Text style={styles.buttonText}>Send Message</Text>
                    </TouchableOpacity>
                </View>

                {/* Social Media Links Section */}
                <View style={styles.socialMediaSection}>
                    <Text style={styles.sectionTitle}>Follow Us</Text>
                    <View style={styles.socialIcons}>
                        <Image
                            source={require("../../assets/images/twitter.png")}
                            style={styles.socialIcon}
                        />
                        <Image
                            source={require("../../assets/images/insta.png")}
                            style={styles.socialIcon}
                        />
                        <Image
                            source={require("../../assets/images/fb.png")}
                            style={styles.socialIcon}
                        />
                    </View>
                </View>

                {/* Support Timings Section */}
                {/* <View style={styles.timingsSection}>
                <Text style={styles.sectionTitle}>Support Timings</Text>
                <Text style={styles.timingsText}>Monday - Friday: 9:00 AM to 6:00 PM</Text>
                <Text style={styles.timingsText}>Saturday: 10:00 AM to 4:00 PM</Text>
                <Text style={styles.timingsText}>Sunday: Closed</Text>
            </View> */}
            </ScrollView>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9F9F9",
    },
    header: {
        alignItems: "center",
        padding: 10,
        backgroundColor: "#F4F9F4",
    },
    headerImage: {
        width: "100%",
        height: 180,
        borderRadius: 0,
    },
    headerText: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        marginTop: 10,
    },
    subHeaderText: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
        marginTop: 5,
    },
    contactDetails: {
        padding: 20,
        backgroundColor: "#FFF",
        marginBottom: 10,
        borderRadius: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 10,
    },
    contactItem: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 10,
    },
    icon: {
        width: 24,
        height: 24,
        marginRight: 10,
    },
    contactText: {
        fontSize: 16,
        color: "#666",
    },
    feedbackSection: {
        padding: 20,
        backgroundColor: "#FFF",
        marginBottom: 10,
        borderRadius: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: "#DDD",
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
        fontSize: 16,
        backgroundColor: "#F9F9F9",
    },
    textArea: {
        height: 100,
        textAlignVertical: "top",
    },
    button: {
        backgroundColor: "#4CAF50",
        padding: 15,
        borderRadius: 5,
        alignItems: "center",
    },
    buttonText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "bold",
    },
    socialMediaSection: {
        padding: 20,
        backgroundColor: "#FFF",
        marginBottom: 10,
        borderRadius: 10,
    },
    socialIcons: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 10,
    },
    socialIcon: {
        width: 40,
        height: 40,
    },
    timingsSection: {
        padding: 20,
        backgroundColor: "#FFF",
        marginBottom: 10,
        borderRadius: 10,
    },
    timingsText: {
        fontSize: 16,
        color: "#666",
        marginTop: 5,
    },
});

export default ContactUs;

import React from "react";
import { View, Text, Image } from "react-native";
import CustomTopBar from "../../components/topBar/CustomTopBar"
const LoanPage = ({ navigation }) => {
    return (
        <>
            <CustomTopBar navigation={navigation} title={"Loan"} />

            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f5f5f5" }}>
                <Image
                    source={require("../../assets/images/loan.png")}
                    style={{ width: 120, height: 120, marginBottom: 20, borderRadius: 10 }}
                    resizeMode="contain"
                />
                <Text style={{ fontSize: 24, fontWeight: "bold", color: "#333" }}>Feature Coming Soon</Text>
                <Text style={{ fontSize: 16, color: "#666", textAlign: "center", marginTop: 10, paddingHorizontal: 20 }}>
                    We are working on bringing loan assistance to help farmers access financial aid easily. Stay tuned!
                </Text>
            </View>
        </>
    );
};

export default LoanPage;

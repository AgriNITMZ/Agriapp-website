import React, { useState, useEffect } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Text,
    Alert,
    ActivityIndicator,
    ScrollView,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Ionicons from '@expo/vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import customFetch from '../../utils/axios';
import CustomTopBar from '../../components/topBar/CustomTopBar';
// Mizoram district and cities data
const MIZORAM_DATA = {
    districts: [
        'Aizawl',
        'Lunglei',
        'Champhai',
        'Kolasib',
        'Serchhip',
        'Lawngtlai',
        'Mamit',
        'Saiha',
        'Khawzawl',
        'Hnahthial',
        'Saitual'
    ],
    cities: {
        'Aizawl': [
            'Aizawl City', 'Durtlang', 'Bawngkawn', 'Chaltlang', 'Zemabawk',
            'Sikulpuikawn', 'Dawrpui', 'Khatla', 'Chanmari', 'Bethlehem'
        ],
        'Lunglei': [
            'Lunglei City', 'Hnahthial', 'Sangau', 'Tlabung', 'Bunghmun',
            'Lungsen', 'South Vanlaiphai'
        ],
        'Champhai': [
            'Champhai City', 'Khawbung', 'Vaphai', 'Zokhawthar', 'Ruantlang',
            'Hnahlan', 'Biate', 'Kahrawt'
        ],
        'Kolasib': [
            'Kolasib City', 'Vairengte', 'Kawnpui', 'Bairabi', 'Thingdawl',
            'Bilkhawthlir', 'North Vanlaiphai'
        ],
        'Serchhip': [
            'Serchhip City', 'Thenzawl', 'Bungtlang', 'East Lungdar', 'Chhingchhip',
            'Keitum', 'Sialsuk'
        ],
        'Lawngtlai': [
            'Lawngtlai City', 'Chawngte', 'Vathuampui', 'Sangau', 'Kawlchaw',
            'Lungtian', 'Mampui'
        ],
        'Mamit': [
            'Mamit City', 'Zawlnuam', 'West Phaileng', 'Reiek', 'Kawrthah',
            'Marpara', 'Darlung'
        ],
        'Saiha': [
            'Saiha City', 'Tuipang', 'Phura', 'Lungpuk', 'Chapui',
            'Niawhtlang', 'Tuisumpui'
        ],
        'Khawzawl': [
            'Khawzawl City', 'Ngopa', 'Kawlkulh', 'Rabung', 'Mimbung',
            'Khuangleng', 'Hmunhmeltha'
        ],
        'Hnahthial': [
            'Hnahthial City', 'Lungtian', 'Pangzawl', 'Thingsai', 'Cherhlun',
            'Mualcheng', 'Rawpui'
        ],
        'Saitual': [
            'Saitual City', 'Keifang', 'Thingsul', 'Aichalkawn', 'Rulchawm',
            'Lungdai', 'Vanbawng'
        ]
    }
};

const EditAddressPage = ({ route, navigation }) => {
    // Get address data from navigation params
    const { addressData } = route.params;

    // Form state
    const [formData, setFormData] = useState({
        Name: '',
        streetAddress: '',
        district: '',
        city: '',
        mobile: '',
        zipCode: ''
    });

    // Loading states
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    // Input validation state
    const [errors, setErrors] = useState({});

    // Determine district from city if needed
    const findDistrictFromCity = (cityName) => {
        for (const [district, cities] of Object.entries(MIZORAM_DATA.cities)) {
            if (cities.includes(cityName)) {
                return district;
            }
        }
        return '';
    };

    // Load address data
    useEffect(() => {
        if (addressData) {
            const district = findDistrictFromCity(addressData.city);

            let Name = addressData.Name || '';


            setFormData({
                Name: Name,
                streetAddress: addressData.streetAddress || '',
                district: district,
                city: addressData.city || '',
                mobile: addressData.mobile || '',
                zipCode: addressData.zipCode || ''
            });
        }
        setIsFetching(false);
    }, [addressData]);

    // Handle input changes
    const handleChange = (field, value) => {
        setFormData(prevData => ({
            ...prevData,
            [field]: value
        }));

        // Clear error for this field when user types
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }

        // Reset city if district changes
        if (field === 'district') {
            setFormData(prevData => ({
                ...prevData,
                city: ''
            }));
        }
    };

    // Validate form data
    const validateForm = () => {
        const newErrors = {};

        // Validate required fields
        if (!formData.Name.trim()) newErrors.Name = "Name is required";
        if (!formData.streetAddress.trim()) newErrors.streetAddress = "Street address is required";
        if (!formData.district) newErrors.district = "Please select a district";
        if (!formData.city) newErrors.city = "Please select a city";

        // Validate PIN code (ZIP code)
        if (!formData.zipCode) {
            newErrors.zipCode = "PIN code is required";
        } else if (!/^\d{6}$/.test(formData.zipCode)) {
            newErrors.zipCode = "PIN code must be 6 digits";
        }

        // Validate mobile number
        if (!formData.mobile) {
            newErrors.mobile = "Mobile number is required";
        } else if (!/^\d{10}$/.test(formData.mobile)) {
            newErrors.mobile = "Mobile number must be 10 digits";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleUpdateAddress = async () => {
        // Validate form before submission
        if (!validateForm()) {
            Toast.show({
                type: 'error',
                text1: 'Validation Error',
                text2: 'Please check all fields and try again',
            });
            return;
        }

        // Prepare payload
        const payload = {
            Name: formData.Name,
            streetAddress: formData.streetAddress,
            city: formData.city,
            state: 'Mizoram', // Default state
            zipCode: formData.zipCode,
            mobile: formData.mobile
        };

        // Set loading state
        setIsLoading(true);

        try {
            // Submit data to API
            const response = await customFetch.put(`/auth/editaddress/${addressData._id}`, payload);

            if (response.status === 200) {
                // Show success message
                Toast.show({
                    type: 'success',
                    text1: 'Address Updated',
                    text2: 'Your address has been updated successfully',
                });
                // Navigate back to address list
                navigation.goBack();
            }
        } catch (error) {
            console.error('Error updating address:', error);

            // Show appropriate error message based on error response
            const errorMessage = error.response?.data?.message || 'Unable to update address. Please try again.';

            Toast.show({
                type: 'error',
                text1: 'Update Failed',
                text2: errorMessage,
            });
        } finally {
            // Reset loading state
            setIsLoading(false);
        }
    };

    // Show loading indicator while fetching address
    if (isFetching) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.loadingText}>Loading address information...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <CustomTopBar navigation={navigation} title={"Edit Address"} />
            <ScrollView style={styles.container}>
                {/* Top Bar */}

                {/* Form Fields */}
                <View style={styles.formContainer}>
                    {/* Personal Information */}
                    <Text style={styles.sectionTitle}>Personal Information</Text>

                    <TextInput
                        style={[styles.input, errors.Name ? styles.inputError : null]}
                        placeholder="Name"
                        value={formData.Name}
                        onChangeText={(text) => handleChange('Name', text)}
                    />
                    {errors.Name && <Text style={styles.errorText}>{errors.Name}</Text>}

                    <TextInput
                        style={[styles.input, errors.mobile ? styles.inputError : null]}
                        placeholder="Mobile Number"
                        value={formData.mobile}
                        onChangeText={(text) => handleChange('mobile', text)}
                        keyboardType="phone-pad"
                        maxLength={10}
                    />
                    {errors.mobile && <Text style={styles.errorText}>{errors.mobile}</Text>}

                    {/* Address Information */}
                    <Text style={styles.sectionTitle}>Address Details</Text>

                    <Text style={styles.stateText}>State: Mizoram</Text>
                    <View style={styles.pickerContainer}>
                        {/* <Text style={styles.pickerLabel}>Select District</Text> */}
                        <View style={[
                            styles.pickerWrapper,
                            errors.district ? styles.inputError : null
                        ]}>
                            <Picker
                                selectedValue={formData.district}
                                onValueChange={(value) => handleChange('district', value)}
                                style={styles.picker}
                            >
                                <Picker.Item label="Select District" value="" />
                                {MIZORAM_DATA.districts.map((district, index) => (
                                    <Picker.Item key={index} label={district} value={district} />
                                ))}
                            </Picker>
                        </View>
                        {/* {errors.district && <Text style={styles.errorText}>{errors.district}</Text>} */}
                    </View>

                    <View style={styles.pickerContainer}>
                        {/* <Text style={styles.pickerLabel}>Select City</Text> */}
                        <View style={[
                            styles.pickerWrapper,
                            errors.city ? styles.inputError : null
                        ]}>
                            <Picker
                                selectedValue={formData.city}
                                onValueChange={(value) => handleChange('city', value)}
                                style={styles.picker}
                                enabled={!!formData.district}
                            >
                                <Picker.Item label={formData.district ? "Select City" : "Select District First"} value="" />
                                {formData.district && MIZORAM_DATA.cities[formData.district]
                                    ? MIZORAM_DATA.cities[formData.district].map((city, index) => (
                                        <Picker.Item key={index} label={city} value={city} />
                                    ))
                                    : null}
                            </Picker>
                        </View>
                        {/* {errors.city && <Text style={styles.errorText}>{errors.city}</Text>} */}
                    </View>



                    <TextInput
                        style={[styles.input, errors.zipCode ? styles.inputError : null]}
                        placeholder="PIN Code"
                        value={formData.zipCode}
                        onChangeText={(text) => handleChange('zipCode', text)}
                        keyboardType="numeric"
                        maxLength={6}
                    />
                    {errors.zipCode && <Text style={styles.errorText}>{errors.zipCode}</Text>}
                    <TextInput
                        style={[
                            styles.input,
                            styles.textArea,
                            errors.streetAddress ? styles.inputError : null
                        ]}
                        placeholder="Street Address"
                        value={formData.streetAddress}
                        onChangeText={(text) => handleChange('streetAddress', text)}
                        multiline
                        numberOfLines={3}
                    />
                    {errors.streetAddress && <Text style={styles.errorText}>{errors.streetAddress}</Text>}

                </View>

                {/* Action Buttons */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => navigation.goBack()}
                        disabled={isLoading}
                    >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleUpdateAddress}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                            <Text style={styles.saveButtonText}>Update Address</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    loadingText: {
        marginTop: 12,
        color: '#666666',
        fontSize: 16,
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    pageTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333333',
    },
    formContainer: {
        padding: 14,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333333',
        marginBottom: 8,
    },
    input: {
        height: 50,
        borderColor: '#DDDDDD',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        marginBottom: 12,
        fontSize: 16,
        color: '#333333',
        backgroundColor: '#FAFAFA',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
        paddingTop: 12,
    },
    inputError: {
        borderColor: '#FF5252',
        borderWidth: 1.5,
    },
    errorText: {
        color: '#FF5252',
        fontSize: 12,
        marginTop: -8,
        marginBottom: 8,
        marginLeft: 4,
    },
    pickerContainer: {
        marginBottom: 6,
    },
    pickerLabel: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 4,
        marginLeft: 4,
    },
    pickerWrapper: {
        borderWidth: 1,
        borderColor: '#DDDDDD',
        borderRadius: 8,
        backgroundColor: '#FAFAFA',
    },
    picker: {
        height: 50,
    },
    stateText: {
        fontSize: 16,
        color: '#333333',
        backgroundColor: '#F0F0F0',
        padding: 14,
        borderRadius: 8,
        marginBottom: 12,
        fontWeight: '500',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#F0F0F0',
        paddingVertical: 12,
        marginRight: 8,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#DDDDDD',
    },
    cancelButtonText: {
        color: '#555555',
        fontSize: 16,
        fontWeight: '600',
    },
    saveButton: {
        flex: 1,
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        marginLeft: 8,
        borderRadius: 8,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default EditAddressPage;
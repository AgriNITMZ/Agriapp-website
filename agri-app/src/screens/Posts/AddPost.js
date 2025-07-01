import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Image, Alert,
    ActivityIndicator, FlatList, Modal
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
// import { actions, RichEditor, RichToolbar } from 'react-native-pell-rich-editor';
// import HTML from 'react-native-render-html'
import CustomTopBar from '../../components/topBar/CustomTopBar';
// import QuillEditor, { QuillToolbar } from 'react-native-cn-quill';
import customFetch from '../../utils/axios';
import Toast from 'react-native-toast-message';

export default function AddPost({ navigation }) {
    // ---------- STATE MANAGEMENT ----------
    // Basic Information
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const richTextRef = useRef(null);
    const _editor = React.createRef(null);
    // Product Images
    const [images, setImages] = useState([]);

    // Category Selection
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedSubCategory, setSelectedSubCategory] = useState(null);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showSubCategoryModal, setShowSubCategoryModal] = useState(false);

    // Product Metadata
    const [tags, setTags] = useState('');
    const [badges, setBadges] = useState('');

    // Product Sizes & Pricing
    const [sizes, setSizes] = useState([
        { size: '', price: '', discountedPrice: '', quantity: '' },
    ]);

    // Shop Information
    const [shopDetail, setShopDetail] = useState('');

    // Loading States
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ---------- LIFECYCLE METHODS ----------
    useEffect(() => {
        fetchCategories();
    }, []);

    // ---------- DATA FETCHING ----------
    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await customFetch.get('/products/getcategorylist');
            if (response.data.success) {
                setCategories(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Could not load categories. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    // ---------- FORM HANDLERS ----------
    // Size Management
    const addSize = () => {
        setSizes([...sizes, { size: '', price: '', discountedPrice: '', quantity: '' }]);
    };

    const updateSizeField = (index, field, value) => {
        const updatedSizes = sizes.map((size, i) =>
            i === index ? { ...size, [field]: value } : size
        );
        setSizes(updatedSizes);
    };

    // Image Management
    const pickImages = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'We need access to your photos to upload images.');
            return;
        }

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                selectionLimit: 5 - images.length,
                quality: 1,
            });

            if (!result.canceled) {
                const newImages = result.assets.map(asset => asset.uri);
                setImages(prevImages => [...prevImages, ...newImages].slice(0, 5));
            }
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to pick images. Please try again.'
            });
        }
    };

    const removeImage = (indexToRemove) => {
        setImages(images.filter((_, index) => index !== indexToRemove));
    };
    // Preview section to show the rendered HTML
    // const renderPreview = () => {
    //     return (
    //         <View style={styles.previewContainer}>
    //             <Text style={styles.previewTitle}>Preview:</Text>
    //             <HTML
    //                 source={{ html: description }}
    //                 contentWidth={300}
    //                 tagsStyles={{
    //                     p: { margin: 0 }
    //                 }}
    //             />
    //         </View>
    //     );
    // };
    // Form Submission
    const validateForm = () => {
        if (!title.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please enter a product title'
            });
            return false;
        }

        if (!description.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please enter a product description'
            });
            return false;
        }

        if (images.length === 0) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please select at least one image'
            });
            return false;
        }

        if (!selectedCategory || !selectedSubCategory) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please select both category and subcategory'
            });
            return false;
        }

        if (!tags.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please enter at least one tag'
            });
            return false;
        }

        // Validate sizes
        for (const size of sizes) {
            if (!size.size.trim() || !size.price || !size.quantity) {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Please fill in all required size fields'
                });
                return false;
            }
        }

        if (!shopDetail.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please enter shop details'
            });
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        try {
            Toast.show({
                type: 'info',
                text1: 'Adding Product',
                text2: 'Please wait while we upload your product...'
            });

            const formData = new FormData();

            // Append images
            images.forEach((uri, index) => {
                formData.append('image', {
                    uri,
                    type: 'image/jpeg',
                    name: `image${index}.jpg`,
                });
            });

            // Append product details
            formData.append('name', title);
            formData.append('description', description);

            // Format the price_size data
            const formattedSizes = sizes.map(item => ({
                price: parseFloat(item.price),
                discountedPrice: parseFloat(item.discountedPrice) || 0,
                size: item.size,
                quantity: parseInt(item.quantity)
            }));
            formData.append('price_size', JSON.stringify(formattedSizes));

            // Append category
            formData.append('category', selectedSubCategory._id);

            // Parse tags as an array
            const tagsArray = tags.split(',').map(tag => tag.trim());
            formData.append('tag', JSON.stringify(tagsArray));

            // Add badges
            formData.append('badges', badges);

            // Shop Detail
            formData.append('fullShopDetails', shopDetail);

            // Make API request
            const response = await customFetch.post("/products/createproduct", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.status === 200 || response.status === 201) {
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Product added successfully!'
                });
                setTimeout(() => {
                    navigation.goBack();
                }, 1000);
            }
        } catch (error) {
            console.error('Error adding product:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.response?.data?.message || 'Could not add product. Please try again.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // ---------- RENDER METHODS ----------
    // Category Selection Modal Items
    const renderCategoryItem = ({ item }) => (
        <TouchableOpacity
            style={styles.modalItem}
            onPress={() => {
                setSelectedCategory(item);
                setSelectedSubCategory(null);
                setShowCategoryModal(false);
            }}
        >
            <Text style={styles.modalItemText}>{item.name}</Text>
        </TouchableOpacity>
    );

    const renderSubCategoryItem = ({ item }) => (
        <TouchableOpacity
            style={styles.modalItem}
            onPress={() => {
                setSelectedSubCategory(item);
                setShowSubCategoryModal(false);
            }}
        >
            <Text style={styles.modalItemText}>{item.name}</Text>
        </TouchableOpacity>
    );

    // ---------- MAIN RENDER ----------
    return (
        <>
            <CustomTopBar navigation={navigation} title="Add New Product" />
            <ScrollView contentContainerStyle={styles.container}>
                {/* SECTION: Basic Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Basic Information</Text>

                    <Text style={styles.label}>Product Title</Text>
                    <TextInput
                        style={styles.input}
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Enter Title for the Product"
                    />

                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Describe your product in detail..."
                        value={description}
                        onChangeText={setDescription}
                        multiline
                    />
                </View>

                {/* SECTION: Product Images */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Product Images</Text>
                    <Text style={styles.sectionDescription}>
                        Add up to 5 high-quality images of your product (front, back, in use, etc.).
                    </Text>

                    <View style={styles.imageContainer}>
                        {images.map((uri, index) => (
                            <View key={index} style={styles.imageWrapper}>
                                <Image source={{ uri }} style={styles.image} />
                                <TouchableOpacity
                                    style={styles.crossButton}
                                    onPress={() => removeImage(index)}
                                >
                                    <Text style={styles.crossButtonText}>×</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>

                    {images.length < 5 && (
                        <TouchableOpacity onPress={pickImages} style={styles.addButton}>
                            <Text style={styles.addButtonText}>
                                {images.length === 0 ? 'Select Images' : 'Add More Images'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* SECTION: Product Category */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Product Category</Text>

                    <Text style={styles.label}>Category</Text>
                    <TouchableOpacity
                        style={styles.dropdown}
                        onPress={() => setShowCategoryModal(true)}
                    >
                        <Text style={selectedCategory ? styles.dropdownText : styles.dropdownPlaceholder}>
                            {selectedCategory ? selectedCategory.name : 'Select Category'}
                        </Text>
                    </TouchableOpacity>

                    <Text style={styles.label}>Subcategory</Text>
                    <TouchableOpacity
                        style={[styles.dropdown, !selectedCategory && styles.disabledDropdown]}
                        onPress={() => selectedCategory && setShowSubCategoryModal(true)}
                        disabled={!selectedCategory}
                    >
                        <Text style={selectedSubCategory ? styles.dropdownText : styles.dropdownPlaceholder}>
                            {selectedSubCategory ? selectedSubCategory.name : 'Select Subcategory'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* SECTION: Product Metadata */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Product Metadata</Text>
                    <Text style={styles.sectionDescription}>
                        Add tags and badges to help customers find your product.
                    </Text>

                    <Text style={styles.label}>Tags (comma separated)</Text>
                    <Text style={styles.fieldDescription}>
                        Enter keywords to improve discoverability of your Product.
                    </Text>
                    <TextInput
                        style={styles.input}
                        value={tags}
                        onChangeText={setTags}
                        placeholder="e.g., organic, natural, vegan"
                    />

                    <Text style={styles.label}>Badges</Text>
                    <TextInput
                        style={styles.input}
                        value={badges}
                        onChangeText={setBadges}
                        placeholder="e.g., PreciAgri"
                    />
                </View>

                {/* SECTION: Product Sizing & Pricing */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Product Sizing & Pricing</Text>
                    <Text style={styles.sectionDescription}>
                        Add different sizes, prices, and stock quantities for your product.
                    </Text>

                    {sizes.map((size, index) => (
                        <View key={index} style={styles.sizeContainer}>
                            <Text style={styles.sizeLabel}>Size Option {index + 1}</Text>

                            <Text style={styles.label}>Size/Variant</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., 100ml, 1kg, Small"
                                value={size.size}
                                onChangeText={value => updateSizeField(index, 'size', value)}
                            />

                            <Text style={styles.label}>Quantity in Stock</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Available quantity"
                                value={size.quantity}
                                onChangeText={value => updateSizeField(index, 'quantity', value)}
                                keyboardType="numeric"
                            />

                            <Text style={styles.label}>Regular Price</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Regular price"
                                value={size.price}
                                keyboardType="numeric"
                                onChangeText={value => updateSizeField(index, 'price', value)}
                            />

                            <Text style={styles.label}>Discounted Price</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Discounted price"
                                keyboardType="numeric"
                                value={size.discountedPrice}
                                onChangeText={value => updateSizeField(index, 'discountedPrice', value)}
                            />
                        </View>
                    ))}

                    <TouchableOpacity style={styles.addButton} onPress={addSize}>
                        <Text style={styles.addButtonText}>+ Add Another Size/Variant</Text>
                    </TouchableOpacity>
                </View>

                {/* SECTION: Shop Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Shop Information</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={shopDetail}
                        onChangeText={setShopDetail}
                        placeholder="Enter details about your shop name, addres etc."
                        multiline
                    />
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.submitButton, isSubmitting && styles.disabledButton]}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitButtonText}>Add Product</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>

            {/* Category Selection Modal */}
            <Modal
                visible={showCategoryModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowCategoryModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Category</Text>

                        {loading ? (
                            <ActivityIndicator size="large" color="#1a73e8" />
                        ) : (
                            <FlatList
                                data={categories}
                                renderItem={renderCategoryItem}
                                keyExtractor={item => item._id}
                                style={styles.modalList}
                            />
                        )}

                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={() => setShowCategoryModal(false)}
                        >
                            <Text style={styles.modalCloseButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* SubCategory Selection Modal */}
            <Modal
                visible={showSubCategoryModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowSubCategoryModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Subcategory</Text>

                        {loading ? (
                            <ActivityIndicator size="large" color="#1a73e8" />
                        ) : (
                            <FlatList
                                data={selectedCategory?.subcategories || []}
                                renderItem={renderSubCategoryItem}
                                keyExtractor={item => item._id}
                                style={styles.modalList}
                            />
                        )}

                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={() => setShowSubCategoryModal(false)}
                        >
                            <Text style={styles.modalCloseButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Toast />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 7,
        paddingBottom: 10,
    },
    section: {
        marginBottom: 14,
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    sectionDescription: {
        color: '#666',
        marginBottom: 16,
        fontSize: 14,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    fieldDescription: {
        color: '#666',
        fontSize: 12,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 12,
        marginBottom: 16,
        fontSize: 16,
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },
    imageContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 16,
    },
    imageWrapper: {
        position: 'relative',
        width: 100,
        height: 100,
        margin: 4,
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 4,
    },
    crossButton: {
        position: 'absolute',
        top: -7,
        right: -7,
        backgroundColor: '#ff4444',
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    crossButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    addButton: {
        backgroundColor: '#e8f5e9',
        padding: 12,
        borderRadius: 4,
        alignItems: 'center',
        marginBottom: 16,
    },
    addButtonText: {
        color: '#4CAF50',
        fontWeight: '500',
    },
    dropdown: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 12,
        marginBottom: 16,
    },
    disabledDropdown: {
        backgroundColor: '#f0f0f0',
        borderColor: '#ddd',
    },
    dropdownText: {
        fontSize: 16,
    },
    dropdownPlaceholder: {
        fontSize: 16,
        color: '#999',
    },
    sizeContainer: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 4,
        padding: 16,
        marginBottom: 16,
    },
    sizeLabel: {
        fontWeight: 'bold',
        marginBottom: 12,
        fontSize: 16,
    },
    submitButton: {
        backgroundColor: 'green',
        padding: 16,
        borderRadius: 4,
        alignItems: 'center',
        marginTop: 16,
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    submitButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 20,
        maxHeight: '70%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    modalList: {
        maxHeight: 300,
    },
    modalItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalItemText: {
        fontSize: 16,
    },
    modalCloseButton: {
        marginTop: 16,
        padding: 12,
        backgroundColor: '#f2f2f2',
        borderRadius: 4,
        alignItems: 'center',
    },
    modalCloseButtonText: {
        color: '#333',
        fontWeight: '500',
    },
    editorContainer: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 15,
    },
    toolbar: {
        borderBottomWidth: 1,
        borderColor: '#ccc',
    },
    editor: {
        minHeight: 150,
        maxHeight: 200,
    },
    previewContainer: {
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginTop: 10,
        backgroundColor: '#f9f9f9',
    },
    previewTitle: {
        fontWeight: 'bold',
        marginBottom: 5,
    },
    editor: {
        flex: 1,
        padding: 0,
        borderColor: 'gray',
        borderWidth: 1,
        marginHorizontal: 30,
        marginVertical: 5,
        backgroundColor: 'white',
    },
});
import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Image, Alert,
    ActivityIndicator, FlatList, Modal
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import CustomTopBar from '../../components/topBar/CustomTopBar';
import customFetch from '../../utils/axios';
import Toast from 'react-native-toast-message';

export default function EditProduct({ route, navigation }) {
    const { productId } = route.params;

    // ---------- STATE MANAGEMENT ----------
    // Basic Information
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    // Product Images
    const [existingImages, setExistingImages] = useState([]);
    const [newImages, setNewImages] = useState([]);

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
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ---------- LIFECYCLE METHODS ----------
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            // First load categories
            const loadedCategories = await fetchCategories();
            // Small delay to ensure state is updated
            await new Promise(resolve => setTimeout(resolve, 100));
            // Then load product details with categories available
            await fetchProductDetails();
        };
        loadData();
    }, [productId]);

    // Re-run category matching when categories are loaded
    useEffect(() => {
        if (categories.length > 0 && selectedCategory === null) {
            // Try to match category again after categories are loaded
            const reMatchCategory = async () => {
                try {
                    const response = await customFetch.get(`/products/getproductbyId/${productId}`);
                    const product = response.data.product;
                    
                    if (product.category) {
                        const parentCategory = categories.find(cat => 
                            cat.subcategories && cat.subcategories.some(sub => sub._id === product.category)
                        );
                        
                        if (parentCategory) {
                            setSelectedCategory(parentCategory);
                            const subCategory = parentCategory.subcategories.find(sub => sub._id === product.category);
                            if (subCategory) {
                                setSelectedSubCategory(subCategory);
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error re-matching category:', error);
                }
            };
            reMatchCategory();
        }
    }, [categories]);

    // ---------- DATA FETCHING ----------
    const fetchCategories = async () => {
        try {
            const response = await customFetch.get('/products/getcategorylist');
            if (response.data.success) {
                console.log('Fetched categories:', response.data.data);
                setCategories(response.data.data);
                return response.data.data; // Return categories for immediate use
            }
            return [];
        } catch (error) {
            console.error('Error fetching categories:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Could not load categories.'
            });
            return [];
        }
    };

    const fetchProductDetails = async () => {
        try {
            const response = await customFetch.get(`/products/getproductbyId/${productId}`);
            const product = response.data.product;

            console.log('Fetched product data:', JSON.stringify(product, null, 2)); // Debug log

            // Set basic info
            setTitle(product.name || product.title || '');
            setDescription(product.description || '');
            
            // Set images - handle 'images', 'image', and 'imagesUrl' fields
            const images = product.images || product.image || product.imagesUrl || [];
            const imageArray = Array.isArray(images) ? images : [];
            console.log('Setting images:', imageArray);
            setExistingImages(imageArray);
            
            // Set tags
            if (product.tag && Array.isArray(product.tag) && product.tag.length > 0) {
                const tagsString = product.tag.join(', ');
                console.log('Setting tags:', tagsString);
                setTags(tagsString);
            } else if (typeof product.tag === 'string' && product.tag) {
                setTags(product.tag);
            } else {
                console.log('No tags found, setting empty');
                setTags('');
            }
            
            // Set badges
            const badgesValue = product.badges || '';
            console.log('Setting badges:', badgesValue);
            setBadges(badgesValue);
            
            // Set sizes/pricing - check sellers array first, then fallback to direct fields
            let sizesData = [];
            
            // Check if product has sellers array (multi-seller structure)
            if (product.sellers && Array.isArray(product.sellers) && product.sellers.length > 0) {
                // Get the first seller's price_size data
                sizesData = product.sellers[0].price_size || [];
                console.log('Found sizes in sellers array:', sizesData);
            } else {
                // Fallback to direct price_size or sizes field
                sizesData = product.price_size || product.sizes || [];
                console.log('Found sizes in direct field:', sizesData);
            }
            
            if (Array.isArray(sizesData) && sizesData.length > 0) {
                const formattedSizes = sizesData.map(item => ({
                    size: item.size || item.name || '',
                    price: (item.price || '').toString(),
                    discountedPrice: (item.discountedPrice || '').toString(),
                    quantity: (item.quantity || '').toString()
                }));
                console.log('Setting formatted sizes:', formattedSizes);
                setSizes(formattedSizes);
            } else {
                console.log('No sizes data found, keeping default');
            }
            
            // Set shop details - check sellers array first
            let shopDetails = '';
            if (product.sellers && Array.isArray(product.sellers) && product.sellers.length > 0) {
                shopDetails = product.sellers[0].fullShopDetails || '';
                console.log('Found shop details in sellers array:', shopDetails);
            } else {
                shopDetails = product.fullShopDetails || product.shopDetail || '';
                console.log('Found shop details in direct field:', shopDetails);
            }
            setShopDetail(shopDetails);
            
            // Set category and subcategory - needs to wait for categories to be loaded
            if (product.category && categories.length > 0) {
                console.log('Product category ID:', product.category);
                console.log('Available categories count:', categories.length);
                
                // Find the parent category and subcategory
                const parentCategory = categories.find(cat => 
                    cat.subcategories && cat.subcategories.some(sub => sub._id === product.category)
                );
                
                if (parentCategory) {
                    console.log('Found parent category:', parentCategory.name);
                    setSelectedCategory(parentCategory);
                    
                    const subCategory = parentCategory.subcategories.find(sub => sub._id === product.category);
                    if (subCategory) {
                        console.log('Found subcategory:', subCategory.name);
                        setSelectedSubCategory(subCategory);
                    }
                } else {
                    console.log('Category not found in categories list');
                }
            } else {
                console.log('Categories not loaded yet or no category in product');
            }
            
        } catch (error) {
            console.error('Error fetching product details:', error);
            console.error('Error response:', error.response?.data);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.response?.data?.message || 'Could not load product details.'
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

    const removeSize = (index) => {
        if (sizes.length > 1) {
            setSizes(sizes.filter((_, i) => i !== index));
        } else {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'At least one size variant is required'
            });
        }
    };

    // Image Management
    const pickImages = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Toast.show({
                type: 'error',
                text1: 'Permission Denied',
                text2: 'We need access to your photos to upload images.'
            });
            return;
        }

        try {
            const totalImages = existingImages.length + newImages.length;
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                selectionLimit: 5 - totalImages,
                quality: 1,
            });

            if (!result.canceled) {
                const newUris = result.assets.map(asset => asset.uri);
                setNewImages(prevImages => [...prevImages, ...newUris].slice(0, 5 - existingImages.length));
            }
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to pick images. Please try again.'
            });
        }
    };

    const removeExistingImage = (indexToRemove) => {
        setExistingImages(existingImages.filter((_, index) => index !== indexToRemove));
    };

    const removeNewImage = (indexToRemove) => {
        setNewImages(newImages.filter((_, index) => index !== indexToRemove));
    };

    // Form Validation
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

        if (existingImages.length + newImages.length === 0) {
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

        // Tags are optional - backend requires at least one, so we'll send a default if empty
        // Validation removed to allow empty tags

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
                text1: 'Updating Product',
                text2: 'Please wait while we update your product...'
            });

            const formData = new FormData();

            // Append existing images to retain
            formData.append('existingImages', JSON.stringify(existingImages));

            // Append new images
            newImages.forEach((uri, index) => {
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

            // Parse tags as an array (tags are optional)
            const tagsArray = tags.trim() 
                ? tags.split(',').map(tag => tag.trim()).filter(tag => tag)
                : [];
            formData.append('tag', JSON.stringify(tagsArray));

            // Add badges
            formData.append('badges', badges);

            // Shop Detail
            formData.append('fullShopDetails', shopDetail);

            // Make API request
            const response = await customFetch.put(`/products/editproduct/${productId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.status === 200 || response.status === 201) {
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Product updated successfully!'
                });
                setTimeout(() => {
                    navigation.goBack();
                }, 1000);
            }
        } catch (error) {
            console.error('Error updating product:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.response?.data?.message || 'Could not update product. Please try again.'
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

    // Loading Screen
    if (loading) {
        return (
            <>
                <CustomTopBar navigation={navigation} title="Edit Product" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4CAF50" />
                    <Text style={styles.loadingText}>Loading product details...</Text>
                </View>
            </>
        );
    }

    // ---------- MAIN RENDER ----------
    return (
        <>
            <CustomTopBar navigation={navigation} title="Edit Product" />
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
                        style={[styles.input, styles.textArea]}
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
                        {existingImages.map((uri, index) => (
                            <View key={`existing-${index}`} style={styles.imageWrapper}>
                                <Image source={{ uri }} style={styles.image} />
                                <TouchableOpacity
                                    style={styles.crossButton}
                                    onPress={() => removeExistingImage(index)}
                                >
                                    <Text style={styles.crossButtonText}>×</Text>
                                </TouchableOpacity>
                            </View>
                        ))}

                        {newImages.map((uri, index) => (
                            <View key={`new-${index}`} style={styles.imageWrapper}>
                                <Image source={{ uri }} style={styles.image} />
                                <TouchableOpacity
                                    style={styles.crossButton}
                                    onPress={() => removeNewImage(index)}
                                >
                                    <Text style={styles.crossButtonText}>×</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>

                    {(existingImages.length + newImages.length) < 5 && (
                        <TouchableOpacity onPress={pickImages} style={styles.addButton}>
                            <Text style={styles.addButtonText}>
                                {(existingImages.length + newImages.length) === 0 ? 'Select Images' : 'Add More Images'}
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

                    <Text style={styles.label}>Tags (comma separated) - Optional</Text>
                    <Text style={styles.fieldDescription}>
                        Enter keywords to improve discoverability of your Product.
                    </Text>
                    <TextInput
                        style={styles.input}
                        value={tags}
                        onChangeText={setTags}
                        placeholder="e.g., organic, natural, vegan (optional)"
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
                        Update sizes, prices, and stock quantities for your product.
                    </Text>

                    {sizes.map((size, index) => (
                        <View key={index} style={styles.sizeContainer}>
                            <View style={styles.sizeHeader}>
                                <Text style={styles.sizeLabel}>Size Option {index + 1}</Text>
                                {sizes.length > 1 && (
                                    <TouchableOpacity onPress={() => removeSize(index)}>
                                        <Text style={styles.removeText}>Remove</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

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
                        placeholder="Enter details about your shop name, address etc."
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
                        <Text style={styles.submitButtonText}>Update Product</Text>
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

                        <FlatList
                            data={categories}
                            renderItem={renderCategoryItem}
                            keyExtractor={(item) => item._id}
                            style={styles.modalList}
                        />

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

                        <FlatList
                            data={selectedCategory?.subcategories || []}
                            renderItem={renderSubCategoryItem}
                            keyExtractor={(item) => item._id}
                            style={styles.modalList}
                        />

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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
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
        backgroundColor: '#fff',
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
        backgroundColor: '#fff',
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
        backgroundColor: '#fff',
    },
    sizeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sizeLabel: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    removeText: {
        color: '#ff4444',
        fontWeight: '500',
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
});

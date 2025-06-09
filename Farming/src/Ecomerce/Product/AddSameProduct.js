import React, { useState } from 'react';
import axios from 'axios';

const AddSameProduct = ({ setPopupforAddProduct, productId, selectedProduct, token }) => {
    // State for seller-specific inputs
    const [priceSizeInputs, setPriceSizeInputs] = useState([
        { size: '', price: '', discountedPrice: '', quantity: '' }
    ]);
    const [tags, setTags] = useState(''); // Comma-separated tags
    const [shopDetails, setShopDetails] = useState(''); // Shop details

    // Add a new set of input fields
    const handleAddSize = () => {
        setPriceSizeInputs((prev) => [
            ...prev,
            { size: '', price: '', discountedPrice: '', quantity: '' }
        ]);
    };

    // Remove a set of input fields
    const handleRemoveSize = (index) => {
        setPriceSizeInputs((prev) => prev.filter((_, i) => i !== index));
    };

    // Handle input changes for size-price-quantity
    const handleInputChange = (index, field, value) => {
        setPriceSizeInputs((prev) =>
            prev.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        );
    };

    // Handle the "Add Product" action
    const handleAddProduct = async () => {
        try {
            // Prepare the seller data to be added
            const sellerData = {
               
                price_size: priceSizeInputs.map((item) => ({
                    size: item.size,
                    price: parseFloat(item.price),
                    discountedPrice: parseFloat(item.discountedPrice),
                    quantity: parseInt(item.quantity)
                })),
                tags: tags.split(',').map((tag) => tag.trim()), // Split tags into an array
                fullShopDetails: shopDetails // Shop details
            };

            // Call the backend API to add the seller to the existing product
            await axios.put(`http://localhost:4000/api/v1/products/addseller/${productId}`, sellerData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            

            console.log(`Seller added to product with ID: ${productId}`);
            setPopupforAddProduct(false); // Close the popup
        } catch (error) {
            console.error('Error adding seller:', error);
        }
    };

    // Handle the "Cancel" action
    const handleClosePopup = () => {
        setPopupforAddProduct(false);
    };

    return (
        <div
            className="fixed inset-0 z-[1000] grid place-items-center bg-black bg-opacity-50"
            style={{ width: '100vw', height: '100vh' }}
        >
            <div
                className="bg-white rounded-lg shadow-lg overflow-y-auto p-6"
                style={{
                    width: '80vw', // 80% of viewport width
                    height: '80vh', // 80% of viewport height
                    maxWidth: '90vw', // Optional: Prevent exceeding max width on smaller screens
                    maxHeight: '90vh' // Optional: Prevent exceeding max height on smaller screens
                }}
            >
                <h2 className="text-xl font-bold mb-4">Product Already Listed</h2>
                <p className="mb-4">
                    The product "{selectedProduct.name}" is already listed. Please provide your details to add it as a new seller.
                </p>

                {/* Dynamic input fields for size, price, discounted price, and quantity */}
                {priceSizeInputs.map((input, index) => (
                    <div key={index} className="space-y-2 mb-4 border-b pb-4">
                        <h3 className="font-semibold">Size {index + 1}</h3>
                        <input
                            type="text"
                            placeholder="Size"
                            value={input.size}
                            onChange={(e) => handleInputChange(index, 'size', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded"
                            required
                        />
                        <input
                            type="number"
                            placeholder="Price"
                            value={input.price}
                            onChange={(e) => handleInputChange(index, 'price', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded"
                            required
                        />
                        <input
                            type="number"
                            placeholder="Discounted Price"
                            value={input.discountedPrice}
                            onChange={(e) => handleInputChange(index, 'discountedPrice', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded"
                            required
                        />
                        <input
                            type="number"
                            placeholder="Quantity"
                            value={input.quantity}
                            onChange={(e) => handleInputChange(index, 'quantity', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded"
                            required
                        />
                        {priceSizeInputs.length > 1 && (
                            <button
                                className="text-red-500 hover:underline"
                                onClick={() => handleRemoveSize(index)}
                            >
                                Remove Size
                            </button>
                        )}
                    </div>
                ))}

                {/* Button to add another size */}
                <button
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mb-4"
                    onClick={handleAddSize}
                >
                    Add Another Size
                </button>

                {/* Tags Input */}
                <div className="mb-4">
                    <label className="block font-semibold mb-2">Tags</label>
                    <input
                        type="text"
                        placeholder="Enter tags (comma-separated)"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                </div>

                {/* Shop Details Input */}
                <div className="mb-4">
                    <label className="block font-semibold mb-2">Shop Details</label>
                    <textarea
                        placeholder="Enter your shop details (e.g., name, location, description)"
                        value={shopDetails}
                        onChange={(e) => setShopDetails(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        rows="3"
                    />
                </div>

                <div className="flex justify-end space-x-4">
                    <button
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                        onClick={handleClosePopup}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={handleAddProduct}
                    >
                        Add as Seller
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddSameProduct;
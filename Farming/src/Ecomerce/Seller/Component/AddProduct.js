import React, { useEffect, useState } from 'react';
import { Camera, Trash2, Plus, X } from 'lucide-react';
import axios from 'axios';
import TextEditor from './TextEditor';
import { useParams, useNavigate } from 'react-router-dom';

const AddProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fetchdata, setFetchedData] = useState([]);
  const [images, setImages] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [chips, setChips] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  const [productData, setProductData] = useState({
    fullShopDetails: '',
    name: '',
    description: '',
    priceDetails: [{ price: '', discountedPrice: '', size: '', quantity: '' }],
    images: []
  });

  // Fetch product data if editing (unchanged logic)
  useEffect(() => {
    const fetchProductData = async () => {
      if (id) {
        try {
          const storedTokenData = JSON.parse(localStorage.getItem("token"));
          if (storedTokenData && Date.now() < storedTokenData.expires) {
            const response = await axios.get(
              `http://localhost:4000/api/v1/products/getproductbyid/${id}`,
              { headers: { Authorization: `Bearer ${storedTokenData.value}` } }
            );
            const product = response.data.product;
            setIsEditing(true);
            setProductData({
              fullShopDetails: product.sellers[0]?.fullShopDetails || '',
              name: product.name || '',
              description: product.description || '',
              priceDetails: product.sellers[0]?.price_size || [{ price: '', discountedPrice: '', size: '', quantity: '' }],
              images: product.images || []
            });
            setSelectedCategory(product.category || '');
            setChips(product.tag || []);
          }
        } catch (error) {
          console.error('Error fetching product:', error);
        }
      }
    };
    fetchProductData();
  }, [id]);

  const fetchCategory = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/v1/products/getallparentcategory");
      setFetchedData(response.data.data);
    } catch (error) {
      alert(error.message);
    }
  };

  useEffect(() => { fetchCategory(); }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData(prev => ({ ...prev, [name]: value }));
  };

  const handlePriceDetailChange = (index, e) => {
    const { name, value } = e.target;
    const newPriceDetails = [...productData.priceDetails];
    newPriceDetails[index][name] = value;
    setProductData(prev => ({ ...prev, priceDetails: newPriceDetails }));
  };

  const addPriceDetail = () => {
    setProductData(prev => ({
      ...prev,
      priceDetails: [...prev.priceDetails, { price: '', discountedPrice: '', size: '', quantity: '' }]
    }));
  };

  const removePriceDetail = (index) => {
    const newPriceDetails = productData.priceDetails.filter((_, i) => i !== index);
    setProductData(prev => ({ ...prev, priceDetails: newPriceDetails }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files]);
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setProductData(prev => ({ ...prev, images: [...prev.images, ...imageUrls] }));
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setProductData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory('');
  };

  const handleSubcategoryChange = (subcategoryId) => {
    setSelectedSubcategory(subcategoryId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", productData.name);
    formData.append("description", productData.description);
    formData.append("price_size", JSON.stringify(productData.priceDetails));
    formData.append("fullShopDetails", productData.fullShopDetails);
    formData.append("category", selectedSubcategory || selectedCategory);
    formData.append("badges", "PreciAgri");
    formData.append("tag", JSON.stringify(chips));
    if (images.length > 0) {
      images.forEach((image) => formData.append(`image`, image));
    }

    const storedTokenData = JSON.parse(localStorage.getItem("token"));
    if (storedTokenData && Date.now() < storedTokenData.expires) {
      const config = { headers: { Authorization: `Bearer ${storedTokenData.value}` } };
      try {
        const url = isEditing
          ? `http://localhost:4000/api/v1/products/editproduct/${id}`
          : "http://localhost:4000/api/v1/products/createproduct";
        const method = isEditing ? 'put' : 'post';
        await axios[method](url, formData, config);
        navigate('/seller');
      } catch (error) {
        console.error('Error saving product:', error);
      }
    }
  };

  const handleDeleteChip = (chipIndex) => {
    setChips(chips.filter((_, index) => index !== chipIndex));
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      const chipValue = event.target.value.trim();
      if (chipValue && !chips.includes(chipValue)) {
        setChips([...chips, chipValue]);
        event.target.value = "";
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-7xl mx-auto p-8 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {isEditing ? 'Edit Product' : 'Add New Product'}
      </h2>

      {/* Grid Layout for Shop Details and Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block mb-1 font-medium text-gray-700">Full Shop Details</label>
          <input
            type="text"
            name="fullShopDetails"
            value={productData.fullShopDetails}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium text-gray-700">Product Name</label>
          <input
            type="text"
            name="name"
            value={productData.name}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>
      </div>

      {/* Category Selection */}
      <div className="mb-6">
        <label className="block mb-1 font-medium text-gray-700">Category</label>
        <div className="flex gap-4">
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Select Category</option>
            {fetchdata.map((category) => (
              <option key={category._id} value={category._id}>{category.name}</option>
            ))}
          </select>
          <select
            value={selectedSubcategory}
            onChange={(e) => handleSubcategoryChange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            disabled={!selectedCategory}
          >
            <option value="">Select Subcategory</option>
            {selectedCategory &&
              fetchdata.find(cat => cat._id === selectedCategory)?.subcategories.map((subcategory) => (
                <option key={subcategory._id} value={subcategory._id}>{subcategory.name}</option>
              ))}
          </select>
        </div>
      </div>

      {/* Description */}
      <div className="mb-6">
        <label className="block mb-1 font-medium text-gray-700">Description</label>
        <TextEditor value={productData.description} onChange={handleInputChange} />
      </div>

      {/* Tags */}
      <div className="mb-6">
        <label className="block mb-1 font-medium text-gray-700">Tags</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {chips.map((chip, index) => (
            <span
              key={index}
              className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
            >
              {chip}
              <button
                type="button"
                onClick={() => handleDeleteChip(index)}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                <X size={16} />
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          placeholder="Add a tag (press Enter or comma)"
          onKeyDown={handleKeyDown}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      {/* Images */}
      <div className="mb-6">
        <label className="block mb-1 font-medium text-gray-700">Product Images</label>
        <div className="flex flex-wrap gap-4 mb-4">
          {productData.images.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image}
                alt="Product"
                className="w-32 h-32 object-cover rounded-lg shadow-md"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700">
          <Camera size={20} /> Upload Images
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Price & Sizes */}
      <div className="mb-6">
        <label className="block mb-1 font-medium text-gray-700">Price & Sizes</label>
        {productData.priceDetails.map((detail, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
            <input
              type="number"
              name="price"
              placeholder="Price"
              value={detail.price}
              onChange={(e) => handlePriceDetailChange(index, e)}
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
            <input
              type="number"
              name="discountedPrice"
              placeholder="Discounted Price"
              value={detail.discountedPrice}
              onChange={(e) => handlePriceDetailChange(index, e)}
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <input
              type="text"
              name="size"
              placeholder="Size"
              value={detail.size}
              onChange={(e) => handlePriceDetailChange(index, e)}
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
            <div className="flex items-center gap-2">
              <input
                type="number"
                name="quantity"
                placeholder="Quantity"
                value={detail.quantity}
                onChange={(e) => handlePriceDetailChange(index, e)}
                className="p-3 border border-gray-300 rounded-lg flex-grow focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removePriceDetail(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={20} />
                </button>
              )}
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addPriceDetail}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus size={20} /> Add Price/Size
        </button>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
      >
        {isEditing ? 'Update Product' : 'Add Product'}
      </button>
    </form>
  );
};

export default AddProduct;
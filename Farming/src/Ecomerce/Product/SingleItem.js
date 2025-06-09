import React, { useEffect, useState } from "react";
import {
  Heart,
  Share2,
  ShoppingCart,
  Truck,
  RefreshCw,
  Star,
  Minus,
  Plus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import RatingAndReview from "./RatingAndReview";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import copy from "copy-to-clipboard";
import AddressPopup from "../Address/AddressPopup";
import ConfirmationModal from "../../Component/Common/ConfirmationModal";
import { getProductById } from "../../services/operations/singleproductApi";
import { addTowishlist } from "../../slice/wishlistSlice";
import AddSameProduct from "./AddSameProduct";

const SingleItem = () => {
  const { productId } = useParams();
  const [mainImage, setMainImage] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [wisListId, setWisListId] = useState(null);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const navigate = useNavigate();
  const [isAddressPopupVisible, setIsAddressPopupVisible] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isConfirmationModalVisible, setIsConfirmationModalVisible] =
    useState(false);
  const [confirmationModal, setConfirmationModal] = useState(null);
  const dispatch = useDispatch();
  const { selectedProduct, loading } = useSelector((state) => state.singleproduct);
  const [userType, setUserRole] = useState("");
  const [popupforAddProduct, setPopupforAddProduct] = useState(false);
  const [showOtherSellers, setShowOtherSellers] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(0); // Default to first seller

  // Extract token from localStorage
  let token;
  const storedTokenData = JSON.parse(localStorage.getItem("token"));
  if (storedTokenData && Date.now() < storedTokenData.expires) {
    token = storedTokenData.value;
  } else {
    localStorage.removeItem("token");
  }

  // Fetch user role based on token
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/v1/auth/getuserbytoken", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserRole(response.data.user.accountType);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    if (token) fetchUser();
  }, [token]);

  // Fetch product details by ID
  useEffect(() => {
    dispatch(getProductById(productId));
  }, [dispatch, productId]);

  // Set default image, size, and seller
  useEffect(() => {
    if (selectedProduct) {
      setMainImage(selectedProduct?.images?.[0] || null);
      if (selectedProduct.sellers && selectedProduct.sellers.length > 0) {
        setSelectedSeller(0);
        if (selectedProduct.sellers[0].price_size && selectedProduct.sellers[0].price_size.length > 0) {
          setSelectedSize(selectedProduct.sellers[0].price_size[0]);
        }
      }
    }
  }, [selectedProduct]);

  // Handle share functionality
  const handleShare = () => {
    copy(window.location.href);
    toast.success("Link copied to clipboard");
  };

  // Add product to wishlist
  const addtoWishListt = async (productId) => {
    dispatch(addTowishlist(selectedProduct));
  };

  // Change selected seller
  const changeSeller = (index) => {
    setSelectedSeller(index);
    if (selectedProduct.sellers[index].price_size && selectedProduct.sellers[index].price_size.length > 0) {
      setSelectedSize(selectedProduct.sellers[index].price_size[0]);
      setQuantity(1);
    }
  };

  // Add product to cart
  const addtocart = async (id) => {
    if (!selectedSize) {
      alert("Please select a size before adding to cart.");
      return;
    }
    const selectedsize = selectedSize.size;
    const selecetedDiscountedPrice = selectedSize.discountedPrice;
    const selectedPrice = selectedSize.price;
    const sellerId = selectedProduct.sellers[selectedSeller].sellerId;

    try {
      const response = await axios.post(
        "http://localhost:4000/api/v1/products/addtocart",
        {
          productId: id,
          quantity,
          selectedsize,
          selecetedDiscountedPrice,
          selectedPrice,
          sellerId,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Cart Response:", response.data);
      toast.success("Product added to cart successfully!");
      navigate("/product/cart");
    } catch (error) {
      console.error("Error adding to cart:", error.response?.data || error.message);
      toast.error("Failed to add product to cart.");
    }
  };

  // Handle quantity changes
  const handleQuantityChange = (newQuantity) => {
    if (selectedSize && newQuantity >= 1 && newQuantity <= selectedSize.quantity) {
      setQuantity(newQuantity);
    }
  };

  // Handle address selection
  const handleAddressSelect = (addressId) => {
    setSelectedAddress(addressId);
    toast.success("Proceeding for checkout");
    navigate("/product/checkout");
  };

  // Handle "Buy Now" action
  const handleBuyNow = async () => {
    if (!token) {
      setConfirmationModal({
        text1: "You are not logged in!",
        text2: "Please login to buy the product.",
        btn1Text: "Login",
        btn2Text: "Cancel",
        btn1Handler: () => navigate("/login"),
        btn2Handler: () => closeConfirmationModal(),
      });
      openConfirmationModal();
    } else {
      // Get selected seller and size info
      const selectedSellerInfo = selectedProduct.sellers[selectedSeller];
      const selectedPriceSize = selectedSize; // already available as state
  
      // Navigate with query params
      const queryParams = new URLSearchParams({
        sellerId: selectedSellerInfo.sellerId,
        shopName: selectedSellerInfo.fullShopDetails,
        size: selectedPriceSize.size,
        price: selectedPriceSize.price,
        discountedPrice: selectedPriceSize.discountedPrice,
        quantity: quantity,
        image:selectedProduct.images[0],
        productId: selectedProduct._id,
      }).toString();
  
      navigate(`/product/checkout?${queryParams}`);
    }
  };

  // Open confirmation modal
  const openConfirmationModal = () => {
    setIsConfirmationModalVisible(true);
  };

  // Close confirmation modal
  const closeConfirmationModal = () => {
    setIsConfirmationModalVisible(false);
  };

  // Render fallback UI while loading
  if (!selectedProduct) return <div className="text-center text-xl mt-20">Loading...</div>;

  return (
    <>
      {/* Main Product Layout */}
      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8 mt-16">
        {/* Image Gallery Section */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Thumbnail Gallery */}
          <div className="flex lg:flex-col space-x-2 lg:space-y-2 overflow-x-auto lg:overflow-visible">
            {selectedProduct.images?.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Product thumbnail ${index + 1}`}
                className={`w-16 h-16 lg:w-20 lg:h-20 object-contain rounded-lg cursor-pointer ${
                  mainImage === image ? "border-2 border-blue-500" : "opacity-70 hover:opacity-100"
                }`}
                onClick={() => setMainImage(image)}
              />
            ))}
          </div>

          {/* Main Image and Mobile Price Section */}
          <div className="flex-grow relative">
            <img
              src={mainImage || "fallback-image-url"}
              alt={selectedProduct.name}
              className="w-full h-[400px] lg:h-[500px] object-contain rounded-lg shadow-lg"
            />
            <div className="absolute top-4 right-4 flex space-x-2">
              <button
                className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition"
                aria-label="Add to Wishlist"
                onClick={() => addtoWishListt(selectedProduct._id)}
              >
                <Heart size={24} className="text-gray-600 hover:text-red-500" />
              </button>
              <button
                className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition"
                aria-label="Share"
                onClick={handleShare}
              >
                <Share2 size={24} className="text-gray-600" />
              </button>
            </div>

            {/* Mobile Price Display */}
            <div className="lg:hidden mt-4 rounded-lg shadow-sm">
              <div className="grid grid-cols-2 gap-2 mb-4">
                {selectedProduct.sellers[selectedSeller].price_size?.map((sizeOption, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-2 bg-white cursor-pointer transition ${
                      selectedSize === sizeOption ? "border-blue-500 bg-blue-50" : "border-gray-200"
                    }`}
                    onClick={() => setSelectedSize(sizeOption)}
                  >
                    <div className="text-center">
                      <div className="font-medium mb-1">{sizeOption.size}</div>
                      <div className="text-blue-600 font-bold">₹{sizeOption.discountedPrice}</div>
                      <div className="text-xs">
                        <span className="text-gray-500 line-through">₹{sizeOption.price}</span>
                        <span className="text-green-600 ml-1">
                          {Math.round(((sizeOption.price - sizeOption.discountedPrice) / sizeOption.price) * 100)}% off
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div>
              <div className="flex space-x-4 p-4 rounded-lg mb-4">
                <span className="text-gray-700 font-medium">Quantity:</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className={`p-2 rounded-full ${
                      quantity <= 1
                        ? "bg-gray-100 text-gray-400"
                        : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                    } transition-colors duration-200`}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-10 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={!selectedSize || quantity >= selectedSize.quantity}
                    className={`p-2 rounded-full ${
                      !selectedSize || quantity >= selectedSize.quantity
                        ? "bg-gray-100 text-gray-400"
                        : "bg-blue-100 text-green-600 hover:bg-green-200"
                    } transition-colors duration-200`}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              <div className="flex space-x-4 mt-4">
                <button
                  className="flex-1 flex items-center justify-center bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
                  onClick={() => addtocart(selectedProduct._id)}
                >
                  <ShoppingCart className="mr-2" /> Add to Cart
                </button>
                <button
                  className="flex-1 flex items-center justify-center bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition"
                  onClick={handleBuyNow}
                >
                  Buy Now
                </button>
              </div>
              {userType === "Seller" && (
                <div className="flex items-center justify-center mt-4 text-sm text-gray-600">
                  <span className="mr-2">Already a Seller?</span>
                  <button
                    className="text-blue-500 hover:underline"
                    onClick={() => setPopupforAddProduct(true)}
                  >
                    Sell Same Product
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div>
          <h1 className="text-2xl text-[#1b2c0a] font-bold mb-2">{selectedProduct.name}</h1>

          {/* Current Seller Info */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Seller: {selectedProduct.sellers[selectedSeller].fullShopDetails}</h3>
              {selectedProduct.sellers.length > 1 && (
                <button
                  onClick={() => setShowOtherSellers(!showOtherSellers)}
                  className="text-blue-600 flex items-center text-sm hover:underline"
                >
                  {showOtherSellers ? (
                    <>Hide Other Sellers <ChevronUp size={16} className="ml-1" /></>
                  ) : (
                    <>See Other Sellers ({selectedProduct.sellers.length - 1}) <ChevronDown size={16} className="ml-1" /></>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Other Sellers Section */}
          {showOtherSellers && selectedProduct.sellers.length > 1 && (
            <div className="bg-white border rounded-lg mb-6 overflow-hidden">
              <div className="bg-gray-50 p-3 border-b">
                <h3 className="font-medium">All Available Sellers ({selectedProduct.sellers.length})</h3>
              </div>
              <div className="divide-y">
                {selectedProduct.sellers.map((seller, index) => (
                  <div
                    key={index}
                    className={`p-4 hover:bg-gray-50 cursor-pointer ${selectedSeller === index ? "bg-blue-50" : ""}`}
                    onClick={() => changeSeller(index)}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">{seller.fullShopDetails}</h4>
                      {selectedSeller === index && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Selected</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {seller.price_size.map((sizeOption, idx) => (
                        <div key={idx} className="bg-gray-100 px-3 py-1 rounded-md text-sm">
                          <span className="font-medium">{sizeOption.size}</span>: ₹{sizeOption.discountedPrice}
                          <span className="text-xs text-gray-500 ml-1">({sizeOption.quantity} in stock)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Desktop Price Display */}
          <div className="hidden lg:block p-4 rounded-lg mb-4">
            <div className="flex flex-wrap gap-4">
              {selectedProduct.sellers[selectedSeller].price_size?.map((sizeOption, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-3 bg-white cursor-pointer transition ${
                    selectedSize === sizeOption ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"
                  }`}
                  onClick={() => setSelectedSize(sizeOption)}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{sizeOption.size}</span>
                    <div>
                      <div className="flex items-center">
                        <span className="text-xl font-bold text-blue-600 mr-2">₹{sizeOption.discountedPrice}</span>
                        <span className="text-gray-500 line-through text-sm">₹{sizeOption.price}</span>
                        <span className="text-green-600 font-semibold text-sm ml-2">
                          {Math.round(((sizeOption.price - sizeOption.discountedPrice) / sizeOption.price) * 100)}% off
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">Qty Available: {sizeOption.quantity}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery and Services */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h3 className="text-lg font-semibold mb-3">Delivery & Services</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center">
                <Truck className="mb-2 text-blue-600" />
                <span className="text-xs">Free Delivery</span>
              </div>
              <div className="flex flex-col items-center">
                <RefreshCw className="mb-2 text-green-600" />
                <span className="text-xs">7 Days Replacement</span>
              </div>
              <div className="flex flex-col items-center">
                <Star className="mb-2 text-yellow-600" />
                <span className="text-xs">Quality Guaranteed</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Product Description</h3>
            <div className="mt-4">
              <div
                dangerouslySetInnerHTML={{ __html: selectedProduct.description }}
                className="border p-4"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Ratings and Reviews */}
      <div>
        <RatingAndReview productId={productId} />
      </div>

      {/* Confirmation Modal */}
      {isConfirmationModalVisible && (
        <ConfirmationModal modalData={confirmationModal} />
      )}

      {/* Add Same Product Popup */}
      {popupforAddProduct && (
        <div>
          <AddSameProduct
            setPopupforAddProduct={setPopupforAddProduct}
            productId={productId}
            setWisListId={setWisListId}
            wisListId={wisListId}
            selectedProduct={selectedProduct}
            setIsInWishlist={setIsInWishlist}
            isInWishlist={isInWishlist}
            token={token}
          />
        </div>
      )}
    </>
  );
};

export default SingleItem;
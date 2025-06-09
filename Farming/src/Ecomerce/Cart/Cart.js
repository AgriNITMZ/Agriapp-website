import axios from 'axios';
import { ArrowRight, Edit, MapPin, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import AddressPopup from '../Address/AddressPopup';

const Cart = () => {
  const [cartProduct, setCartProduct] = useState(null);
  const [token, setToken] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [isProcessing, setIsProcessing] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isAddressPopupVisible, setIsAddressPopupVisible] = useState(false);
  const navigate = useNavigate();

  // Fetch cart items
  const fetchProduct = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/v1/products/cartitems", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("cart response", response?.data?.cart);
      setCartProduct(response?.data?.cart);
    } catch (error) {
      toast.error(error.message || "An error occurred.");
    }
  };

  // Token validation
  useEffect(() => {
    const storedTokenData = JSON.parse(localStorage.getItem("token"));
    if (storedTokenData && Date.now() < parseInt(storedTokenData.expires)) {
      setToken(storedTokenData.value);
    } else {
      localStorage.removeItem("token");
      setToken(null);
    }
  }, []);

  // Fetch cart items when token is available
  useEffect(() => {
    if (token) {
      fetchProduct();
    }
  }, [token]);

  // Fetch addresses
  useEffect(() => {
    const fetchAddresses = async () => {
     
      try {
        const response = await axios.get("http://localhost:4000/api/v1/auth/getaddress", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response?.data) {
          setAddresses(response?.data);
          const validAddress = response.data.find(addr => addr.streetAddress && addr.city && addr.state && addr.zipCode);
          if (validAddress) {
            setSelectedAddress(validAddress);
          } else {
            toast.warn('No valid address found. Please add a new address.');
          }
        } else {
          toast.error('No addresses found.');
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
      //  toast.error('Failed to load addresses. Please try again.');
      }
    };
    fetchAddresses();
  }, [token]);

  // Handle address selection
  const handleAddressSelect = (addressId) => {
    const selected = addresses.find(addr => addr._id === addressId);
    if (selected) {
      setSelectedAddress(selected);
      setIsAddressPopupVisible(false);
      toast.success('Address selected successfully.');
    }
  };

  // Handle payment processing
  const handlePayment = async (totalAmount) => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address.');
      return;
    }
    setIsProcessing(true);
    try {
      const paymentResponse = await axios.post(
        'http://localhost:4000/api/v1/order/create-payment-link-before-order/',
        { totalAmount: totalAmount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (paymentResponse.data.success) {
        const { paymentLinkId, payment_link_url } = paymentResponse.data.data;
        const orderResponse = await axios.post(
          'http://localhost:4000/api/v1/order/createorder/',
          {
            paymentLinkId: paymentLinkId,
            totalAmount: totalAmount,
            addressId: selectedAddress._id,
            paymentMethod: "online"
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (orderResponse.data.success) {
          window.location.href = payment_link_url;
        } else {
          toast.error('Order creation failed. Please try again.');
        }
      } else {
        toast.error('Payment link creation failed. Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Remove item from cart
  const removeItem = async (id) => {
    try {
      console.log("Removing", id);
      await axios.delete(`http://localhost:4000/api/v1/products/removeitem/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Product removed from cart successfully!');
      fetchProduct();
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error('Failed to remove item. Please try again.');
    }
  };

  // Navigate to product details
  const goToProduct = async (id) => {
    navigate(`/product/item/${id}`);
  };

  // Render empty cart message
  if (!cartProduct?.items?.length) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <p className="text-2xl text-gray-600 font-semibold">Your cart is empty</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 mt-16">
        <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-8rem)]">
          {/* Delivery Address Section */}
          <div className="lg:w-3/5 w-full">
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Delivery Address</h2>
                <button
                  onClick={() => setIsAddressPopupVisible(true)}
                  className="text-green-600 hover:text-green-700 flex items-center"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Change
                </button>
              </div>
              {selectedAddress ? (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-green-600 mt-1 mr-2" />
                    <div>
                      <p className="font-medium text-gray-900">{selectedAddress.Name}</p>
                      <p className="text-gray-600">{selectedAddress.streetAddress}</p>
                      <p className="text-gray-600">
                        {selectedAddress.city}, {selectedAddress.state} {selectedAddress.zipCode}
                      </p>
                      <p className="text-gray-600">Phone: {selectedAddress.mobile}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600">No delivery address selected</p>
                  <button
                    onClick={() => setIsAddressPopupVisible(true)}
                    className="mt-2 text-green-600 hover:text-green-700"
                  >
                    Add Address
                  </button>
                </div>
              )}
            </div>

            {/* Cart Items Section */}
            <div className="bg-white rounded-lg shadow-sm p-6 max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-hide">
              <h2 className="text-xl font-semibold mb-4">Shopping Cart</h2>
              <div className="space-y-4">
                {cartProduct?.items?.map((item) => (
                  <div key={item._id} className="bg-gray-50 rounded-lg p-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <img
                        src={item?.product?.images[0] || "https://via.placeholder.com/112"}
                        alt={item?.product?.name}
                        className="w-28 h-28 object-cover rounded-md flex-shrink-0"
                      />
                      <div className="flex-grow">
                        <h3
                          className="font-semibold text-lg cursor-pointer hover:text-blue-600"
                          onClick={() => goToProduct(item.product._id)}
                        >
                          {item?.product?.name}
                        </h3>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>Size: {item?.selectedsize}</p>
                          <p>Shop: {item?.product?.fullShopDetails}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="font-medium">Price:</span>
                            <span className="line-through text-gray-500">₹{item?.selectedPrice}</span>
                            <span className="text-green-600 font-semibold">₹{item?.selecetedDiscountedPrice}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-2 border-t border-gray-200">
                      <p className="text-gray-600">
                        Quantity: <span className="font-semibold">{item?.quantity}</span>
                      </p>
                      <button
                        onClick={() => removeItem(item?._id)}
                        className="flex items-center gap-1 text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 size={16} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary Section - Fixed */}
          <div className="lg:w-2/5 w-full">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Price</span>
                  <span className="line-through text-gray-500">₹{cartProduct?.totalPrice}</span>
                </div>
                <div className="flex justify-between items-center font-semibold">
                  <span>Total Discounted Price</span>
                  <span className="text-green-600">₹{cartProduct?.totalDiscountedPrice}</span>
                </div>
                <div className="text-green-500 mt-2 font-semibold">
                  You save: ₹{cartProduct?.totalPrice - cartProduct?.totalDiscountedPrice}
                </div>
              </div>
              <button
                className="w-full mt-6 bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition-all duration-300 font-medium flex items-center justify-center gap-2"
                onClick={() => handlePayment(cartProduct?.totalDiscountedPrice)}
                disabled={isProcessing} // Disable the button while processing
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <>
                    <span>Proceed to Payment</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Address Popup */}
      {isAddressPopupVisible && (
        <AddressPopup
          isVisible={isAddressPopupVisible}
          onClose={() => setIsAddressPopupVisible(false)}
          onAddressSelect={handleAddressSelect}
        />
      )}
    </>
  );
};

export default Cart;
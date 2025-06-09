import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CreditCard, Truck, Shield, ArrowRight, MapPin, Edit } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AddressPopup from '../Address/AddressPopup';

const CheckoutProduct = () => {
  const { selectedProduct, loading } = useSelector((state) => state.singleproduct);
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [isProcessing, setIsProcessing] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isAddressPopupVisible, setIsAddressPopupVisible] = useState(false);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const sellerId = searchParams.get('sellerId');
  console.log("sellerId", sellerId);
  const shopName = searchParams.get('shopName');
  const productId = searchParams.get('productId');
  console.log("productId", productId);
  const image = searchParams.get('image');
  const size = searchParams.get('size');
  const price = parseFloat(searchParams.get('price'));
  const discountedPrice = parseFloat(searchParams.get('discountedPrice'));
  const quantity = parseInt(searchParams.get('quantity') || '1');

  const totalAmount = discountedPrice * quantity;
  const navigate = useNavigate();

  // Get token from localStorage
  const storedTokenData = JSON.parse(localStorage.getItem("token"));
  const token = storedTokenData && Date.now() < storedTokenData.expires ? storedTokenData.value : null;

  // Fetch addresses when component mounts
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!token) {
        toast.error('Session expired. Please log in again.');
        return;
      }

      try {
        const response = await axios.get("http://localhost:4000/api/v1/auth/getaddress", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response?.data) {
          setAddresses(response?.data);

          // Set the first valid address as default
          const validAddress = response.data.find(addr => addr.streetAddress && addr.city && addr.state && addr.zipCode);
          console.log("validAddress", validAddress);
          if (validAddress) {
            setSelectedAddress(validAddress);
          }
        } else {
          toast.error('No addresses found.');
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
        toast.error('Failed to load addresses. Please try again.');
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
  const handlePayment = async () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address.');
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Create payment link
      const paymentResponse = await axios.post(
        'http://localhost:4000/api/v1/order/create-payment-link-before-order/',
        { totalAmount: totalAmount },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (paymentResponse.data.success) {
        const { paymentLinkId, payment_link_url } = paymentResponse.data.data;

        // Step 2: Create order with payment details
        // In handlePayment()
        const orderResponse = await axios.post(
          'http://localhost:4000/api/v1/order/createorder',
          {
            productId: productId,
            sellerId,       // from query param
            size,           // from query param
            quantity,
            paymentMethod: 'online',
            paymentLinkId: paymentLinkId,
            addressId: selectedAddress._id,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (orderResponse.data.success) {
          window.location.href = payment_link_url; // Redirect to payment gateway
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

  return (
    <div className="min-h-screen bg-gray-50 py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">Checkout</h1>

          {/* Main Card */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            {/* Order Summary */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-24 bg-gray-200 rounded mb-4"></div>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <img
                    src={image}
                    alt={selectedProduct?.name}
                    className="w-24 h-24 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{selectedProduct?.name}</h3>
                    <p className="text-gray-600">Size: {size}, Seller: {shopName}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-2xl font-bold text-green-600">
                        ₹{discountedPrice} x {quantity} = ₹{totalAmount}
                      </span>
                      <span className="text-gray-500 line-through">
                        ₹{price * quantity}
                      </span>
                    </div>

                  </div>
                </div>
              )}
            </div>

            {/* Delivery Address Section */}
            <div className="p-6 border-b border-gray-200">
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

            {/* Address Popup */}
            {isAddressPopupVisible && (
              <AddressPopup
                isVisible={isAddressPopupVisible}
                onClose={() => setIsAddressPopupVisible(false)}
                onAddressSelect={handleAddressSelect}
              />
            )}

            {/* Shipping Information */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping Information</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Truck className="w-5 h-5" />
                  <span>Free Delivery</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Shield className="w-5 h-5" />
                  <span>Secure Packaging</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>
              <div className="space-y-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    value="online"
                    checked={paymentMethod === 'online'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="form-radio h-5 w-5 text-green-600"
                  />
                  <span className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5 text-gray-600" />
                    <span>Online Payment</span>
                  </span>
                </label>
              </div>
            </div>

            {/* Total and Checkout Button */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <span className="text-lg font-medium text-gray-900">Total Amount:</span>
                <span className="text-2xl font-bold text-green-600">
                  ₹{totalAmount}
                </span>
              </div>
              <button
                onClick={handlePayment}
                disabled={isProcessing || !selectedAddress}
                className={`w-full py-3 px-4 rounded-lg flex items-center justify-center space-x-2 ${isProcessing || !selectedAddress
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
                  } text-white transition-colors duration-200`}
              >
                {isProcessing ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <span>Proceed to Payment</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Security Badge */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center space-x-2 text-gray-600">
              <Shield className="w-5 h-5" />
              <span>Secure Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
};

export default CheckoutProduct;
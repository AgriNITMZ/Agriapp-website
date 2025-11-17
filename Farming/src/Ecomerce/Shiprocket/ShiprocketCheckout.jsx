import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, Truck, Shield, ArrowRight, MapPin, Edit, Package, Minus, Plus, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import AddressPopup from '../Address/AddressPopup';

const ShiprocketCheckout = () => {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isAddressPopupVisible, setIsAddressPopupVisible] = useState(false);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [shippingInfo, setShippingInfo] = useState(null);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Get token from localStorage
  const getToken = () => {
    const storedTokenData = JSON.parse(localStorage.getItem("token"));
    return storedTokenData && Date.now() < storedTokenData.expires ? storedTokenData.value : null;
  };

  const token = getToken();

  // Handle pre-selected product or cart items from navigation state
  useEffect(() => {
    // Check for new products from navigation state FIRST (priority)
    if (location.state?.preSelectedProduct) {
      const preSelected = location.state.preSelectedProduct;
      // Validate required fields
      if (preSelected.productId && preSelected.name && preSelected.quantity && preSelected.price) {
        setSelectedProducts([preSelected]);
        // Save to sessionStorage
        sessionStorage.setItem('shiprocketSelectedProducts', JSON.stringify([preSelected]));
        toast.success(`${preSelected.name} added to checkout`);
      } else {
        console.error('Invalid product data:', preSelected);
        toast.error('Product data is incomplete. Please try again.');
      }
      // Clear the navigation state to prevent re-adding on refresh
      window.history.replaceState({}, document.title);
    } else if (location.state?.cartItems) {
      const cartItems = location.state.cartItems;
      // Validate all cart items
      const validCartItems = cartItems.filter(item => 
        item.productId && item.name && item.quantity && item.price
      );
      
      if (validCartItems.length > 0) {
        setSelectedProducts(validCartItems);
        // Save to sessionStorage
        sessionStorage.setItem('shiprocketSelectedProducts', JSON.stringify(validCartItems));
        toast.success(`${validCartItems.length} item(s) added to checkout from cart`);
      } else {
        toast.error('Cart items are incomplete. Please try again.');
      }
      // Clear the navigation state to prevent re-adding on refresh
      window.history.replaceState({}, document.title);
    } else {
      // Only load from sessionStorage if there's no new navigation state
      const savedProducts = sessionStorage.getItem('shiprocketSelectedProducts');
      if (savedProducts) {
        try {
          const parsedProducts = JSON.parse(savedProducts);
          // Validate that all products have required fields
          const validProducts = parsedProducts.filter(p => 
            p.productId && p.name && p.quantity && p.price
          );
          
          if (validProducts.length > 0) {
            setSelectedProducts(validProducts);
            console.log('Loaded products from sessionStorage:', validProducts);
          } else {
            console.warn('No valid products found in sessionStorage');
            sessionStorage.removeItem('shiprocketSelectedProducts');
          }
        } catch (error) {
          console.error('Error parsing saved products:', error);
          sessionStorage.removeItem('shiprocketSelectedProducts');
        }
      }
    }
  }, [location.state]);

  // Fetch available products
  useEffect(() => {
    const fetchProducts = async () => {
      if (!token) {
        toast.error('Session expired. Please log in again.');
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/products/getallproduct`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data && response.data.products) {
          setProducts(response.data.products.slice(0, 10)); // Show first 10 products
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products');
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [token, navigate]);

  // Fetch addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!token) return;

      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/getaddress`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response?.data) {
          const addresses = response?.data.addresses || response?.data;
          const validAddress = addresses.find(
            addr => addr.streetAddress && addr.city && addr.state && addr.zipCode
          );
          if (validAddress) {
            setSelectedAddress(validAddress);
          }
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
      }
    };

    fetchAddresses();
  }, [token]);

  // Get pickup pincode from selected products
  const getPickupPincode = async () => {
    if (selectedProducts.length === 0) return '110001'; // Default fallback
    
    try {
      // Get the first product's details to find seller address
      const productId = selectedProducts[0].productId;
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/products/get/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Try to get seller's pincode from product data
      // Adjust this based on your actual product structure
      const sellerPincode = response.data?.product?.sellers?.[0]?.address?.zipCode || 
                           response.data?.product?.sellerAddress?.zipCode ||
                           '110001'; // Fallback
      
      return sellerPincode;
    } catch (error) {
      console.error('Error getting pickup pincode:', error);
      return '110001'; // Fallback on error
    }
  };

  // Check shipping serviceability
  const checkShippingCost = async (zipCode) => {
    if (!zipCode || !token) return;
    
    setLoadingShipping(true);
    try {
      // Get pickup pincode from product seller
      const pickupPincode = await getPickupPincode();
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/shiprocket/check-serviceability`,
        {
          pincode: zipCode,
          pickupPincode: pickupPincode,
          weight: 0.5, // Default weight, you can calculate based on products
          cod: paymentMethod === 'cod' ? 1 : 0
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success && response.data.serviceable) {
        setShippingInfo({
          cost: response.data.shippingCost,
          estimatedDays: response.data.estimatedDays,
          courierName: response.data.courierName
        });
      } else {
        setShippingInfo(null);
        if (!response.data.serviceable) {
          toast.error('Delivery not available to this pincode');
        }
      }
    } catch (error) {
      console.error('Error checking shipping:', error);
      setShippingInfo(null);
    } finally {
      setLoadingShipping(false);
    }
  };

  // Handle address selection
  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setIsAddressPopupVisible(false);
    toast.success('Address selected successfully');
    // Check shipping cost for the selected address
    if (address.zipCode) {
      checkShippingCost(address.zipCode);
    }
  };

  // Add product to selection
  const addProduct = (product) => {
    const priceDetail = product.price_size?.[0];
    if (!priceDetail) {
      toast.error('Product pricing not available');
      return;
    }

    const existingProduct = selectedProducts.find(p => p.productId === product._id);
    if (existingProduct) {
      updateQuantity(product._id, existingProduct.quantity + 1);
    } else {
      const newProducts = [...selectedProducts, {
        productId: product._id,
        name: product.name,
        quantity: 1,
        price: priceDetail.discountedPrice || priceDetail.price,
        imageUrl: product.images?.[0] || ''
      }];
      setSelectedProducts(newProducts);
      // Save to sessionStorage
      sessionStorage.setItem('shiprocketSelectedProducts', JSON.stringify(newProducts));
      toast.success(`${product.name} added to checkout`);
    }
  };

  // Update product quantity
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeProduct(productId);
      return;
    }
    const updatedProducts = selectedProducts.map(p =>
      p.productId === productId ? { ...p, quantity: newQuantity } : p
    );
    setSelectedProducts(updatedProducts);
    // Save to sessionStorage
    sessionStorage.setItem('shiprocketSelectedProducts', JSON.stringify(updatedProducts));
  };

  // Remove product
  const removeProduct = (productId) => {
    const updatedProducts = selectedProducts.filter(p => p.productId !== productId);
    setSelectedProducts(updatedProducts);
    // Save to sessionStorage
    sessionStorage.setItem('shiprocketSelectedProducts', JSON.stringify(updatedProducts));
    toast.success('Product removed');
  };

  // Calculate subtotal (products only)
  const calculateSubtotal = () => {
    const subtotal = selectedProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    return Math.round(subtotal * 100) / 100; // Round to 2 decimal places
  };

  // Calculate total (including shipping)
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shippingCost = shippingInfo?.cost || 0;
    const total = subtotal + shippingCost;
    return Math.round(total * 100) / 100; // Round to 2 decimal places
  };

  // Load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Handle payment
  const handlePayment = async () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      return;
    }

    if (selectedProducts.length === 0) {
      toast.error('Please select at least one product');
      return;
    }

    // Validate all products have required fields
    const invalidProducts = selectedProducts.filter(p => 
      !p.productId || !p.name || !p.quantity || !p.price
    );
    
    if (invalidProducts.length > 0) {
      console.error('Invalid products found:', invalidProducts);
      toast.error('Some products are missing required information. Please try adding them again.');
      return;
    }

    setIsProcessing(true);

    try {
      const totalAmount = calculateTotal();
      
      console.log('Creating order with:', {
        addressId: selectedAddress._id,
        paymentMethod,
        items: selectedProducts,
        shippingCost: shippingInfo?.cost || 0,
        totalAmount
      });

      if (paymentMethod === 'cod') {
        // Direct order creation for COD
        console.log('Sending COD order request...');
        const orderResponse = await axios.post(
          `${import.meta.env.VITE_API_URL}/shiprocket/create`,
          {
            addressId: selectedAddress._id,
            paymentMethod: 'cod',
            items: selectedProducts,
            shippingCost: shippingInfo?.cost || 0,
            shippingInfo: shippingInfo
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log('COD Order response:', orderResponse.data);
        
        if (orderResponse.data.success) {
          // Clear selected products to prevent duplicate orders
          setSelectedProducts([]);
          // Clear sessionStorage
          sessionStorage.removeItem('shiprocketSelectedProducts');
          
          toast.success('Order placed successfully!');
          console.log('Navigating to success page with:', {
            order: orderResponse.data.order,
            shiprocket: orderResponse.data.shiprocket
          });
          navigate('/shiprocket/success', {
            state: {
              order: orderResponse.data.order,
              shiprocket: orderResponse.data.shiprocket
            },
            replace: true // Replace history to prevent back button issues
          });
        } else {
          toast.error(orderResponse.data.message || 'Failed to create order');
          setIsProcessing(false);
        }
      } else {
        // Online payment flow
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          toast.error('Failed to load payment gateway');
          setIsProcessing(false);
          return;
        }

        // Create Razorpay order
        const paymentOrderResponse = await axios.post(
          `${import.meta.env.VITE_API_URL}/shiprocket/payment/create-order`,
          { amount: totalAmount },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!paymentOrderResponse.data.success) {
          toast.error('Failed to create payment order');
          setIsProcessing(false);
          return;
        }

        const razorpayOrder = paymentOrderResponse.data.order;

        // Validate Razorpay key
        if (!import.meta.env.VITE_RAZORPAY_KEY_ID) {
          console.error('Razorpay key not configured');
          toast.error('Payment gateway not configured. Please contact support.');
          setIsProcessing(false);
          return;
        }

        console.log('Razorpay Key:', import.meta.env.VITE_RAZORPAY_KEY_ID);

        // Open Razorpay popup
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: 'Shiprocket Checkout',
          description: 'Order Payment',
          order_id: razorpayOrder.id,
          handler: async function (response) {
            try {
              // Verify payment
              const verifyResponse = await axios.post(
                `${import.meta.env.VITE_API_URL}/shiprocket/payment/verify`,
                {
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature
                },
                { headers: { Authorization: `Bearer ${token}` } }
              );

              if (verifyResponse.data.success) {
                // Create Shiprocket order
                const orderResponse = await axios.post(
                  `${import.meta.env.VITE_API_URL}/shiprocket/create`,
                  {
                    addressId: selectedAddress._id,
                    paymentMethod: 'online',
                    items: selectedProducts,
                    shippingCost: shippingInfo?.cost || 0,
                    shippingInfo: shippingInfo,
                    paymentInfo: {
                      razorpay_payment_id: response.razorpay_payment_id,
                      razorpay_order_id: response.razorpay_order_id,
                      razorpay_signature: response.razorpay_signature
                    }
                  },
                  { headers: { Authorization: `Bearer ${token}` } }
                );

                if (orderResponse.data.success) {
                  // Clear selected products to prevent duplicate orders
                  setSelectedProducts([]);
                  // Clear sessionStorage
                  sessionStorage.removeItem('shiprocketSelectedProducts');
                  
                  toast.success('Payment successful! Order placed.');
                  navigate('/shiprocket/success', {
                    state: {
                      order: orderResponse.data.order,
                      shiprocket: orderResponse.data.shiprocket
                    },
                    replace: true // Replace history to prevent back button issues
                  });
                }
              }
            } catch (error) {
              console.error('Payment verification error:', error);
              toast.error('Payment verification failed');
            } finally {
              setIsProcessing(false);
            }
          },
          prefill: {
            name: selectedAddress.Name,
            email: '',
            contact: selectedAddress.mobile
          },
          theme: {
            color: '#16a34a'
          },
          modal: {
            ondismiss: function() {
              setIsProcessing(false);
              toast.error('Payment cancelled');
            }
          }
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      }
    } catch (error) {
      console.error('Payment error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        selectedProducts: selectedProducts,
        selectedAddress: selectedAddress,
        totalAmount: calculateTotal()
      });
      toast.error(error.response?.data?.message || error.message || 'Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Shiprocket Checkout</h1>
            <p className="text-gray-600 mt-2">Fast and reliable shipping with Shiprocket</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Product Selection & Address */}
            <div className="lg:col-span-2 space-y-6">
              {/* Product Selection */}
              <div className="bg-white shadow-lg rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Select Products
                </h2>
                
                {loadingProducts ? (
                  <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-20 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {products.map(product => (
                      <div key={product._id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <img
                            src={product.images?.[0] || 'https://via.placeholder.com/60'}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div>
                            <h3 className="font-medium text-gray-900">{product.name}</h3>
                            <p className="text-green-600 font-semibold">
                              ₹{product.price_size?.[0]?.discountedPrice || product.price_size?.[0]?.price}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => addProduct(product)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Products */}
              {selectedProducts.length > 0 && (
                <div className="bg-white shadow-lg rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Selected Items</h2>
                  <div className="space-y-3">
                    {selectedProducts.map(product => (
                      <div key={product.productId} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <img
                            src={product.imageUrl || 'https://via.placeholder.com/60'}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div>
                            <h3 className="font-medium text-gray-900">{product.name}</h3>
                            <p className="text-green-600 font-semibold">₹{product.price}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateQuantity(product.productId, product.quantity - 1)}
                              className="p-1 rounded-full hover:bg-gray-200"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-medium">{product.quantity}</span>
                            <button
                              onClick={() => updateQuantity(product.productId, product.quantity + 1)}
                              className="p-1 rounded-full hover:bg-gray-200"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeProduct(product.productId)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Delivery Address */}
              <div className="bg-white shadow-lg rounded-lg p-6">
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
            </div>

            {/* Right Column - Order Summary & Payment */}
            <div className="lg:col-span-1">
              <div className="bg-white shadow-lg rounded-lg p-6 sticky top-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({selectedProducts.length} items)</span>
                    <span>₹{calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping Charges</span>
                    {loadingShipping ? (
                      <span className="text-gray-400">Calculating...</span>
                    ) : shippingInfo ? (
                      <span className="text-orange-600">₹{Number(shippingInfo.cost).toFixed(2)}</span>
                    ) : (
                      <span className="text-gray-400">₹0.00</span>
                    )}
                  </div>
                  {shippingInfo && (
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Estimated Delivery</span>
                      <span className="font-medium">{shippingInfo.estimatedDays} days</span>
                    </div>
                  )}
                  <div className="border-t pt-3 flex justify-between font-semibold text-lg">
                    <span>Total Amount</span>
                    <span className="text-green-600">
                      ₹{calculateTotal().toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Payment Method</h3>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="form-radio h-5 w-5 text-green-600"
                      />
                      <span className="flex items-center space-x-2">
                        <Truck className="w-5 h-5 text-gray-600" />
                        <span>Cash on Delivery</span>
                      </span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        value="online"
                        checked={paymentMethod === 'online'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="form-radio h-5 w-5 text-green-600"
                      />
                      <span className="flex items-center space-x-2">
                        <CreditCard className="w-5 h-5 text-gray-600" />
                        <span>Pay Online</span>
                      </span>
                    </label>
                  </div>
                </div>

                {/* Shipping Info */}
                <div className="mb-6 space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2 text-sm text-blue-800">
                      <Shield className="w-4 h-4" />
                      <span>Secure shipping with Shiprocket</span>
                    </div>
                  </div>
                  
                  {/* Delivery Estimation - Prominent Display */}
                  {shippingInfo && (
                    <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Truck className="w-5 h-5 text-green-600" />
                          <span className="font-semibold text-green-800">Delivery Estimate</span>
                        </div>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Estimated Time:</span>
                          <span className="font-bold text-green-700">{shippingInfo.estimatedDays} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Courier:</span>
                          <span className="font-medium text-gray-800">{shippingInfo.courierName}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Loading State */}
                  {loadingShipping && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                        <span className="text-sm">Calculating delivery time...</span>
                      </div>
                    </div>
                  )}
                  
                  {/* No Address Selected */}
                  {!selectedAddress && !loadingShipping && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        📍 Select a delivery address to see estimated delivery time
                      </p>
                    </div>
                  )}
                </div>

                {/* Place Order Button */}
                <button
                  onClick={handlePayment}
                  disabled={isProcessing || !selectedAddress || selectedProducts.length === 0}
                  className={`w-full py-3 px-4 rounded-lg flex items-center justify-center space-x-2 ${
                    isProcessing || !selectedAddress || selectedProducts.length === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                  } text-white transition-colors duration-200`}
                >
                  {isProcessing ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <span>Place Order</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
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
    </div>
  );
};

export default ShiprocketCheckout;

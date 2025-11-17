// controller/Shiprocket.js
const ShiprocketOrder = require('../models/ShiprocketOrder');
const Address = require('../models/Address');
const Product = require('../models/Product');
const User = require('../models/Users');
const shiprocketService = require('../services/shiprocket.service');
const razorpay = require('../config/razorpay');
const crypto = require('crypto');
const { asyncHandler } = require('../utils/error');

/**
 * Create Razorpay Payment Order for Shiprocket checkout
 * POST /api/shiprocket/payment/create-order
 */
exports.createPaymentOrder = asyncHandler(async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid amount is required'
    });
  }

  try {
    const options = {
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `shiprocket_${Date.now()}`,
      payment_capture: 1
    };

    const razorpayOrder = await razorpay.orders.create(options);
    console.log()

    res.status(200).json({
      success: true,
      order: razorpayOrder,
      message: 'Payment order created successfully'
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: error.message
    });
  }
});

/**
 * Verify Razorpay Payment Signature
 * POST /api/shiprocket/payment/verify
 */
exports.verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    return res.status(400).json({
      success: false,
      message: 'Missing payment verification parameters'
    });
  }

  try {
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      res.status(200).json({
        success: true,
        message: 'Payment verified successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment verification failed - Invalid signature'
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying payment',
      error: error.message
    });
  }
});

/**
 * Create Shiprocket Order
 * POST /api/shiprocket/create
 */
exports.createOrder = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { addressId, paymentMethod, items, paymentInfo, shippingCost, shippingInfo } = req.body;

  console.log('=== Shiprocket Order Creation Started ===');
  console.log('User ID:', userId);
  console.log('Payment Method:', paymentMethod);
  console.log('Shipping Cost:', shippingCost);

  // Validate required fields
  if (!addressId || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Address and items are required'
    });
  }

  // Validate payment method
  if (!['cod', 'online'].includes(paymentMethod)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid payment method'
    });
  }

  // For online payment, verify payment info is provided
  if (paymentMethod === 'online' && (!paymentInfo || !paymentInfo.razorpay_payment_id)) {
    return res.status(400).json({
      success: false,
      message: 'Payment information is required for online payment'
    });
  }

  try {
    // Fetch user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Fetch and validate address
    const address = await Address.findById(addressId);
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // Validate address belongs to user
    if (address.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to address'
      });
    }

    // Validate address data for Shiprocket requirements
    const validationErrors = [];
    
    if (!address.mobile || address.mobile.length < 10) {
      validationErrors.push('Mobile number must be at least 10 digits');
    }
    
    if (!address.zipCode || address.zipCode.length !== 6) {
      validationErrors.push('PIN code must be exactly 6 digits');
    }
    
    if (!address.Name || address.Name.trim().length === 0) {
      validationErrors.push('Name is required');
    }
    
    if (!address.streetAddress || address.streetAddress.trim().length === 0) {
      validationErrors.push('Street address is required');
    }
    
    if (!address.city || address.city.trim().length === 0) {
      validationErrors.push('City is required');
    }
    
    if (!address.state || address.state.trim().length === 0) {
      validationErrors.push('State is required');
    }
    
    if (validationErrors.length > 0) {
      console.error('❌ Address validation failed:', validationErrors);
      return res.status(400).json({
        success: false,
        message: 'Invalid address data for shipping',
        errors: validationErrors
      });
    }

    // Validate products and calculate subtotal
    let subTotal = 0;
    const validatedItems = [];

    for (const item of items) {
      if (!item.productId || !item.name || !item.quantity || !item.price) {
        return res.status(400).json({
          success: false,
          message: 'Invalid item data'
        });
      }

      // Optionally validate product exists
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.name}`
        });
      }

      validatedItems.push({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        imageUrl: item.imageUrl || product.images?.[0] || ''
      });

      subTotal += item.price * item.quantity;
    }

    // Split name into first and last name for Shiprocket
    const nameParts = address.Name.trim().split(' ');
    const firstName = nameParts[0] || 'Customer';
    const lastName = nameParts.slice(1).join(' ') || 'Name';

    // Dynamically fetch pickup location from Shiprocket
    console.log('Fetching pickup locations from Shiprocket...');
    let pickupLocation = 'Primary'; // Fallback default
    
    try {
      const pickupLocations = await shiprocketService.getPickupLocations();
      console.log('✅ Fetched pickup locations:', JSON.stringify(pickupLocations, null, 2));
 
      
      if (pickupLocations && pickupLocations.length > 0) {
        // Try different possible field names.
        const firstLocation = pickupLocations[0];
        pickupLocation = firstLocation.pickup_location || 
                        firstLocation.nickname || 
                        firstLocation.name ||
                        firstLocation.company_name ||
                        'Primary';
        
        console.log('📍 Using pickup location:', pickupLocation);
      } else {
        console.warn('⚠️  No pickup locations found, using fallback: "Primary"');
      }
    } catch (error) {
      console.error('❌ Failed to fetch pickup locations:', error.message);
      console.warn('⚠️  Using fallback pickup location: "Primary"');
      // Continue with fallback - don't fail the order
    }

    // Calculate total amount including shipping BEFORE creating Shiprocket order
    const shippingCharges = shippingCost || 0;
    const totalAmount = subTotal + shippingCharges;

    // Prepare Shiprocket order data
    const shiprocketOrderData = {
      order_id: `SR_${Date.now()}_${userId}`,
      order_date: new Date().toISOString().split('T')[0],
      pickup_location: pickupLocation, // Dynamically fetched from Shiprocket!
      billing_customer_name: firstName,
      billing_last_name: lastName,
      billing_address: address.streetAddress,
      billing_city: address.city,
      billing_pincode: address.zipCode,
      billing_state: address.state,
      billing_country: 'India',
      billing_email: user.email,
      billing_phone: address.mobile,
      shipping_is_billing: true,
      order_items: validatedItems.map(item => ({
        name: item.name,
        sku: item.productId,
        units: item.quantity,
        selling_price: item.price
      })),
      payment_method: paymentMethod === 'cod' ? 'COD' : 'Prepaid',
      sub_total: subTotal,
      shipping_charges: shippingCharges, // Add shipping charges to Shiprocket
      length: 10, // Default dimensions - adjust as needed
      breadth: 10,
      height: 10,
      weight: 0.5 // Default weight in kg - adjust as needed
    };

    console.log('Creating Shiprocket order...');
    console.log('Order totals - Subtotal:', subTotal, 'Shipping:', shippingCharges, 'Total:', totalAmount);
    console.log('📦 Shiprocket Order Data:', JSON.stringify(shiprocketOrderData, null, 2));
    
    const shiprocketResponse = await shiprocketService.createOrder(shiprocketOrderData);
    console.log('✅ Shiprocket order created:', JSON.stringify(shiprocketResponse, null, 2));

    // Save order to database
    const newOrder = await ShiprocketOrder.create({
      user: userId,
      items: validatedItems,
      shippingAddress: {
        name: address.Name,
        mobile: address.mobile,
        streetAddress: address.streetAddress,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode
      },
      paymentMethod,
      paymentInfo: paymentMethod === 'online' ? paymentInfo : {},
      subTotal,
      shippingCost: shippingCharges,
      totalAmount,
      shippingInfo: shippingInfo || {},
      shiprocket: {
        order_id: shiprocketResponse.order_id,
        shipment_id: shiprocketResponse.shipment_id,
        status: shiprocketResponse.status || 'NEW',
        raw: shiprocketResponse
      },
      status: 'processing'
    });

 

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: newOrder,
      shiprocket: shiprocketResponse
    });
  } catch (error) {
    console.error('❌ Shiprocket order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
});

/**
 * Get all Shiprocket orders for authenticated user
 * GET /api/shiprocket/orders
 */
exports.getOrders = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  try {
    const orders = await ShiprocketOrder.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      orders,
      message: 'Orders retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
});

/**
 * Track shipment
 * GET /api/shiprocket/track/:shipmentId
 */
exports.trackShipment = asyncHandler(async (req, res) => {
  const { shipmentId } = req.params;
  const userId = req.user.id;

  if (!shipmentId) {
    return res.status(400).json({
      success: false,
      message: 'Shipment ID is required'
    });
  }

  try {
    // Verify order belongs to user
    const order = await ShiprocketOrder.findOne({
      user: userId,
      'shiprocket.shipment_id': shipmentId
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    // Fetch tracking details from Shiprocket
    const trackingData = await shiprocketService.trackOrder(shipmentId);

    res.status(200).json({
      success: true,
      tracking: trackingData,
      message: 'Tracking details retrieved successfully'
    });
  } catch (error) {
    console.error('Error tracking shipment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track shipment',
      error: error.message
    });
  }
});

/**
 * Check delivery serviceability and get shipping rates
 * POST /api/shiprocket/check-serviceability
 */
exports.checkServiceability = asyncHandler(async (req, res) => {
  const { pincode, weight, cod, pickupPincode } = req.body;

  if (!pincode) {
    return res.status(400).json({
      success: false,
      message: 'Pincode is required'
    });
  }

  try {
    // Use provided pickup pincode or default to a fallback
    const pickup = pickupPincode || '110001'; // Fallback if not provided
    const packageWeight = weight || 0.5; // Default 0.5 kg
    const isCOD = cod ? 1 : 0;

    const serviceabilityData = await shiprocketService.checkServiceability(
      pincode,
      pickup,
      packageWeight,
      isCOD
    );

    // Extract useful information
    const availableCouriers = serviceabilityData.data?.available_courier_companies || [];
    
    if (availableCouriers.length === 0) {
      return res.status(200).json({
        success: true,
        serviceable: false,
        message: 'Delivery not available to this pincode'
      });
    }

    // Get the best courier (usually first one with lowest rate)
    const bestCourier = availableCouriers[0];
    
    res.status(200).json({
      success: true,
      serviceable: true,
      shippingCost: bestCourier.rate || 0,
      estimatedDays: bestCourier.etd || '5-7',
      courierName: bestCourier.courier_name,
      allCouriers: availableCouriers.map(c => ({
        name: c.courier_name,
        rate: c.rate,
        etd: c.etd,
        cod: c.cod
      }))
    });
  } catch (error) {
    console.error('Error checking serviceability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check serviceability',
      error: error.message
    });
  }
});

/**
 * Cancel shipment
 * POST /api/shiprocket/cancel/:shipmentId
 */
exports.cancelShipment = asyncHandler(async (req, res) => {
  const { shipmentId } = req.params;
  const userId = req.user.id;

  if (!shipmentId) {
    return res.status(400).json({
      success: false,
      message: 'Shipment ID is required'
    });
  }

  try {
    // Verify order belongs to user
    const order = await ShiprocketOrder.findOne({
      user: userId,
      'shiprocket.shipment_id': shipmentId
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    // Check if order can be cancelled
    if (order.status === 'delivered' || order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled. Current status: ${order.status}`
      });
    }

    // Get the Shiprocket order_id (not shipment_id) for cancellation
    const shiprocketOrderId = order.shiprocket.order_id;
    
    if (!shiprocketOrderId) {
      return res.status(400).json({
        success: false,
        message: 'Shiprocket order ID not found'
      });
    }

    console.log(`Cancelling Shiprocket order: ${shiprocketOrderId} (shipment: ${shipmentId})`);

    // Cancel in Shiprocket using order_id
    const cancellationResponse = await shiprocketService.cancelOrder(shiprocketOrderId);

    // Update order status in database using findOneAndUpdate to bypass validation
    await ShiprocketOrder.findOneAndUpdate(
      { _id: order._id },
      { 
        $set: { 
          status: 'cancelled',
          'shiprocket.status': 'CANCELLED'
        }
      },
      { runValidators: false }
    );

    res.status(200).json({
      success: true,
      message: 'Shipment cancelled successfully',
      cancellation: cancellationResponse
    });
  } catch (error) {
    console.error('Error cancelling shipment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel shipment',
      error: error.message
    });
  }
});

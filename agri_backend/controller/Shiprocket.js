// Shiprocket Controller
const Order = require('../models/Order');
const Address = require('../models/Address');
const shiprocketService = require('../utils/shiprocketService');
const { asyncHandler } = require('../utils/error');

// Create shipment for an order
exports.createShipment = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  const sellerId = req.user.id;

  // Find order
  const order = await Order.findById(orderId)
    .populate('items.product')
    .populate('shippingAddress')
    .populate('userId');

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  // Check if seller has items in this order
  const hasSellerItems = order.items.some(item => 
    item.sellerId.toString() === sellerId
  );

  if (!hasSellerItems) {
    return res.status(403).json({ 
      message: 'You are not authorized to create shipment for this order' 
    });
  }

  // Check if shipment already exists
  if (order.shiprocketOrderId) {
    return res.status(400).json({ 
      message: 'Shipment already created for this order',
      shiprocketOrderId: order.shiprocketOrderId
    });
  }

  // Prepare order items for Shiprocket
  const orderItems = order.items.map(item => ({
    name: item.product.name,
    sku: item.product._id.toString(),
    units: item.quantity,
    selling_price: item.selectedDiscountedPrice,
    discount: item.selectedprice - item.selectedDiscountedPrice,
    tax: 0,
    hsn: ''
  }));

  // Calculate total weight (assuming 0.5 kg per item as default)
  const totalWeight = order.items.reduce((sum, item) => sum + (item.quantity * 0.5), 0);

  // Prepare Shiprocket order data
  const shiprocketOrderData = {
    order_id: order._id.toString(),
    order_date: order.createdAt.toISOString().split('T')[0],
    pickup_location: 'Primary',
    billing_customer_name: order.shippingAddress.Name,
    billing_last_name: '',
    billing_address: order.shippingAddress.streetAddress,
    billing_address_2: order.shippingAddress.city,
    billing_city: order.shippingAddress.city,
    billing_pincode: order.shippingAddress.zipcode,
    billing_state: order.shippingAddress.state,
    billing_country: 'India',
    billing_email: order.userId.email || 'customer@example.com',
    billing_phone: order.shippingAddress.mobile,
    shipping_is_billing: true,
    order_items: orderItems,
    payment_method: order.paymentMethod === 'cod' ? 'COD' : 'Prepaid',
    sub_total: order.totalAmount,
    length: 10,
    breadth: 10,
    height: 10,
    weight: totalWeight
  };

  // Create order in Shiprocket
  const shiprocketResponse = await shiprocketService.createOrder(shiprocketOrderData);

  // Update order with Shiprocket details
  order.shiprocketOrderId = shiprocketResponse.order_id;
  order.shiprocketShipmentId = shiprocketResponse.shipment_id;
  await order.save();

  res.status(200).json({
    success: true,
    message: 'Shipment created successfully',
    data: {
      orderId: order._id,
      shiprocketOrderId: shiprocketResponse.order_id,
      shiprocketShipmentId: shiprocketResponse.shipment_id,
      status: shiprocketResponse.status
    }
  });
});

// Check courier serviceability
exports.checkServiceability = asyncHandler(async (req, res) => {
  const { deliveryPincode, weight, cod } = req.body;

  // Default pickup pincode (can be configured)
  const pickupPincode = '400001';

  const serviceability = await shiprocketService.checkServiceability(
    pickupPincode,
    deliveryPincode,
    weight || 1,
    cod ? 1 : 0
  );

  res.status(200).json({
    success: true,
    message: 'Serviceability checked successfully',
    data: serviceability.data
  });
});

// Generate AWB for shipment
exports.generateAWB = asyncHandler(async (req, res) => {
  const { orderId, courierId } = req.body;
  const sellerId = req.user.id;

  const order = await Order.findById(orderId);

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  // Check authorization
  const hasSellerItems = order.items.some(item => 
    item.sellerId.toString() === sellerId
  );

  if (!hasSellerItems) {
    return res.status(403).json({ 
      message: 'You are not authorized to generate AWB for this order' 
    });
  }

  if (!order.shiprocketShipmentId) {
    return res.status(400).json({ 
      message: 'Please create shipment first' 
    });
  }

  if (order.awbCode) {
    return res.status(400).json({ 
      message: 'AWB already generated',
      awbCode: order.awbCode
    });
  }

  // Generate AWB
  const awbResponse = await shiprocketService.generateAWB(
    order.shiprocketShipmentId,
    courierId
  );

  // Update order with AWB details
  order.awbCode = awbResponse.awb_code || awbResponse.response?.data?.awb_code;
  order.courierCompanyId = courierId;
  order.courierName = awbResponse.courier_name;
  await order.save();

  res.status(200).json({
    success: true,
    message: 'AWB generated successfully',
    data: {
      orderId: order._id,
      awbCode: order.awbCode,
      courierName: order.courierName
    }
  });
});

// Track shipment
exports.trackShipment = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user.id;

  const order = await Order.findById(orderId);

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  // Check if user is buyer or seller
  const isBuyer = order.userId.toString() === userId;
  const isSeller = order.items.some(item => 
    item.sellerId.toString() === userId
  );

  if (!isBuyer && !isSeller) {
    return res.status(403).json({ 
      message: 'You are not authorized to track this order' 
    });
  }

  if (!order.awbCode) {
    return res.status(400).json({ 
      message: 'AWB not generated yet. Shipment tracking not available.' 
    });
  }

  // Track shipment
  const trackingData = await shiprocketService.trackShipment(order.awbCode);

  res.status(200).json({
    success: true,
    message: 'Shipment tracked successfully',
    data: trackingData.tracking_data
  });
});

// Cancel shipment
exports.cancelShipment = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  const sellerId = req.user.id;

  const order = await Order.findById(orderId);

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  // Check authorization
  const hasSellerItems = order.items.some(item => 
    item.sellerId.toString() === sellerId
  );

  if (!hasSellerItems) {
    return res.status(403).json({ 
      message: 'You are not authorized to cancel shipment for this order' 
    });
  }

  if (!order.awbCode) {
    return res.status(400).json({ 
      message: 'No shipment to cancel' 
    });
  }

  // Cancel shipment
  const cancelResponse = await shiprocketService.cancelShipment([order.awbCode]);

  // Update order status
  order.orderStatus = 'Cancelled';
  await order.save();

  res.status(200).json({
    success: true,
    message: 'Shipment cancelled successfully',
    data: cancelResponse
  });
});

// Generate shipping label
exports.generateLabel = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  const sellerId = req.user.id;

  const order = await Order.findById(orderId);

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  // Check authorization
  const hasSellerItems = order.items.some(item => 
    item.sellerId.toString() === sellerId
  );

  if (!hasSellerItems) {
    return res.status(403).json({ 
      message: 'You are not authorized to generate label for this order' 
    });
  }

  if (!order.shiprocketShipmentId) {
    return res.status(400).json({ 
      message: 'Please create shipment first' 
    });
  }

  // Generate label
  const labelResponse = await shiprocketService.generateLabel([order.shiprocketShipmentId]);

  res.status(200).json({
    success: true,
    message: 'Shipping label generated successfully',
    data: {
      labelUrl: labelResponse.label_url,
      orderId: order._id
    }
  });
});

// Get all shipments for seller
exports.getSellerShipments = asyncHandler(async (req, res) => {
  const sellerId = req.user.id;

  const orders = await Order.find({ 
    'items.sellerId': sellerId,
    shiprocketOrderId: { $exists: true }
  })
  .populate('items.product')
  .populate('shippingAddress')
  .sort({ createdAt: -1 });

  const shipments = orders.map(order => ({
    orderId: order._id,
    shiprocketOrderId: order.shiprocketOrderId,
    shiprocketShipmentId: order.shiprocketShipmentId,
    awbCode: order.awbCode,
    courierName: order.courierName,
    orderStatus: order.orderStatus,
    totalAmount: order.totalAmount,
    createdAt: order.createdAt,
    shippingAddress: order.shippingAddress
  }));

  res.status(200).json({
    success: true,
    message: 'Shipments retrieved successfully',
    count: shipments.length,
    data: shipments
  });
});

// Get shipment details for buyer
exports.getBuyerShipment = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user.id;

  const order = await Order.findById(orderId)
    .populate('items.product')
    .populate('shippingAddress');

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  if (order.userId.toString() !== userId) {
    return res.status(403).json({ 
      message: 'You are not authorized to view this shipment' 
    });
  }

  const shipmentDetails = {
    orderId: order._id,
    shiprocketOrderId: order.shiprocketOrderId,
    awbCode: order.awbCode,
    courierName: order.courierName,
    orderStatus: order.orderStatus,
    totalAmount: order.totalAmount,
    items: order.items,
    shippingAddress: order.shippingAddress,
    createdAt: order.createdAt
  };

  res.status(200).json({
    success: true,
    message: 'Shipment details retrieved successfully',
    data: shipmentDetails
  });
});

module.exports = exports;

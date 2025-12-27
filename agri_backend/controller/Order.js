// backend/controller/Order.js
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/CartItem');
const { asyncHandler } = require('../utils/error');
const { createNotification } = require('./Notification'); // IMPORT THIS
const { invalidateAnalyticsCache } = require('./Analytics'); // Import cache invalidation

function getPriceArray(product, sellerId) {
  if (sellerId) {
    const block = product.sellers.find(
      s => s.sellerId.toString() === sellerId.toString()
    );
    return block ? block.price_size : null;
  }
  return product.price_size;
}

exports.createOrder = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const {
      productId,
      size,
      quantity,
      addressId,
      paymentMethod,
      paymentLinkId,
      paymentLink,
      sellerId
    } = req.body;

    console.log('=== Order Creation Started ===');
    console.log('User ID:', userId);
    console.log('Request body:', req.body);

    const orderItems = [];
    let totalAmount = 0;
    let cart = null;

    if (productId) {
      console.log('Processing single product checkout');
      
      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ message: 'Product not found' });

      const priceArr = getPriceArray(product, sellerId);
      if (!priceArr) return res.status(404).json({ message: 'Seller not linked to product' });

      const sizeDetail = priceArr.find(p => p.size === size);
      if (!sizeDetail) return res.status(400).json({ message: 'Size not available' });
      if (sizeDetail.quantity < quantity)
        return res.status(400).json({ message: 'Insufficient stock' });

      orderItems.push({
        product: productId,
        sellerId: sellerId || product.sellerId,
        size,
        selectedprice: sizeDetail.price,
        selectedDiscountedPrice: sizeDetail.discountedPrice,
        quantity
      });
      totalAmount = sizeDetail.discountedPrice * quantity;
    } else {
      console.log('Processing cart checkout');
      
      cart = await Cart.findOne({ userId }).populate('items.product');
      
      console.log('Cart found:', cart ? 'Yes' : 'No');
      console.log('Cart items count:', cart?.items?.length || 0);
      
      if (!cart || !cart.items || cart.items.length === 0) {
        return res.status(400).json({ 
          message: 'Cart is empty. Please add items to your cart before placing an order.' 
        });
      }

      for (const item of cart.items) {
        const product = item.product;
        
        console.log(`Processing item: ${product?.name || 'Unknown'}, Size: ${item.selectedsize}`);
        
        if (!product) {
          return res.status(404).json({ 
            message: 'One or more products in your cart no longer exist.' 
          });
        }

        const priceArr = getPriceArray(product, item.sellerId);
        if (!priceArr) {
          return res.status(404).json({ 
            message: `Seller not linked to ${product.name}` 
          });
        }

        const sizeDetail = priceArr.find(p => p.size === item.selectedsize);
        if (!sizeDetail) {
          return res.status(400).json({ 
            message: `Size ${item.selectedsize} not available for ${product.name}` 
          });
        }
        
        if (sizeDetail.quantity < item.quantity) {
          return res.status(400).json({ 
            message: `Insufficient stock for ${product.name}. Available: ${sizeDetail.quantity}, Requested: ${item.quantity}` 
          });
        }

        orderItems.push({
          product: product._id,
          sellerId: item.sellerId || product.sellerId,
          size: item.selectedsize,
          selectedprice: sizeDetail.price,
          selectedDiscountedPrice: sizeDetail.discountedPrice,
          quantity: item.quantity
        });
        
        totalAmount += sizeDetail.discountedPrice * item.quantity;
      }

      console.log('Order items prepared:', orderItems.length);
      console.log('Total amount:', totalAmount);
    }

    const newOrder = await Order.create({
      userId,
      items: orderItems,
      totalAmount,
      paymentMethod,
      shippingAddress: addressId,
      paymentStatus: paymentMethod === 'cod' ? 'Pending' : 'Pending',
      orderStatus: paymentMethod === 'cod' ? 'Processing' : 'Pending',
      paymentId: paymentLinkId || null,
      paymentLink: paymentLink || null
    });

    console.log('Order created successfully:', newOrder._id);

    // Handle COD orders
    if (paymentMethod === 'cod') {
      // Clear cart if order was from cart
      if (cart) {
        cart.items = [];
        cart.totalPrice = 0;
        cart.totalDiscountedPrice = 0;
        await cart.save();
        console.log('Cart cleared for COD order');
      }

      // CREATE NOTIFICATION FOR USER (COD ORDER)
      console.log('📧 Creating order placed notification for user:', userId);
      await createNotification(
        userId,
        'order_placed',
        'Order Placed Successfully! 🎉',
        `Your order of ₹${totalAmount} has been placed successfully. Order ID: ${newOrder._id}`,
        newOrder._id,
        {
          amount: totalAmount,
          itemCount: orderItems.length,
          paymentMethod: 'COD'
        }
      );
      console.log('✅ User notification sent');

      // CREATE NOTIFICATIONS FOR ALL SELLERS (COD ORDER)
      const uniqueSellerIds = [...new Set(orderItems.map(item => item.sellerId?.toString()).filter(Boolean))];
      console.log('📧 Creating notifications for sellers:', uniqueSellerIds);
      
      for (const sellerId of uniqueSellerIds) {
        const sellerItems = orderItems.filter(item => item.sellerId?.toString() === sellerId);
        const sellerTotal = sellerItems.reduce((sum, item) => sum + (item.selectedDiscountedPrice * item.quantity), 0);
        
        console.log(`📧 Sending notification to seller ${sellerId} for ₹${sellerTotal}`);
        
        await createNotification(
          sellerId,
          'order_placed',
          'New Order Received! 🛒',
          `You have received a new order worth ₹${sellerTotal}. Order ID: ${newOrder._id}`,
          newOrder._id,
          {
            amount: sellerTotal,
            itemCount: sellerItems.length,
            paymentMethod: 'COD'
          }
        );
        
        console.log(`✅ Notification sent to seller ${sellerId}`);
      }
    } else if (paymentMethod === 'online') {
      console.log('Cart NOT cleared - waiting for payment confirmation');
    }

    console.log('=== Order Creation Completed ===');

 
    try {
        // Invalidate cache for all sellers involved in this order
        const sellerIds = orderItems.map(item => item.sellerId.toString());
        sellerIds.forEach(sellerId => {
            invalidateAnalyticsCache(sellerId);
        });
        // Also invalidate admin analytics cache
        invalidateAnalyticsCache();
        console.log('📊 Analytics cache invalidated for real-time updates');
    } catch (cacheError) {
        console.warn('⚠️ Failed to invalidate analytics cache:', cacheError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: newOrder
    });
});

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate('items.product');
    if (!order) return res.status(404).json({ message:'Order not found' });

    res.status(200).json({ message:'Order retrieved', order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message:'Internal server error', error: err.message });
  }
};

exports.getOrderHistory = asyncHandler(async (req, res) => {
    const orders = await Order.find({ userId: req.user.id })
                              .populate('items.product')
                              .populate({
                                path: 'shippingAddress',
                                select: 'Name streetAddress city state zipcode mobile',
                              })
                              .sort({ createdAt: -1 });
    res.status(200).json({ message:'Orders retrieved', orders });
});

exports.getSellerOrderHistory = asyncHandler(async (req, res) => {
    const sellerId = req.user.id;
    
    console.log('📦 Fetching seller orders for:', sellerId);
    
    // Convert to ObjectId for proper matching
    const sellerObjectId = new mongoose.Types.ObjectId(sellerId);
    
    // Find orders that have items from this seller
    const orders = await Order.find({ 
        'items.sellerId': sellerObjectId 
    })
    .populate({
        path: 'items.product',
        select: 'name images imageUrl price discountedPrice'
    })
    .populate({
        path: 'userId',
        select: 'Name email image',
        populate: {
            path: 'additionalDetails',
            select: 'firstName lastName contactNo'
        }
    })
    .populate('shippingAddress')
    .sort({ createdAt: -1 });
    
    console.log(`✅ Found ${orders.length} orders for seller`);
    
    if (orders.length > 0) {
        console.log('🔍 Sample order data:');
        console.log('   - User:', orders[0].userId);
        console.log('   - Shipping Address:', orders[0].shippingAddress);
        console.log('   - First Product:', orders[0].items[0]?.product);
    }
    
    // Filter items to only show this seller's items and format response
    const filteredOrders = orders.map(order => {
        const orderObj = order.toObject();
        orderObj.items = orderObj.items.filter(item => 
            item.sellerId.toString() === sellerId
        );
        // Map userId to user for frontend compatibility
        orderObj.user = orderObj.userId;
        return orderObj;
    });
    
    res.status(200).json({ 
        success: true,
        message: 'Seller orders retrieved', 
        orders: filteredOrders,
        count: filteredOrders.length
    });
});


// ============ CHANGED FOR APP - Update Order Status ============
exports.updateOrderStatus = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { orderStatus } = req.body;
    const sellerId = req.user.id;

    const order = await Order.findById(orderId).populate('userId', 'firstName lastName email');
    if (!order) {
        return res.status(404).json({ message: 'Order not found' });
    }

    // Prevent updating Shiprocket orders - they are managed by Shiprocket API
    if (order.shiprocketOrderId || order.shiprocketShipmentId) {
        return res.status(403).json({ 
            message: 'Cannot update Shiprocket orders. These are managed by Shiprocket API.' 
        });
    }

    // Check if seller has items in this order
    const hasSellerItems = order.items.some(item => 
        item.sellerId.toString() === sellerId
    );

    if (!hasSellerItems) {
        return res.status(403).json({ 
            message: 'You are not authorized to update this order' 
        });
    }

    // Validate status transition
    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(orderStatus)) {
        return res.status(400).json({ message: 'Invalid order status' });
    }

    // Store old status for notification
    const oldStatus = order.orderStatus;

    order.orderStatus = orderStatus;
    await order.save();

    // Create notification for buyer
    await createNotification(
        order.userId,
        'order_status_updated',
        `Order Status Updated`,
        `Your order #${order._id.toString().slice(-8)} is now ${orderStatus}`,
        order._id,
        { orderStatus }
    );

    // Invalidate analytics cache
    try {
        invalidateAnalyticsCache(sellerId);
    } catch (cacheError) {
        console.warn('Failed to invalidate cache:', cacheError.message);
    }

    // Emit Socket.IO event for real-time update
    const io = req.app.get('io');
    if (io) {
        // Emit to buyer's room
        io.to(`user-${order.userId._id.toString()}`).emit('order-status-updated', {
            orderId: order._id,
            orderStatus: orderStatus,
            oldStatus: oldStatus,
            message: `Your order #${order._id.toString().slice(-8)} is now ${orderStatus}`,
            timestamp: new Date()
        });

        // Emit to seller's room (for multi-device sync)
        io.to(`seller-${sellerId}`).emit('order-updated', {
            orderId: order._id,
            orderStatus: orderStatus,
            timestamp: new Date()
        });

        console.log(`📡 Socket.IO: Order ${orderId} status updated to ${orderStatus}`);
    }

    res.status(200).json({
        success: true,
        message: 'Order status updated successfully',
        order
    });
});


// Cancel Order
exports.cancelOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const userId = req.user.id;

    console.log('=== Cancel Order Request ===');
    console.log('Order ID:', orderId);
    console.log('User ID:', userId);

    // Find the order
    const order = await Order.findById(orderId);

    if (!order) {
        return res.status(404).json({
            success: false,
            message: 'Order not found'
        });
    }

    // Check if the order belongs to the user
    if (order.userId.toString() !== userId.toString()) {
        return res.status(403).json({
            success: false,
            message: 'You are not authorized to cancel this order'
        });
    }

    // Check if order can be cancelled
    if (order.orderStatus === 'Cancelled') {
        return res.status(400).json({
            success: false,
            message: 'Order is already cancelled'
        });
    }

    if (order.orderStatus === 'Delivered') {
        return res.status(400).json({
            success: false,
            message: 'Cannot cancel a delivered order'
        });
    }

    if (order.orderStatus === 'Shipped') {
        return res.status(400).json({
            success: false,
            message: 'Cannot cancel a shipped order. Please contact support.'
        });
    }

    // Update order status to Cancelled
    order.orderStatus = 'Cancelled';
    // Keep payment status as is for COD, or set to Failed for online payments
    if (order.paymentMethod === 'online' && order.paymentStatus === 'Pending') {
        order.paymentStatus = 'Failed';
    }
    await order.save();

    // Restore product quantities
    for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
            const priceArr = getPriceArray(product, item.sellerId);
            if (priceArr) {
                const sizeDetail = priceArr.find(p => p.size === item.size);
                if (sizeDetail) {
                    sizeDetail.quantity += item.quantity;
                    await product.save();
                    console.log(`Restored ${item.quantity} units of ${product.name} (${item.size})`);
                }
            }
        }
    }

    // Invalidate analytics cache
    invalidateAnalyticsCache();

    // Create notification for USER
    await createNotification(
        order.userId,
        'order_cancelled',
        'Order Cancelled',
        `Your order #${order._id.toString().slice(-8)} has been cancelled successfully.`,
        order._id
    );

    // Create notifications for ALL SELLERS
    if (order.items && order.items.length > 0) {
        const uniqueSellerIds = [...new Set(order.items.map(item => item.sellerId?.toString()).filter(Boolean))];
        for (const sellerId of uniqueSellerIds) {
            const sellerItems = order.items.filter(item => item.sellerId?.toString() === sellerId);
            const sellerTotal = sellerItems.reduce((sum, item) => sum + (item.selectedDiscountedPrice * item.quantity), 0);
            
            await createNotification(
                sellerId,
                'order_cancelled',
                'Order Cancelled by Customer',
                `Order #${order._id.toString().slice(-8)} worth ₹${sellerTotal} has been cancelled by the customer.`,
                order._id,
                {
                    amount: sellerTotal,
                    itemCount: sellerItems.length
                }
            );
        }
    }

    console.log('Order cancelled successfully');

    res.status(200).json({
        success: true,
        message: 'Order cancelled successfully',
        order
    });
});


// Update Order Status (for sellers)
exports.updateOrderStatus = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { orderStatus } = req.body;
    const sellerId = req.user.id;

    console.log('=== Update Order Status Request ===');
    console.log('Order ID:', orderId);
    console.log('New Status:', orderStatus);
    console.log('Seller ID:', sellerId);

    // Validate status
    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(orderStatus)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid order status'
        });
    }

    // Find the order
    const order = await Order.findById(orderId);

    if (!order) {
        return res.status(404).json({
            success: false,
            message: 'Order not found'
        });
    }

    // Check if the seller is associated with this order
    const sellerItem = order.items.find(item => 
        item.sellerId && item.sellerId.toString() === sellerId.toString()
    );

    if (!sellerItem) {
        return res.status(403).json({
            success: false,
            message: 'You are not authorized to update this order'
        });
    }

    // Store old status for notification
    const oldStatus = order.orderStatus;

    // Update order status
    order.orderStatus = orderStatus;
    await order.save();

    // Invalidate analytics cache
    invalidateAnalyticsCache();

    // Create notification for customer based on status change
    let notificationTitle = '';
    let notificationMessage = '';
    let notificationType = 'order';

    switch (orderStatus) {
        case 'Processing':
            notificationTitle = 'Order is Being Processed';
            notificationMessage = `Your order #${order._id.toString().slice(-8)} is now being processed and will be shipped soon.`;
            notificationType = 'order_confirmed';
            break;
        case 'Shipped':
            notificationTitle = 'Order Shipped';
            notificationMessage = `Great news! Your order #${order._id.toString().slice(-8)} has been shipped and is on its way.`;
            notificationType = 'order_shipped';
            break;
        case 'Delivered':
            notificationTitle = 'Order Delivered';
            notificationMessage = `Your order #${order._id.toString().slice(-8)} has been delivered. Thank you for shopping with us!`;
            notificationType = 'order_delivered';
            break;
        case 'Cancelled':
            notificationTitle = 'Order Cancelled';
            notificationMessage = `Your order #${order._id.toString().slice(-8)} has been cancelled by the seller.`;
            notificationType = 'order_cancelled';
            
            // Restore product quantities if cancelled by seller
            for (const item of order.items) {
                const product = await Product.findById(item.product);
                if (product) {
                    const priceArr = getPriceArray(product, item.sellerId);
                    if (priceArr) {
                        const sizeDetail = priceArr.find(p => p.size === item.size);
                        if (sizeDetail) {
                            sizeDetail.quantity += item.quantity;
                            await product.save();
                        }
                    }
                }
            }
            break;
        default:
            notificationTitle = 'Order Status Updated';
            notificationMessage = `Your order #${order._id.toString().slice(-8)} status has been updated to ${orderStatus}.`;
    }

    // Send notification to customer
    if (oldStatus !== orderStatus) {
        await createNotification(
            order.userId,
            notificationType,
            notificationTitle,
            notificationMessage,
            order._id
        );
    }

    console.log('Order status updated successfully');

    res.status(200).json({
        success: true,
        message: 'Order status updated successfully',
        order
    });
});

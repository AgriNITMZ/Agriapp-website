// controller/Order.js
const Order   = require('../models/Order');
const Product = require('../models/Product');
const Cart    = require('../models/CartItem');
const {asyncHandler}=require('../utils/error')

/* -------------------------------------------------- *
 *  Helper: return price_size array for a seller
 * -------------------------------------------------- */
function getPriceArray(product, sellerId) {
  if (sellerId) {
    const block = product.sellers.find(
      s => s.sellerId.toString() === sellerId.toString()
    );
    return block ? block.price_size : null;
  }
  return product.price_size;           // default seller
}

/* -------------------------------------------------- *
 *  POST /createorder
 * -------------------------------------------------- */
exports.createOrder = asyncHandler(async (req, res) => {

    const userId = req.user.id;
    const {
      productId,
      size,
      quantity,
      addressId,
      paymentMethod,      // 'online' | 'cod'
      paymentLinkId,      // online only
      paymentLink,        // online only
      sellerId
    } = req.body;

    console.log('=== Order Creation Started ===');
    console.log('User ID:', userId);
    console.log('Request body:', req.body);

    const orderItems = [];
    let   totalAmount = 0;
    let   cart = null; // Store cart reference

    /* ---------- 1. single-product checkout ---------- */
    if (productId) {
      console.log('Processing single product checkout');
      
      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ message: 'Product not found' });

      const priceArr = getPriceArray(product, sellerId);
      if (!priceArr) return res.status(404).json({ message: 'Seller not linked to product' });

      const sizeDetail = priceArr.find(p => p.size === size);
      if (!sizeDetail)  return res.status(400).json({ message: 'Size not available' });
      if (sizeDetail.quantity < quantity)
        return res.status(400).json({ message: 'Insufficient stock' });

      orderItems.push({
        product   : productId,
        sellerId  : sellerId || product.sellerId,
        size,
        selectedprice           : sizeDetail.price,
        selectedDiscountedPrice : sizeDetail.discountedPrice,
        quantity
      });
      totalAmount = sizeDetail.discountedPrice * quantity;
    }

    /* ---------- 2. cart checkout ---------- */
    else {
      console.log('Processing cart checkout');
      
      // Fetch cart from database with populated product details
      cart = await Cart.findOne({ userId }).populate('items.product');
      
      console.log('Cart found:', cart ? 'Yes' : 'No');
      console.log('Cart items count:', cart?.items?.length || 0);
      
      if (!cart || !cart.items || cart.items.length === 0) {
        return res.status(400).json({ 
          message: 'Cart is empty. Please add items to your cart before placing an order.' 
        });
      }

      // Process each cart item
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
          product   : product._id,
          sellerId  : item.sellerId || product.sellerId,
          size      : item.selectedsize,
          selectedprice           : sizeDetail.price,
          selectedDiscountedPrice : sizeDetail.discountedPrice,
          quantity  : item.quantity
        });
        
        totalAmount += sizeDetail.discountedPrice * item.quantity;
      }

      console.log('Order items prepared:', orderItems.length);
      console.log('Total amount:', totalAmount);
    }

    /* ---------- 3. create Order document ---------- */
    const newOrder = await Order.create({
      userId,
      items        : orderItems,
      totalAmount,
      paymentMethod,
      shippingAddress: addressId,
      paymentStatus : paymentMethod === 'cod' ? 'Pending' : 'Pending',
      orderStatus   : paymentMethod === 'cod' ? 'Processing' : 'Pending',
      paymentId     : paymentLinkId || null,
      paymentLink   : paymentLink   || null
    });

    console.log('Order created successfully:', newOrder._id);

    /* Clear cart only for COD. For online payment, clear after verification */
    if (paymentMethod === 'cod' && cart) {
      cart.items = [];
      cart.totalPrice = 0;
      cart.totalDiscountedPrice = 0;
      await cart.save();
      console.log('Cart cleared for COD order');
    } else if (paymentMethod === 'online') {
      console.log('Cart NOT cleared - waiting for payment confirmation');
    }

    console.log('=== Order Creation Completed ===');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order  : newOrder
    });
 
});

/* -------------------------------------------------- *
 *  GET /order/:orderId
 * -------------------------------------------------- */
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

/* -------------------------------------------------- *
 *  GET /order/history (buyer)
 * -------------------------------------------------- */
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

/* -------------------------------------------------- *
 *  GET /seller/orders (seller)
 * -------------------------------------------------- */
exports.getSellerOrderHistory = asyncHandler(async (req, res) => {

    const orders = await Order.find({ 'items.sellerId': req.user.id })
                              .populate('items.product')
                              .sort({ createdAt: -1 });
    res.status(200).json({ message:'Seller orders retrieved', orders });
  
});
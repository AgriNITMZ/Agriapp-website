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

    const cart = await Cart.findOne({ userId }).populate('items.product');
    const orderItems = [];
    let   totalAmount = 0;

    /* ---------- 1. single-product checkout ---------- */
    if (productId) {
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
    else if (cart && cart.items.length) {
      for (const item of cart.items) {
        const product = item.product;
        const priceArr = getPriceArray(product, item.sellerId);
        if (!priceArr)
          return res.status(404).json({ message: `Seller not linked to ${product.name}` });

        const sizeDetail = priceArr.find(p => p.size === item.selectedsize);
        if (!sizeDetail)
          return res.status(400).json({ message: `Size ${item.selectedsize} not available` });
        if (sizeDetail.quantity < item.quantity)
          return res.status(400).json({ message: `Insufficient stock for ${product.name}` });

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

      /* empty the cart */
      cart.items = [];
      await cart.save();
    } else {
      return res.status(400).json({ message: 'No product or cart supplied' });
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
                              .populate({path: 'shippingAddress',
    select: 'Name streetAddress   city state  zipcode mobile',
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
9
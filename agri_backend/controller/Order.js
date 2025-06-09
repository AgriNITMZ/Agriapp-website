const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/CartItem');

exports.createOrder = async (req, res) => {
    try {
      const userId = req.user.id;
      console.log(`User ID: ${userId}`);
      const {
        productId,
        size,
        quantity,
        addressId,
        paymentMethod,
        paymentLinkId,
        paymentLink,
        sellerId // <-- Added sellerId from request
      } = req.body;
      console.log("sellerId", sellerId)
     
      let cartId = await Cart.findOne({ userId });
  
      let orderItems = [];
      let totalAmount = 0;

      
  
      if (productId) {
        // Single Product Order
        const product = await Product.findById(productId);
        if (!product) {
          return res.status(404).json({ message: "Product not found." });
        }
  
        // Find the selected size and its price
        const sizeDetail = product.price_size.find((item) => item.size === size);
        if (!sizeDetail) {
          return res.status(400).json({ message: "Selected size not available." });
        }
  
        if (sizeDetail.quantity < quantity) {
          return res.status(400).json({ message: "Insufficient stock for the selected size." });
        }
  
        // Prepare order item
        orderItems.push({
          product: productId,
          size: size,
          selectedprice: sizeDetail.price,
          selectedDiscountedPrice: sizeDetail.discountedPrice,
          quantity: quantity,
          sellerId: sellerId // <-- Save sellerId here
        });
  
        totalAmount = sizeDetail.discountedPrice * quantity;
      } else if (cartId) {
        // Cart-based Order
        const cart = await Cart.findById(cartId).populate('items.product');
        if (!cart || cart.items.length === 0) {
          return res.status(404).json({ message: "Cart is empty or not found." });
        }
  
        for (const item of cart.items) {
          const product = item.product;
  
          const sizeDetail = product.price_size.find((p) => p.size === item.selectedsize);
          if (!sizeDetail) {
            return res.status(400).json({ message: `Size ${item.selectedsize} not available for product ${product.name}.` });
          }
  
          if (sizeDetail.quantity < item.quantity) {
            return res.status(400).json({ message: `Insufficient stock for product ${product.name} in size ${item.selectedsize}.` });
          }
  
          orderItems.push({
            product: product._id,
            size: item.selectedsize,
            selectedprice: sizeDetail.price,
            selectedDiscountedPrice: sizeDetail.discountedPrice,
            quantity: item.quantity,
            sellerId: item.sellerId // <-- Ensure sellerId is included in cart item
          });
  
          totalAmount += sizeDetail.discountedPrice * item.quantity;
        }
  
        // Clear the cart after creating the order
        cart.items = [];
        await cart.save();
      } else {
        return res.status(400).json({ message: "Provide either productId for a single product or cartId for cart items." });
      }
  
      // Create the order with payment details
      const newOrder = new Order({
        userId: userId,
        items: orderItems,
        totalAmount: totalAmount,
        paymentMethod: paymentMethod,
        shippingAddress: addressId,
        paymentStatus: 'Pending',
        orderStatus: 'Pending',
        paymentId: paymentLinkId,
        paymentLink: paymentLink
      });
  
      await newOrder.save();
  
      res.status(201).json({
        success: true,
        message: "Order created successfully.",
        order: newOrder
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ 
        success: false,
        message: "Internal server error.", 
        error 
      });
    }
  };

// find order by id

exports.getOrderById = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        console.log(`Order ${orderId}`)
        const order = await Order.findById(orderId).populate('items.product');

        if (!order) {
            return res.status(404).json({ message: "Order not found." });
        }

        res.status(201).json({
            message: "Order retrieved successfully.",
            order: order
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error.", error });
    }
};

// order History

exports.getOrderHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await Order.find({ userId }).populate('items.product');

        if (!orders) {
            return res.status(404).json({ message: "No orders found." });
        }

        res.status(201).json({
            message: "Order history retrieved successfully.",
            orders: orders
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error.", error });
    }
};

// seller order history
exports.getSellerOrderHistory = async (req, res) => {
    try {
        const sellerId = req.user.id;
        const orders = await Order.find({ 'items.product.sellerId': sellerId }).populate('items.product');

        if (!orders) {
            return res.status(404).json({ message: "No orders found." });
        }

        res.status(201).json({
            message: "Order history retrieved successfully.",
            orders: orders
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error.", error });
    }
};


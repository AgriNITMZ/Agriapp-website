// controller/Payment.js

const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const mongoose = require("mongoose");
const { Types } = mongoose;

const Order = require("../models/Order");
const User = require("../models/Users");
const Product = require("../models/Product");
const Address = require("../models/Address");
const Cart = require("../models/CartItem");
const { createNotification } = require("./Notification");

/* =======================================================
   1️⃣  WEBSITE: Create Razorpay Payment Link (for checkout)
   ======================================================= */
exports.createPaymentLinkBeforeOrder = async (req, res) => {
  try {
    const { ObjectId } = Types;
    const userId = req.user.id;
    const { totalAmount, addressId } = req.body;

    const user = await User.findById(userId);
    const idOfAddress = new ObjectId(addressId);
    const address = await Address.findById(idOfAddress);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Construct payment link payload
    const paymentLinkRequest = {
      amount: totalAmount * 100, // Convert to paise
      currency: "INR",
      customer: {
        name: user.Name,
        email: user.email,
        contact: address?.mobile,
      },
      notify: { sms: true, email: true },
      reminder_enable: true,
      callback_url: `${process.env.CORS_ORIGIN}/payment/callback`,
      callback_method: "get",
      notes: { userId: userId },
    };

    const paymentLink = await razorpay.paymentLink.create(paymentLinkRequest);

    res.status(200).json({
      success: true,
      data: {
        paymentLinkId: paymentLink.id,
        payment_link_url: paymentLink.short_url,
      },
      message: "Payment link created successfully",
    });
  } catch (error) {
    console.error("Error in creating payment link:", error);
    res.status(500).json({
      success: false,
      message: "Error in creating payment link",
      error: error.message,
    });
  }
};

/* =======================================================
   2️⃣  APP: Create Razorpay Order (for mobile checkout)
   ======================================================= */
exports.createPaymentOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Valid amount is required" });
    }

    const options = {
      amount: amount * 100, // Convert to paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order: razorpayOrder,
      message: "Payment order created successfully",
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create payment order",
      error: error.message,
    });
  }
};

/* =======================================================
   3️⃣  WEBHOOK (Razorpay → backend)
   ======================================================= */
exports.handleWebhook = async (req, res) => {
  try {
    const digest = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(req.rawBody)
      .digest("hex");

    if (digest !== req.headers["x-razorpay-signature"]) {
      return res.status(400).send("Invalid webhook signature");
    }

    const { payload } = req.body;
    
    // Validate payload structure
    if (!payload || !payload.payment_link) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid webhook payload" 
      });
    }

    const { payment_link } = payload;

    const order = await Order.findOne({ paymentId: payment_link.id });
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: "Order not found" 
      });
    }

    // Skip if already processed
    if (order.paymentStatus === "Completed" || order.orderStatus === "Cancelled") {
      return res.json({ received: true });
    }

    switch (payment_link.status) {
      case "paid":
        await handleSuccessfulPayment(order);
        break;
      case "cancelled":
      case "expired":
      case "failed":
        await handleFailedPayment(order, payment_link.status);
        break;
      default:
        order.paymentStatus = payment_link.status;
        await order.save();
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({
      success: false,
      message: "Error processing webhook",
      error: error.message,
    });
  }
};

/* =======================================================
   4️⃣  Verify Payment (common for web & app)
   ======================================================= */
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      razorpay_payment_link_id,
      orderId,
    } = req.body;

    // ───────── WEB Verification (payment link based)
    if (razorpay_payment_link_id) {
      const order = await Order.findOne({
        paymentId: razorpay_payment_link_id,
      });
      
      if (!order) {
        return res.status(404).json({ 
          success: false, 
          message: "Order not found" 
        });
      }

      const payment = await razorpay.paymentLink.fetch(razorpay_payment_link_id);
      
      if (order.paymentStatus === "Completed") {
        return res.status(200).json({ 
          success: true, 
          message: "Payment already verified", 
          order 
        });
      }

      if (payment.status === "paid" && order.paymentStatus !== "Completed") {
        await handleSuccessfulPayment(order);
        return res.status(200).json({ 
          success: true, 
          message: "Payment verified successfully", 
          order 
        });
      }

      if (["cancelled", "expired", "failed"].includes(payment.status)) {
        await handleFailedPayment(order, payment.status);
        return res.status(400).json({ 
          success: false, 
          message: `Payment ${payment.status}` 
        });
      }

      return res.status(202).json({ 
        success: false, 
        message: "Payment status pending" 
      });
    }

    // ───────── APP Verification (Razorpay order based)
    if (razorpay_order_id && razorpay_payment_id && razorpay_signature) {
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_SECRET)
        .update(body.toString())
        .digest("hex");

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({
          success: false,
          message: "Payment verification failed - Invalid signature",
        });
      }

      if (orderId) {
        const order = await Order.findById(orderId);
        if (order) {
          order.paymentStatus = "Completed";
          order.orderStatus = "Processing";
          order.paymentId = razorpay_payment_id;
          await order.save();

          // Clear cart after successful payment
          const cart = await Cart.findOne({ userId: order.userId });
          if (cart) {
            cart.items = [];
            cart.totalPrice = 0;
            cart.totalDiscountedPrice = 0;
            await cart.save();
          }

          // Send success notification to USER
          await createNotification(
            order.userId,
            'payment_success',
            'Payment Successful! 🎉',
            `Your payment of ₹${order.totalAmount} was successful. Your order is being processed.`,
            order._id,
            {
              amount: order.totalAmount,
              paymentId: razorpay_payment_id
            }
          );

          // Send notifications to ALL SELLERS
          const uniqueSellerIds = [...new Set(order.items.map(item => item.sellerId?.toString()).filter(Boolean))];
          for (const sellerId of uniqueSellerIds) {
            const sellerItems = order.items.filter(item => item.sellerId?.toString() === sellerId);
            const sellerTotal = sellerItems.reduce((sum, item) => sum + (item.selectedDiscountedPrice * item.quantity), 0);
            
            await createNotification(
              sellerId,
              'payment_success',
              'New Order - Payment Received! 💰',
              `Payment of ₹${sellerTotal} received for order #${order._id.toString().slice(-8)}. Start processing the order.`,
              order._id,
              {
                amount: sellerTotal,
                itemCount: sellerItems.length,
                paymentId: razorpay_payment_id
              }
            );
          }
        }
      }

      return res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        paymentId: razorpay_payment_id,
      });
    }

    return res.status(400).json({
      success: false,
      message: "Invalid payment verification payload",
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying payment",
      error: error.message,
    });
  }
};

/* =======================================================
   5️⃣  Helper Functions
   ======================================================= */
async function handleSuccessfulPayment(order) {
  if (order.stockAdjusted) return;

  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      order.paymentStatus = "Completed";
      order.orderStatus = "Processing";

      // Adjust stock for each item
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (!product) continue;

        let priceArray;
        
        // Handle seller-specific pricing
        if (item.sellerId) {
          const sellerEntry = product.sellers.find(
            (s) => s.sellerId.toString() === item.sellerId.toString()
          );
          if (!sellerEntry) {
            throw new Error(`Seller not linked to product ${product.name}`);
          }
          priceArray = sellerEntry.price_size;
        } else {
          priceArray = product.price_size;
        }

        // Find size and validate stock
        const sizeIndex = priceArray.findIndex((p) => p.size === item.size);
        if (sizeIndex === -1) {
          throw new Error(`Size ${item.size} not available for product ${product.name}`);
        }

        if (priceArray[sizeIndex].quantity < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name} (Size: ${item.size})`);
        }

        // Deduct stock
        priceArray[sizeIndex].quantity -= item.quantity;
        
        item.sellerId
          ? product.markModified("sellers")
          : product.markModified("price_size");
          
        await product.save({ session });
      }

      order.stockAdjusted = true;
      await order.save({ session });
    });

    // Clear cart after successful payment (for web flow)
    const cart = await Cart.findOne({ userId: order.userId });
    if (cart) {
      cart.items = [];
      cart.totalPrice = 0;
      cart.totalDiscountedPrice = 0;
      await cart.save();
    }

    // Send success notification to USER
    await createNotification(
      order.userId,
      'payment_success',
      'Payment Successful! 🎉',
      `Your payment of ₹${order.totalAmount} was successful. Your order is being processed.`,
      order._id,
      {
        amount: order.totalAmount,
        paymentId: order.paymentId
      }
    );

    // Send notifications to ALL SELLERS
    const uniqueSellerIds = [...new Set(order.items.map(item => item.sellerId?.toString()).filter(Boolean))];
    for (const sellerId of uniqueSellerIds) {
      const sellerItems = order.items.filter(item => item.sellerId?.toString() === sellerId);
      const sellerTotal = sellerItems.reduce((sum, item) => sum + (item.selectedDiscountedPrice * item.quantity), 0);
      
      await createNotification(
        sellerId,
        'payment_success',
        'New Order - Payment Received! 💰',
        `Payment of ₹${sellerTotal} received for order #${order._id.toString().slice(-8)}. Start processing the order.`,
        order._id,
        {
          amount: sellerTotal,
          itemCount: sellerItems.length,
          paymentId: order.paymentId
        }
      );
    }
  } catch (error) {
    console.error("Error in handleSuccessfulPayment:", error);
    throw error;
  } finally {
    session.endSession();
  }
}

async function handleFailedPayment(order, status) {
  try {
    order.paymentStatus = "Failed";
    order.orderStatus = "Cancelled";
    order.failureReason = `Payment ${status}`;
    await order.save();

    // Send failure notification
    await createNotification(
      order.userId,
      'payment_failed',
      'Payment Failed ❌',
      `Your payment of ₹${order.totalAmount} was unsuccessful. Retry Now!`,
      order._id,
      {
        amount: order.totalAmount,
        paymentId: order.paymentId
      }
    );
  } catch (error) {
    console.error("Error in handleFailedPayment:", error);
    throw error;
  }
}
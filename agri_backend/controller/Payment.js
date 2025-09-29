const Order = require('../models/Order');
const User = require('../models/Users');
const razorpay = require('../config/razorpay');
const Product = require('../models/Product');
const crypto = require('crypto');
const mongoose=require('mongoose');
const Address = require('../models/Address');
// or const mongoose = require('mongoose');
const { Types } = mongoose;

exports.createPaymentLinkBeforeOrder = async (req, res) => {
    try {
         const { ObjectId } = Types;
        const userId = req.user.id;
        const { totalAmount,addressId } = req.body;
        const user = await User.findById(userId);
        const idofAddress= new ObjectId(addressId);

        const address=await Address.findById(idofAddress);
        console.log(address)


        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create payment link request
        const paymentLinkRequest = {
            amount: totalAmount * 100,  // Convert to paise
            currency: 'INR',
            customer: {
                name: user.Name,
                email: user.email,
                contact: address.mobile ,
            },
            notify: {
                sms: true,
                email: true,
            },
            reminder_enable: true,
            callback_url: `{process.env.REACT/payment/callback`,
            callback_method: 'get',
            notes: {
                userId: userId
            }
        };

        // Create Razorpay payment link
        const paymentLink = await razorpay.paymentLink.create(paymentLinkRequest);

        res.status(200).json({
            success: true,
            data: {
                paymentLinkId: paymentLink.id,
                payment_link_url: paymentLink.short_url,
            },
            message: 'Payment link created successfully'
        });

    } catch (error) {
        console.error("Error in creating payment link:", error);
        res.status(500).json({ 
            success: false,
            message: 'Error in creating payment link'
        });
    }
};

// Razorpay Webhook Handler
exports.handleWebhook = async (req, res) => {
    try {
        // Verify webhook signature
       const digest = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(req.rawBody)                       // raw buffer!
    .digest('hex');

  if (digest !== req.headers['x-razorpay-signature'])
    return res.status(400).send('Invalid webhook signature');

        const { payload } = req.body;
        const { payment_link } = payload;
        
        // Find order by payment link ID
        const order = await Order.findOne({ paymentId: payment_link.id });
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

          /* ---------- 2-C  Idempotency guard ---------- */
  if (order.paymentStatus === 'Completed' || order.orderStatus === 'Cancelled')
    return res.json({ received: true });      // already handled


        // Handle different payment statuses
        switch (payment_link.status) {
            case 'paid':
                await handleSuccessfulPayment(order);
                break;
            case 'cancelled':
            case 'expired':
            case 'failed':
                await handleFailedPayment(order, payment_link.status);
                break;
            default:
                // For any other status, just update the status
                order.paymentStatus = payment_link.status;
                await order.save();
        }

        res.status(200).json({ success: true });

    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({
            success: false,
            message: "Error processing webhook",
            error: error.message
        });
    }
};

// Handle successful payment
async function handleSuccessfulPayment(order) {

    if (order.stockAdjusted) {
    console.log(`Stock already adjusted for order ${order._id}`);
    return;
  }
  const session = await mongoose.startSession();
  await session.withTransaction(async () => {
    // Update order status
    order.paymentStatus = 'Completed';
    order.orderStatus = 'Processing';

    // Update product quantities
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (!product) continue;

      // Determine the correct price_size array to update
      let priceArray;
      if (item.sellerId) {
        const sellerEntry = product.sellers.find(s =>
          s.sellerId.toString() === item.sellerId.toString()
        );
        if (!sellerEntry) {
          throw new Error(`Seller not linked to product ${product.name}`);
        }
        priceArray = sellerEntry.price_size;
      } else {
        priceArray = product.price_size;
      }

      const sizeIndex = priceArray.findIndex(p => p.size === item.size);
      if (sizeIndex === -1) {
        throw new Error(`Size ${item.size} not available for product ${product.name}`);
      }

      if (priceArray[sizeIndex].quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name} (Size: ${item.size})`);
      }



      // Deduct stock
      console.log(`Before:`, priceArray[sizeIndex].quantity);
priceArray[sizeIndex].quantity -= item.quantity;
console.log(`After:`, priceArray[sizeIndex].quantity);
  
if (item.sellerId) {
  product.markModified('sellers');
} else {
  product.markModified('price_size');
}

await product.save({ session });
    }
    order.stockAdjusted=true;

    await order.save({ session });
  });

  session.endSession();
}



    


    


// Handle failed payment
async function handleFailedPayment(order, status) {
    order.paymentStatus = 'Failed';
    order.orderStatus = 'Cancelled';
    order.failureReason = `Payment ${status}`;
    await order.save();
}

// Verify payment from frontend callback
exports.verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_payment_link_id,
        } = req.body;

        // Find order by payment link ID
        const order = await Order.findOne({ paymentId: razorpay_payment_link_id });
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Get payment status from Razorpay
        const payment = await razorpay.paymentLink.fetch(razorpay_payment_link_id);

        // If payment is already completed, return success
        if (order.paymentStatus === 'Completed') {
            return res.status(200).json({
                success: true,
                message: "Payment already verified",
                order
            });
        }

        // If payment is paid but order not updated (webhook might be delayed)
        if (payment.status === 'paid' && order.paymentStatus !== 'Completed') {
            try {
                await handleSuccessfulPayment(order);
                return res.status(200).json({
                    success: true,
                    message: "Payment verified successfully",
                    order
                });
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
        }

        // If payment failed
        if (['cancelled', 'expired', 'failed'].includes(payment.status)) {
            await handleFailedPayment(order, payment.status);
            return res.status(400).json({
                success: false,
                message: `Payment ${payment.status}`,
                paymentStatus: payment.status
            });
        }

        // For any other status
        return res.status(202).json({
            success: false,
            message: "Payment status pending",
            paymentStatus: payment.status
        });

    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({
            success: false,
            message: "Error verifying payment",
            error: error.message
        });
    }
};

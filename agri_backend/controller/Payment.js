// backend/controller/Payment.js
const razorpay = require('../config/razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Cart = require('../models/CartItem');
const { createNotification } = require('./Notification'); // IMPORT THIS

exports.createPaymentOrder = async (req, res) => {
    try {
        const { amount } = req.body;

        console.log('Creating payment order for amount:', amount);

        if (!amount || amount <= 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Valid amount is required' 
            });
        }

        const options = {
            amount: amount * 100,
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
            payment_capture: 1
        };

        const razorpayOrder = await razorpay.orders.create(options);

        console.log('Razorpay order created successfully:', razorpayOrder.id);

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
};

exports.verifyPayment = async (req, res) => {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature,
            orderId
        } = req.body;

        console.log('=== Payment Verification Started ===');
        console.log('Razorpay Order ID:', razorpay_order_id);
        console.log('Razorpay Payment ID:', razorpay_payment_id);
        console.log('Internal Order ID:', orderId);

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: 'Missing payment verification data'
            });
        }

        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_SECRET)
            .update(body.toString())
            .digest('hex');

        const isValid = expectedSignature === razorpay_signature;

        if (!isValid) {
            console.error('Payment verification failed: Invalid signature');
            return res.status(400).json({
                success: false,
                message: 'Payment verification failed - Invalid signature'
            });
        }

        console.log('✓ Payment signature verified successfully');

        if (orderId) {
            const order = await Order.findById(orderId);
            
            if (!order) {
                console.error('Order not found:', orderId);
                return res.status(404).json({
                    success: false,
                    message: 'Order not found'
                });
            }

            order.paymentStatus = 'Completed';
            order.orderStatus = 'Processing';
            order.paymentId = razorpay_payment_id;
            await order.save();
            console.log('✓ Order updated with payment details');

            const cart = await Cart.findOne({ userId: order.userId });
            if (cart && cart.items.length > 0) {
                cart.items = [];
                cart.totalPrice = 0;
                cart.totalDiscountedPrice = 0;
                await cart.save();
                console.log('✓ Cart cleared after successful payment');
            }

            // CREATE NOTIFICATION FOR SUCCESSFUL PAYMENT
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
        }

        console.log('=== Payment Verification Completed ===');

        res.status(200).json({
            success: true,
            message: 'Payment verified successfully',
            paymentId: razorpay_payment_id
        });

    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({
            success: false,
            message: 'Payment verification failed',
            error: error.message
        });
    }
};
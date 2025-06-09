const Order = require('../models/Order');
const User = require('../models/Users');
const razorpay = require('../config/razorpay');
const Product = require('../models/Product');
const crypto = require('crypto');

exports.createPaymentLinkBeforeOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const { totalAmount } = req.body;
        const user = await User.findById(userId);

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
                contact: user.mobile || "7633020372",
            },
            notify: {
                sms: true,
                email: true,
                contact: true
            },
            reminder_enable: true,
            callback_url: `http://localhost:3000/payment/callback`,
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
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const signature = req.headers['x-razorpay-signature'];
        
        const shasum = crypto.createHmac('sha256', webhookSecret);
        shasum.update(JSON.stringify(req.body));
        const digest = shasum.digest('hex');

        if (signature !== digest) {
            return res.status(400).json({
                success: false,
                message: 'Invalid webhook signature'
            });
        }

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
    try {
        // Update order status
        order.paymentStatus = 'Completed';
        order.orderStatus = 'Processing';
        
        // Update product quantities
        for (const item of order.items) {
            const product = await Product.findById(item.product);
            if (product) {
                const sizeIndex = product.price_size.findIndex(p => p.size === item.size);
                if (sizeIndex !== -1) {
                    if (product.price_size[sizeIndex].quantity < item.quantity) {
                        throw new Error(`Insufficient stock for product ${product.name} in size ${item.size}`);
                    }
                    product.price_size[sizeIndex].quantity -= item.quantity;
                    await product.save();
                }
            }
        }

        await order.save();
        return true;
    } catch (error) {
        // If there's an error updating stock, mark payment for refund
        order.paymentStatus = 'Refund_Pending';
        order.orderStatus = 'Cancelled';
        order.failureReason = error.message;
        await order.save();
        throw error;
    }
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
            razorpay_payment_id,
            razorpay_payment_link_id,
            razorpay_payment_link_status
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

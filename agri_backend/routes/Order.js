// const express = require('express');

// const router = express.Router()

// const { createOrder, getOrderById, getOrderHistory, getSellerOrderHistory,

// } = require('../controller/Order');

// const { auth,
//     isUser, 
//     isSeller} = require('../middleware/auth');
// const {  updatePaymentInformations, createPaymentLinkBeforeOrder, handleWebhook, verifyPayment} = require('../controller/Payment');

// router.post('/createorder/', auth,  createOrder)

// router.get('/findeorderbyid/:orderId',auth,getOrderById)
// router.get('/orderhistory',auth,getOrderHistory)
// router.post('/seller/orders',auth,isSeller,getSellerOrderHistory)



// // router.post('/createpaymentlink/:orderId',auth,isUser,createPaymentLink)
// // router.get('/updatepayemtstatus',auth,isUser,updatePaymentInformations)
// router.post('/create-payment-link-before-order',auth,createPaymentLinkBeforeOrder)
// router.post('/payment-verify', auth, verifyPayment);
// router.post("/payment/webhook", handleWebhook); 
// module.exports = router;

// routes/order.js (or wherever your order routes are defined)
const express = require('express');
const router = express.Router();

const { auth,
    isUser, 
    isSeller} = require('../middleware/auth');
 // Your auth middleware
const orderController = require('../controller/Order');
const paymentController = require('../controller/Payment'); // NEW

// Existing order routes
router.post('/createorder', auth, orderController.createOrder);
router.get('/order/:orderId', auth, orderController.getOrderById);
router.get('/orderhistory', auth, orderController.getOrderHistory);
router.get('/seller/orders', auth, orderController.getSellerOrderHistory);

const { createOrder, getOrderById, getOrderHistory, getSellerOrderHistory,

} = require('../controller/Order');

const {  updatePaymentInformations, createPaymentLinkBeforeOrder, handleWebhook, verifyPayment} = require('../controller/Payment');

router.post('/createorder/', auth,  createOrder)

router.get('/findeorderbyid/:orderId',auth,getOrderById)
router.get('/orderhistory',auth,getOrderHistory)
router.post('/seller/orders',auth,isSeller,getSellerOrderHistory)

// ============ CHANGED FOR APP - Update Order Status ============
router.put('/update-status/:orderId', auth, isSeller, orderController.updateOrderStatus);

// Cancel Order
router.put('/cancel/:orderId', auth, orderController.cancelOrder);

// NEW Payment routes for mobile app
router.post('/create-payment-app', auth, paymentController.createPaymentOrder);
router.post('/verify-payment-app', auth, paymentController.verifyPayment);

// router.post('/createpaymentlink/:orderId',auth,isUser,createPaymentLink)
// router.get('/updatepayemtstatus',auth,isUser,updatePaymentInformations)
router.post('/create-payment-link-before-order',auth,createPaymentLinkBeforeOrder)
router.post('/payment-verify', auth, verifyPayment);
router.post("/payment/webhook", handleWebhook); 


module.exports = router;
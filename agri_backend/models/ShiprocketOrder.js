// models/ShiprocketOrder.js
const mongoose = require('mongoose');

const shiprocketOrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true
  },
  items: [{
    productId: { 
      type: String, 
      required: true 
    },
    name: { 
      type: String, 
      required: true 
    },
    quantity: { 
      type: Number, 
      required: true,
      min: 1
    },
    price: { 
      type: Number, 
      required: true 
    },
    imageUrl: { 
      type: String 
    }
  }],
  shippingAddress: {
    name: { 
      type: String, 
      required: true 
    },
    mobile: { 
      type: String, 
      required: true 
    },
    streetAddress: { 
      type: String, 
      required: true 
    },
    city: { 
      type: String, 
      required: true 
    },
    state: { 
      type: String, 
      required: true 
    },
    zipCode: { 
      type: String, 
      required: true 
    }
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'online'],
    default: 'cod'
  },
  paymentInfo: {
    razorpay_order_id: String,
    razorpay_payment_id: String,
    razorpay_signature: String
  },
  subTotal: { 
    type: Number, 
    required: true 
  },
  shippingCost: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  shippingInfo: {
    cost: Number,
    estimatedDays: String,
    courierName: String
  },
  shiprocket: {
    order_id: String,
    shipment_id: String,
    status: String,
    raw: mongoose.Schema.Types.Mixed
  },
  status: {
    type: String,
    default: 'created',
    enum: ['created', 'processing', 'shipped', 'delivered', 'cancelled']
  }
}, {
  timestamps: true
});

// Index for faster queries
shiprocketOrderSchema.index({ user: 1, createdAt: -1 });
shiprocketOrderSchema.index({ 'shiprocket.shipment_id': 1 });

const ShiprocketOrder = mongoose.model('ShiprocketOrder', shiprocketOrderSchema);

module.exports = ShiprocketOrder;

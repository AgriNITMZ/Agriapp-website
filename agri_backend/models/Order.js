const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      size: {
        type: String,
        required: true
      },
      selectedprice: {
        type: Number,
        required: true
      },
      selectedDiscountedPrice: {
        type: Number,
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      },
      sellerId: { // <-- Add this line
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller', // or just ObjectId if Seller model isn't defined
        required: true
      }
    }
  ],
  totalAmount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true // e.g., 'online', 'cod', etc.
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending'
  },
  orderStatus: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  paymentId: {
    type: String
  },
  paymentLink: {
    type: String
  },
  paymentLinkId: {
    type: String
  },
  shippingAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Addresses',
    required: true
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Optional: Middleware to update `updatedAt` timestamp before saving
orderSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, // Reference to the user
        ref: 'User',
        required: true,
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId, // Reference to the product
                ref: 'Product',
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
                min: 1,
                default: 1,
            },
            selectedsize: {
                type: String,
                required: true, // Ensure size is mandatory
            },
            selectedPrice: {
                type: Number,
                required: true,
                default: 0,
            },
            selecetedDiscountedPrice: {
                type: Number,
                required: true,
                default: 0,
            },
            sellerId: {
                type: mongoose.Schema.Types.ObjectId, // Reference to the seller
                ref: 'User', // Assuming sellers are stored in the User collection
                required: true,
            },
        },
    ],
    totalPrice: {
        type: Number,
        required: true,
        default: 0,
    },
    totalDiscountedPrice: {
        type: Number,
        required: true,
        default: 0,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Middleware to calculate the total price before saving
cartSchema.pre('save', function (next) {
    let total = 0;
    let totalDiscountedPrice = 0;

    // Iterate over each item in the cart and calculate totals based on selectedPrice
    for (const item of this.items) {
        totalDiscountedPrice += item.selecetedDiscountedPrice * item.quantity;
        total += item.selectedPrice * item.quantity;
    }

    this.totalPrice = total;
    this.totalDiscountedPrice = totalDiscountedPrice;
    this.updatedAt = Date.now();

    next();
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
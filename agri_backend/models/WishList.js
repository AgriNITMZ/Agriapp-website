const mongoose = require('mongoose');

const WishlistSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            addedAt: {
                type: Date, default: Date.now
            },
        },
    ],
});

const Wishlist = mongoose.model('Wishlist', WishlistSchema);

module.exports = Wishlist;
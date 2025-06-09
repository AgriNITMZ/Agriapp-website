const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    sellers: [
        {
            sellerId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            price_size: [
                {
                    price: { type: Number },
                    discountedPrice: { type: Number },
                    size: { type: String },
                    quantity: { type: Number }
                }
            ],
            fullShopDetails: { type: String, required: true }
        }
    ],
    name: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
        ref: "Category"
    },
    description: {
        type: String,
        required: true,
    },
    images: [
        {
            type: String,
            required: true,
        }
    ],
    ratingandreview: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "RatingAndReview",
        }
    ],
    tag: [
        {
            type: String,
            required: true,
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now()
    },
    badges: {
        type: String,
        default: 'New Arrival'
    },
    avgRating: {
        type: Number,
        default: 0
    },
    ratings: {
        average: {
            type: Number,
            default: 0
        },
        count: {
            type: Number,
            default: 0
        },
        distribution: {
            1: { type: Number, default: 0 },
            2: { type: Number, default: 0 },
            3: { type: Number, default: 0 },
            4: { type: Number, default: 0 },
            5: { type: Number, default: 0 }
        }
    },
    updatedAt: {
        type: Date,
        default: Date.now()
    }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
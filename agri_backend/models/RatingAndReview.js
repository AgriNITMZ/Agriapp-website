const mongoose = require("mongoose");
const Product=require('./Product')

const ratingAndReviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Product",
        index: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5, // Ensures rating is between 1 and 5
    },
    review: {
        type: String,
        required: true,
    },
    createdAt:{
        type: Date,
        default: Date.now(),

    }
}, { timestamps: true });

// Middleware to update average rating in Product
async function updateAvgRating(productId) {
    const result = await mongoose.model("RatingAndReview").aggregate([
        { $match: { product: new mongoose.Types.ObjectId(productId) } },
        { $group: { _id: "$product", avgRating: { $avg: "$rating" } } }
    ]);

    const avgRating = result.length > 0 ? result[0].avgRating.toFixed(1) : 0;

    await Product.findByIdAndUpdate(productId, { avgRating });
}

// Middleware to update avgRating after save
ratingAndReviewSchema.post("save", async function () {
    await updateAvgRating(this.product);
});

// Middleware to update avgRating after deletion
ratingAndReviewSchema.post("findOneAndDelete", async function (doc) {
    if (doc) {
        await updateAvgRating(doc.product);
    }
});


module.exports = mongoose.model("RatingAndReview", ratingAndReviewSchema);

const mongoose = require('mongoose');

const SchemeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    date: { type: Date, required: true },
    source: { type: String, required: true },
    image: { type: String, required: false }, // Optional image URL
    description: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Scheme', SchemeSchema);

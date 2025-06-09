const mongoose = require('mongoose')
const detailsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    details: [
        {
            image: {
                type: String,
            },
            subtitle: {
                type: String,
               
            },
            description: {
                type: String,
               
            }

        }
    ],



})

module.exports = mongoose.model('Details', detailsSchema)
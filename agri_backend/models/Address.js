const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
   },
  Name: {
    type: String,
    required: true,
  },

  streetAddress: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  zipCode: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
  },
  mobile: {
    type: String,
  },
});

const Address = mongoose.model('Addresses', addressSchema);

module.exports = Address;
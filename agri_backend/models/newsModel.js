// models/newsModel.js - Isolated News Model
const mongoose = require('mongoose');

const agriNewsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  link: {
    type: String,
    required: true,
    unique: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  source: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries
agriNewsSchema.index({ date: -1 });
agriNewsSchema.index({ link: 1 }, { unique: true });

const AgriNews = mongoose.model('AgriNews', agriNewsSchema);

module.exports = AgriNews;

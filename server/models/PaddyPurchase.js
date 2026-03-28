const mongoose = require('mongoose');

const paddyPurchaseSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  bags: {
    type: Number,
    required: true,
    min: 0
  },
  bagType: {
    type: String,
    required: true,
    enum: ['New', 'Old']
  },
  source: {
    type: String,
    required: true
  },
  hamali: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    enum: ['Qu', 'Ton']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PaddyPurchase', paddyPurchaseSchema);

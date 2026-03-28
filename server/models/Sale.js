const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  productType: {
    type: String,
    required: true,
    enum: ['Rice', 'Bran', 'Broken', 'Rafi', 'Husk']
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
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  customerName: {
    type: String,
    default: ''
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Sale', saleSchema);

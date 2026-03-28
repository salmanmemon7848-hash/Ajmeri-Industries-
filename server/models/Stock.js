const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  paddy: {
    bags: { type: Number, default: 0 },
    quantity: { type: Number, default: 0 },
    unit: { type: String, default: 'Qu', enum: ['Qu', 'Ton'] }
  },
  rice: {
    quantity: { type: Number, default: 0 },
    unit: { type: String, default: 'Qu', enum: ['Qu', 'Ton'] }
  },
  bran: {
    quantity: { type: Number, default: 0 },
    unit: { type: String, default: 'Qu', enum: ['Qu', 'Ton'] }
  },
  broken: {
    quantity: { type: Number, default: 0 },
    unit: { type: String, default: 'Qu', enum: ['Qu', 'Ton'] }
  },
  rafi: {
    quantity: { type: Number, default: 0 },
    unit: { type: String, default: 'Qu', enum: ['Qu', 'Ton'] }
  },
  husk: {
    quantity: { type: Number, default: 0 },
    unit: { type: String, default: 'Qu', enum: ['Qu', 'Ton'] }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Stock', stockSchema);

const mongoose = require('mongoose');

const millingProcessSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  quantityMilled: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    enum: ['Qu', 'Ton']
  },
  outputs: {
    rice: {
      quantity: { type: Number, required: true },
      unit: { type: String, required: true }
    },
    bran: {
      quantity: { type: Number, required: true },
      unit: { type: String, required: true }
    },
    broken: {
      quantity: { type: Number, required: true },
      unit: { type: String, required: true }
    },
    rafi: {
      quantity: { type: Number, required: true },
      unit: { type: String, required: true }
    },
    husk: {
      quantity: { type: Number, required: true },
      unit: { type: String, required: true }
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MillingProcess', millingProcessSchema);

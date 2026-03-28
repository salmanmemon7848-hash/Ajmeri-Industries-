const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  type: {
    type: String,
    required: true,
    enum: ['Advance', 'Full']
  }
}, {
  timestamps: true
});

const workerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['Labour', 'Driver', 'Helper']
  },
  payments: [paymentSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Worker', workerSchema);

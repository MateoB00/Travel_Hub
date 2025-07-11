const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  from: { type: String, required: true, index: true },
  to: { type: String, required: true, index: true },
  departDate: { type: Date, required: true },
  returnDate: { type: Date, required: true },
  provider: { type: String, required: true, index: 'text' },
  price: { type: Number, required: true, index: true },
  currency: { type: String, default: 'EUR' },
  legs: [{
    flightNum: String,
    dep: String,
    arr: String,
    duration: Number
  }],
  hotel: {
    name: String,
    nights: Number,
    price: Number
  },
  activity: {
    title: String,
    price: Number
  }
}, { timestamps: true });

offerSchema.index({ from: 1, to: 1, price: 1 });

module.exports = mongoose.model('Offer', offerSchema);
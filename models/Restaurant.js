const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, default: '' },
  openTime: { type: String, default: '10:30' },
  closeTime: { type: String, default: '22:00' },
  timezone: { type: String, default: 'America/Argentina/Buenos_Aires' },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Restaurant', RestaurantSchema);

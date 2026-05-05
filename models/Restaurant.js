const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, default: '' },
  openTime: { type: String, default: '10:30' },
  closeTime: { type: String, default: '22:00' },
  // ✅ Cortes de servicio definidos por Amber
  lunchStart: { type: String, default: '10:30' },
  lunchEnd: { type: String, default: '15:00' },
  dinnerStart: { type: String, default: '17:00' },
  dinnerEnd: { type: String, default: '22:00' },
  timezone: { type: String, default: 'Pacific/Auckland' },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Restaurant', RestaurantSchema);

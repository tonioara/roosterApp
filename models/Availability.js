const mongoose = require('mongoose');

const AvailabilitySchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  weekId: { type: String, required: true },
  daysOff: [{ type: String }], // Ejemplo: ["Lunes", "Martes"]
  maxHours: { type: Number, default: 40 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Availability', AvailabilitySchema);
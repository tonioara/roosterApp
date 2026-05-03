const mongoose = require('mongoose');

const ShiftSchema = new mongoose.Schema({
  day: { type: String, required: true },
  shiftType: { type: String, enum: ['Lunch', 'Dinner'], required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  isAvailable: { type: Boolean, default: true }
});

module.exports = mongoose.model('Shift', ShiftSchema);

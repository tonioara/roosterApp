const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  weekReference: { type: String, required: true },
  requestedDayOff: { type: String, required: true },
  type: { type: String, enum: ['dayOff', 'scheduleChange'], default: 'dayOff' },
  note: { type: String, default: '' },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Request', RequestSchema);

const mongoose = require('mongoose');

const ShiftSchema = new mongoose.Schema({
  day: { type: String, required: true },
  role: { type: String, enum: ['FOH', 'BOH'], required: true },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  shiftType: { type: String, enum: ['Mañana', 'Tarde', 'Split'], default: 'Mañana' },
  hoursWorked: { type: Number, default: 0 },
  notes: { type: String, default: '' },
});

const RosterSchema = new mongoose.Schema({
  weekId: { type: String, required: true },
  // ✅ Roster pertenece a un restaurante
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  shifts: [ShiftSchema],
  createdAt: { type: Date, default: Date.now },
});

// Índice único por semana + restaurante
RosterSchema.index({ weekId: 1, restaurantId: 1 }, { unique: true });

module.exports = mongoose.model('Roster', RosterSchema);

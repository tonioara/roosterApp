const mongoose = require('mongoose');

const RosterSchema = new mongoose.Schema({
  weekId: { type: String, required: true, unique: true }, // Ejemplo: "2026-W18"
  shifts: [
    {
      day: { type: String, required: true }, // Lunes, Martes, etc.
      role: { type: String, enum: ['FOH', 'BOH'], required: true },
      employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      shiftType: { type: String, enum: ['Mañana', 'Tarde', 'Cierre'], required: true },
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Roster', RosterSchema);
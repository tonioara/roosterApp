const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['FOH', 'BOH', 'admin', 'superadmin'], required: true },
  contractType: { type: String, enum: ['full-time', 'part-time'], default: 'full-time' },
  maxWeeklyHours: { type: Number, default: 40 },
  skills: { type: [String], default: [] },
  phoneToken: { type: String, default: '' },
  pushSubscription: { type: Object, default: null },
  // ✅ Cada usuario pertenece a un restaurante
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: false },
  createdAt: { type: Date, default: Date.now },
});

UserSchema.pre('save', async function (next) {
  if (this.isModified('contractType')) {
    this.maxWeeklyHours = this.contractType === 'part-time' ? 20 : 40;
  }
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', UserSchema);

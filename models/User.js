const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, enum: ['FOH', 'BOH'], required: true },
  skills: { type: [String], default: [] },
  phoneToken: { type: String, default: '' }
});

module.exports = mongoose.model('User', UserSchema);

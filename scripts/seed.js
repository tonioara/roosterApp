require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI;

const initialUsers = [
  { name: 'Antonio', email: 'antonio@rooster.com', password: 'antonio123', role: 'FOH', contractType: 'full-time', skills: ['bar', 'coffee', 'service'] },
  { name: 'PJ',      email: 'pj@rooster.com',      password: 'pj1234',     role: 'FOH', contractType: 'full-time', skills: ['bar', 'service'] },
  { name: 'Crystal', email: 'crystal@rooster.com', password: 'crystal123', role: 'FOH', contractType: 'full-time', skills: ['service', 'management'] },
  { name: 'Jane',    email: 'jane@rooster.com',    password: 'jane1234',   role: 'FOH', contractType: 'part-time', skills: ['service'] },
  { name: 'Pin',     email: 'pin@rooster.com',     password: 'pin1234',    role: 'BOH', contractType: 'full-time', skills: ['cocina'] },
  { name: 'Betty',   email: 'betty@rooster.com',   password: 'betty123',   role: 'BOH', contractType: 'part-time', skills: ['parrilla'] },
  { name: 'Amber',   email: 'amber@rooster.com',   password: 'amber123',   role: 'admin', contractType: 'full-time', skills: ['management'] },
];

const seedDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected.');
    await User.deleteMany({});
    console.log('Previous users deleted.');
    for (const u of initialUsers) {
      await User.create(u);
      console.log(`✅ Created: ${u.name} (${u.contractType})`);
    }
    console.log('\n🎉 Staff initialized.');
    initialUsers.forEach(u => console.log(`  ${u.name}: ${u.email} / ${u.password} [${u.contractType}]`));
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.connection.close();
  }
};

seedDB();

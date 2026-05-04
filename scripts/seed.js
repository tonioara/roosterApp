require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI;

const initialUsers = [
  { name: 'Antonio', email: 'antonio@rooster.com', password: 'antonio123', role: 'FOH', skills: ['bar', 'coffee', 'service'] },
  { name: 'PJ',      email: 'pj@rooster.com',      password: 'pj123456',      role: 'FOH', skills: ['bar', 'service'] },
  { name: 'Crystal', email: 'crystal@rooster.com', password: 'crystal123', role: 'FOH', skills: ['service', 'management'] },
  { name: 'Jane',    email: 'jane@rooster.com',    password: 'jane123',    role: 'FOH', skills: ['service'] },
  { name: 'Pin',     email: 'pin@rooster.com',     password: 'pin123456',     role: 'BOH', skills: ['cocina'] },
  { name: 'Betty',   email: 'betty@rooster.com',   password: 'betty123',   role: 'BOH', skills: ['parrilla'] },
  { name: 'Amber',   email: 'amber@rooster.com',   password: 'amber123',   role: 'admin', skills: ['management'] },
];

const seedDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB conectado.');

    // Borramos y recreamos para que los passwords se hasheen correctamente
    await User.deleteMany({});
    console.log('Usuarios anteriores eliminados.');

    for (const u of initialUsers) {
      await User.create(u);
      console.log(`✅ Creado: ${u.name} (${u.email})`);
    }

    console.log('\n🎉 Staff inicializado correctamente.');
    console.log('Credenciales de acceso:');
    initialUsers.forEach(u => console.log(`  ${u.name}: ${u.email} / ${u.password}`));

    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    mongoose.connection.close();
  }
};

seedDB();

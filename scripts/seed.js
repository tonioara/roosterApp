require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/roster_db';

const initialUsers = [
  // Personal FOH existente
  { name: 'Antonio', role: 'FOH', skills: ['bar', 'coffee', 'service'] },
  { name: 'PJ', role: 'FOH', skills: ['bar', 'coffee', 'service'] },
  { name: 'Crystal', role: 'FOH', skills: ['service', 'management'] },
  { name: 'Jane', role: 'FOH', skills: ['service'] },
  // Nuevos ingresos BOH (Cocina)
  { name: 'Chef Pin', role: 'BOH', skills: ['cocina', 'inventario'] },
  { name: 'Antonio Taiwan', role: 'BOH', skills: ['linea fria', 'preparacion'] },
  { name: 'Betty', role: 'BOH', skills: ['limpieza', 'parrilla'] }
];

const seedDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB conectado para el script de inicialización.');

    // Limpiamos la colección para no duplicar datos
    await User.deleteMany({});
    console.log('Usuarios anteriores eliminados.');

    await User.insertMany(initialUsers);
    console.log('¡Usuarios iniciales agregados exitosamente!');

    mongoose.connection.close();
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    mongoose.connection.close();
  }
};

seedDB();
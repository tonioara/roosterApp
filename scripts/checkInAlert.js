const User = require('../models/User');
const mongoose = require('mongoose');
require('dotenv').config();

const simulateSaturdayAlert = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Obtenemos todos los usuarios registrados
    const users = await User.find({});
    
    console.log('--- ENVIANDO ALERTA DE DISPONIBILIDAD (SÁBADO A LA MAÑANA) ---');
    users.forEach(user => {
      // Simulamos la notificación push o mensaje que llega al celular
      console.log(`[Notificación enviada a ${user.name} (${user.role})]: ¿Necesitas algún día libre para la semana que viene? Responde en la app.`);
    });
    
    console.log('------------------------------------------------------------');
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error al simular la alerta:', error);
  }
};

simulateSaturdayAlert();
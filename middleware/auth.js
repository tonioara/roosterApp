const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'mi_clave_secreta_muy_segura';

exports.protect = async (req, res, next) => {
  let token;

  // 1. Aceptamos tanto "Authorization" como "authorization" para evitar errores de lectura
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (authHeader && authHeader.startsWith('Bearer')) {
    try {
      // 2. Extraemos el token correctamente
      token = authHeader.split(' ')[1];
      
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Buscamos el usuario
      req.user = await User.findById(decoded.id);
      
      if (!req.user) {
        return res.status(401).json({ message: 'Usuario no encontrado con este token' });
      }

      next();
    } catch (error) {
      // Devolvemos el error específico para saber qué falló en la verificación
      return res.status(401).json({ 
        message: 'No autorizado, token fallido', 
        error: error.message 
      });
    }
  } else {
    return res.status(401).json({ message: 'No autorizado, no existe token o el formato es incorrecto' });
  }
};

exports.restrictToAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Usuario no autenticado' });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'manager') {
    return res.status(403).json({ message: 'No tienes permisos para realizar esta acción' });
  }
  
  next();
};
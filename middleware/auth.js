const jwt = require('jsonwebtoken');
const User = require('../models/User');
const JWT_SECRET = process.env.JWT_SECRET || 'mi_clave_secreta_muy_segura';

exports.protect = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer')) {
    return res.status(401).json({ message: 'No token provided.' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) return res.status(401).json({ message: 'User not found.' });
    
    // ✅ Usar restaurantId del TOKEN (no de la DB)
    // Esto permite que superadmin cambie de restaurante sin cambiar la DB
    req.user.restaurantId = decoded.restaurantId || req.user.restaurantId;
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token invalid.', error: error.message });
  }
};

exports.restrictToAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated.' });
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Not authorized.' });
  }
  next();
};

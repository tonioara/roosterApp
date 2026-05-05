const express = require('express');
const router = express.Router();
const { protect, restrictToAdmin } = require('../middleware/auth');
const Restaurant = require('../models/Restaurant');
const User = require('../models/User');

// GET /api/restaurants — superadmin ve todos
router.get('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Not authorized.' });
    }
    const restaurants = await Restaurant.find({});
    res.status(200).json(restaurants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/restaurants/register — crear nuevo restaurante + admin
router.post('/register', async (req, res) => {
  try {
    const { restaurantName, restaurantAddress, openTime, closeTime,
            adminName, adminEmail, adminPassword } = req.body;

    if (!restaurantName || !adminName || !adminEmail || !adminPassword) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Verificar que el email no exista
    const exists = await User.findOne({ email: adminEmail.toLowerCase() });
    if (exists) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    // Crear el restaurante
    const restaurant = new Restaurant({
      name: restaurantName,
      address: restaurantAddress || '',
      openTime: openTime || '10:30',
      closeTime: closeTime || '22:00',
    });
    await restaurant.save();

    // Crear el admin del restaurante
    const admin = new User({
      name: adminName,
      email: adminEmail.toLowerCase(),
      password: adminPassword,
      role: 'admin',
      contractType: 'full-time',
      restaurantId: restaurant._id,
    });
    await admin.save();

    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: admin._id, role: admin.role, restaurantId: restaurant._id },
      process.env.JWT_SECRET || 'mi_clave_secreta_muy_segura',
      { expiresIn: '8h' }
    );

    res.status(201).json({
      message: 'Restaurant registered successfully.',
      restaurant: { _id: restaurant._id, name: restaurant.name },
      token,
      user: {
        _id: admin._id, name: admin.name, email: admin.email,
        role: admin.role, restaurantId: restaurant._id,
      },
      redirectUrl: '/admin-dashboard',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/restaurants/my — info del restaurante del admin logueado
router.get('/my', protect, async (req, res) => {
  try {
    if (!req.user.restaurantId) {
      return res.status(404).json({ message: 'No restaurant associated.' });
    }
    const restaurant = await Restaurant.findById(req.user.restaurantId);
    res.status(200).json(restaurant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/restaurants/my — actualizar info del restaurante
router.put('/my', protect, restrictToAdmin, async (req, res) => {
  try {
    const { name, address, openTime, closeTime } = req.body;
    const updated = await Restaurant.findByIdAndUpdate(
      req.user.restaurantId,
      { ...(name && { name }), ...(address && { address }), ...(openTime && { openTime }), ...(closeTime && { closeTime }) },
      { new: true }
    );
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

// POST /api/restaurants/setup
// Crear restaurante desde el wizard y asociarlo al superadmin
router.post('/setup', protect, async (req, res) => {
  try {
    const { name, address } = req.body;
    if (!name) return res.status(400).json({ message: 'Name required.' });

    const restaurant = await Restaurant.create({
      name, address: address || '',
      openTime: '10:30', closeTime: '22:00',
    });

    // Agregar a los restaurantes del superadmin
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { managedRestaurants: restaurant._id },
      $set: { restaurantId: restaurant._id },
    });

    const updatedUser = await User.findById(req.user._id);
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: updatedUser._id, role: updatedUser.role, restaurantId: restaurant._id },
      process.env.JWT_SECRET || 'mi_clave_secreta_muy_segura',
      { expiresIn: '8h' }
    );

    res.status(201).json({
      message: 'Restaurant created.',
      restaurant,
      user: {
        _id: updatedUser._id, name: updatedUser.name,
        email: updatedUser.email, role: updatedUser.role,
        restaurantId: restaurant._id,
        restaurantName: restaurant.name,
        managedRestaurants: updatedUser.managedRestaurants,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/setup', protect, async (req, res) => {
  try {
    const { name, address } = req.body;
    if (!name) return res.status(400).json({ message: 'Name required.' });

    const restaurant = await Restaurant.create({
      name, address: address || '',
      openTime: '10:30', closeTime: '22:00',
    });

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { managedRestaurants: restaurant._id },
      $set: { restaurantId: restaurant._id },
    });

    const updatedUser = await User.findById(req.user._id);
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: updatedUser._id, role: updatedUser.role, restaurantId: restaurant._id },
      process.env.JWT_SECRET || 'mi_clave_secreta_muy_segura',
      { expiresIn: '8h' }
    );

    res.status(201).json({
      message: 'Restaurant created.',
      restaurant,
      user: {
        _id: updatedUser._id, name: updatedUser.name,
        email: updatedUser.email, role: updatedUser.role,
        restaurantId: restaurant._id,
        restaurantName: restaurant.name,
        managedRestaurants: updatedUser.managedRestaurants,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

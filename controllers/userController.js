const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'mi_clave_secreta_muy_segura';

const generateToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, restaurantId: user.restaurantId },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

exports.getStaff = async (req, res) => {
  try {
    // ✅ Solo ve el staff de su restaurante
    const filter = req.user.role === 'superadmin'
      ? {}
      : { restaurantId: req.user.restaurantId };
    const staff = await User.find(filter).select('-password');
    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required.' });
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Incorrect password.' });

    const token = generateToken(user);
    const userPublic = {
      _id: user._id, name: user.name, email: user.email,
      role: user.role, skills: user.skills,
      contractType: user.contractType,
      maxWeeklyHours: user.maxWeeklyHours,
      restaurantId: user.restaurantId,
    };

    const isAdmin = user.role === 'admin' || user.role === 'superadmin';
    res.status(200).json({
      message: isAdmin ? 'Admin access granted' : 'Employee access granted',
      token, user: userPublic,
      redirectUrl: isAdmin ? '/admin-dashboard' : '/employee-dashboard',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, contractType, skills } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password and role required.' });
    }
    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) return res.status(400).json({ message: 'Email already exists.' });

    const newUser = new User({
      name, email: email.toLowerCase().trim(), password, role,
      contractType: contractType || 'full-time',
      maxWeeklyHours: contractType === 'part-time' ? 20 : 40,
      skills: skills || [],
      // ✅ Hereda el restaurante del admin que lo crea
      restaurantId: req.user.restaurantId,
    });
    await newUser.save();

    const userPublic = {
      _id: newUser._id, name: newUser.name, email: newUser.email,
      role: newUser.role, contractType: newUser.contractType,
      maxWeeklyHours: newUser.maxWeeklyHours, skills: newUser.skills,
      restaurantId: newUser.restaurantId,
    };
    res.status(201).json({ message: 'Staff member added.', user: userPublic });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, skills, name, contractType } = req.body;
    const updateData = {};
    if (role) updateData.role = role;
    if (skills) updateData.skills = skills;
    if (name) updateData.name = name;
    if (contractType) {
      updateData.contractType = contractType;
      updateData.maxWeeklyHours = contractType === 'part-time' ? 20 : 40;
    }
    const updated = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
    if (!updated) return res.status(404).json({ message: 'User not found.' });
    res.status(200).json({ message: 'Updated.', updatedUser: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'User not found.' });
    res.status(200).json({ message: 'Member removed.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) return res.status(401).json({ message: 'Current password incorrect.' });
    if (newPassword.length < 6) return res.status(400).json({ message: 'Min 6 characters.' });
    user.password = newPassword;
    await user.save();
    res.status(200).json({ message: 'Password updated.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

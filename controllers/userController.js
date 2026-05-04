const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'mi_clave_secreta_muy_segura';

const generateToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '8h' });

// GET /api/users — obtener todo el staff
exports.getStaff = async (req, res) => {
  try {
    const staff = await User.find({}).select('-password');
    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/users/login — login con email + password
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Contraseña incorrecta.' });
    }

    const token = generateToken(user);
    const userPublic = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      skills: user.skills,
    };

    const isAdmin = user.role === 'admin';
    res.status(200).json({
      message: isAdmin ? 'Acceso de Admin concedido' : 'Acceso de Empleado concedido',
      token,
      user: userPublic,
      redirectUrl: isAdmin ? '/admin-dashboard' : '/employee-dashboard',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/users — crear usuario (solo admin)
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, skills, phoneToken } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Nombre, email, contraseña y rol son requeridos.' });
    }

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) {
      return res.status(400).json({ message: 'Ya existe un usuario con ese email.' });
    }

    const newUser = new User({
      name,
      email: email.toLowerCase().trim(),
      password,
      role,
      skills: skills || [],
      phoneToken: phoneToken || '',
    });

    await newUser.save();

    const userPublic = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      skills: newUser.skills,
    };

    res.status(201).json({ message: 'Miembro del staff agregado con éxito', user: userPublic });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/users/:id — actualizar rol y habilidades
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, skills, name } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { ...(role && { role }), ...(skills && { skills }), ...(name && { name }) },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json({ message: 'Perfil actualizado', updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/users/:id — eliminar usuario
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.status(200).json({ message: 'Miembro eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/users/change-password — cambiar contraseña
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Contraseña actual incorrecta.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres.' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Contraseña actualizada correctamente.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

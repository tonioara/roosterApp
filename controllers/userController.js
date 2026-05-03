const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'mi_clave_secreta_muy_segura';

// 1. Obtener todo el staff
exports.getStaff = async (req, res) => {
  try {
    const staff = await User.find({});
    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Iniciar sesión (Login)
exports.login = async (req, res) => {
  try {
    const { name, email } = req.body;
    
    // Buscamos al usuario por nombre o por email (para que soporte ambos)
    let user;
    if (email) {
      user = await User.findOne({ email });
    } else {
      user = await User.findOne({ name });
    }

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado en el staff' });
    }

    // Generamos el token incluyendo el _id y el role (para ser usado en auth.js)
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: '1d',
    });

    // Control de redirección y permisos (incluye a Antonio y Amber como admins)
    if (user.role === 'admin' || user.name === 'Antonio') {
      return res.status(200).json({
        message: 'Acceso de Administrador/Manager concedido',
        token,
        role: user.role,
        user,
        redirectUrl: '/admin-dashboard'
      });
    }

    res.status(200).json({
      message: 'Acceso de Empleado concedido',
      token,
      role: user.role,
      user,
      redirectUrl: '/employee-dashboard'
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Crear usuario (Solo el administrador puede hacer esto)
exports.createUser = async (req, res) => {
  try {
    const { name, email, role, skills, phoneToken } = req.body;

    // Verificamos si el usuario ya existe por nombre o por email
    const userExists = await User.findOne({ $or: [{ name }, { email }] });
    if (userExists) {
      return res.status(400).json({ message: 'El usuario ya existe en el staff' });
    }

    // Creamos el nuevo miembro con email por defecto para evitar errores de índice
    const newUser = new User({
      name,
      email: email || `${name.toLowerCase().replace(/\s+/g, '')}@rooster.com`,
      role,
      skills,
      phoneToken
    });

    await newUser.save();
    res.status(201).json({ message: 'Miembro del staff agregado con éxito', newUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. Actualizar rol y habilidades
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, skills } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role, skills },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json({ message: 'Perfil actualizado con éxito', updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 5. Eliminar usuario del staff
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json({ message: 'Miembro eliminado correctamente del staff' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
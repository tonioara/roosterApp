const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, restrictToAdmin } = require('../middleware/auth');

// Rutas protegidas: Solo el administrador (Antonio) puede ver y agregar staff
router.get('/', protect, restrictToAdmin, userController.getStaff);
router.post('/', protect, restrictToAdmin, userController.createUser); // Nueva ruta segura
// Modificar y Eliminar requieren los mismos permisos de administrador
router.put('/:id', protect, restrictToAdmin, userController.updateUserRole);
router.delete('/:id', protect, restrictToAdmin, userController.deleteUser);

router.post('/login', userController.login);

module.exports = router;
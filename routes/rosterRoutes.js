const express = require('express');
const router = express.Router();
const rosterController = require('../controllers/rosterController');
const { protect, restrictToAdmin } = require('../middleware/auth');

// Rutas protegidas: Solo administradores/managers pueden generar y crear
//router.post('/', protect, restrictToAdmin, rosterController.createRoster);
router.post('/', rosterController.createRoster);
router.post('/generate',  rosterController.generateAutomaticRoster);

// Rutas protegidas: Cualquier usuario autenticado del staff puede consultar su roster
router.get('/:weekId',  rosterController.getRosterByWeek);

// Ruta para inicializar el staff
router.post('/create-test-users', rosterController.createTestUsers);

module.exports = router;
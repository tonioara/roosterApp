const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');

// Ruta para que el empleado envíe su solicitud de día libre
router.post('/', requestController.createRequest);

// Ruta para que el manager vea las solicitudes pendientes
router.get('/pending', requestController.getPendingRequests);

// Ruta para que el manager apruebe o rechace la solicitud
router.patch('/:requestId/status', requestController.updateRequestStatus);

module.exports = router;
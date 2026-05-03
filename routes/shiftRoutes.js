const express = require('express');
const router = express.Router();
const shiftController = require('../controllers/shiftController');

router.post('/swap', shiftController.swapShifts);

module.exports = router;

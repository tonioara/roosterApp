const express = require('express');
const router = express.Router();
const { protect, restrictToAdmin } = require('../middleware/auth');
const rosterController = require('../controllers/rosterController');

router.post('/', protect, restrictToAdmin, rosterController.createRoster);
router.get('/:weekId', protect, rosterController.getRosterByWeek);
router.post('/generate', protect, restrictToAdmin, rosterController.generateAutomaticRoster);

module.exports = router;

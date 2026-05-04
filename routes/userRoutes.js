const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, restrictToAdmin } = require('../middleware/auth');

router.post('/login', userController.login);
router.post('/select-restaurant', protect, userController.selectRestaurant);
router.post('/change-password', protect, userController.changePassword);
router.get('/', protect, restrictToAdmin, userController.getStaff);
router.post('/', protect, restrictToAdmin, userController.createUser);
router.put('/:id', protect, restrictToAdmin, userController.updateUserRole);
router.delete('/:id', protect, restrictToAdmin, userController.deleteUser);

module.exports = router;

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// 1. Endpoint Publik
router.post('/register', authController.register);
router.post('/login', authController.login);

// 2. Endpoint Privat (Butuh Bearer Token)
router.get('/profile', protect, authController.getProfile);

// Endpoint Baru untuk Select All & Select By ID
router.get('/', protect, authController.getAllUsers);      // GET /api/auth
router.get('/:id', protect, authController.getUserById);  // GET /api/auth/:id

module.exports = router;
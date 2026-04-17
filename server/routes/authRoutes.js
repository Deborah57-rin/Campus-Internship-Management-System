const express = require('express');
const { login, getMe, logout } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { sendHealth } = require('../utils/health');

const router = express.Router();

// Public routes
router.get('/health', sendHealth);
router.post('/login', login);
router.get('/logout', logout);

// Protected routes
router.get('/me', protect, getMe);

module.exports = router;
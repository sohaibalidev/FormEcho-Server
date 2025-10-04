const express = require('express');
const { googleLogin, getMe, logout } = require('../controllers/auth.controller');
const { protect, guest } = require('../middleware/auth.middleware');

const router = express.Router();

// @route   POST /auth/google
// @desc    Google login/register
// @access  Guest only
router.post('/google', guest, googleLogin);

// @route   GET /auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, getMe);

// @route   POST /auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', protect, logout);

module.exports = router;

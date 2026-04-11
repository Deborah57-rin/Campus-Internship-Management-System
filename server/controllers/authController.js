const User = require('../models/User');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { roleFromEmail } = require('../config/roleEmailRules');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database unavailable. Check MongoDB Atlas connection.' });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please add email and password' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    // Set HttpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    });

    const resolvedRole = roleFromEmail(user.email);

    return res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: resolvedRole,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    if (String(err?.message || '').includes('buffering timed out')) {
      return res.status(503).json({ message: 'Database unavailable. Try again in a moment.' });
    }
    return res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database unavailable. Check MongoDB Atlas connection.' });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const resolvedRole = roleFromEmail(user.email);

    return res.status(200).json({ 
      success: true, 
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: resolvedRole
      }
    });
  } catch (err) {
    console.error('GetMe error:', err);
    return res.status(500).json({ message: 'Server error fetching user' });
  }
};

// @desc    Logout user
// @route   GET /api/auth/logout
const logout = async (req, res) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });
    return res.status(200).json({ success: true, data: {} });
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({ message: 'Server error during logout' });
  }
};

module.exports = { login, getMe, logout };
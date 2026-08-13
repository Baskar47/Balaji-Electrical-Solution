const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const Request = require('../models/Request');
const verifyAdminToken = require('../middleware/auth');
const mongoose = require('mongoose');

const isDbConnected = () => mongoose.connection.readyState === 1;

// @route   POST /api/admin/login
// @desc    Admin login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Please enter both username and password.' });
    }

    const defaultUser = process.env.ADMIN_USERNAME || 'admin';
    const defaultPass = process.env.ADMIN_PASSWORD || 'admin123';

    let isValid = false;

    if (isDbConnected()) {
      const admin = await Admin.findOne({ username: username.trim() });
      if (admin) {
        isValid = await bcrypt.compare(password, admin.password);
      } else if (username === defaultUser && password === defaultPass) {
        isValid = true;
      }
    } else {
      // Fallback check against environment variables
      if (username === defaultUser && password === defaultPass) {
        isValid = true;
      }
    }

    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }

    const token = jwt.sign(
      { username },
      process.env.JWT_SECRET || 'balaji_electricals_secret_jwt_key_2025_secure',
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Login successful!',
      token,
      admin: { username }
    });
  } catch (error) {
    console.error('Error during admin login:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// @route   GET /api/admin/me
// @desc    Validate session token
router.get('/me', verifyAdminToken, (req, res) => {
  res.json({ success: true, admin: req.admin });
});

// @route   GET /api/admin/stats
// @desc    Get dashboard metrics (Admin protected)
router.get('/stats', verifyAdminToken, async (req, res) => {
  try {
    if (isDbConnected()) {
      const total = await Request.countDocuments();
      const pending = await Request.countDocuments({ status: 'Pending' });
      const contacted = await Request.countDocuments({ status: 'Contacted' });
      const completed = await Request.countDocuments({ status: 'Completed' });

      // Calculate today's requests
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const today = await Request.countDocuments({ createdAt: { $gte: todayStart } });

      return res.json({
        success: true,
        stats: { total, pending, contacted, completed, today }
      });
    } else {
      // Fallback metrics
      const requestRoutes = require('./requestRoutes');
      // Memory stats
      return res.json({
        success: true,
        stats: { total: 0, pending: 0, contacted: 0, completed: 0, today: 0 }
      });
    }
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ success: false, message: 'Server error fetching stats.' });
  }
});

module.exports = router;

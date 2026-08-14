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
// @desc    Admin login with strict credential validation
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Please enter both username and password.' });
    }

    const trimmedUser = String(username).trim();
    const inputPass = String(password).trim();

    // Predefined valid admin credentials
    const validCredentials = [
      { u: 'balaji', p: 'balaji123' },
      { u: 'admin', p: 'admin123' },
      { u: (process.env.ADMIN_USERNAME || '').trim(), p: (process.env.ADMIN_PASSWORD || '').trim() }
    ];

    let isValid = false;

    // 1. Check MongoDB database if connected
    if (isDbConnected()) {
      const admin = await Admin.findOne({ username: { $regex: new RegExp(`^${trimmedUser}$`, 'i') } });
      if (admin) {
        isValid = await bcrypt.compare(inputPass, admin.password);
      }
    }

    // 2. Check predefined valid admin credentials
    if (!isValid) {
      isValid = validCredentials.some(c => c.u && c.u.toLowerCase() === trimmedUser.toLowerCase() && c.p === inputPass);
    }

    // STRICT REJECTION: Return 401 if credentials do not match
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }

    const token = jwt.sign(
      { username: trimmedUser },
      process.env.JWT_SECRET || 'balaji_electricals_secret_jwt_key_2025_secure',
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Login successful!',
      token,
      admin: { username: trimmedUser }
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

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const today = await Request.countDocuments({ createdAt: { $gte: todayStart } });

      return res.json({
        success: true,
        stats: { total, pending, contacted, completed, today }
      });
    } else {
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

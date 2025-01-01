const express = require('express');
const router = express.Router();
const User = require('../models/user');
const OTP = require('../models/otp');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const smsService = require('../services/smsService');
const config = require('../config/config');
const { validateRegistration, validateLogin } = require('../middleware/validators');
const { authenticateToken } = require('../middleware/auth');

// Register
router.post('/register', validateRegistration, async (req, res) => {
  const { name, email, password, mobileNumber: mobile_number, referenceCode } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { mobile_number }]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists with this email or mobile number'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      mobile_number,
      referenceCode,
      status: 'pending_verification'
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile_number: user.mobile_number,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login
router.post('/login', validateLogin, async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check if user is verified
    if (user.status !== 'active') {
      return res.status(403).json({
        error: 'Account not verified',
        status: user.status
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile_number: user.mobile_number,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Send OTP
router.post('/send-otp', async (req, res) => {
  const { mobileNumber: mobile_number } = req.body;

  try {
    // Check if we've sent too many OTPs recently
    const recentOTPs = await OTP.count({
      where: {
        mobile_number,
        created_at: {
          [Op.gt]: new Date(Date.now() - 60 * 60 * 1000) // Last hour
        }
      }
    });

    if (recentOTPs >= 5) {
      return res.status(429).json({
        error: 'Too many OTP requests. Please try again later.'
      });
    }

    // Send OTP via SMS service
    const { otp } = await smsService.sendOTP(mobile_number);
    
    // Store OTP in database
    await OTP.create({
      mobile_number,
      otp: await bcrypt.hash(otp.toString(), 10), // Hash OTP before storing
      expires_at: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
    });

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  const { mobileNumber: mobile_number, otp } = req.body;

  try {
    const otpRecord = await OTP.findOne({
      where: {
        mobile_number,
        expires_at: {
          [Op.gt]: new Date()
        }
      },
      order: [['created_at', 'DESC']]
    });

    if (!otpRecord) {
      return res.status(400).json({ error: 'OTP expired. Please request a new one.' });
    }

    const isValidOTP = await bcrypt.compare(otp.toString(), otpRecord.otp);
    if (!isValidOTP) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Delete all OTPs for this number
    await OTP.destroy({
      where: { mobile_number }
    });

    // Update user status if exists
    await User.update(
      { status: 'active' },
      { where: { mobile_number } }
    );

    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// Get User Profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Profile Error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update Profile
router.put('/profile', authenticateToken, async (req, res) => {
  const { name, email } = req.body;

  try {
    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile_number: user.mobile_number,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;

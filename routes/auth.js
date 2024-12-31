const express = require('express');
const router = express.Router();
const User = require('../models/user');
const OTP = require('../models/otp'); // Assuming OTP model is defined in '../models/otp.js'
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize'); // Import Op from sequelize

// Register
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, 'vendor');
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Send OTP
router.post('/send-otp', async (req, res) => {
  const { mobileNumber } = req.body;

  try {
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in database with expiry (15 minutes)
    await OTP.create({
      mobileNumber,
      otp,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes from now
    });

    // In production, integrate with SMS service provider
    // For development, just return success
    res.json({ message: 'OTP sent successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  const { mobileNumber, otp } = req.body;

  try {
    const otpRecord = await OTP.findOne({
      where: {
        mobileNumber,
        otp,
        expiresAt: {
          [Op.gt]: new Date() // Not expired
        }
      }
    });

    if (!otpRecord) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Delete the OTP record
    await otpRecord.destroy();

    res.json({ message: 'OTP verified successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

module.exports = router;

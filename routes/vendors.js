const express = require('express');
const router = express.Router();
const Vendor = require('../models/vendor');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const { authenticateToken } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix);
  }
});
const upload = multer({ storage: storage });

router.get('/', authenticateToken, async (req, res) => {
  try {
    const vendors = await Vendor.findAll();
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  const { name, email, password, mobileNumber } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const vendor = await Vendor.create({ name, email, password: hashedPassword, mobileNumber });
    res.status(201).json(vendor);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const existingFile = await Vendor.findOne({ where: { fileName: file.filename } });
    if (existingFile) {
      return res.status(400).json({ error: 'Duplicate file upload' });
    }

    await Vendor.create({ fileName: file.filename, filePath: file.path });

    res.status(201).json({ message: 'File uploaded successfully', file });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;



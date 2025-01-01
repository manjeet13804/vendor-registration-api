const express = require('express');
const cors = require('cors');
const sequelize = require('./models/database');
const vendorRoutes = require('./routes/vendors');
const authRoutes = require('./routes/auth');
const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all routes
app.use(cors({
  origin: true, // Reflects the request origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true
}));

app.use(express.json());

app.use('/api/vendors', vendorRoutes);
app.use('/api/auth', authRoutes);

sequelize.sync()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => console.log('Error connecting to the database:', err));

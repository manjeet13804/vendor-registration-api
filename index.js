const express = require('express');
const sequelize = require('./models/database');
const vendorRoutes = require('./routes/vendors');
const authRoutes = require('./routes/auth');
const app = express();
const PORT = process.env.PORT || 5000;

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

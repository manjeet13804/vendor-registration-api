const sequelize = require('./database');
const User = require('./user');
const OTP = require('./otp');

const initializeDatabase = async () => {
  try {
    // Drop existing tables and recreate them
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await sequelize.sync({ force: true });
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('Database tables created successfully');

    // Create default admin user
    await User.create({
      name: 'Admin User',
      email: 'admin@indiazona.com',
      mobileNumber: '+919999999999',
      password: '$2a$10$YourHashedPasswordHere', // Replace with actual hashed password
      role: 'admin',
      status: 'active'
    });

    console.log('Default admin user created');
  } catch (error) {
    console.error('Database initialization error:', error);
    process.exit(1);
  }
};

// Run initialization
if (require.main === module) {
  initializeDatabase();
}

module.exports = initializeDatabase;

const { Sequelize } = require('sequelize');
const config = require('../config/config');

const sequelize = new Sequelize(config.database.name, config.database.username, config.database.password, {
  host: config.database.host,
  dialect: 'mysql',
  logging: console.log,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    timestamps: true,
    underscored: true
  }
});

// Test the connection
sequelize
  .authenticate()
  .then(() => {
    console.log('Database connection established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

// Sync all models
// Note: In production, you should use migrations instead of sync
const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true }); // This will update existing tables
    console.log('Database synced successfully');
  } catch (error) {
    console.error('Error syncing database:', error);
  }
};

syncDatabase();

module.exports = sequelize;

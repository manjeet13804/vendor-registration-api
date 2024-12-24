const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Vendor = sequelize.define('Vendor', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  mobileNumber: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

module.exports = Vendor;

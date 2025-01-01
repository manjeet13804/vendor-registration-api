const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Vendor = sequelize.define('vendors', {
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
  mobile_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      is: /^\+91[0-9]{10}$/
    }
  },
  status: {
    type: DataTypes.ENUM('pending_verification', 'active', 'suspended'),
    defaultValue: 'pending_verification'
  },
  reference_code: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  underscored: true,
  timestamps: true
});

module.exports = Vendor;

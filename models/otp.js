const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const OTP = sequelize.define('OTP', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  mobile_number: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      is: /^\+91[0-9]{10}$/
    }
  },
  otp: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('registration', 'login', 'reset_password', 'update_mobile'),
    allowNull: false,
    defaultValue: 'registration'
  },
  attempts: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  verified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'otps',
  underscored: true,
  timestamps: true,
  indexes: [
    {
      fields: ['mobile_number']
    },
    {
      fields: ['expires_at']
    },
    {
      fields: ['verified']
    }
  ]
});

// Instance methods
OTP.prototype.isExpired = function() {
  return Date.now() >= this.expires_at;
};

OTP.prototype.incrementAttempts = async function() {
  this.attempts += 1;
  await this.save();
  return this.attempts;
};

// Hooks for cleanup
OTP.addHook('afterCreate', async (otp) => {
  // Delete all previous unverified OTPs for this number
  await OTP.destroy({
    where: {
      mobile_number: otp.mobile_number,
      verified: false,
      id: { [sequelize.Sequelize.Op.ne]: otp.id }
    }
  });
});

// Cleanup expired OTPs periodically
setInterval(async () => {
  try {
    await OTP.destroy({
      where: {
        [sequelize.Sequelize.Op.or]: [
          { expires_at: { [sequelize.Sequelize.Op.lt]: new Date() } },
          { verified: true, created_at: { [sequelize.Sequelize.Op.lt]: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
        ]
      }
    });
  } catch (error) {
    console.error('OTP cleanup error:', error);
  }
}, 60 * 60 * 1000); // Run every hour

module.exports = OTP;

const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      len: [2, 50]
    }
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: {
      name: 'users_email',
      msg: 'This email is already registered'
    },
    validate: {
      isEmail: true,
      len: [5, 100]
    }
  },
  mobileNumber: {
    type: DataTypes.STRING(13),
    allowNull: false,
    unique: {
      name: 'users_mobile',
      msg: 'This mobile number is already registered'
    },
    validate: {
      is: /^\+91[0-9]{10}$/
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('vendor', 'admin'),
    defaultValue: 'vendor'
  },
  status: {
    type: DataTypes.ENUM('pending_verification', 'active', 'suspended', 'blocked'),
    defaultValue: 'pending_verification'
  },
  referenceCode: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  businessName: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  businessType: {
    type: DataTypes.ENUM('retail', 'wholesale', 'manufacturing', 'service'),
    allowNull: true
  },
  gstNumber: {
    type: DataTypes.STRING(15),
    allowNull: true,
    validate: {
      is: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
    }
  },
  panNumber: {
    type: DataTypes.STRING(10),
    allowNull: true,
    validate: {
      is: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
    }
  },
  aadhaarNumber: {
    type: DataTypes.STRING(12),
    allowNull: true,
    validate: {
      is: /^[0-9]{12}$/
    }
  },
  address: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  bankDetails: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  kycStatus: {
    type: DataTypes.ENUM('pending', 'submitted', 'verified', 'rejected'),
    defaultValue: 'pending'
  },
  kycDocuments: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  profileImage: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  lastLoginAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  loginAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lockUntil: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'users',
  underscored: true,
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      unique: true,
      fields: ['email'],
      name: 'users_email'
    },
    {
      unique: true,
      fields: ['mobile_number'],
      name: 'users_mobile'
    },
    {
      fields: ['status']
    },
    {
      fields: ['role']
    }
  ]
});

// Instance methods
User.prototype.isLocked = function() {
  return Boolean(this.lockUntil && this.lockUntil > Date.now());
};

// Hooks
User.beforeCreate(async (user) => {
  if (user.email) {
    user.email = user.email.toLowerCase();
  }
});

User.beforeUpdate(async (user) => {
  if (user.email) {
    user.email = user.email.toLowerCase();
  }
});

module.exports = User;

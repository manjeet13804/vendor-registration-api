require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,

  // Database Configuration
  database: {
    url: process.env.DATABASE_URL || 'mysql://root:123456@localhost:3306/vendors',
    dialect: 'mysql',
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },

  // JWT Configuration
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiresIn: '7d',
  
  // SMS Gateway Configuration (MSG91)
  sms: {
    apiKey: process.env.MSG91_API_KEY,
    senderId: process.env.MSG91_SENDER_ID,
    templates: {
      registration: process.env.MSG91_REGISTRATION_TEMPLATE,
      login: process.env.MSG91_LOGIN_TEMPLATE,
      resetPassword: process.env.MSG91_RESET_PASSWORD_TEMPLATE
    }
  },

  // Email Configuration
  email: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    from: process.env.EMAIL_FROM || 'no-reply@indiazona.com'
  },

  // AWS S3 Configuration for file uploads
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'ap-south-1',
    bucket: process.env.AWS_BUCKET
  },

  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  },

  // OTP Configuration
  otp: {
    length: 6,
    expiresIn: 15 * 60 * 1000, // 15 minutes
    maxAttempts: 3,
    cooldownTime: 60 * 60 * 1000 // 1 hour
  }
};

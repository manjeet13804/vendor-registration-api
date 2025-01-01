const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/user');

async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided.' 
      });
    }

    // Check if token follows Bearer scheme
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Invalid token format. Use Bearer scheme.' 
      });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      
      // Check if user still exists and is active
      const user = await User.findOne({
        where: { 
          id: decoded.userId,
          status: 'active'
        }
      });

      if (!user) {
        return res.status(401).json({ 
          error: 'User no longer exists or is inactive' 
        });
      }

      req.user = decoded;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          error: 'Token has expired. Please log in again.' 
        });
      }
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          error: 'Invalid token. Please log in again.' 
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    res.status(500).json({ 
      error: 'Internal server error during authentication' 
    });
  }
}

// Optional: Middleware to check specific roles
function requireRole(roles) {
  return async (req, res, next) => {
    try {
      const user = await User.findByPk(req.user.userId);
      
      if (!user) {
        return res.status(404).json({ 
          error: 'User not found' 
        });
      }

      if (!roles.includes(user.role)) {
        return res.status(403).json({ 
          error: 'Access denied. Insufficient permissions.' 
        });
      }

      next();
    } catch (error) {
      console.error('Role Check Error:', error);
      res.status(500).json({ 
        error: 'Internal server error while checking permissions' 
      });
    }
  };
}

module.exports = { 
  authenticateToken,
  requireRole
};

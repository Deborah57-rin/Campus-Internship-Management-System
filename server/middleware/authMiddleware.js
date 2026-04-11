const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { roleFromEmail } = require('../config/roleEmailRules');

const protect = async (req, res, next) => {
  let token;

  // Check for token in cookies
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized to access this route' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const dbUser = await User.findById(decoded.id);
    if (!dbUser) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    // Override role using hardcoded email rules so authorization matches product requirements.
    const mappedRole = roleFromEmail(dbUser.email);
    req.user = { ...dbUser.toObject(), role: mappedRole };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// Role Authorization Middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `User role '${req.user.role}' is not authorized to access this route` 
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
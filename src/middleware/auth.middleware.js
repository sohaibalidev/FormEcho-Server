const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.attachUser = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      req.user = null;
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      req.user = user || null;
      return next();
    } catch (error) {
      req.user = null; // invalid or expired token
      return next();
    }
  } catch (error) {
    console.error('Error in attachUser middleware:', error);
    req.user = null;
    next();
  }
};

exports.protect = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized',
    });
  }
  next();
};

exports.guest = (req, res, next) => {
  if (req.user) {
    return res.status(403).json({
      success: false,
      message: 'Already authenticated, guests only',
    });
  }
  next();
};

exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Not authorized as admin',
  });
};

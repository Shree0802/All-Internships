const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Read token from HTTP-only Cookie or Authorization Header
  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token missing. Please log in.',
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'shopsphere_super_secret_jwt_key_2026_codealpha';
    const decoded = jwt.verify(token, secret);
    req.user = await User.findById(decoded.userId).select('-password');
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User account not found.',
      });
    }
    next();
  } catch (error) {
    console.error('JWT verification error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Token verification failed or expired. Please log in again.',
    });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Forbidden: Admin privilege required.',
    });
  }
};

module.exports = { protect, admin };

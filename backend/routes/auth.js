const express = require('express');
const rateLimit = require('express-rate-limit');
const { authenticateToken } = require('../middleware/auth');
const { 
  validateRegistration, 
  validateLogin, 
  handleValidationErrors 
} = require('../middleware/validation');
const {
  register,
  login,
  refreshToken,
  logout,
  logoutAll,
  getProfile
} = require('../controllers/authControllers');

const router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // more lenient for refresh
  message: {
    success: false,
    message: 'Too many token refresh attempts, please try again later'
  }
});

// Public routes
router.post('/register', 
  authLimiter,
  validateRegistration,
  handleValidationErrors,
  register
);

router.post('/login',
  authLimiter,
  validateLogin,
  handleValidationErrors,
  login
);

router.post('/refresh-token',
  refreshLimiter,
  refreshToken
);

router.post('/logout', logout);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.post('/logout-all', authenticateToken, logoutAll);

module.exports = router;
const express = require('express');
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  updatePassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate, authSchemas } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.post('/register', validate(authSchemas.register), register);
router.post('/login', validate(authSchemas.login), login);

// Protected routes
router.use(protect); // All routes after this middleware are protected

router.post('/logout', logout);
router.get('/me', getMe);
router.put('/profile', updateProfile);
router.put('/password', updatePassword);

module.exports = router;

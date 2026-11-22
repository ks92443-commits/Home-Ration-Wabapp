const express = require('express');
const router = express.Router();
const { register, login, logout, refreshToken, getProfile, updateProfile, changePassword } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

router.post('/register', validate(schemas.register), register);
router.post('/login', validate(schemas.login), login);
router.post('/logout', authenticate, logout);
router.post('/refresh', validate(schemas.refreshToken), refreshToken);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, validate(schemas.updateProfile), updateProfile);
router.put('/password', authenticate, validate(schemas.changePassword), changePassword);

module.exports = router;
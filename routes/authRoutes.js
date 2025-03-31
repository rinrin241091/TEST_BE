// Routes liên quan đến đăng kí, đăng nhập
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Routes công khai
router.post('/register', authController.register);
router.post('/login', authController.login);

// Routes yêu cầu xác thực
router.get('/me', verifyToken, authController.getCurrentUser);

module.exports = router;

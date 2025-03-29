// Routes liên quan đến đăng kí, đăng nhập
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Đăng ký người dùng
router.post('/register', authController.register);

// Đăng nhập người dùng
router.post('/login', authController.login);

// Kiểm tra role và trả về thông tin người dùng
router.get('/me', verifyToken, authController.getUserInfo);

module.exports = router;

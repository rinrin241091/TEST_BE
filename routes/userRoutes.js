// Routes quản lí người dùng
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Lấy danh sách người dùng
router.get('/users', authMiddleware, roleMiddleware(['admin']), userController.getUsers);

// Xem chi tiết người dùng
router.get('/users/:id', authMiddleware, roleMiddleware(['admin']), userController.getUserById);

// Cập nhật vai trò người dùng
router.put('/users/:id/role', authMiddleware, roleMiddleware(['admin']), userController.updateUserRole);

// Xóa người dùng
router.delete('/users/:id', authMiddleware, roleMiddleware(['admin']), userController.deleteUser);

module.exports = router;

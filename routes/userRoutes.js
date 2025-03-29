// Routes quản lí người dùng
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

// Tất cả các routes đều yêu cầu xác thực và quyền admin
router.use(verifyToken, isAdmin);

// Lấy danh sách tất cả người dùng
router.get('/', userController.getAllUsers);

// Lấy thông tin chi tiết một người dùng
router.get('/:id', userController.getUserById);

// Cập nhật thông tin người dùng
router.put('/:id', userController.updateUser);

// Xóa người dùng
router.delete('/:id', userController.deleteUser);

// Đổi mật khẩu người dùng
router.put('/:id/change-password', userController.changePassword);

module.exports = router;

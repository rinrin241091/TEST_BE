// Routes quản lí người dùng
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, isAdmin, isTeacher } = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');

// Cấu hình multer cho upload avatar
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/avatars');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Not an image! Please upload an image.'), false);
        }
    }
});

// Middleware để check quyền admin hoặc teacher
const isAdminOrTeacher = (req, res, next) => {
    if (req.userRole === 'admin' || req.userRole === 'teacher') {
        next();
    } else {
        res.status(403).json({ message: 'Không có quyền truy cập' });
    }
};

// Public routes (có xác thực token)
router.use(verifyToken);

// Routes cho admin
router.get('/', isAdmin, userController.getAllUsers);
router.post('/', isAdmin, userController.createUser);
router.get('/:id', isAdmin, userController.getUserById);
router.put('/:id', isAdmin, userController.updateUser);
router.delete('/:id', isAdmin, userController.deleteUser);
router.get('/:id/activities', isAdmin, userController.getUserActivities);

// Routes cho admin và teacher
router.get('/students', isAdminOrTeacher, userController.getAllUsers); // Với role=student

// Routes cho user đã đăng nhập (tự quản lý thông tin của mình)
router.put('/:id/avatar', upload.single('avatar'), userController.uploadAvatar);
router.put('/:id/change-password', userController.changePassword);

// Error handling cho multer
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                message: 'File quá lớn. Kích thước tối đa là 5MB'
            });
        }
    }
    if (error.message === 'Not an image! Please upload an image.') {
        return res.status(400).json({
            message: 'Chỉ chấp nhận file hình ảnh'
        });
    }
    next(error);
});

module.exports = router;

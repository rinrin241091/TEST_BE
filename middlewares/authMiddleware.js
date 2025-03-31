// Kiểm tra JWT token và phân quyền
const jwt = require('jsonwebtoken');
const db = require('../config/database');
require('dotenv').config();

// Verify JWT token
exports.verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'Không tìm thấy token xác thực' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Kiểm tra user có tồn tại và không bị khóa
        const [user] = await db.query(
            'SELECT user_id, role, status FROM Users WHERE user_id = ?',
            [decoded.userId]
        );

        if (user.length === 0) {
            return res.status(401).json({ message: 'User không tồn tại' });
        }

        if (user[0].status === 'INACTIVE') {
            return res.status(403).json({ message: 'Tài khoản đã bị khóa' });
        }

        // Cập nhật last_active
        await db.query(
            'UPDATE Users SET last_active = NOW() WHERE user_id = ?',
            [decoded.userId]
        );

        // Thêm thông tin user vào request
        req.userId = decoded.userId;
        req.userRole = user[0].role;
        
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token đã hết hạn' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Token không hợp lệ' });
        }
        console.error('Error in verifyToken:', error);
        res.status(500).json({ message: 'Lỗi xác thực token', error: error.message });
    }
};

// Check admin role
exports.isAdmin = (req, res, next) => {
    if (req.userRole !== 'admin') {
        return res.status(403).json({ message: 'Yêu cầu quyền admin' });
    }
    next();
};

// Check teacher role
exports.isTeacher = (req, res, next) => {
    if (req.userRole !== 'teacher') {
        return res.status(403).json({ message: 'Yêu cầu quyền teacher' });
    }
    next();
};

// Check student role
exports.isStudent = (req, res, next) => {
    if (req.userRole !== 'student') {
        return res.status(403).json({ message: 'Yêu cầu quyền student' });
    }
    next();
};

// Check owner or admin
exports.isOwnerOrAdmin = async (req, res, next) => {
    const resourceId = req.params.id;
    
    if (req.userRole === 'admin') {
        return next();
    }
    
    if (req.userId === parseInt(resourceId)) {
        return next();
    }
    
    res.status(403).json({ message: 'Không có quyền truy cập' });
};

// Log user activity
exports.logActivity = async (activityType, description) => {
    try {
        await db.query(
            'INSERT INTO UserActivities (user_id, activity_type, description, created_at) VALUES (?, ?, ?, NOW())',
            [req.userId, activityType, description]
        );
    } catch (error) {
        console.error('Error logging activity:', error);
    }
};

module.exports = {
    verifyToken,
    isAdmin,
    isTeacher,
    isStudent,
    isOwnerOrAdmin,
    logActivity
};
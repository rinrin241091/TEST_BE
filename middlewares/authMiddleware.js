// Kiểm tra JWT token và phân quyền
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware xác thực token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Không tìm thấy token xác thực' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token không hợp lệ' });
    }
};

// Middleware kiểm tra role admin
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Không có quyền truy cập' });
    }
};

// Middleware kiểm tra role giảng viên
const isTeacher = (req, res, next) => {
    if (req.user && (req.user.role === 'teacher' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({ message: 'Không có quyền truy cập' });
    }
};

module.exports = {
    verifyToken,
    isAdmin,
    isTeacher
};
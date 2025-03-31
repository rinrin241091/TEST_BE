// Kiểm tra JWT token và phân quyền
const jwt = require('jsonwebtoken');
const db = require('../config/database');
require('dotenv').config();

// Middleware xác thực token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        req.userRole = decoded.role;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

// Middleware kiểm tra role admin
const isAdmin = (req, res, next) => {
    if (req.userRole !== 'admin') {
        return res.status(403).json({ message: 'Requires admin role' });
    }
    next();
};

// Middleware kiểm tra role giảng viên
const isTeacher = (req, res, next) => {
    if (req.userRole !== 'teacher') {
        return res.status(403).json({ message: 'Requires teacher role' });
    }
    next();
};

// Middleware kiểm tra role sinh viên
const isStudent = (req, res, next) => {
    if (req.userRole !== 'student') {
        return res.status(403).json({ message: 'Requires student role' });
    }
    next();
};

module.exports = {
    verifyToken,
    isAdmin,
    isTeacher,
    isStudent
};
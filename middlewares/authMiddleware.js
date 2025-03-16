// Kiểm tra JWT token và phân quyền
const jwt = require('jsonwebtoken');
require('dotenv').config();

//Middle xác thực người dùng dựa trên JWT
const authMiddle = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token)
        return res.status(401).json({ message: 'Không có token, từ chối truy cập' });
    try {
        const decoded = jwt.verify(token.replace('Bearer', ''), process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ message: 'Token không hợp lệ'});
    }
};

module.exports = authMiddleware;
// Xử lí đăng kí, đăng nhập
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Đăng ký người dùng
exports.register = async (req, res) => {
    const { username, email, password, role } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.query(
            'INSERT INTO Users (username, email, password, role) VALUES (?, ?, ?, ?)',
            [username, email, hashedPassword, role]
        );
        res.json({ message: 'Đăng ký thành công', user_id: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi đăng ký', error });
    }
};

// Đăng nhập người dùng
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [user] = await db.query('SELECT * FROM Users WHERE email = ?', [email]);

        if (user.length === 0) {
            return res.status(400).json({ message: 'Email hoặc mật khẩu không chính xác' });
        }

        const isMatch = await bcrypt.compare(password, user[0].password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Email hoặc mật khẩu không chính xác' });
        }

        const token = jwt.sign({ user_id: user[0].user_id, role: user[0].role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        
        // Trả về thông tin role để frontend có thể điều hướng
        res.json({ 
            message: 'Đăng nhập thành công', 
            token,
            user: {
                id: user[0].user_id,
                username: user[0].username,
                email: user[0].email,
                role: user[0].role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi đăng nhập', error });
    }
};

// Lấy thông tin người dùng và role
exports.getUserInfo = async (req, res) => {
    try {
        const [user] = await db.query('SELECT user_id, username, email, role FROM Users WHERE user_id = ?', [req.user.user_id]);
        
        if (user.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        res.json({
            user: {
                id: user[0].user_id,
                username: user[0].username,
                email: user[0].email,
                role: user[0].role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy thông tin người dùng', error });
    }
};

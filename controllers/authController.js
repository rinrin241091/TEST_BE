// Xử lí đăng kí, đăng nhập
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Đăng ký tài khoản
exports.register = async (req, res) => {
    try {
        console.log('Register request received:', req.body);
        
        const { username, email, password, role } = req.body;
        
        // Validate input
        if (!username || !email || !password) {
            console.log('Missing required fields');
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Kiểm tra email tồn tại
        const [existingUser] = await db.query(
            'SELECT * FROM Users WHERE email = ?',
            [email]
        );

        if (existingUser.length > 0) {
            console.log('User already exists:', email);
            return res.status(400).json({ message: 'Email đã được sử dụng' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Thêm user mới
        const [result] = await db.query(
            'INSERT INTO Users (username, email, password, role) VALUES (?, ?, ?, ?)',
            [username, email, hashedPassword, role || 'user']
        );

        console.log('User created successfully:', result.insertId);

        // Tạo token
        const token = jwt.sign(
            { userId: result.insertId, role: role || 'user' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Đăng ký thành công',
            token,
            user: {
                id: result.insertId,
                username,
                email,
                role: role || 'user',
                created_at: new Date(),
                updated_at: new Date()
            }
        });
    } catch (error) {
        console.error('Error in register:', error);
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
};

// Đăng nhập
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
        }

        // Kiểm tra user tồn tại
        const [users] = await db.query(
            'SELECT * FROM Users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
        }

        const user = users[0];

        // Kiểm tra password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
        }

        // Tạo token
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Đăng nhập thành công',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                created_at: user.created_at,
                updated_at: user.updated_at
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// Lấy thông tin user hiện tại
exports.getCurrentUser = async (req, res) => {
    try {
        const [user] = await db.query(
            'SELECT id, username, email, role, created_at, updated_at FROM Users WHERE id = ?',
            [req.user.userId]
        );

        if (user.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        res.json(user[0]);
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

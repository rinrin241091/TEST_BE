// Quản lí tài khoản người dùng

const db = require('../config/db');
const bcrypt = require('bcryptjs');

// Lấy danh sách người dùng có phân trang và tìm kiếm
exports.getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const role = req.query.role;
        const offset = (page - 1) * limit;

        let query = 'SELECT user_id, username, email, role, created_at, last_login FROM Users WHERE 1=1';
        let countQuery = 'SELECT COUNT(*) as total FROM Users WHERE 1=1';
        const params = [];

        if (search) {
            query += ' AND (username LIKE ? OR email LIKE ?)';
            countQuery += ' AND (username LIKE ? OR email LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        if (role) {
            query += ' AND role = ?';
            countQuery += ' AND role = ?';
            params.push(role);
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const [[{ total }]] = await db.query(countQuery, params.slice(0, -2));
        const [users] = await db.query(query, params);

        res.json({
            users,
            pagination: {
                total,
                page,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error in getAllUsers:', error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách người dùng', error: error.message });
    }
};

// Lấy thông tin chi tiết một người dùng
exports.getUserById = async (req, res) => {
    try {
        const [user] = await db.query('SELECT user_id, username, email, role FROM Users WHERE user_id = ?', [req.params.id]);
        
        if (user.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }
        
        res.json(user[0]);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy thông tin người dùng', error });
    }
};

// Tạo mới người dùng
exports.createUser = async (req, res) => {
    const { username, email, password, role } = req.body;

    try {
        // Kiểm tra email tồn tại
        const [existingUser] = await db.query('SELECT * FROM Users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'Email đã được sử dụng' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo user mới
        const [result] = await db.query(
            'INSERT INTO Users (username, email, password, role, created_at) VALUES (?, ?, ?, ?, NOW())',
            [username, email, hashedPassword, role]
        );

        // Log activity
        await db.query(
            'INSERT INTO UserActivities (user_id, activity_type, description, created_at) VALUES (?, ?, ?, NOW())',
            [req.userId, 'CREATE_USER', `Created new user: ${username}`]
        );

        res.status(201).json({
            message: 'Tạo người dùng thành công',
            userId: result.insertId
        });
    } catch (error) {
        console.error('Error in createUser:', error);
        res.status(500).json({ message: 'Lỗi khi tạo người dùng', error: error.message });
    }
};

// Cập nhật thông tin người dùng
exports.updateUser = async (req, res) => {
    const { username, email, role, status } = req.body;
    const userId = req.params.id;

    try {
        // Kiểm tra email đã tồn tại chưa (trừ user hiện tại)
        const [existingUser] = await db.query(
            'SELECT * FROM Users WHERE email = ? AND user_id != ?',
            [email, userId]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'Email đã được sử dụng' });
        }

        await db.query(
            'UPDATE Users SET username = ?, email = ?, role = ?, status = ?, updated_at = NOW() WHERE user_id = ?',
            [username, email, role, status, userId]
        );

        // Log activity
        await db.query(
            'INSERT INTO UserActivities (user_id, activity_type, description, created_at) VALUES (?, ?, ?, NOW())',
            [req.userId, 'UPDATE_USER', `Updated user: ${username}`]
        );

        res.json({ message: 'Cập nhật thông tin thành công' });
    } catch (error) {
        console.error('Error in updateUser:', error);
        res.status(500).json({ message: 'Lỗi khi cập nhật thông tin', error: error.message });
    }
};

// Xóa người dùng
exports.deleteUser = async (req, res) => {
    const userId = req.params.id;
    
    try {
        // Get user info before delete
        const [user] = await db.query('SELECT username FROM Users WHERE user_id = ?', [userId]);
        if (user.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        // Soft delete user
        await db.query(
            'UPDATE Users SET status = "DELETED", deleted_at = NOW() WHERE user_id = ?',
            [userId]
        );

        // Log activity
        await db.query(
            'INSERT INTO UserActivities (user_id, activity_type, description, created_at) VALUES (?, ?, ?, NOW())',
            [req.userId, 'DELETE_USER', `Deleted user: ${user[0].username}`]
        );

        res.json({ message: 'Xóa người dùng thành công' });
    } catch (error) {
        console.error('Error in deleteUser:', error);
        res.status(500).json({ message: 'Lỗi khi xóa người dùng', error: error.message });
    }
};

// Lấy lịch sử hoạt động của người dùng
exports.getUserActivities = async (req, res) => {
    const userId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        const [[{ total }]] = await db.query(
            'SELECT COUNT(*) as total FROM UserActivities WHERE user_id = ?',
            [userId]
        );

        const [activities] = await db.query(
            `SELECT * FROM UserActivities 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?`,
            [userId, limit, offset]
        );

        res.json({
            activities,
            pagination: {
                total,
                page,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error in getUserActivities:', error);
        res.status(500).json({ message: 'Lỗi khi lấy lịch sử hoạt động', error: error.message });
    }
};

// Upload avatar
exports.uploadAvatar = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Không tìm thấy file upload' });
    }

    const userId = req.params.id;
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    try {
        await db.query(
            'UPDATE Users SET avatar_url = ?, updated_at = NOW() WHERE user_id = ?',
            [avatarUrl, userId]
        );

        res.json({
            message: 'Upload avatar thành công',
            avatarUrl
        });
    } catch (error) {
        console.error('Error in uploadAvatar:', error);
        res.status(500).json({ message: 'Lỗi khi upload avatar', error: error.message });
    }
};

// Đổi mật khẩu người dùng
exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.params.id;

    try {
        // Kiểm tra mật khẩu hiện tại
        const [user] = await db.query('SELECT password FROM Users WHERE user_id = ?', [userId]);
        if (user.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user[0].password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });
        }

        // Hash và cập nhật mật khẩu mới
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.query(
            'UPDATE Users SET password = ?, updated_at = NOW() WHERE user_id = ?',
            [hashedPassword, userId]
        );

        // Log activity
        await db.query(
            'INSERT INTO UserActivities (user_id, activity_type, description, created_at) VALUES (?, ?, ?, NOW())',
            [userId, 'CHANGE_PASSWORD', 'Changed password']
        );

        res.json({ message: 'Đổi mật khẩu thành công' });
    } catch (error) {
        console.error('Error in changePassword:', error);
        res.status(500).json({ message: 'Lỗi khi đổi mật khẩu', error: error.message });
    }
};
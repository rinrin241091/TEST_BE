// Quản lí tài khoản người dùng

const db = require('../config/db');
const bcrypt = require('bcryptjs');

// Lấy danh sách tất cả người dùng
exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await db.query('SELECT user_id, username, email, role FROM Users');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách người dùng', error });
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

// Cập nhật thông tin người dùng
exports.updateUser = async (req, res) => {
    const { username, email, role } = req.body;
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
            'UPDATE Users SET username = ?, email = ?, role = ? WHERE user_id = ?',
            [username, email, role, userId]
        );

        res.json({ message: 'Cập nhật thông tin thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật thông tin', error });
    }
};

// Xóa người dùng
exports.deleteUser = async (req, res) => {
    try {
        await db.query('DELETE FROM Users WHERE user_id = ?', [req.params.id]);
        res.json({ message: 'Xóa người dùng thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa người dùng', error });
    }
};

// Đổi mật khẩu người dùng
exports.changePassword = async (req, res) => {
    const { newPassword } = req.body;
    const userId = req.params.id;

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.query(
            'UPDATE Users SET password = ? WHERE user_id = ?',
            [hashedPassword, userId]
        );
        res.json({ message: 'Đổi mật khẩu thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi đổi mật khẩu', error });
    }
};
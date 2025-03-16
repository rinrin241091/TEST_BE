// Quản lí tài khoản người dùng

const db = require('../config/db');
const bcrypt = require('bcryptjs');

//lấy danh sách người dùng
exports.getUsers = async (req, res) => {
    try {
        const [users] = await db.query('SELECT user_id, username, email, role, created_at FROM Users');
        res.json(users);
    }   catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy người dùng', error});
    }
};    

//Xem chi tiêt người dùng
exports.getUserByID = async (req, res)  => {
    const { id} = req.params;
    try {
        const [user] = await db.query('SELECT user_id, username, email, role, created_at FROM Users WHERE user_id = ?', [id]);
        if (length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng'});
        }
        res.json(user[0]);
    }   catch (error) {
        res.status(500),json({ message: 'Lỗi khi lấy chi tiết người dùng', error});
    }
};

// Cập nhật vai trò người dùng
exports.updateUserRole = async (req, res) => {
    const {id} = req.params;
    const {role} = req.body;
    if (!['student', 'teacher', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Vai trò người dùng không hợp lệ'});
    }
    try {
        await db.query('UPDATE Users SET role =? WHERE user_id =?', [role, id]);
        res.json({ message: 'Cập nhật vai trò thành công'});
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật vai trò', error});
    }
};

// Xóa người dùng
exports.deleteUser = async (req, res) => {
    const { id} = req.params;
    try {
        await db.query('DELETE FROM Users WHERE user_id = ?', [id]);
        res.json({ message: 'Xóa người dùng thành công'});
    } catch (error) {
        res.status(500).json({ message: 'L��i khi xóa người dùng', error});
    }
};
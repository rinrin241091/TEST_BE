// controllers/userController.js
const { validationResult } = require('express-validator');
const userServices = require('../services/user.service');

const registerUser = async (req, res) => {
  console.log('Processing registration request:', req.body);

  const { username, email, password } = req.body;

  try {
    const result = await userServices.register({ username, email, password });
    res.status(201).json({ message: 'Đăng ký thành công', userId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Đã xảy ra lỗi khi đăng ký người dùng', error: error.message });
  }
};

const getUsers = async (req, res) => {
  console.log('Đã nhận request GET /user/all');
  try {
    const users = await userServices.getUsers();
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Không thể lấy dữ liệu người dùng', error: error.message });
  }
};

module.exports = {
  registerUser,
  getUsers,
};

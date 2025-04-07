
const { validationResult } = require('express-validator');
const userServices = require('../services/user.service');

const registerUser = async (req, res) => {
  console.log('Processing registration request:', req.body);
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { username, email, password } = req.body;

  try {
    const result = await userServices.register({ username, email, password });
    res.status(201).json({ message: 'Đăng ký thành công', userId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Đã xảy ra lỗi khi đăng ký người dùng', error: error.message });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await userServices.login({ username, password });

    // Trả về kết quả từ service, bao gồm token và thông tin người dùng
    res.status(200).json({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      username: result.username,
    });

  } catch (error) {
    console.error("Controller login error:", error.message);
    res.status(500).json({ message: error.message });
  }
};
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const message = await userServices.forgotPassword(email);
    res.status(200).json({ message });
  } catch (error) {
    console.error('Error in forgotPassword controller:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const verifyOTPAndUpdatePassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const message = await userServices.verifyOTPAndUpdatePassword(email, otp, newPassword);
    res.status(200).json({ message });
  } catch (error) {
    console.error('Error in verifyOTPAndUpdatePassword controller:', error.message);
    res.status(500).json({ message: error.message });
  }
};
module.exports = {
  registerUser,
  login,
  forgotPassword,
  verifyOTPAndUpdatePassword,
};

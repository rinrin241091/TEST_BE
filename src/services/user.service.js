// models/userModel.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { sendEmail } = require('../utils/mail'); 
const { verifyToken, generateToken } = require("../utils/jwt");

const register = async (userData) => {
  try {

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    const values = [userData.username, userData.email, hashedPassword];

    return new Promise((resolve, reject) => {
      db.query(query, values, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  } catch (error) {
    throw new Error('Không thể tạo người dùng');
  }
};

const login = async (data) => {
  const { username, password } = data;

  try {
    const queryUser = 'SELECT * FROM users WHERE username = ?';
    const [user] = await db.promise().query(queryUser, [username]);

    if (!user || user.length === 0) {
      throw new Error('Tên người dùng hoặc mật khẩu không chính xác');
    }

    const foundUser = user[0]; // Lấy người dùng đầu tiên từ kết quả query

      if (!password || !foundUser.password) {
        throw new Error('Mật khẩu không hợp lệ');
      }

    const isPasswordMatch = await bcrypt.compare(password, foundUser.password);
    if (!isPasswordMatch) {
      throw new Error('Tên người dùng hoặc mật khẩu không chính xác');
    }

    const payload = {
      sub: foundUser.username,
    };

    const { accessToken, refreshToken } = await generateToken(payload);

    return {
      accessToken,
      refreshToken,
      username: foundUser.username,
    };

  } catch (error) {
    console.error("Login error:", error.message);
    throw new Error('Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại sau.');
  }
};

const generateOTP = () => {
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    return otpCode;
};

const sendOTP = async (email, otp) => {
  const subject = 'Mã OTP xác thực thay đổi mật khẩu';
  const text = `Mã OTP của bạn là: ${otp}. Mã này chỉ có hiệu lực trong 10 phút.`;
  const html = `<p>Mã OTP của bạn là: <strong>${otp}</strong></p><p>Mã này chỉ có hiệu lực trong 10 phút.</p>`;

  try {
    await sendEmail(email, subject, text, html); 
    console.log('OTP đã được gửi thành công');
  } catch (error) {
    console.error('Lỗi khi gửi OTP:', error);
    throw new Error('Không thể gửi OTP. Vui lòng thử lại sau.');
  }
};

const forgotPassword = async (email) => {
  try {
    const queryUser = 'SELECT * FROM users WHERE email = ?';
    const [user] = await db.promise().query(queryUser, [email]);

    if (!user || user.length === 0) {
      throw new Error('Email không tồn tại trong hệ thống');
    }

    const otp = generateOTP(); 
    await sendOTP(email, otp);   

    // Lưu OTP vào bảng OTP riêng (bảng otp)
    const insertOTPQuery = 'INSERT INTO otp (email, otp, expires_at) VALUES (?, ?, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 10 MINUTE))';
    await db.promise().query(insertOTPQuery, [email, otp]);

    return 'OTP đã được gửi đến email của bạn. Vui lòng kiểm tra email để tiếp tục.';
  } catch (error) {
    throw new Error(error.message);
  }
};

const verifyOTPAndUpdatePassword = async (email, otp, newPassword) => {
  try {
    // Kiểm tra OTP trong bảng otp
    const queryOTP = 'SELECT * FROM otp WHERE email = ? AND otp = ? AND expires_at > CURRENT_TIMESTAMP';
    const [otpRecord] = await db.promise().query(queryOTP, [email, otp]);

    if (!otpRecord || otpRecord.length === 0) {
      throw new Error('Mã OTP không hợp lệ hoặc đã hết hạn');
    }

    // Mã OTP hợp lệ, tiếp tục cập nhật mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);  // Mã hóa mật khẩu mới
    const updatePasswordQuery = 'UPDATE users SET password = ? WHERE email = ?';
    await db.promise().query(updatePasswordQuery, [hashedPassword, email]);

    // Xóa OTP sau khi sử dụng
    const deleteOTPQuery = 'DELETE FROM otp WHERE email = ?';
    await db.promise().query(deleteOTPQuery, [email]);

    return 'Mật khẩu đã được thay đổi thành công.';
  } catch (error) {
    throw new Error(error.message);
  }
};
module.exports = {
  register,
  login,
  forgotPassword,
  verifyOTPAndUpdatePassword,
};

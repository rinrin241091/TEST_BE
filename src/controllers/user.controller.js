const { validationResult } = require("express-validator");
const userServices = require("../services/user.service");

const registerUser = async (req, res) => {
  console.log("Processing registration request:", req.body);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { username, email, password } = req.body;

  try {
    const result = await userServices.register({ username, email, password });
    res
      .status(201)
      .json({ message: "Đăng ký thành công", userId: result.insertId });
  } catch (error) {
    res.status(500).json({
      message: "Đã xảy ra lỗi khi đăng ký người dùng",
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await userServices.login({ email, password });

    // Trả về kết quả từ service, bao gồm token và thông tin người dùng
    res.status(200).json({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
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
    console.error("Error in forgotPassword controller:", error.message);
    res.status(500).json({ message: error.message });
  }
};

const verifyOTPAndUpdatePassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const message = await userServices.verifyOTPAndUpdatePassword(
      email,
      otp,
      newPassword
    );
    res.status(200).json({ message });
  } catch (error) {
    console.error(
      "Error in verifyOTPAndUpdatePassword controller:",
      error.message
    );
    res.status(500).json({ message: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const userEmail = req.user.sub; // Get email from decoded token
    const user = await userServices.getUserByEmail(userEmail);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return user profile without sensitive information
    res.status(200).json({
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      created_at: user.created_at,
    });
  } catch (error) {
    console.error("Error in getUserProfile controller:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Admin User Management Controllers
const getAllUsers = async (req, res) => {
  try {
    const users = await userServices.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error in getAllUsers controller:", error.message);
    res.status(500).json({ message: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userServices.getUserById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error in getUserById controller:", error.message);
    res.status(500).json({ message: error.message });
  }
};

const createUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { username, email, password, role } = req.body;
    const user = await userServices.createUser({
      username,
      email,
      password,
      role,
    });
    res.status(201).json(user);
  } catch (error) {
    console.error("Error in createUser controller:", error.message);
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { username, email, role } = req.body;
    const user = await userServices.updateUser(id, { username, email, role });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error in updateUser controller:", error.message);
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await userServices.deleteUser(id);

    if (!result) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error in deleteUser controller:", error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  login,
  forgotPassword,
  verifyOTPAndUpdatePassword,
  getUserProfile,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};

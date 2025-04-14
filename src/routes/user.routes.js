const express = require("express");
const UserController = require("../controllers/user.Controller");
const authMiddleware = require("../middleware/auth");
const adminMiddleware = require("../middleware/admin");
const router = express.Router();

// Public routes
router.post("/register", UserController.registerUser);
router.post("/login", UserController.login);
router.post("/forgot-password", UserController.forgotPassword);
router.post("/verify-otp", UserController.verifyOTPAndUpdatePassword);
router.get("/profile", authMiddleware, UserController.getUserProfile);

// Admin routes
router.get(
  "/admin/users",
  authMiddleware,
  adminMiddleware,
  UserController.getAllUsers
);
router.get(
  "/admin/users/:id",
  authMiddleware,
  adminMiddleware,
  UserController.getUserById
);
router.post(
  "/admin/users",
  authMiddleware,
  adminMiddleware,
  UserController.createUser
);
router.put(
  "/admin/users/:id",
  authMiddleware,
  adminMiddleware,
  UserController.updateUser
);
router.delete(
  "/admin/users/:id",
  authMiddleware,
  adminMiddleware,
  UserController.deleteUser
);

module.exports = router;

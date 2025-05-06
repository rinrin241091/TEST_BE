// routes/quizRoutes.js
const express = require("express");
const router = express.Router();
const quizController = require("../controllers/quizController");
const authenticateJWT = require("../middleware/auth");  // Import middleware

// Route để thêm quiz, chỉ cho phép người dùng đã xác thực
router.post("/", authenticateJWT, quizController.store);

// Route để lấy danh sách quiz của user
router.get("/my-quizzes", authenticateJWT, quizController.getUserQuizzes);

module.exports = router;
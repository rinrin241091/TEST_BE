const express = require("express");
const router = express.Router();
const questionController = require("../controllers/questionController");
const authMiddleware = require("../middleware/auth");

// Create a new quiz
router.post("/quiz", authMiddleware, questionController.createQuiz);

// Create a new question
router.post("/", authMiddleware, questionController.createQuestion);

// Get questions for a quiz
router.get("/quiz/:quizId", authMiddleware, questionController.getQuizQuestions);

module.exports = router; 
const express = require("express");
const router = express.Router();
const questionController = require('../controllers/questionController');

// Routes
router.post("/create-new-question", questionController.createQuestion);
router.get('/', questionController.getAllQuestions);
router.get('/:id', questionController.getQuestionById);
router.put('/:id', questionController.updateQuestion);
router.delete('/:id', questionController.deleteQuestion);
router.get('/:id/explanation', questionController.getExplanation);

module.exports = router;

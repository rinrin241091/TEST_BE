// controllers/quizController.js
const Quiz = require('../models/quizModel');

const store = async (req, res) => {
  const quizData = req.body;

  // Lấy creator_id từ req.user (được gán bởi middleware authenticateJWT)
  const creator_id = req.user.user_id;

  // Thêm creator_id vào quizData
  quizData.creator_id = creator_id;

  try {
    const newQuiz = await Quiz.addQuiz(quizData);
    res.status(201).json({ message: 'Quiz added successfully!', data: newQuiz });
  } catch (error) {
    console.error('Error adding quiz:', error);
    res.status(500).json({ message: 'Error adding quiz', error: error.message });
  }
};

const getUserQuizzes = async (req, res) => {
  try {
    // Lấy user_id từ token đã được decode trong middleware auth
    const userId = req.user.user_id;
    
    const quizzes = await Quiz.getQuizzesByUserId(userId);
    
    res.status(200).json({
      status: 'success',
      data: quizzes
    });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({
      status: 'error',
      message: 'Không thể lấy danh sách quiz',
      error: error.message
    });
  }
};

module.exports = { 
  store,
  getUserQuizzes 
};
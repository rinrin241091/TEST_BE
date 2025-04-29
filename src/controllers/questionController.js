const express = require("express");
const router = express.Router();
const pool = require('../../config/db');

// Tạo quiz mới
router.post("/quiz", async (req, res) => {
  try {
    const { title, description } = req.body;
    const connection = await pool.getConnection();

    try {
      const [result] = await connection.query(
        'INSERT INTO quizzes (title, description, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
        [title, description]
      );

      res.status(201).json({
        success: true,
        message: 'Quiz created successfully',
        data: { quiz_id: result.insertId }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Tạo câu hỏi mới
router.post("/create", async (req, res) => {
  console.log('Received request to create question');  // Log thông báo để kiểm tra

  try {
    const { quiz_id, question_text, question_type, answers, true_false_answer } = req.body;

    console.log('Received question text:', question_text);

    // Kiểm tra các trường bắt buộc
    if (!quiz_id || !question_text || !question_type) {
      return res.status(400).json({
        success: false,
        message: 'quiz_id, question_text, and question_type are required',
      });
    }

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Thêm câu hỏi vào bảng questions
      const [questionResult] = await connection.query(
        'INSERT INTO questions (quiz_id, question_text, question_type, created_at) VALUES (?, ?, ?, NOW())',
        [quiz_id, question_text, question_type]
      );
      const questionId = questionResult.insertId;

      // Thêm đáp án cho câu hỏi
      if (question_type === 'multiple_choice' || question_type === 'checkboxes') {
        for (const answer of answers) {
          await connection.query(
            'INSERT INTO answers (question_id, answer_text, is_correct) VALUES (?, ?, ?)',
            [questionId, answer.text, answer.isCorrect ? 1 : 0]
          );
        }
      } else if (question_type === 'true_false') {
        await connection.query(
          'INSERT INTO answers (question_id, answer_text, is_correct) VALUES (?, ?, ?)',
          [questionId, 'True', true_false_answer === 'true' ? 1 : 0]
        );
        await connection.query(
          'INSERT INTO answers (question_id, answer_text, is_correct) VALUES (?, ?, ?)',
          [questionId, 'False', true_false_answer === 'false' ? 1 : 0]
        );
      }

      await connection.commit();

      res.status(201).json({
        success: true,
        message: 'Question created successfully',
        data: { questionId }
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Lấy danh sách câu hỏi của một quiz
router.get('/:quizId', async (req, res) => {
  const { quizId } = req.params;
  
  let connection;
  try {
    connection = await pool.getConnection();

    const [questions] = await connection.query(
      'SELECT * FROM questions WHERE quiz_id = ?',
      [quizId]
    );

    // Lấy đáp án cho mỗi câu hỏi
    for (let question of questions) {
      const [answers] = await connection.query(
        'SELECT * FROM answers WHERE question_id = ?',
        [question.question_id]
      );
      question.answers = answers;
    }

    res.status(200).json({
      success: true,
      data: questions
    });
  } catch (error) {
    console.error('Error getting quiz questions:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting quiz questions',
      error: error.message
    });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;

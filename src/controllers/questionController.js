const pool = require('../config/db');

// Tạo quiz mới
exports.createQuiz = async (req, res) => {
  const { title, description = '', creator_id = 1, is_public = 1 } = req.body;
  
  let connection;
  try {
    connection = await pool.getConnection();
    
    const [result] = await connection.query(
      'INSERT INTO quizzes (title, description, creator_id, is_public, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
      [title, description, creator_id, is_public]
    );

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: { quiz_id: result.insertId }
    });
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating quiz',
      error: error.message
    });
  } finally {
    if (connection) connection.release();
  }
};

// Tạo câu hỏi mới
exports.createQuestion = async (req, res) => {
  const { quiz_id, question_text, question_type, answers, true_false_answer } = req.body;

  // Validation: Kiểm tra quiz_id có được gửi không
  if (!quiz_id) {
    return res.status(400).json({
      success: false,
      message: 'quiz_id is required',
    });
  }

  let connection;
  try {
    connection = await pool.getConnection();

    // Kiểm tra quiz_id có tồn tại trong bảng quizzes không
    const [quizResult] = await connection.query(
      'SELECT quiz_id FROM quizzes WHERE quiz_id = ?',
      [quiz_id]
    );
    if (quizResult.length === 0) {
      return res.status(400).json({
        success: false,
        message: `Quiz with quiz_id ${quiz_id} does not exist`,
      });
    }

    // Bắt đầu transaction
    await connection.beginTransaction();

    // Thêm câu hỏi vào bảng questions với các trường mới
    const [questionResult] = await connection.query(
      'INSERT INTO questions (quiz_id, question_text, question_type, time_limit, points, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [quiz_id, question_text, question_type, 60, 1]
    );
    const questionId = questionResult.insertId;

    // Xử lý đáp án (nếu có)
    if (question_type === 'multiple_choice' || question_type === 'checkboxes') {
      for (const answer of answers) {
        await connection.query(
          'INSERT INTO answers (question_id, answer_text, is_correct) VALUES (?, ?, ?)',
          [questionId, answer.text, answer.isCorrect ? 1 : 0]
        );
      }
    } else if (question_type === 'true_false') {
      // Tạo cả hai đáp án True và False cho câu hỏi True/False
      await connection.query(
        'INSERT INTO answers (question_id, answer_text, is_correct) VALUES (?, ?, ?)',
        [questionId, 'True', true_false_answer === 'true' ? 1 : 0]
      );
      await connection.query(
        'INSERT INTO answers (question_id, answer_text, is_correct) VALUES (?, ?, ?)',
        [questionId, 'False', true_false_answer === 'false' ? 1 : 0]
      );
    }

    // Commit transaction
    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      data: { question_id: questionId },
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error creating question:', error);
    // Kiểm tra nếu lỗi là do foreign key constraint
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        success: false,
        message: `Quiz with quiz_id ${quiz_id} does not exist`,
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating question',
      error: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
};

// Lấy danh sách câu hỏi của một quiz
exports.getQuizQuestions = async (req, res) => {
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
};
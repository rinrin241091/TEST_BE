const pool = require('../config/db');

exports.createAnswer = async (req, res) => {
  const { question_id, answer_text, is_correct } = req.body;

  // Validation
  if (!question_id || !answer_text) {
    return res.status(400).json({
      success: false,
      message: 'question_id and answer_text are required',
    });
  }

  let connection;
  try {
    connection = await pool.getConnection();

    // Kiểm tra question_id có tồn tại không
    const [questionResult] = await connection.query(
      'SELECT question_id FROM questions WHERE question_id = ?',
      [question_id]
    );
    if (questionResult.length === 0) {
      return res.status(400).json({
        success: false,
        message: `Question with id ${question_id} does not exist`,
      });
    }

    // Thêm đáp án
    const [result] = await connection.query(
      'INSERT INTO answers (question_id, answer_text, is_correct) VALUES (?, ?, ?)',
      [question_id, answer_text, is_correct]
    );

    res.status(201).json({
      success: true,
      message: 'Answer created successfully',
      data: {
        answer_id: result.insertId,
        question_id,
        answer_text,
        is_correct
      },
    });
  } catch (error) {
    console.error('Error creating answer:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating answer',
      error: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
}; 
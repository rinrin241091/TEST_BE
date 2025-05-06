const pool = require('../../config/db');

// Get explanation for a question (sample logic)
const getExplanation = async (req, res) => {
  const questionId = req.params.id;
  res.json({
    success: true,
    explanation: `This is an AI-generated explanation for question ID ${questionId}.`
  });
};

// Create a new question
const createQuestion = async (req, res) => {
  try {
    const { quiz_id, question_text, question_type, options, correctAnswer, time_limit, points } = req.body;
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [questionResult] = await connection.query(
        'INSERT INTO questions (quiz_id, question_text, question_type, time_limit, points, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
        [quiz_id, question_text, question_type, time_limit, points]
      );
      const questionId = questionResult.insertId;

      for (const option of options) {
        await connection.query(
          'INSERT INTO answers (question_id, answer_text, is_correct) VALUES (?, ?, ?)',
          [questionId, option, option === correctAnswer]
        );
      }

      await connection.commit();

      res.status(201).json({
        success: true,
        message: 'Question created successfully',
        data: { question_id: questionId }
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
};

// Get all questions
const getAllQuestions = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    try {
      const [questions] = await connection.query(`
        SELECT q.*, GROUP_CONCAT(
          JSON_OBJECT(
            'answer_id', a.answer_id,
            'answer_text', a.answer_text,
            'is_correct', a.is_correct
          )
        ) as answers
        FROM questions q
        LEFT JOIN answers a ON q.question_id = a.question_id
        GROUP BY q.question_id
        ORDER BY q.created_at DESC
      `);

      const formattedQuestions = questions.map(q => {
        const answers = JSON.parse(`[${q.answers}]`);
        return {
          question_id: q.question_id,
          quiz_id: q.quiz_id,
          question_text: q.question_text,
          question_type: q.question_type,
          time_limit: q.time_limit,
          points: q.points,
          options: answers.map(a => a.answer_text),
          correctAnswer: answers.find(a => a.is_correct)?.answer_text
        };
      });

      res.json({
        success: true,
        data: formattedQuestions
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
};

// Get question by ID
const getQuestionById = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    try {
      const [questions] = await connection.query(`
        SELECT q.*, GROUP_CONCAT(
          JSON_OBJECT(
            'answer_id', a.answer_id,
            'answer_text', a.answer_text,
            'is_correct', a.is_correct
          )
        ) as answers
        FROM questions q
        LEFT JOIN answers a ON q.question_id = a.question_id
        WHERE q.question_id = ?
        GROUP BY q.question_id
      `, [req.params.id]);

      if (questions.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Question not found'
        });
      }

      const q = questions[0];
      const answers = q.answers ? JSON.parse(`[${q.answers}]`) : [];
      const question = {
        question_id: q.question_id,
        quiz_id: q.quiz_id,
        question_text: q.question_text,
        question_type: q.question_type,
        time_limit: q.time_limit,
        points: q.points,
        options: answers.map(a => a.answer_text),
        correctAnswer: answers.find(a => a.is_correct)?.answer_text
      };

      res.json({
        success: true,
        data: question
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
};

// Update question
const updateQuestion = async (req, res) => {
  try {
    const { question_text, question_type, time_limit, points } = req.body;
    const connection = await pool.getConnection();

    try {
      const [result] = await connection.query(
        `UPDATE questions 
         SET question_text = ?, question_type = ?, time_limit = ?, points = ?
         WHERE question_id = ?`,
        [question_text, question_type, time_limit, points, req.params.id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Question not found' });
      }

      res.json({ message: 'Question updated successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete question
const deleteQuestion = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.query(
        'DELETE FROM questions WHERE question_id = ?', 
        [req.params.id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Question not found' });
      }

      res.json({ message: 'Question deleted successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getExplanation,
  createQuestion,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion
};

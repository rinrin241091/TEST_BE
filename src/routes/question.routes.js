const express = require("express");
const router = express.Router();
const pool = require('../../config/db');
const questionController = require('../controllers/questionController');

// Create a new quiz
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

// Create a new question
router.post("/create-new-question", async (req, res) => {
  try {
    const { title, content, options, correctAnswer, type } = req.body;
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Insert question
      const [questionResult] = await connection.query(
        'INSERT INTO questions (title, content, type, created_at) VALUES (?, ?, ?, NOW())',
        [title, content, type]
      );
      const questionId = questionResult.insertId;

      // Insert answers
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

// Get all questions
router.get('/', async (req, res) => {
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

      // Format questions to match frontend structure
      const formattedQuestions = questions.map(q => {
        const answers = JSON.parse(`[${q.answers}]`);
        return {
          id: q.question_id,
          title: q.title,
          content: q.content,
          type: q.type,
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
});

// Get question by ID
router.get('/:id', async (req, res) => {
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

      const question = {
        ...questions[0],
        answers: questions[0].answers ? JSON.parse(`[${questions[0].answers}]`) : []
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
});

// Update question
router.put('/:id', (req, res) => {
  const { title, content, options, correctAnswer, type } = req.body;
  
  const query = `
    UPDATE questions 
    SET title = ?, content = ?, options = ?, correct_answer = ?, type = ?
    WHERE id = ?
  `;
  
  db.query(
    query,
    [title, content, JSON.stringify(options), correctAnswer, type, req.params.id],
    (err, results) => {
      if (err) {
        console.error('Error updating question:', err);
        return res.status(500).json({ message: 'Error updating question' });
      }
      
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'Question not found' });
      }
      
      res.json({ message: 'Question updated successfully' });
    }
  );
});

// Delete question
router.delete('/:id', (req, res) => {
  const query = 'DELETE FROM questions WHERE id = ?';
  
  db.query(query, [req.params.id], (err, results) => {
    if (err) {
      console.error('Error deleting question:', err);
      return res.status(500).json({ message: 'Error deleting question' });
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    res.json({ message: 'Question deleted successfully' });
  });
});

// Get GPT explanation for a question
router.get('/:id/explanation', questionController.getExplanation);

module.exports = router; 
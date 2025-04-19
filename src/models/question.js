const pool = require('../config/db');

class Question {
  static async create(questionData) {
    const { quiz_id, question_text, question_type, answers, true_false_answer } = questionData;
    let connection;

    try {
      connection = await pool.getConnection();
      await connection.beginTransaction();

      const [questionResult] = await connection.query(
        'INSERT INTO questions (quiz_id, question_text, question_type, time_limit, points, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
        [quiz_id, question_text, question_type, 60, 1]
      );
      const questionId = questionResult.insertId;

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
      return { question_id: questionId };
    } catch (error) {
      if (connection) await connection.rollback();
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  static async findByQuizId(quizId) {
    let connection;
    try {
      connection = await pool.getConnection();
      
      const [questions] = await connection.query(
        'SELECT * FROM questions WHERE quiz_id = ?',
        [quizId]
      );

      for (let question of questions) {
        const [answers] = await connection.query(
          'SELECT * FROM answers WHERE question_id = ?',
          [question.question_id]
        );
        question.answers = answers;
      }

      return questions;
    } catch (error) {
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }
}

module.exports = Question;
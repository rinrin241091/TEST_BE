// models/quizModel.js
const db = require('../config/db');

class Quiz {
  static async addQuiz(quizData) {
    const { title, description, creator_id, is_public, category_id } = quizData;

    try {
      const query = `
        INSERT INTO quizzes (
          title, 
          description, 
          creator_id, 
          is_public, 
          category_id, 
          created_at, 
          updated_at
        ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `;

      return new Promise((resolve, reject) => {
        db.query(query, [title, description, creator_id, is_public, category_id], (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve({
              id: result.insertId,
              ...quizData,
            });
          }
        });
      });
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Lỗi khi thêm quiz vào cơ sở dữ liệu: " + error.message);
    }
  }

  static async getQuizzesByUserId(userId) {
    try {
      const query = `
      SELECT * FROM quizzes
      WHERE creator_id = ?
    `;

      return new Promise((resolve, reject) => {
        db.query(query, [userId], (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        });
      });
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Lỗi khi lấy danh sách quiz: " + error.message);
    }
  }
}

module.exports = Quiz;
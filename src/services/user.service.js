// models/userModel.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');

const register = async (userData) => {
  try {

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    const values = [userData.username, userData.email, hashedPassword];

    return new Promise((resolve, reject) => {
      db.query(query, values, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  } catch (error) {
    throw new Error('Không thể tạo người dùng');
  }
};

const getUsers = async () => {
  const query = 'SELECT id, username, email FROM users';
  return new Promise((resolve, reject) => {
    db.query(query, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

module.exports = {
  register,
  getUsers,
};

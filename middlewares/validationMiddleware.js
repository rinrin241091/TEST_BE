// middlewares/validationMiddleware.js
const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const userValidationRules = () => {
  return [
    body('username')
      .trim()
      .isLength({ min: 3 })
      .withMessage('Tên người dùng phải có ít nhất 3 ký tự'),
    body('email')
      .isEmail()
      .withMessage('Email không hợp lệ')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
    body('role')
      .isIn(['admin', 'teacher', 'student'])
      .withMessage('Vai trò không hợp lệ')
  ];
};

const quizValidationRules = () => {
  return [
    body('title')
      .trim()
      .isLength({ min: 3 })
      .withMessage('Tiêu đề phải có ít nhất 3 ký tự'),
    body('description')
      .trim()
      .isLength({ min: 10 })
      .withMessage('Mô tả phải có ít nhất 10 ký tự'),
    body('timeLimit')
      .isInt({ min: 1 })
      .withMessage('Thời gian làm bài phải lớn hơn 0'),
    body('questions')
      .isArray({ min: 1 })
      .withMessage('Quiz phải có ít nhất 1 câu hỏi')
  ];
};

module.exports = {
  handleValidationErrors,
  userValidationRules,
  quizValidationRules
};
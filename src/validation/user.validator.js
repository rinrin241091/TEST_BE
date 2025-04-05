const { body } = require('express-validator');

const registerValidator = [
  body('username')
    .notEmpty()
    .withMessage('Tên người dùng là bắt buộc')
    .isLength({ min: 3 })
    .withMessage('Tên người dùng phải có ít nhất 3 ký tự'),

  body('email')
    .isEmail()
    .withMessage('Email không hợp lệ')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu phải có ít nhất 6 ký tự')
    .matches(/\d/)
    .withMessage('Mật khẩu phải chứa ít nhất một số')
    .matches(/[a-zA-Z]/)
    .withMessage('Mật khẩu phải chứa ít nhất một chữ cái'),

  // body('confirmPassword')
  //   .custom((value, { req }) => {
  //     if (value !== req.body.password) {
  //       throw new Error('Mật khẩu xác nhận không khớp');
  //     }
  //     return true;
  //   }),
];

module.exports = {
  registerValidator,
};

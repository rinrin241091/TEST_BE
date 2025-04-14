const { body } = require("express-validator");

const registerValidator = [
  body("username")
    .notEmpty()
    .withMessage("Tên người dùng là bắt buộc")
    .isLength({ min: 3 })
    .withMessage("Tên người dùng phải có ít nhất 3 ký tự"),

  body("email").isEmail().withMessage("Email không hợp lệ").normalizeEmail(),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Mật khẩu phải có ít nhất 6 ký tự")
    .matches(/\d/)
    .withMessage("Mật khẩu phải chứa ít nhất một số")
    .matches(/[a-zA-Z]/)
    .withMessage("Mật khẩu phải chứa ít nhất một chữ cái"),

  // body('confirmPassword')
  //   .custom((value, { req }) => {
  //     if (value !== req.body.password) {
  //       throw new Error('Mật khẩu xác nhận không khớp');
  //     }
  //     return true;
  //   }),
];

const adminUserValidator = [
  body("username")
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters long"),

  body("email").isEmail().withMessage("Invalid email address").normalizeEmail(),

  body("role")
    .isIn(["user", "admin"])
    .withMessage("Role must be either user or admin"),
];

const adminCreateUserValidator = [
  ...adminUserValidator,
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/\d/)
    .withMessage("Password must contain at least one number")
    .matches(/[a-zA-Z]/)
    .withMessage("Password must contain at least one letter"),
];

module.exports = {
  registerValidator,
  adminUserValidator,
  adminCreateUserValidator,
};

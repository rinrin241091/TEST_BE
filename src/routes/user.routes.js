const express = require('express');
const UserController = require('../controllers/user.Controller');
const router = express.Router();

router.post('/register', UserController.registerUser);
router.post('/login', UserController.login);
router.post('/forgot-password', UserController.forgotPassword);
router.post('/verify-otp', UserController.verifyOTPAndUpdatePassword);

module.exports = router;

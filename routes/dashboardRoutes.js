const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');
const dashboardController = require('../controllers/dashboardController');

// All dashboard routes require authentication and admin role
router.use(verifyToken, isAdmin);

// Get dashboard statistics
router.get('/stats', dashboardController.getStats);

// Get performance data
router.get('/performance', dashboardController.getPerformance);

// Get recent activities
router.get('/activities', dashboardController.getActivities);

module.exports = router; 
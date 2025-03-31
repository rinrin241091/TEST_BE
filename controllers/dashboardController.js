const db = require('../config/database');

const getStats = async (req, res) => {
  try {
    // Get total students
    const [students] = await db.query(
      'SELECT COUNT(*) as total FROM users WHERE role = "student"'
    );
    
    // Get total quizzes
    const [quizzes] = await db.query(
      'SELECT COUNT(*) as total FROM quizzes'
    );
    
    // Get active users (users who logged in last 30 days)
    const [activeUsers] = await db.query(
      'SELECT COUNT(DISTINCT user_id) as total FROM user_activities WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)'
    );
    
    // Get quiz completion rate
    const [completions] = await db.query(`
      SELECT 
        COUNT(*) as total_attempts,
        COUNT(CASE WHEN score >= passing_score THEN 1 END) as passed_attempts
      FROM quiz_attempts
      JOIN quizzes ON quiz_attempts.quiz_id = quizzes.id
      WHERE quiz_attempts.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);
    
    // Calculate growth rates
    const [prevMonthStats] = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM users 
         WHERE role = "student" AND created_at >= DATE_SUB(NOW(), INTERVAL 60 DAY)
         AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)) as prev_students,
        (SELECT COUNT(*) FROM quizzes 
         WHERE created_at >= DATE_SUB(NOW(), INTERVAL 60 DAY)
         AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)) as prev_quizzes,
        (SELECT COUNT(DISTINCT user_id) FROM user_activities 
         WHERE created_at >= DATE_SUB(NOW(), INTERVAL 60 DAY)
         AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)) as prev_active_users
    `);
    
    const completionRate = completions[0].total_attempts > 0 
      ? (completions[0].passed_attempts / completions[0].total_attempts * 100).toFixed(1)
      : 0;
      
    const stats = {
      totalStudents: students[0].total,
      totalQuizzes: quizzes[0].total,
      activeUsers: activeUsers[0].total,
      completionRate: parseFloat(completionRate),
      studentGrowth: calculateGrowth(prevMonthStats[0].prev_students, students[0].total),
      quizGrowth: calculateGrowth(prevMonthStats[0].prev_quizzes, quizzes[0].total),
      userGrowth: calculateGrowth(prevMonthStats[0].prev_active_users, activeUsers[0].total)
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ message: 'Error getting dashboard stats' });
  }
};

const getPerformance = async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT 
        DATE_FORMAT(created_at, '%a') as name,
        COUNT(*) as quizzes,
        COUNT(CASE WHEN score >= passing_score THEN 1 END) as completions,
        ROUND(AVG(score), 1) as score
      FROM quiz_attempts
      JOIN quizzes ON quiz_attempts.quiz_id = quizzes.id
      WHERE quiz_attempts.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE_FORMAT(created_at, '%a')
      ORDER BY quiz_attempts.created_at DESC
    `);
    
    res.json(results);
  } catch (error) {
    console.error('Error getting performance data:', error);
    res.status(500).json({ message: 'Error getting performance data' });
  }
};

const getActivities = async (req, res) => {
  try {
    const [activities] = await db.query(`
      SELECT 
        a.id,
        CASE
          WHEN a.activity_type = 'quiz_created' THEN CONCAT('New Quiz Created: ', q.title)
          WHEN a.activity_type = 'quiz_completed' THEN CONCAT('Quiz Completed: ', q.title)
          WHEN a.activity_type = 'user_registered' THEN CONCAT('New User Registered: ', u.name)
          ELSE a.activity_type
        END as description,
        CASE
          WHEN TIMESTAMPDIFF(MINUTE, a.created_at, NOW()) < 60 
            THEN CONCAT(TIMESTAMPDIFF(MINUTE, a.created_at, NOW()), ' minutes ago')
          WHEN TIMESTAMPDIFF(HOUR, a.created_at, NOW()) < 24 
            THEN CONCAT(TIMESTAMPDIFF(HOUR, a.created_at, NOW()), ' hours ago')
          ELSE CONCAT(TIMESTAMPDIFF(DAY, a.created_at, NOW()), ' days ago')
        END as timeAgo
      FROM activities a
      LEFT JOIN quizzes q ON a.quiz_id = q.id
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 10
    `);
    
    res.json(activities);
  } catch (error) {
    console.error('Error getting activities:', error);
    res.status(500).json({ message: 'Error getting activities' });
  }
};

const calculateGrowth = (prev, current) => {
  if (prev === 0) return 100;
  return parseFloat(((current - prev) / prev * 100).toFixed(1));
};

module.exports = {
  getStats,
  getPerformance,
  getActivities
}; 
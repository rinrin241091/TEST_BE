const express = require('express');
const db = require('./config/db'); 
const cors = require('cors');
const http = require('http');
const { initializeSocket } = require('./src/socket/server');
const port = process.env.PORT || 3001;
const app = express();
require("dotenv").config();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Hàm trả về Promise cho việc kết nối cơ sở dữ liệu
function assertDatabaseConnectionOk() {
  return new Promise((resolve, reject) => {
    console.log("Đang kiểm tra kết nối cơ sở dữ liệu...");
    db.connect((err) => {
      if (err) {
        console.error("Không thể kết nối đến cơ sở dữ liệu:", err.message);
        reject(new Error("Không thể kết nối đến cơ sở dữ liệu"));
      } else {
        console.log("Kết nối cơ sở dữ liệu OK!");
        resolve();
      }
    });
  });
}

// Routes
app.use('/quizzes', require('./src/routes/question.routes'));
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/games', require('./src/routes/game.routes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server);

// Khởi động server
async function init() {
  try {
    await assertDatabaseConnectionOk(); 
    console.log(`Khởi động Express trên cổng ${port}...`);
    
    server.listen(port, () => {
      console.log(`Server đang chạy tại http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Lỗi khi khởi động ứng dụng:", error.message);
    process.exit(1);  
  }
}

init();

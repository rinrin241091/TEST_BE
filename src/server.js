const express = require('express');
const db = require('./config/db'); 
const port = process.env.PORT || 3000;
const app = express();
require("dotenv").config();

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

// Khởi động server
async function init() {
  try {
    await assertDatabaseConnectionOk(); 
    console.log(`Khởi động Express trên cổng ${port}...`);
    
    app.listen(port, () => {
      console.log(`Server đang chạy tại http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Lỗi khi khởi động ứng dụng:", error.message);
    process.exit(1);  
  }
}

init();

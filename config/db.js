// Cấu hình kết nối MySQL
const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 10, // Số kết nối tối đa cho phép
    waitForConnections: true, // Cho phép đăng ký kết nối khi hết kết nối hiện tại
    queueLimit: 0, // Không cho phép đăng ký kết nối khi queue đầy
});

module.exports = pool.promise();
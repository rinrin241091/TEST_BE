-- Tạo database nếu chưa tồn tại
CREATE DATABASE IF NOT EXISTS cap2;
USE cap2;

-- Tạo bảng Users
CREATE TABLE IF NOT EXISTS Users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'teacher', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tạo bảng Quizzes
CREATE TABLE IF NOT EXISTS Quizzes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    creator_id INT,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES Users(id) ON DELETE SET NULL
);

-- Tạo bảng Questions
CREATE TABLE IF NOT EXISTS Questions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    quiz_id INT,
    question_text TEXT NOT NULL,
    options JSON NOT NULL,
    correct_answer INT NOT NULL,
    points INT DEFAULT 1,
    time_limit INT DEFAULT 30,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_id) REFERENCES Quizzes(id) ON DELETE CASCADE
);

-- Tạo bảng Rooms
CREATE TABLE IF NOT EXISTS Rooms (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(6) UNIQUE NOT NULL,
    quiz_id INT,
    host_id INT,
    status ENUM('waiting', 'active', 'finished') DEFAULT 'waiting',
    start_time TIMESTAMP NULL,
    end_time TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_id) REFERENCES Quizzes(id) ON DELETE SET NULL,
    FOREIGN KEY (host_id) REFERENCES Users(id) ON DELETE SET NULL
);

-- Tạo bảng Room_Participants
CREATE TABLE IF NOT EXISTS Room_Participants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    room_id INT,
    user_id INT,
    score INT DEFAULT 0,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES Rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
); 
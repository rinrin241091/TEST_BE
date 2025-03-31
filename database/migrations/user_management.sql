-- Cập nhật bảng Users
ALTER TABLE Users
ADD COLUMN status ENUM('ACTIVE', 'INACTIVE', 'DELETED') DEFAULT 'ACTIVE',
ADD COLUMN avatar_url VARCHAR(255),
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
ADD COLUMN deleted_at TIMESTAMP NULL,
ADD COLUMN last_login TIMESTAMP NULL,
ADD COLUMN last_active TIMESTAMP NULL;

-- Tạo bảng UserActivities
CREATE TABLE IF NOT EXISTS UserActivities (
    activity_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    activity_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Tạo bảng UserPermissions
CREATE TABLE IF NOT EXISTS UserPermissions (
    permission_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

-- Tạo bảng RolePermissions
CREATE TABLE IF NOT EXISTS RolePermissions (
    role_id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    permissions JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default permissions
INSERT INTO UserPermissions (name, description) VALUES
('manage_users', 'Quản lý người dùng'),
('create_quiz', 'Tạo quiz mới'),
('edit_quiz', 'Chỉnh sửa quiz'),
('delete_quiz', 'Xóa quiz'),
('view_statistics', 'Xem thống kê'),
('manage_categories', 'Quản lý danh mục');

-- Insert default roles with permissions
INSERT INTO RolePermissions (role_name, permissions) VALUES
('admin', '["manage_users", "create_quiz", "edit_quiz", "delete_quiz", "view_statistics", "manage_categories"]'),
('teacher', '["create_quiz", "edit_quiz", "view_statistics"]'),
('student', '[]'); 
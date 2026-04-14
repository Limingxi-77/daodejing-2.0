-- MySQL 数据库初始化脚本

-- 创建数据库
CREATE DATABASE IF NOT EXISTS daodejing_platform;

-- 使用数据库
USE daodejing_platform;

-- 创建用户（如果不存在）
CREATE USER IF NOT EXISTS 'daodejing'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON daodejing_platform.* TO 'daodejing'@'localhost';
FLUSH PRIVILEGES;

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  avatar_url TEXT,
  subscription_tier VARCHAR(20) DEFAULT 'free',
  subscription_expiry DATETIME,
  daily_usage_count INT DEFAULT 0,
  last_usage_date DATE DEFAULT CURRENT_DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login DATETIME,
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE
);

-- 创建课程表
CREATE TABLE IF NOT EXISTS courses (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  level VARCHAR(20) DEFAULT 'beginner',
  duration INT,
  total_chapters INT DEFAULT 0,
  thumbnail_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 创建章节表
CREATE TABLE IF NOT EXISTS chapters (
  id VARCHAR(36) PRIMARY KEY,
  course_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  order_number INT DEFAULT 0,
  duration INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- 创建学习进度表
CREATE TABLE IF NOT EXISTS learning_progress (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  course_id VARCHAR(36) NOT NULL,
  chapter_id VARCHAR(36) NOT NULL,
  progress_percentage INT DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
  UNIQUE KEY (user_id, course_id, chapter_id)
);

-- 创建学习目标表
CREATE TABLE IF NOT EXISTS learning_goals (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  goal_text TEXT NOT NULL,
  target_date DATETIME,
  completed BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 创建学习统计表
CREATE TABLE IF NOT EXISTS learning_stats (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  total_study_time INT DEFAULT 0,
  completed_lessons INT DEFAULT 0,
  streak_days INT DEFAULT 0,
  last_study_date DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY (user_id)
);

-- 创建学习记录表
CREATE TABLE IF NOT EXISTS study_records (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  course_id VARCHAR(36),
  chapter_id VARCHAR(36),
  study_time INT DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 创建用户笔记表
CREATE TABLE IF NOT EXISTS user_notes (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  content TEXT NOT NULL,
  chapter_id VARCHAR(36),
  tags TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 创建对话历史表
CREATE TABLE IF NOT EXISTS conversations (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  messages TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 创建社区点赞表
CREATE TABLE IF NOT EXISTS community_likes (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  post_id VARCHAR(36) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY (user_id, post_id)
);

-- 创建社区书签表
CREATE TABLE IF NOT EXISTS community_bookmarks (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  post_id VARCHAR(36) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY (user_id, post_id)
);

-- 创建社区关注表
CREATE TABLE IF NOT EXISTS community_follows (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  followed_user_id VARCHAR(36) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY (user_id, followed_user_id)
);

-- 创建社区草稿表
CREATE TABLE IF NOT EXISTS community_drafts (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  content TEXT NOT NULL,
  title VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 创建修炼数据表
CREATE TABLE IF NOT EXISTS cultivation (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  exp INT DEFAULT 0,
  level INT DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY (user_id)
);

-- 插入默认课程数据
INSERT IGNORE INTO courses (id, title, description, level, total_chapters)
VALUES 
('1', '初学者路径', '适合道德经初学者的学习路径', 'beginner', 27),
('2', '进阶者路径', '适合有一定基础的学习者', 'intermediate', 36),
('3', '研究者路径', '适合深入研究道德经的学者', 'advanced', 18);

-- 插入默认章节数据（示例）
INSERT IGNORE INTO chapters (id, course_id, title, order_number)
VALUES 
('1', '1', '第一章', 1),
('2', '1', '第二章', 2),
('3', '1', '第三章', 3);

-- 显示创建的表
SHOW TABLES;

-- 显示用户表结构
DESCRIBE users;

-- 显示课程表结构
DESCRIBE courses;

-- 显示章节表结构
DESCRIBE chapters;

-- 显示学习进度表结构
DESCRIBE learning_progress;

-- 显示学习目标表结构
DESCRIBE learning_goals;

-- 显示学习统计表结构
DESCRIBE learning_stats;

-- 显示学习记录表结构
DESCRIBE study_records;

-- 显示用户笔记表结构
DESCRIBE user_notes;

-- 显示对话历史表结构
DESCRIBE conversations;

-- 显示社区点赞表结构
DESCRIBE community_likes;

-- 显示社区书签表结构
DESCRIBE community_bookmarks;

-- 显示社区关注表结构
DESCRIBE community_follows;

-- 显示社区草稿表结构
DESCRIBE community_drafts;

-- 显示修炼数据表结构
DESCRIBE cultivation;

-- 显示插入的课程数据
SELECT * FROM courses;

-- 显示插入的章节数据
SELECT * FROM chapters;

-- 初始化完成
SELECT 'MySQL 数据库初始化完成' AS message;
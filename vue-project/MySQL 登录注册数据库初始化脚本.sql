-- MySQL 登录注册数据库初始化脚本

-- 删除现有数据库（如果存在）
DROP DATABASE IF EXISTS daodejing_platform;

-- 创建数据库
CREATE DATABASE IF NOT EXISTS daodejing_platform;

-- 使用数据库
USE daodejing_platform;

-- 创建用户（如果不存在）
CREATE USER IF NOT EXISTS 'daodejing'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON daodejing_platform.* TO 'daodejing'@'localhost';
FLUSH PRIVILEGES;

-- 创建用户表（登录注册核心表）
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

-- 插入测试用户数据
INSERT IGNORE INTO users (id, username, email, password_hash, display_name)
VALUES 
('1', 'testuser', 'test@example.com', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', '测试用户');

-- 显示创建的表
SHOW TABLES;

-- 显示用户表结构
DESCRIBE users;

-- 显示测试数据
SELECT * FROM users;

-- 初始化完成
SELECT 'MySQL 登录注册数据库初始化完成' AS message;
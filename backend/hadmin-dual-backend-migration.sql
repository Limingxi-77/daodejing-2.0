-- hAdmin 双后端并存迁移脚本
-- 目标：为 Express 前台业务后端与 hAdmin 后台管理后端建立同库协作基础。

USE daodejing_platform;

-- 后台管理员
CREATE TABLE IF NOT EXISTS admin_users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(80) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(120),
  role_code VARCHAR(50) DEFAULT 'admin',
  is_active BOOLEAN DEFAULT TRUE,
  last_login DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 后台角色
CREATE TABLE IF NOT EXISTS roles (
  id VARCHAR(36) PRIMARY KEY,
  code VARCHAR(80) UNIQUE NOT NULL,
  name VARCHAR(120) NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 后台权限点
CREATE TABLE IF NOT EXISTS permissions (
  id VARCHAR(36) PRIMARY KEY,
  code VARCHAR(120) UNIQUE NOT NULL,
  name VARCHAR(120) NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 管理员角色关联
CREATE TABLE IF NOT EXISTS admin_user_roles (
  admin_user_id VARCHAR(36) NOT NULL,
  role_id VARCHAR(36) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (admin_user_id, role_id)
);

-- 角色权限关联
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id VARCHAR(36) NOT NULL,
  permission_id VARCHAR(36) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (role_id, permission_id)
);

-- 后台操作审计日志
CREATE TABLE IF NOT EXISTS admin_operation_logs (
  id VARCHAR(36) PRIMARY KEY,
  admin_user_id VARCHAR(36),
  admin_username VARCHAR(120),
  action VARCHAR(120) NOT NULL,
  target_type VARCHAR(80) NOT NULL,
  target_id VARCHAR(120),
  before_data JSON NULL,
  after_data JSON NULL,
  ip_address VARCHAR(80),
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 系统配置：hAdmin 可直接管理的低风险配置表
CREATE TABLE IF NOT EXISTS system_configs (
  id VARCHAR(36) PRIMARY KEY,
  config_key VARCHAR(120) UNIQUE NOT NULL,
  config_value JSON NULL,
  description TEXT,
  updated_by VARCHAR(36),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- AI 供应商配置：hAdmin 管理，Express 读取并代理调用
CREATE TABLE IF NOT EXISTS ai_providers (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(80) UNIQUE NOT NULL,
  base_url VARCHAR(255) NOT NULL,
  default_model VARCHAR(120),
  enabled BOOLEAN DEFAULT FALSE,
  daily_limit INT DEFAULT 0,
  config JSON NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- AI 用量日志：高风险写入建议通过 Express 内部 API
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36),
  provider_name VARCHAR(80),
  model_name VARCHAR(120),
  prompt_tokens INT DEFAULT 0,
  completion_tokens INT DEFAULT 0,
  total_tokens INT DEFAULT 0,
  estimated_cost DECIMAL(12, 6) DEFAULT 0,
  status VARCHAR(30) DEFAULT 'success',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 安全事件日志：记录登录失败、锁定、敏感操作等事件，供 hAdmin 安全审计使用
CREATE TABLE IF NOT EXISTS security_events (
  id VARCHAR(36) PRIMARY KEY,
  event_type VARCHAR(80) NOT NULL,
  scope VARCHAR(50),
  actor_id VARCHAR(36),
  ip_address VARCHAR(80),
  user_agent TEXT,
  metadata JSON NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 外部服务调用日志：记录 AI/TTS 供应商调用、耗时、token 与成本估算
CREATE TABLE IF NOT EXISTS external_service_call_logs (
  id VARCHAR(36) PRIMARY KEY,
  service_type VARCHAR(50) NOT NULL,
  user_id VARCHAR(36),
  provider_name VARCHAR(80),
  model_name VARCHAR(120),
  status VARCHAR(40) NOT NULL,
  duration_ms INT DEFAULT 0,
  tokens INT DEFAULT 0,
  estimated_cost DECIMAL(12, 6) DEFAULT 0,
  error_message TEXT,
  request_id VARCHAR(80),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 集中式限流状态：生产多实例可将 SECURITY_STATE_DRIVER 设为 mysql
CREATE TABLE IF NOT EXISTS rate_limit_buckets (
  bucket_key VARCHAR(200) PRIMARY KEY,
  request_count INT DEFAULT 0,
  reset_at DATETIME NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_rate_limit_reset_at (reset_at)
);

-- 集中式登录失败锁定状态
CREATE TABLE IF NOT EXISTS login_failure_buckets (
  bucket_key VARCHAR(200) PRIMARY KEY,
  failure_count INT DEFAULT 0,
  locked_until DATETIME NULL,
  last_failure_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_login_failure_locked_until (locked_until),
  INDEX idx_login_failure_last_failure_at (last_failure_at)
);

-- 告警事件：可由 hAdmin 展示并结合 ALERT_WEBHOOK_URL 推送
CREATE TABLE IF NOT EXISTS alert_events (
  id VARCHAR(36) PRIMARY KEY,
  level VARCHAR(30) NOT NULL,
  event_type VARCHAR(120) NOT NULL,
  message TEXT NOT NULL,
  metadata JSON NULL,
  handled BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_alert_events_level_created (level, created_at),
  INDEX idx_alert_events_handled (handled)
);

-- 前台学习进度：Express 前台业务后端写入，hAdmin 可做只读统计
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
  UNIQUE KEY user_course_chapter (user_id, course_id, chapter_id)
);

-- 用户学习笔记：Express 提供前台 API，hAdmin 可用于内容巡检和统计
CREATE TABLE IF NOT EXISTS user_notes (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  lesson_id INT,
  title VARCHAR(255),
  content TEXT NOT NULL,
  chapter_id VARCHAR(36),
  tags JSON NULL,
  is_public BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 社区帖子：Express 提供前台发布/互动 API，hAdmin 负责审核和置顶
CREATE TABLE IF NOT EXISTS community_posts (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  tags JSON NULL,
  status VARCHAR(30) DEFAULT 'published',
  is_pinned BOOLEAN DEFAULT FALSE,
  is_hot BOOLEAN DEFAULT FALSE,
  view_count INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_community_posts_status_created (status, created_at),
  INDEX idx_community_posts_user_id (user_id)
);

CREATE TABLE IF NOT EXISTS community_comments (
  id VARCHAR(36) PRIMARY KEY,
  post_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(30) DEFAULT 'published',
  parent_id VARCHAR(36) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_community_comments_post_id (post_id),
  INDEX idx_community_comments_status (status)
);

CREATE TABLE IF NOT EXISTS community_likes (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  post_id VARCHAR(36) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY user_post_like (user_id, post_id),
  INDEX idx_community_likes_post_id (post_id)
);

CREATE TABLE IF NOT EXISTS community_bookmarks (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  post_id VARCHAR(36) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY user_post_bookmark (user_id, post_id),
  INDEX idx_community_bookmarks_post_id (post_id)
);

CREATE TABLE IF NOT EXISTS community_reports (
  id VARCHAR(36) PRIMARY KEY,
  reporter_id VARCHAR(36) NOT NULL,
  target_type VARCHAR(30) NOT NULL,
  target_id VARCHAR(36) NOT NULL,
  reason VARCHAR(255) NOT NULL,
  detail TEXT,
  status VARCHAR(30) DEFAULT 'pending',
  handled_by VARCHAR(36),
  handled_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_community_reports_status (status),
  INDEX idx_community_reports_target (target_type, target_id)
);

-- 资源库：hAdmin 维护分类和资源，Express 提供前台查询
CREATE TABLE IF NOT EXISTS resource_categories (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(120) UNIQUE NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0,
  enabled BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS resources (
  id VARCHAR(36) PRIMARY KEY,
  category_id VARCHAR(36),
  title VARCHAR(255) NOT NULL,
  summary TEXT,
  content LONGTEXT,
  resource_type VARCHAR(40) DEFAULT 'article',
  cover_url VARCHAR(500),
  file_url VARCHAR(500),
  tags JSON NULL,
  status VARCHAR(30) DEFAULT 'published',
  sort_order INT DEFAULT 0,
  view_count INT DEFAULT 0,
  download_count INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_resources_category_status (category_id, status),
  INDEX idx_resources_status_sort (status, sort_order)
);

-- TTS 任务：前台创建任务，hAdmin 或异步 worker 回写生成结果
CREATE TABLE IF NOT EXISTS tts_tasks (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  text TEXT NOT NULL,
  voice VARCHAR(80) DEFAULT 'longxiaochun',
  speed DECIMAL(4, 2) DEFAULT 1.00,
  volume DECIMAL(4, 2) DEFAULT 1.00,
  status VARCHAR(30) DEFAULT 'pending',
  audio_url VARCHAR(500),
  error_message TEXT,
  metadata JSON NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tts_tasks_user_created (user_id, created_at),
  INDEX idx_tts_tasks_status (status)
);

-- 角色种子数据
INSERT IGNORE INTO roles (id, code, name, description) VALUES
(UUID(), 'super_admin', '超级管理员', '拥有全部后台权限'),
(UUID(), 'content_admin', '内容管理员', '管理章节、学习路径和资源'),
(UUID(), 'community_moderator', '社区审核员', '管理社区内容和举报'),
(UUID(), 'ai_operator', 'AI 运维', '管理 AI 配置和调用统计');

-- 权限种子数据
INSERT IGNORE INTO permissions (id, code, name, description) VALUES
(UUID(), 'admin:read', '查看后台基础信息', NULL),
(UUID(), 'user:list', '查看用户列表', NULL),
(UUID(), 'user:update', '更新用户状态', NULL),
(UUID(), 'content:manage', '管理内容配置', NULL),
(UUID(), 'resource:manage', '管理资源库', NULL),
(UUID(), 'community:moderate', '审核社区内容', NULL),
(UUID(), 'tts:manage', '管理 TTS 任务', NULL),
(UUID(), 'ai_config:manage', '管理 AI 配置', NULL),
(UUID(), 'audit:read', '查看操作日志', NULL);

-- 超级管理员默认拥有全部权限
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.code = 'super_admin';

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN ('content:manage', 'resource:manage')
WHERE r.code = 'content_admin';

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code = 'community:moderate'
WHERE r.code = 'community_moderator';

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN ('ai_config:manage', 'tts:manage', 'audit:read')
WHERE r.code = 'ai_operator';

INSERT IGNORE INTO resource_categories (id, slug, name, description) VALUES
(UUID(), 'dao-texts', '经典原文', '道德经原文、译注与版本资料'),
(UUID(), 'audio', '音频资源', '诵读、讲解和 TTS 音频'),
(UUID(), 'learning', '学习资料', '课程、导读、练习与拓展阅读');

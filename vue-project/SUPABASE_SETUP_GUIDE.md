# Supabase 项目创建与配置指南

## 1. 创建 Supabase 项目

### 步骤 1：注册 Supabase 账号
1. 访问 [Supabase 官方网站](https://supabase.com/)
2. 点击 "Start your project" 或 "Sign Up"
3. 使用 GitHub、Google 或电子邮件注册账号

### 步骤 2：创建新项目
1. 登录后，进入 Supabase 控制台
2. 点击 "New project" 按钮
3. 填写项目信息：
   - **Project name**: daodejing-platform
   - **Database Password**: 设置一个强密码并保存好
   - **Region**: 选择离你最近的区域（如 Singapore）
4. 点击 "Create project" 按钮
5. 等待项目创建完成（约 2-3 分钟）

### 步骤 3：获取 API 密钥
1. 项目创建完成后，进入项目控制台
2. 点击左侧菜单的 "Project Settings"
3. 选择 "API" 选项卡
4. 复制以下信息：
   - **Project URL**: 如 `https://your-project-id.supabase.co`
   - **Anon Public API Key**: 如 `********************************************************************************************************************************************************************************************************`
   - **Service Role Key**: 如 `********************************************************************************************************************************************************************************************************`

## 2. 数据库配置

### 步骤 1：创建数据库表
1. 点击左侧菜单的 "Database"
2. 选择 "Table Editor"
3. 点击 "New table" 创建以下表：

#### 2.1 用户表 (users)
- **Table name**: users
- **Columns**:
  | Name | Type | Default | Constraints |
  |------|------|---------|-------------|
  | id | UUID | gen_random_uuid() | Primary Key |
  | username | VARCHAR(50) | - | Unique, Not Null |
  | email | VARCHAR(255) | - | Unique, Not Null |
  | password_hash | VARCHAR(255) | - | Not Null |
  | display_name | VARCHAR(100) | - | - |
  | avatar_url | TEXT | - | - |
  | subscription_tier | VARCHAR(20) | 'free' | CHECK (subscription_tier IN ('free', 'pro', 'master')) |
  | subscription_expiry | TIMESTAMP WITH TIME ZONE | - | - |
  | daily_usage_count | INTEGER | 0 | - |
  | last_usage_date | DATE | CURRENT_DATE | - |
  | created_at | TIMESTAMP WITH TIME ZONE | NOW() | - |
  | updated_at | TIMESTAMP WITH TIME ZONE | NOW() | - |
  | last_login | TIMESTAMP WITH TIME ZONE | - | - |
  | is_active | BOOLEAN | true | - |
  | email_verified | BOOLEAN | false | - |

#### 2.2 学习进度表 (learning_progress)
- **Table name**: learning_progress
- **Columns**:
  | Name | Type | Default | Constraints |
  |------|------|---------|-------------|
  | id | UUID | gen_random_uuid() | Primary Key |
  | user_id | UUID | - | Foreign Key (users.id) |
  | course_id | UUID | - | Foreign Key (courses.id) |
  | chapter_id | UUID | - | Foreign Key (chapters.id) |
  | progress_percentage | INTEGER | 0 | - |
  | completed | BOOLEAN | false | - |
  | last_accessed | TIMESTAMP WITH TIME ZONE | NOW() | - |
  | created_at | TIMESTAMP WITH TIME ZONE | NOW() | - |
  | updated_at | TIMESTAMP WITH TIME ZONE | NOW() | - |

#### 2.3 课程表 (courses)
- **Table name**: courses
- **Columns**:
  | Name | Type | Default | Constraints |
  |------|------|---------|-------------|
  | id | UUID | gen_random_uuid() | Primary Key |
  | title | VARCHAR(255) | - | Not Null |
  | description | TEXT | - | - |
  | level | VARCHAR(20) | 'beginner' | CHECK (level IN ('beginner', 'intermediate', 'advanced')) |
  | duration | INTEGER | - | - |
  | total_chapters | INTEGER | 0 | - |
  | thumbnail_url | TEXT | - | - |
  | created_at | TIMESTAMP WITH TIME ZONE | NOW() | - |
  | updated_at | TIMESTAMP WITH TIME ZONE | NOW() | - |

#### 2.4 章节表 (chapters)
- **Table name**: chapters
- **Columns**:
  | Name | Type | Default | Constraints |
  |------|------|---------|-------------|
  | id | UUID | gen_random_uuid() | Primary Key |
  | course_id | UUID | - | Foreign Key (courses.id) |
  | title | VARCHAR(255) | - | Not Null |
  | content | TEXT | - | - |
  | order_number | INTEGER | 0 | - |
  | duration | INTEGER | - | - |
  | created_at | TIMESTAMP WITH TIME ZONE | NOW() | - |
  | updated_at | TIMESTAMP WITH TIME ZONE | NOW() | - |

## 3. 认证配置

### 步骤 1：启用认证方法
1. 点击左侧菜单的 "Authentication"
2. 选择 "Providers"
3. 启用以下认证方法：
   - **Email**: 启用邮箱/密码认证
   - **Google**: 可选，启用 Google 登录
   - **GitHub**: 可选，启用 GitHub 登录

### 步骤 2：配置认证设置
1. 点击 "Settings" 选项卡
2. 设置 "Site URL" 为 `http://localhost:5173`（本地开发）
3. 设置 "Additional redirect URLs" 为生产环境 URL
4. 配置邮箱模板和其他认证选项

## 4. 安全策略配置

### 步骤 1：设置 Row Level Security (RLS)
1. 对于每个表，启用 RLS 并创建适当的策略
2. 例如，对于 `users` 表：
   - 允许用户查看自己的信息
   - 允许管理员查看所有用户信息

### 步骤 2：配置存储策略
1. 点击左侧菜单的 "Storage"
2. 创建存储桶用于上传头像和其他文件
3. 设置适当的访问权限

## 5. 本地项目配置

### 步骤 1：创建环境变量文件
1. 在项目根目录创建 `.env` 文件
2. 添加以下内容：

```env
# Supabase 配置
VITE_SUPABASE_URL=你的项目 URL
VITE_SUPABASE_ANON_KEY=你的 Anon Public API Key
VITE_SUPABASE_SERVICE_KEY=你的 Service Role Key

# 应用配置
VITE_APP_URL=http://localhost:5173
VITE_NODE_ENV=development
```

### 步骤 2：创建 Supabase 客户端
1. 在 `src/services` 目录创建 `supabaseService.ts` 文件
2. 实现 Supabase 客户端实例和认证服务

## 6. 测试与验证

### 步骤 1：测试认证功能
1. 实现注册、登录、登出功能
2. 测试用户创建和会话管理

### 步骤 2：测试数据库操作
1. 测试课程和学习进度的 CRUD 操作
2. 验证权限控制是否正常

## 7. 部署准备

### 步骤 1：更新环境变量
1. 为生产环境创建 `.env.production` 文件
2. 使用生产环境的 Supabase 配置

### 步骤 2：构建项目
1. 运行 `npm run build` 命令
2. 验证构建是否成功

## 8. 监控与维护

### 步骤 1：设置监控
1. 启用 Supabase 监控功能
2. 配置错误跟踪和性能监控

### 步骤 2：定期维护
1. 定期备份数据库
2. 监控 API 使用情况
3. 更新 Supabase 客户端库

---

**注意事项**：
- 妥善保管 API 密钥，不要在代码中硬编码
- 定期更新密码和密钥
- 遵循最佳安全实践
- 测试所有功能在生产环境中的表现

完成以上步骤后，你的 Supabase 项目将完全配置好，可以与 Vue 应用集成使用。
# 道德经平台 - 登录注册功能部署指南

## 系统架构概述

本项目采用前后端分离架构：
- **前端**: Vue 3 + TypeScript + Pinia + Tailwind CSS
- **后端**: Supabase (PostgreSQL数据库 + 认证服务 + 存储服务)
- **数据库**: Supabase PostgreSQL

## 部署步骤

### 1. 环境准备

#### 1.1 安装Node.js依赖
```bash
# 进入前端目录
cd "c:\Users\39937\Desktop\新建文件夹\daodejing-2.0\vue-project"

# 安装Node.js依赖
npm install

# 安装Supabase客户端库
npm install @supabase/supabase-js
```

### 2. Supabase配置

#### 2.1 创建Supabase项目
1. 访问 [Supabase官网](https://supabase.com)
2. 注册并登录账号
3. 点击"New project"创建新项目
4. 填写项目信息：
   - **Project name**: daodejing-platform
   - **Database Password**: 设置强密码并保存
   - **Region**: 选择离你最近的区域（如Singapore）
5. 点击"Create project"按钮
6. 等待项目创建完成（约2-3分钟）

#### 2.2 获取API密钥
1. 项目创建完成后，进入项目控制台
2. 点击左侧菜单的"Project Settings"
3. 选择"API"选项卡
4. 复制以下信息：
   - **Project URL**
   - **Anon Public API Key**
   - **Service Role Key**

#### 2.3 创建数据库表
1. 点击左侧菜单的"Database"
2. 选择"Table Editor"
3. 点击"New table"创建以下表：
   - **users** - 用户表
   - **learning_progress** - 学习进度表
   - **courses** - 课程表
   - **chapters** - 章节表

   详细表结构参考 `SUPABASE_SETUP_GUIDE.md` 文件。

#### 2.4 配置认证服务
1. 点击左侧菜单的"Authentication"
2. 选择"Providers"
3. 启用邮箱/密码认证
4. 设置"Site URL"为 `http://localhost:5173`（本地开发）

### 3. 配置环境变量

#### 3.1 前端配置 (vue-project/.env)
```env
# Supabase 配置
VITE_SUPABASE_URL=你的项目 URL
VITE_SUPABASE_ANON_KEY=你的 Anon Public API Key
VITE_SUPABASE_SERVICE_KEY=你的 Service Role Key

# 应用配置
VITE_APP_URL=http://localhost:5173
VITE_NODE_ENV=development
```

### 4. 启动服务

#### 4.1 启动前端服务
```bash
# 进入前端目录
cd "c:\Users\39937\Desktop\新建文件夹\daodejing-2.0\vue-project"

# 启动Vue开发服务器
npm run dev
```

前端服务将运行在：`http://localhost:3000`（或其他可用端口）

### 5. 功能测试

#### 5.1 注册功能测试
1. 访问 `http://localhost:3000`
2. 点击右上角"登录/注册"按钮
3. 切换到"注册"标签
4. 填写以下信息：
   - 用户名：testuser
   - 邮箱：test@example.com
   - 密码：test123456
5. 点击"注册"按钮
6. 检查 Supabase 控制台中的用户是否创建成功

#### 5.2 登录功能测试
1. 使用已注册的账号登录
2. 验证登录状态是否正确显示
3. 检查用户信息是否正确加载

#### 5.3 登出功能测试
1. 登录后点击右上角用户头像
2. 选择"登出"选项
3. 验证是否成功登出

## Supabase 认证服务

### 认证方法
- **邮箱/密码认证**：支持用户注册、登录、密码重置
- **第三方登录**：可选启用 Google、GitHub 等 OAuth 登录

### 安全特性
- **密码安全**：Supabase 自动处理密码哈希和存储
- **JWT认证**：使用 JSON Web Tokens 进行身份验证
- **邮箱验证**：支持发送邮箱验证链接
- **密码重置**：支持通过邮箱重置密码

### 数据库表结构

详细的数据库表结构参考 `SUPABASE_SETUP_GUIDE.md` 文件，包括：
- **users** - 用户表
- **learning_progress** - 学习进度表
- **courses** - 课程表
- **chapters** - 章节表

## 故障排除

### 常见问题

#### 1. Supabase 连接失败
- 检查环境变量配置是否正确
- 验证 Supabase 项目是否正常运行
- 检查网络连接是否稳定

#### 2. 认证失败
- 检查邮箱和密码是否正确
- 验证 Supabase 认证服务是否启用
- 检查 JWT Token 是否有效

#### 3. 数据库操作失败
- 检查数据库表结构是否正确创建
- 验证 Row Level Security (RLS) 策略是否正确配置
- 检查用户权限是否足够

### 日志查看

#### Supabase 日志
- 登录 Supabase 控制台
- 点击左侧菜单的 "Database" -> "Logs"
- 查看数据库操作日志

#### 前端日志
- 浏览器开发者工具 -> Console
- 查看网络请求状态
- 检查 Supabase 错误信息

## 扩展功能

### 已实现功能
- [x] 邮箱/密码认证
- [x] 邮箱验证
- [x] 密码重置
- [x] 用户信息管理
- [x] 学习进度跟踪

### 待实现功能
- [ ] 第三方登录（Google、GitHub）
- [ ] 用户头像上传
- [ ] 订阅管理
- [ ] 多语言支持

### 性能优化建议
- 使用 Supabase 的缓存策略
- 优化数据库查询
- 实现前端状态管理
- 合理使用 Supabase 的实时功能

## 技术支持

如有问题，请检查：
1. Supabase 项目配置是否正确
2. 环境变量是否正确设置
3. 数据库表结构是否完整
4. 认证服务是否启用

完成以上步骤后，您的道德经平台将具备完整的用户认证系统和学习进度跟踪功能！
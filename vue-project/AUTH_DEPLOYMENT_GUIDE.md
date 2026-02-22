# 道德经平台 - 登录注册功能部署指南

## 系统架构概述

本项目采用前后端分离架构：
- **前端**: Vue 3 + TypeScript + Pinia + Tailwind CSS
- **后端**: Python Flask + JWT认证 + PostgreSQL数据库
- **数据库**: PostgreSQL (支持本地或Supabase云数据库)

## 部署步骤

### 1. 环境准备

#### 1.1 安装Python依赖
```bash
# 进入后端目录
cd "c:\Users\39937\Desktop\新建文件夹\daodejing-2.0\道德经平台\AI"

# 安装Python依赖
pip install -r requirements.txt
```

#### 1.2 安装Node.js依赖
```bash
# 进入前端目录
cd "c:\Users\39937\Desktop\新建文件夹\daodejing-2.0\vue-project"

# 安装Node.js依赖
npm install
```

### 2. 数据库配置

#### 2.1 本地PostgreSQL数据库
1. 安装PostgreSQL数据库
2. 创建数据库：`createdb daodejing`
3. 修改AI目录下的`.env`文件中的数据库配置

#### 2.2 Supabase云数据库（推荐）
1. 访问 [Supabase官网](https://supabase.com)
2. 创建新项目
3. 获取连接信息并更新`.env`文件

#### 2.3 初始化数据库
```bash
# 进入后端目录
cd "c:\Users\39937\Desktop\新建文件夹\daodejing-2.0\道德经平台\AI"

# 运行数据库初始化脚本
python database_init.py
```

### 3. 配置环境变量

#### 3.1 后端配置 (AI/.env)
```env
# 数据库配置
DB_HOST=localhost
DB_NAME=daodejing
DB_USER=postgres
DB_PASSWORD=your-password
DB_PORT=5432

# JWT配置
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7

# AI API配置（可选）
DEEPSEEK_ENABLED=false
DEEPSEEK_API_KEY=your-key
```

#### 3.2 前端配置 (vue-project/.env.development)
```env
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=道德经AI平台
```

### 4. 启动服务

#### 4.1 启动后端服务
```bash
# 进入后端目录
cd "c:\Users\39937\Desktop\新建文件夹\daodejing-2.0\道德经平台\AI"

# 启动Flask应用
python app.py
```

后端服务将运行在：`http://localhost:8000`

#### 4.2 启动前端服务
```bash
# 进入前端目录
cd "c:\Users\39937\Desktop\新建文件夹\daodejing-2.0\vue-project"

# 启动Vue开发服务器
npm run dev
```

前端服务将运行在：`http://localhost:3000`

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

#### 5.2 登录功能测试
1. 使用已注册的账号登录
2. 或使用示例账号：
   - 邮箱：test@example.com
   - 密码：test123456

## API接口文档

### 认证相关接口

#### 用户注册
- **URL**: `POST /api/auth/register`
- **参数**:
  ```json
  {
    "username": "用户名",
    "email": "邮箱",
    "password": "密码",
    "display_name": "显示名称（可选）"
  }
  ```

#### 用户登录
- **URL**: `POST /api/auth/login`
- **参数**:
  ```json
  {
    "email": "邮箱",
    "password": "密码"
  }
  ```

#### 获取用户信息
- **URL**: `GET /api/auth/profile`
- **认证**: 需要Bearer Token

#### 用户登出
- **URL**: `POST /api/auth/logout`

### 数据库表结构

#### users表
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    subscription_tier VARCHAR(20) DEFAULT 'free',
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);
```

## 安全特性

### 密码安全
- 使用bcrypt进行密码哈希
- 密码强度验证（至少8位，包含字母和数字）
- 密码复杂度检查

### JWT认证
- Token过期时间：7天
- 自动刷新机制
- 安全的Token存储

### 数据保护
- SQL注入防护
- XSS攻击防护
- 敏感信息加密存储

## 故障排除

### 常见问题

#### 1. 数据库连接失败
- 检查PostgreSQL服务是否启动
- 验证数据库连接配置
- 检查防火墙设置

#### 2. JWT认证失败
- 检查JWT_SECRET配置
- 验证Token格式
- 检查Token过期时间

#### 3. 跨域请求错误
- 确保后端CORS配置正确
- 检查前端API URL配置

#### 4. 密码验证失败
- 检查密码哈希算法
- 验证密码强度要求

### 日志查看

#### 后端日志
```bash
# 查看Flask应用日志
python app.py
```

#### 前端日志
- 浏览器开发者工具 -> Console
- 查看网络请求状态

## 扩展功能

### 待实现功能
- [ ] 邮箱验证
- [ ] 密码重置
- [ ] 第三方登录（微信、GitHub）
- [ ] 用户头像上传
- [ ] 订阅管理

### 性能优化建议
- 实现数据库连接池
- 添加Redis缓存
- 优化JWT Token刷新机制
- 实现API限流

## 技术支持

如有问题，请检查：
1. 环境变量配置是否正确
2. 数据库连接是否正常
3. 服务端口是否被占用
4. 依赖包版本是否兼容

完成以上步骤后，您的道德经平台将具备完整的用户认证系统！
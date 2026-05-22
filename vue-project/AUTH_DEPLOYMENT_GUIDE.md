# 道德经平台 - 认证与双后端部署指南

## 1. 架构结论

本项目统一采用“双后端并存”技术路线：

- **前台应用**：Vue 3 + TypeScript + Vite + Pinia + Tailwind CSS。
- **前台业务后端**：Node.js + Express + MySQL + JWT，目录为 `backend/`。
- **后台管理后端**：hAdmin 独立服务，负责后台管理、RBAC、内容配置和运营审核。
- **数据库**：MySQL 主业务数据库，Express 和 hAdmin 通过同库或内部 API 协作。

旧文档中的 Python Flask、SQLite、PostgreSQL 不再作为当前项目主技术路线。

## 2. 服务职责

| 服务 | 默认地址 | 职责 |
| --- | --- | --- |
| Vue 前台 | `http://localhost:3000` | 页面展示、用户交互、调用 Express `/api/*` |
| Express 前台业务后端 | `http://localhost:8000` | 用户认证、前台业务 API、AI/TTS 代理、业务校验 |
| hAdmin 后台管理后端 | 建议 `http://localhost:8001` | 管理员登录、RBAC、内容管理、社区审核、AI 配置、运营报表 |
| MySQL | `localhost:3306` | 主业务数据存储 |

## 3. 环境准备

### 3.1 安装 Node.js 依赖

后端：

```bash
cd ../backend
npm install
```

前端：

```bash
cd ../vue-project
npm install
```

### 3.2 准备 MySQL

当前项目已有 MySQL 初始化脚本：

- `MySQL 登录注册数据库初始化脚本.sql`
- `MySQL 数据库初始化脚本.sql`

建议先创建数据库 `daodejing_platform`，再执行初始化脚本。

生产环境请修改默认数据库账号密码，不要使用示例密码。

## 4. Express 后端配置

在 `backend/.env` 中配置：

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=daodejing
MYSQL_PASSWORD=password
MYSQL_DATABASE=daodejing_platform
PORT=8000
NODE_ENV=development
JWT_SECRET=please-change-this-secret
ADMIN_JWT_SECRET=please-change-this-admin-secret
HADMIN_INTERNAL_TOKEN=please-change-this-hadmin-token

# 可选：AI 代理密钥，未配置时后端返回演示模式响应
DEEPSEEK_API_KEY=
OPENROUTER_API_KEY=
OPENAI_API_KEY=
```

说明：

- `backend/.env` 不应提交到 Git。
- 生产环境必须使用高强度 `JWT_SECRET`。
- 当前代码兼容 `VITE_MYSQL_*` 旧变量名，但推荐使用 `MYSQL_HOST`、`MYSQL_PORT`、`MYSQL_USER`、`MYSQL_PASSWORD`、`MYSQL_DATABASE`。

## 5. 前端配置

Vite 开发服务器已在 `vite.config.ts` 中配置 `/api` 代理到 `http://localhost:8000`。

如需显式配置前端环境变量，可新增 `vue-project/.env.development`：

```env
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=道德经AI平台
```

注意：

- `VITE_` 前缀变量会暴露到浏览器。
- 不要在前端环境变量中放置数据库密码、AI 平台级密钥、Supabase service key 或后台 JWT Secret。
- 前端历史 `mysqlService` 已改为兼容层，不再打包 Node/MySQL 直连逻辑。

## 6. 启动服务

### 6.1 启动 Express 前台业务后端

```bash
cd ../backend
npm run dev
```

服务地址：

```text
http://localhost:8000
```

健康检查：

```text
http://localhost:8000/api/health
```

### 6.2 启动 Vue 前台

```bash
cd ../vue-project
npm run dev
```

前台地址：

```text
http://localhost:3000
```

### 6.3 启动 hAdmin 后台管理后端

hAdmin 尚未放入当前仓库，接入后建议：

- 服务端口：`8001`。
- 管理端 API 前缀：`/admin-api` 或 hAdmin 自身接口。
- 数据库：连接同一个 MySQL 主业务数据库。
- 高风险操作：调用 Express 内部管理 API。

具体启动命令以实际 hAdmin 项目为准。

### 6.4 管理端迁移脚本

接入 hAdmin 前，建议执行：

```text
../backend/hadmin-dual-backend-migration.sql
```

Express 启动时也会自动确保管理端基础表存在，但生产环境仍建议通过迁移脚本管理表结构变更。

## 7. 当前认证接口

### 7.1 用户注册

```text
POST /api/auth/register
```

请求示例：

```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "test123456"
}
```

### 7.2 用户登录

```text
POST /api/auth/login
```

请求示例：

```json
{
  "email": "test@example.com",
  "password": "test123456"
}
```

### 7.3 获取当前用户

```text
GET /api/auth/me
Authorization: Bearer <token>
```

### 7.4 健康检查

```text
GET /api/health
```

### 7.5 AI 后端代理

```text
POST /api/ai/chat
Authorization: Bearer <user-token>
```

前端 AI 服务已改为优先调用 Express 后端代理，不再在浏览器保存平台级 API Key。AI Key 应配置在 `backend/.env` 或由 hAdmin 写入服务端配置。

### 7.6 TTS 后端代理

```text
POST /api/tts/synthesize
Authorization: Bearer <user-token>
```

前端 CosyVoice 服务已改为调用 Express 后端代理，不再使用 Vite `/dashscope-api` 代理，也不在浏览器保存 DashScope/CosyVoice API Key。未配置服务端 TTS Key 时，前端会降级到浏览器内置语音合成。

### 7.7 会话、学习进度和笔记

```text
POST /api/conversations
GET /api/conversations
GET /api/conversations/search
POST /api/conversations/:id/messages
DELETE /api/conversations/:id
GET /api/learning/progress
PUT /api/learning/progress
GET /api/notes
POST /api/notes
PATCH /api/notes/:id
DELETE /api/notes/:id
```

这些接口用于逐步替代 LocalStorage 主数据源。前端仍保留 LocalStorage 作为离线缓存和后端不可用时的兜底。

## 8. 当前管理端桥接接口

### 8.1 管理员登录

```text
POST /api/admin/auth/login
```

### 8.2 当前管理员信息

```text
GET /api/admin/auth/me
Authorization: Bearer <admin-token>
```

### 8.3 用户管理

```text
GET /api/admin/users
PATCH /api/admin/users/:id/status
```

### 8.4 系统配置与审计日志

```text
PUT /api/admin/configs/:key
GET /api/admin/audit-logs
```

### 8.5 hAdmin 内部协作接口

```text
POST /api/admin/internal/users/:id/status
POST /api/admin/internal/ai-usage
Header: X-HAdmin-Token: <HADMIN_INTERNAL_TOKEN>
```

这些内部接口用于 hAdmin 发起高风险写操作时复用 Express 的业务校验、审计日志和数据一致性规则。

## 9. hAdmin 与认证体系的关系

### 9.1 前台用户与后台管理员隔离

不建议 hAdmin 复用前台用户 Token。

建议：

- 前台用户表：`users`。
- 后台管理员表：`admin_users`。
- 前台 JWT Secret：`JWT_SECRET`。
- 后台 JWT Secret：`ADMIN_JWT_SECRET`。
- 前台接口前缀：`/api/*`。
- 后台接口前缀：`/admin-api/*`。

### 9.2 权限边界

Express 负责：

- 前台用户登录注册。
- 前台用户权限。
- 会员等级和使用限制。
- AI/TTS 调用限额。
- 高风险业务写操作。

hAdmin 负责：

- 管理员登录。
- RBAC 权限。
- 内容、资源、提示词、模型配置。
- 社区审核和举报处理。
- 后台操作审计。

## 10. 数据库建议

### 10.1 当前 users 表字段建议

```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  subscription_tier VARCHAR(20) DEFAULT 'free',
  email_verified BOOLEAN DEFAULT false,
  subscription_expiry DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME NULL
);
```

### 10.2 hAdmin 接入后建议新增

```text
admin_users
roles
permissions
role_permissions
admin_operation_logs
dao_chapters
chapter_interpretations
learning_paths
learning_progress
community_posts
community_comments
resources
ai_providers
ai_models
prompt_templates
ai_usage_logs
```

## 11. 安全要求

- 生产环境必须禁用默认 `JWT_SECRET`。
- 登录接口应增加限流和失败次数控制。
- CORS 应限制为可信前端域名。
- AI API Key 只保存在后端，不下发给浏览器。
- Supabase service key 不允许出现在前端构建产物中。
- hAdmin 所有写操作必须记录审计日志。
- 高风险后台操作需要二次鉴权或调用 Express 内部 API。

## 12. 故障排除

### 12.1 数据库连接失败

- 检查 MySQL 服务是否启动。
- 检查 `backend/.env` 中数据库账号、密码、库名是否正确。
- 确认初始化脚本已执行。

### 12.2 前端登录失败

- 确认 Express 后端已启动。
- 访问 `http://localhost:8000/api/health` 检查后端健康状态。
- 检查 Vite `/api` 代理是否仍指向 `http://localhost:8000`。

### 12.3 JWT 认证失败

- 检查 `JWT_SECRET` 是否改变导致旧 Token 失效。
- 清理浏览器 LocalStorage 中的旧 `auth_token` 后重新登录。

### 12.4 hAdmin 无法管理数据

- 确认 hAdmin 连接的是同一个 MySQL 主业务数据库。
- 确认管理端账号和权限已初始化。
- 确认高风险操作是否需要调用 Express 内部管理 API。

## 13. 后续扩展

- 新增 `backend/.env.example` 和 `vue-project/.env.example`。
- 新增 Express `/api/admin/*` 内部管理接口。
- 新增管理员、角色、权限、操作日志表。
- 将 AI 调用从前端直连迁移到 Express 后端代理。
- 将学习进度、社区互动、用户笔记从 LocalStorage 迁移到 MySQL。
- 将 hAdmin 首批菜单接入用户管理、章节管理、资源管理、社区审核、AI 配置管理。

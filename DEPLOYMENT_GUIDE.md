# 道德经平台部署与环境规范

## 1. 当前架构

项目采用双后端并存：

- Vue 前台应用：`vue-project/`，默认 `http://localhost:3000`。
- Express 前台业务后端：`backend/`，默认 `http://localhost:8000`。
- hAdmin 后台管理后端：独立服务，建议默认 `http://localhost:8001`。
- MySQL 主业务数据库：Express 与 hAdmin 通过同库或内部 API 协作。

## 2. 环境变量规范

### 2.1 后端变量

复制样例：

```bash
copy backend\.env.example backend\.env
```

必须配置：

- `MYSQL_HOST`
- `MYSQL_PORT`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `MYSQL_DATABASE`
- `JWT_SECRET`
- `ADMIN_JWT_SECRET`
- `HADMIN_INTERNAL_TOKEN`

生产环境还必须配置：

- `NODE_ENV=production`
- `CORS_ORIGIN=https://your-frontend-domain.example`

可选 AI/TTS 服务端密钥：

- `DEEPSEEK_API_KEY`
- `OPENROUTER_API_KEY`
- `OPENAI_API_KEY`
- `DASHSCOPE_API_KEY`

可选安全与可观测性变量：

- `RATE_LIMIT_WINDOW_MS`：限流窗口，默认 `60000`。
- `API_RATE_LIMIT_MAX`：普通 API 每窗口上限，默认 `120`。
- `AI_RATE_LIMIT_MAX`：AI API 每窗口上限，默认 `30`。
- `TTS_RATE_LIMIT_MAX`：TTS API 每窗口上限，默认 `20`。
- `LOGIN_RATE_LIMIT_MAX`：登录 API 每窗口上限，默认 `10`。
- `LOGIN_FAILURE_LIMIT`：登录失败锁定阈值，默认 `5`。
- `LOGIN_LOCK_MS`：登录锁定时长，默认 `900000`。
- `ENABLE_ACCESS_LOGS`：是否输出结构化访问日志，默认 `true`。
- `AI_DEFAULT_COST_PER_1K_TOKENS`：AI 成本估算单价，默认 `0`。
- `SECURITY_STATE_DRIVER`：安全状态存储，默认 `memory`；多实例建议设为 `mysql`。
- `ALERT_MIN_LEVEL`：告警推送最低级别，默认 `error`。
- `ALERT_WEBHOOK_URL`：告警 Webhook 地址，留空则只写入 `alert_events`。
- `TTS_WORKER_INTERVAL_MS`：TTS worker 轮询间隔，默认 `5000`。
- `TTS_WORKER_BATCH_SIZE`：TTS worker 单次处理数量，默认 `3`。

### 2.2 前端变量

复制样例：

```bash
copy vue-project\.env.example vue-project\.env.development
```

前端只能配置公开变量：

- `VITE_API_URL`
- `VITE_APP_NAME`
- `VITE_APP_VERSION`

禁止放入前端：

- 数据库账号密码。
- AI 平台级 API Key。
- Supabase service role key。
- JWT Secret。
- hAdmin 内部共享令牌。

## 3. 本地启动

最新的本地启动步骤已统一到根目录 [启动方法.txt](启动方法.txt)。本文件仅保留环境变量、迁移、发布检查和部署规范，避免与启动说明重复。

## 4. 发布前检查

后端环境与语法检查：

```bash
npm run backend:check
```

前端类型检查：

```bash
npm run frontend:type-check
```

前端生产构建：

```bash
npm run frontend:build
```

全量检查：

```bash
npm run check
```

## 5. 数据库迁移

迁移脚本入口：

```bash
npm run backend:migrate
```

当前执行文件：

- `backend/hadmin-dual-backend-migration.sql`

说明：

- 本脚本会创建 hAdmin 协作所需表、RBAC 表、审计日志、安全事件日志、外部服务调用日志、AI 配置、AI 用量、学习进度、用户笔记、社区、资源库和 TTS 任务表。
- 生产环境建议先备份数据库，再执行迁移。
- 所有表结构变更应通过迁移脚本维护，不建议 hAdmin 和 Express 各自随意改表。

## 6. hAdmin 接入规范

hAdmin 应配置：

- 同一个 MySQL 主业务库。
- 与 Express 一致的 `HADMIN_INTERNAL_TOKEN`。
- 独立管理员账号体系。

hAdmin 可直接管理：

- `system_configs`
- `ai_providers`
- 内容、资源、提示词等低风险配置表。

hAdmin 高风险操作应调用：

- `POST /api/admin/internal/users/:id/status`
- `POST /api/admin/internal/ai-usage`
- `POST /api/admin/internal/community/posts/:id/status`
- `POST /api/admin/internal/tts/tasks/:id`
- `GET /api/admin/internal/metrics`

前台业务 API：

- `GET/POST /api/community/posts`
- `GET/POST /api/community/posts/:id/comments`
- `POST /api/community/posts/:id/like`
- `POST /api/community/posts/:id/bookmark`
- `POST /api/community/reports`
- `GET /api/resources/categories`
- `GET /api/resources`
- `POST /api/tts/tasks`
- `GET /api/tts/tasks`

请求头：

```text
X-HAdmin-Token: <HADMIN_INTERNAL_TOKEN>
X-HAdmin-Admin-Id: <管理员ID>
X-HAdmin-Admin-Name: <管理员名称>
```

## 7. 生产安全要求

- 禁止使用 `.env.example` 中的示例密钥。
- `JWT_SECRET`、`ADMIN_JWT_SECRET`、`HADMIN_INTERNAL_TOKEN` 至少 32 位随机字符串。
- `CORS_ORIGIN` 必须限制为正式前端域名。
- 前端构建产物不得包含任何平台级 API Key。
- MySQL 不允许使用示例密码 `password` 或 `change-me`。
- hAdmin 管理员与前台用户必须使用不同账号体系。
- 所有后台写操作必须写入 `admin_operation_logs`。
- 多实例部署时，建议将限流和登录锁定状态迁移到 Redis 或 API 网关。

## 8. 运行状态与观测

健康检查：

```bash
curl http://localhost:8000/api/health
curl http://localhost:8000/api/health/ready
```

管理端指标：

- `GET /api/admin/metrics`：管理员 JWT 访问，查看请求量、延迟、安全事件、AI/TTS 成本统计。
- `GET /api/admin/internal/metrics`：hAdmin 使用 `X-HAdmin-Token` 访问，查看运行时基础指标。
- `GET /api/admin/alerts`：查看告警事件。
- `PATCH /api/admin/alerts/:id/handled`：标记告警已处理。

日志与审计：

- 访问日志输出为 JSON，包含 `requestId`、路径、状态码、耗时、用户或管理员 ID。
- 登录失败、登录成功、锁定相关事件写入 `security_events`。
- AI/TTS 调用写入 `external_service_call_logs`，AI token 和成本同时写入 `ai_usage_logs`。
- 限流、登录锁定、worker 失败等告警写入 `alert_events`，配置 `ALERT_WEBHOOK_URL` 后会同步推送。

## 9. 多实例部署建议

- 单实例开发环境可使用 `SECURITY_STATE_DRIVER=memory`。
- 多实例生产环境建议使用 `SECURITY_STATE_DRIVER=mysql`，使限流桶和登录锁定状态写入 MySQL。
- TTS 生成建议以独立进程运行 `npm run backend:worker:tts`，不要阻塞 Express 请求线程。
- 如果已有 API 网关或 Redis，可将限流迁移到网关/Redis，Express 保留审计和告警。

## 10. 常见问题

### MySQL 连接失败

检查：

- MySQL 服务是否启动。
- `backend/.env` 数据库配置是否正确。
- 数据库 `daodejing_platform` 是否存在。
- 当前用户是否有建表、读写权限。

### 前端无法登录

检查：

- Express 是否启动在 `http://localhost:8000`。
- `vue-project/vite.config.ts` 中 `/api` 代理是否正确。
- 浏览器 LocalStorage 中旧 Token 是否需要清理。

### AI 或 TTS 返回演示/浏览器降级

说明：

- 未配置 `DEEPSEEK_API_KEY`、`OPENROUTER_API_KEY`、`OPENAI_API_KEY` 时，AI 代理会返回演示模式响应。
- 未配置 `DASHSCOPE_API_KEY` 时，TTS 会降级到浏览器内置语音合成。

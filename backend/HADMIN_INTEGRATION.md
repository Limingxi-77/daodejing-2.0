# hAdmin 双后端接入说明

## 架构定位

当前 Express 服务作为前台业务后端，hAdmin 作为后台管理后端。两者通过同一个 MySQL 主业务库和 Express 内部管理 API 协作。

## hAdmin 可直接管理的数据

适合由 hAdmin 直接读写 MySQL 的低风险数据：

- `system_configs`
- `ai_providers`
- `resource_categories`
- `resources`
- 章节、提示词模板等内容配置表
- 后台菜单、角色、权限配置表

## hAdmin 应调用 Express 的内部 API

涉及业务一致性或审计要求的高风险操作，应调用 Express 内部 API：

```text
POST /api/admin/internal/users/:id/status
POST /api/admin/internal/ai-usage
POST /api/admin/internal/community/posts/:id/status
POST /api/admin/internal/tts/tasks/:id
GET /api/admin/internal/metrics
```

请求头：

```text
X-HAdmin-Token: <HADMIN_INTERNAL_TOKEN>
X-HAdmin-Admin-Id: <管理员ID>
X-HAdmin-Admin-Name: <管理员名称>
```

## hAdmin 内部 API 示例

禁用用户：

```http
POST /api/admin/internal/users/user-id/status
X-HAdmin-Token: change-me-hadmin-internal-token
Content-Type: application/json

{
  "is_active": false,
  "reason": "社区违规"
}
```

写入 AI 用量：

```http
POST /api/admin/internal/ai-usage
X-HAdmin-Token: change-me-hadmin-internal-token
Content-Type: application/json

{
  "user_id": "user-id",
  "provider_name": "deepseek",
  "model_name": "deepseek-chat",
  "prompt_tokens": 100,
  "completion_tokens": 300,
  "total_tokens": 400,
  "estimated_cost": 0.001,
  "status": "success"
}
```

读取 Express 运行指标：

```http
GET /api/admin/internal/metrics
X-HAdmin-Token: change-me-hadmin-internal-token
```

返回内容包含请求总量、当前并发、平均延迟、状态码分布、限流桶数量和登录失败桶数量。hAdmin 可将该接口接入后台首页监控卡片。

审核社区帖子：

```http
POST /api/admin/internal/community/posts/post-id/status
X-HAdmin-Token: change-me-hadmin-internal-token
Content-Type: application/json

{
  "status": "hidden",
  "reason": "违规内容"
}
```

回写 TTS 任务结果：

```http
POST /api/admin/internal/tts/tasks/task-id
X-HAdmin-Token: change-me-hadmin-internal-token
Content-Type: application/json

{
  "status": "completed",
  "audioUrl": "https://cdn.example.com/audio/task-id.mp3"
}
```

## 安全与观测表

hAdmin 可只读展示以下日志表：

- `admin_operation_logs`：后台管理员操作审计。
- `security_events`：用户/管理员登录成功、登录失败等安全事件。
- `external_service_call_logs`：AI/TTS 外部服务调用、耗时、状态、成本估算。
- `ai_usage_logs`：AI token 与成本统计。
- `alert_events`：限流、登录锁定、worker 失败等告警事件。
- `community_posts`、`community_comments`、`community_reports`：社区内容审核。
- `resources`、`resource_categories`：资源库内容维护。
- `tts_tasks`：TTS 任务状态和音频结果管理。

Express 同时提供：

- `GET /api/health`：服务与数据库健康检查。
- `GET /api/health/ready`：适合发布系统或容器探针使用的就绪检查。
- `GET /api/admin/metrics`：管理员 JWT 访问的完整指标接口。
- `GET /api/admin/alerts`：告警事件列表。
- `PATCH /api/admin/alerts/:id/handled`：标记告警已处理。

## 生产多实例建议

- Express 可将 `SECURITY_STATE_DRIVER` 设为 `mysql`，让限流与登录锁定状态写入 `rate_limit_buckets`、`login_failure_buckets`。
- hAdmin 可只读展示 `rate_limit_buckets`、`login_failure_buckets`，但不建议直接修改。
- TTS 异步生成由 `npm run backend:worker:tts` 执行，worker 从 `tts_tasks` 认领 `pending` 任务并回写结果。
- 告警默认写入 `alert_events`；配置 `ALERT_WEBHOOK_URL` 后可推送到企业微信、飞书、云监控或自建告警服务。

## 初始化步骤

1. 执行 `hadmin-dual-backend-migration.sql`。
2. 配置 `backend/.env` 中的 `HADMIN_INTERNAL_TOKEN`。
3. 在 hAdmin 配置同一个 `HADMIN_INTERNAL_TOKEN`。
4. hAdmin 低风险管理页面直接连接 MySQL 或调用自身 CRUD。
5. hAdmin 高风险操作通过 Express `/api/admin/internal/*`。

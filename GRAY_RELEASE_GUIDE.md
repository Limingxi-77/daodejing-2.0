# 灰度发布与回滚指南

## 1. 目标
- 适用于当前双后端架构：`Express` 承担前台业务，`hAdmin` 承担后台管理。
- 目标是把发布拆成“可观察、可回退、可局部止损”的多个阶段，而不是一次性全量切换。

## 2. 发布前检查
- 执行 `npm run backend:check`
- 执行 `npm run backend:test`
- 执行 `npm run frontend:type-check`
- 执行 `npm run frontend:build`
- 执行 `npm run frontend:e2e`
- 在目标环境执行 `npm run backend:smoke`
- 确认 `backend/.env`、`vue-project/.env.*`、`HADMIN_INTERNAL_TOKEN`、数据库备份都已就绪

## 3. 灰度阶段
- 阶段 0：仅发布数据库变更与只读配置，不切用户流量
- 阶段 1：仅内部管理员验证 `hAdmin`、`/api/admin/internal/*`、核心指标页
- 阶段 2：放量 5%～10% 前台流量到新版本 `Express`
- 阶段 3：放量 30%～50% 并观察 30 分钟
- 阶段 4：全量发布，并保留上一版本实例与 worker 观察窗口

## 4. 观察窗口
- 健康检查：`/api/health`、`/api/health/ready`
- 后台指标：`/api/admin/internal/metrics`、`/api/admin/metrics`
- 安全事件：`security_events`
- 外部调用：`external_service_call_logs`
- 告警事件：`alert_events`
- TTS 队列：`tts_tasks` 中 `pending`、`processing`、`failed` 数量

## 5. Smoke Test
- 默认命令：`npm run backend:smoke`
- 必填环境变量：`SMOKE_BASE_URL`
- 可选环境变量：`SMOKE_USER_EMAIL`、`SMOKE_USER_PASSWORD`
- hAdmin 联调可选：`SMOKE_HADMIN_TOKEN`
- 该脚本会检查健康接口、资源列表，以及可选的登录/社区/TTS/内部指标链路

## 6. 回滚策略
- 前端回滚：切回上一个静态资源版本，并清理 CDN/反向代理缓存
- Express 回滚：切回上一版本服务实例，保留当前数据库只读观察
- hAdmin 回滚：只回退后台管理服务，不影响前台 `Express` 对外 API
- Worker 回滚：停止 `npm run backend:worker:tts`，避免继续消费异常任务
- 数据回滚：仅对“已验证可逆”的迁移执行回退；高风险迁移优先使用备份恢复

## 7. 强制止损条件
- `/api/health/ready` 连续失败
- 登录成功率、社区发帖成功率、TTS 创建成功率持续异常
- `alert_events` 出现高优先级未处理告警
- `tts_tasks` 大量积压在 `processing`

## 8. 建议执行顺序
- 先迁移数据库，再发 `Express`
- 再发 `hAdmin`
- 最后启动或切换 `TTS worker`
- 每个阶段至少完成一次 `backend:smoke` 和一次人工核心链路抽样

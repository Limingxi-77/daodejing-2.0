# 上线验收清单

## 1. 环境与部署

- [ ] `backend/.env` 已按 `backend/.env.example` 补齐真实配置。
- [ ] `vue-project/.env.development` / 生产环境变量已补齐公开配置。
- [ ] MySQL 已启动，`npm run backend:migrate` 执行成功。
- [ ] Express 主服务可通过 `npm run backend:dev` 或 `npm run backend:start` 启动。
- [ ] TTS worker 可通过 `npm run backend:worker:tts` 启动。
- [ ] hAdmin 与 Express 使用同一业务库且 `HADMIN_INTERNAL_TOKEN` 一致。

## 2. 自动化检查

- [ ] `npm run backend:check` 通过。
- [ ] `npm run backend:test` 通过。
- [ ] `npm run frontend:type-check` 通过。
- [ ] `npm run frontend:build` 通过。
- [ ] `npm run frontend:e2e` 通过。
- [ ] 目标环境执行 `npm run backend:smoke` 通过。
- [ ] CI 工作流 [ci.yml](</C:/Users/32415/OneDrive/Desktop/daodejing-2.0/.github/workflows/ci.yml>) 运行成功。

## 3. 业务回归

- [ ] 用户注册、登录、`/api/auth/me` 正常。
- [ ] 社区帖子创建、点赞、收藏、举报、后台审核正常。
- [ ] 资源分类、资源列表、浏览量、下载量统计正常。
- [ ] TTS 任务创建后可由 worker 回写 `completed` / `failed`。
- [ ] 后台用户管理、系统配置、告警列表、AI/TTS 指标页正常。

## 4. 安全与观测

- [ ] 生产环境未使用示例密钥和弱密码。
- [ ] `SECURITY_STATE_DRIVER` 在多实例环境已切换为 `mysql` 或已由网关承接限流。
- [ ] `/api/health`、`/api/health/ready`、`/api/admin/metrics` 返回正常。
- [ ] `GRAY_RELEASE_GUIDE.md` 中的灰度观察窗口、回滚与止损条件已纳入发布流程。
- [ ] `alert_events`、`security_events`、`external_service_call_logs` 有数据写入。
- [ ] `ALERT_WEBHOOK_URL` 已配置时，关键告警能成功推送。

## 5. 发布后检查

- [ ] 首次发布后检查 `tts_tasks` 是否有卡在 `processing` 的任务。
- [ ] 检查 `rate_limit_buckets`、`login_failure_buckets` 是否按预期清理过期数据。
- [ ] 检查 `alert_events` 是否存在未处理高优先级告警。
- [ ] 抽样确认前端构建产物未暴露平台级密钥。

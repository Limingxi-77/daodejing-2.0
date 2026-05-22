# 道德经 2.0 项目改进与 hAdmin 后台接入建议

## 1. 文档目的

本文档基于当前仓库代码结构，对项目现状、优先改进方向、后端管理后台接入方案进行整理，便于后续将项目接入 hAdmin 后端管理后台。

> 说明：当前仓库中未发现 hAdmin 源码或配置。公开资料中常见的 hAdmin 至少包含两类：一类是基于 Django REST Framework 的 `hadmin` Python 包，用于输出后台页面配置；另一类是基于 jQuery/Bootstrap 的静态后台模板。本文按“独立后端管理后台 / 管理端 API / RBAC 权限系统”的通用接入方式编写；如果目标 hAdmin 项目有固定技术栈、接口规范或数据库约束，需要在接入前按实际实现进一步校准。

## 2. 当前项目概况

### 2.1 技术栈

- 前端：Vue 3、TypeScript、Vite、Pinia、Vue Router、Tailwind CSS。
- 后端：Node.js、Express、MySQL、JWT、bcryptjs。
- 数据存储：MySQL 后端认证数据 + 前端 LocalStorage 本地缓存 + 部分 Supabase 服务代码。
- AI 能力：前端直连 DeepSeek、OpenRouter、OpenAI、Coze 等供应商；同时存在后端 `/api/ai/ask` 预留调用逻辑。
- 音频能力：已有预生成音频文件和 TTS 页面；同时存在 CosyVoice/DashScope 接入尝试。

### 2.2 主要目录

```text
daodejing-2.0/
├── backend/                 # Express + MySQL 登录注册后端
├── vue-project/             # Vue 3 前端主项目
├── 演示文档包/              # 演示与讲解文档
├── API接口文档.md           # 早期 API 设计文档
├── 启动方法.txt             # 启动说明
└── 作品介绍文档.md          # 项目介绍
```

### 2.3 当前功能模块

- 登录注册：已接入 Express 后端，使用 JWT 鉴权。
- AI 解读：前端 Chat Store + 直连 AI 服务 + 本地知识库检索。
- 学习路径：大量逻辑在前端服务层和页面内，进度主要保存在 LocalStorage。
- 社区：发帖、点赞、收藏、关注、草稿等多为前端模拟或本地存储。
- 资源库：页面功能较完整，但缺少统一后端内容管理。
- TTS：当前更偏预生成音频播放方案，实时 TTS 可作为扩展。
- 数据迁移/同步：已有 Supabase、MySQL、LocalStorage 多套服务代码，但边界不够统一。

## 3. 当前问题与风险

### 3.1 架构一致性问题

- 历史文档曾保留 Python Flask、PostgreSQL、Supabase 等描述；当前已统一为 Express 前台业务后端 + hAdmin 后台管理后端 + MySQL 主业务库。
- 前端服务层同时存在 MySQL、Supabase、LocalStorage、直连 AI 等多种数据路径，长期维护成本较高。
- 根目录 `package.json` 只包含少量依赖，真正前端脚本在 `vue-project/package.json`，容易造成启动混淆。

### 3.2 安全风险

- AI API Key 存在前端直连设计，生产环境不建议把平台级密钥暴露给浏览器。
- `VITE_SUPABASE_SERVICE_KEY` 不应出现在前端环境变量中，service key 应仅保存在服务端。
- JWT 当前有开发默认密钥兜底，生产环境应强制要求配置高强度密钥。
- 登录接口缺少限流、防撞库、防暴力破解、统一错误提示策略。
- CORS 当前为宽松配置，生产环境应限制来源域名。

### 3.3 数据持久化问题

- 学习进度、社区互动、用户笔记、会话历史等大量数据仍依赖 LocalStorage。
- 后台管理无法稳定管理 LocalStorage 中的数据。
- 缺少统一的数据模型、迁移脚本和审计日志。

### 3.4 工程质量问题

- 前端项目依赖未安装时无法直接构建验证。
- TypeScript 严格模式已开启，但部分服务存在浏览器/Node 混用逻辑。
- 缺少统一的环境变量样例文件，例如 `.env.example`。
- 缺少自动化测试、接口测试、构建校验流水线。

## 4. 优先改进建议

### 4.1 第一优先级：统一后端技术路线

当前已确定采用“**双后端并存**”技术路线：Express 服务前台业务，hAdmin 服务后台管理，通过同一个 MySQL 业务库或内部管理 API 协作。

#### 4.1.1 架构决策

| 决策项 | 结论 |
| --- | --- |
| 前台业务后端 | `backend/` 目录下的 Express + MySQL 服务 |
| 后台管理后端 | hAdmin 独立管理后台服务 |
| 数据协作方式 | 优先同库读取配置/内容数据，高风险写操作通过内部 API |
| 前台 API 前缀 | `/api/*` |
| 后台 API 前缀 | `/admin-api/*` 或 hAdmin 自身管理接口 |
| 用户体系 | 前台用户与后台管理员隔离 |
| 权限体系 | hAdmin 负责后台 RBAC，Express 负责前台用户权限 |
| 密钥管理 | AI Key、数据库密码、后台 JWT Secret 只保存在服务端 |

#### 4.1.2 路线对比与最终选择

| 路线 | 说明 | 推荐场景 |
| --- | --- | --- |
| 保留 Express 后端 | 当前后端继续作为前台 API 服务，hAdmin 只作为管理后台 | 管理能力较轻量 |
| hAdmin 接管后端 | 将用户、内容、社区、AI 配置等接口迁移到 hAdmin | hAdmin 功能成熟、希望统一后台 |
| **双后端并存** | **Express 服务前台业务，hAdmin 服务后台管理，通过同库或内部 API 协作** | **当前项目最终选择** |

#### 4.1.3 统一口径

- 不再使用旧文档中的 Python Flask、SQLite、PostgreSQL 作为当前主后端描述。
- 当前前台业务后端统一描述为 Node.js + Express + MySQL。
- hAdmin 统一描述为后台管理后端，不替代 Express 的前台业务接口。
- 前端 Vue 应用只面向 Express `/api/*`，不直接连接 MySQL，也不直接持有平台级 AI Key。
- hAdmin 可直接管理低风险配置表、内容表、资源表；涉及用户资产、AI 用量、会员权益、审核状态变更等关键操作时，优先调用 Express 内部管理 API。

#### 4.1.4 当前执行状态

- 已完成：Express 后端新增 `/api/admin/*` 管理端桥接接口。
- 已完成：新增后台管理员、角色、权限、审计日志、系统配置、AI 配置、AI 用量等表结构迁移脚本。
- 已完成：新增 `backend/.env.example`、`vue-project/.env.example`，并修正启动说明与部署指南。
- 待执行：本机 MySQL `localhost:3306` 当前连接被拒绝，`backend/hadmin-dual-backend-migration.sql` 需在 MySQL 启动后执行。

### 4.2 第二优先级：收敛前端数据访问

- 前端只调用统一后端 API，不再直接访问数据库或平台级第三方密钥。
- 保留 LocalStorage 作为离线缓存或未登录草稿缓存，不作为核心业务数据源。
- 将 AI 调用、TTS 生成、内容管理、用户权限判断放到服务端。
- 将 `mysqlService.ts` 中的 Node/MySQL 逻辑迁移到后端，前端只保留 API SDK。

#### 4.2.1 本轮执行目标

- 前端 AI 调用改为优先请求 Express `/api/ai/chat`，不再默认直连平台级供应商接口。
- Express 新增 AI 代理接口，统一读取服务端环境变量中的 API Key。
- 前端保留演示模式降级能力，但不再鼓励在浏览器保存平台级 API Key。
- Supabase service key 从前端类型声明和样例配置中移除，只允许服务端持有。

#### 4.2.2 当前执行状态

- 已完成：`directAIService` 改为后端代理优先模式。
- 已完成：AI 配置弹窗不再采集和保存平台级 API Key，仅选择供应商。
- 已完成：Express 新增 `/api/ai/chat`，未配置服务端 Key 时返回演示模式响应。
- 已完成：会话服务改为携带用户 JWT 调用 Express `/api/conversations`。
- 已完成：笔记和学习进度新增 Express API，并保留 LocalStorage 作为离线兜底缓存。
- 已完成：前端 `mysqlService` 改为兼容层，不再打包 Node/MySQL 直连逻辑。
- 已完成：移除前端 `VITE_SUPABASE_SERVICE_KEY` 类型声明，Supabase service role key 只能保存在服务端。
- 已完成：历史 `deepseekService` 改为调用 Express `/api/ai/chat`，不再读取 `VITE_DEEPSEEK_*`。
- 已完成：历史 `cosyvoiceService` 改为调用 Express `/api/tts/synthesize`，不再通过 Vite 代理暴露 DashScope Key。
- 已完成：移除 `vite.config.ts` 中的 `/dashscope-api` 代理和前端 Authorization 注入。

### 4.3 第三优先级：补齐核心后端 API

建议优先补齐：

- 用户资料、会员等级、订阅状态接口。
- 学习路径、章节、课程、学习进度接口。
- AI 会话、消息历史、使用量统计接口。
- 社区帖子、评论、点赞、收藏、举报接口。
- 资源库分类、资源条目、上传、上下架接口。
- TTS 音频资源、生成任务、播放统计接口。
- 管理端审计日志、系统配置、操作记录接口。

#### 4.3.1 当前执行状态

- 已完成：`/api/conversations`、`/api/conversations/search`、`/api/conversations/:id/messages`、`DELETE /api/conversations/:id`。
- 已完成：`GET /api/learning/progress`、`PUT /api/learning/progress`。
- 已完成：`GET /api/notes`、`POST /api/notes`、`PATCH /api/notes/:id`、`DELETE /api/notes/:id`。
- 已完成：`POST /api/tts/synthesize`，用于 TTS 后端代理；未配置服务端 Key 时前端降级到浏览器 TTS。
- 待完成：社区帖子、评论、资源库、TTS 任务等业务 API。

### 4.4 第四优先级：建立环境与发布规范

- 新增 `backend/.env.example` 和 `vue-project/.env.example`。
- 生产环境禁用默认 JWT Secret。
- 明确 `VITE_` 前缀变量只能放公开配置。
- 建立 `dev`、`test`、`prod` 三套环境变量命名。
- 在部署文档中只保留当前真实技术栈。

#### 4.4.1 当前执行状态

- 已完成：新增根目录 `DEPLOYMENT_GUIDE.md`，统一本地启动、迁移、发布前检查、hAdmin 接入和生产安全要求。
- 已完成：根目录 `package.json` 改为 workspace 脚本入口，提供 `backend:check`、`backend:migrate`、`backend:dev`、`frontend:dev`、`frontend:type-check`、`frontend:build`。
- 已完成：后端新增 `scripts/migrate.js`，通过 `npm run backend:migrate` 执行 hAdmin 双后端迁移。
- 已完成：后端新增 `scripts/check-env.js`，通过 `npm run backend:check` 校验语法和关键环境变量。
- 已完成：Express 启动时在 `NODE_ENV=production` 下强制校验 `JWT_SECRET`、`ADMIN_JWT_SECRET`、`HADMIN_INTERNAL_TOKEN`、`MYSQL_PASSWORD` 和 `CORS_ORIGIN`。
- 已完成：`.gitignore` 允许提交 `.env.example`，继续忽略真实 `.env`。
- 已验证：`node --check backend/app.js` 通过，`npm run backend:check` 在补齐本地 `ADMIN_JWT_SECRET` 与 `HADMIN_INTERNAL_TOKEN` 后通过。
- 当前阻塞：`npm run backend:migrate` 因本机 MySQL `localhost:3306` 拒绝连接失败，需先启动 MySQL 并确认 `MYSQL_*` 配置正确。
- 当前阻塞：本地 `backend/.env` 尚未补齐 `ADMIN_JWT_SECRET` 与 `HADMIN_INTERNAL_TOKEN`，需按 `backend/.env.example` 设置真实强密钥。
- 待执行：安装前端依赖后运行 `npm run frontend:type-check` 与 `npm run frontend:build`。

### 4.5 第五优先级：增强安全与可观测性

- 后端接入请求限流、登录失败锁定、统一错误码。
- 增加接口访问日志、管理员操作日志、AI 调用日志。
- 增加健康检查、数据库连接检查、AI 供应商状态检查。
- 增加异常告警和成本统计，尤其是 AI 与 TTS 调用成本。

#### 4.5.1 当前执行状态

- 已完成：Express 全局关闭 `X-Powered-By`，为每个请求生成 `X-Request-Id` 并记录结构化访问日志。
- 已完成：新增 API、AI、TTS、用户登录、管理员登录多级内存限流，可通过 `RATE_LIMIT_*` 与 `LOGIN_*` 环境变量调整。
- 已完成：用户登录与管理员登录增加失败计数和临时锁定，失败/成功事件写入 `security_events`。
- 已完成：AI 与 TTS 代理调用写入结构化日志和 `external_service_call_logs`，AI 调用写入 token 与成本估算。
- 已完成：新增 `/api/health`、`/api/health/ready`、`/api/admin/metrics`、`/api/admin/internal/metrics`，用于运行状态、数据库状态、AI/TTS 配置状态和请求指标查看。
- 已完成：迁移脚本新增 `security_events` 与 `external_service_call_logs`，供 hAdmin 做安全审计和成本统计。
- 已验证：`node --check backend/app.js` 通过，`npm run backend:check` 在补齐本地 `ADMIN_JWT_SECRET` 与 `HADMIN_INTERNAL_TOKEN` 后通过。
- 待增强：当前限流与登录锁定为单进程内存实现，生产多实例建议迁移到 Redis 或网关层限流。
- 待增强：异常告警尚未接入第三方通知渠道，可在下一阶段接入邮件、企业微信或云监控告警。

### 4.6 第六优先级：补齐前台业务闭环与后台页面接入

- 补齐社区帖子、评论、资源库、TTS 任务等前台业务 API。
- 在 hAdmin 中接入用户管理、系统配置、AI 用量、安全事件、外部服务调用日志和运行指标页面。
- 将当前内存限流/登录锁定迁移到 Redis 或网关层，支持多实例部署。
- 接入异常告警渠道，形成“健康检查 + 指标 + 告警 + 审计”的闭环。

#### 4.6.1 当前执行状态

- 已完成：新增社区帖子、评论、点赞、收藏、举报相关表结构和前台 API。
- 已完成：新增资源分类、资源条目表结构和前台资源查询、浏览、下载统计 API。
- 已完成：新增 TTS 任务表结构和前台任务创建、任务列表 API。
- 已完成：新增后台社区审核、举报处理、资源分类/资源维护、TTS 任务管理接口。
- 已完成：新增 hAdmin 内部接口 `POST /api/admin/internal/community/posts/:id/status` 与 `POST /api/admin/internal/tts/tasks/:id`。
- 已完成：前端新增 `communityService`、`resourceService`、`ttsTaskService`，社区、资源库、TTS 页面开始优先接入后端 API，并保留本地示例/降级逻辑。
- 已验证：`node --check backend/app.js` 通过。
- 当前阻塞：数据库迁移仍需本机 MySQL 启动后执行；前端完整类型检查仍依赖安装 `vue-project` 依赖。

### 4.7 第七优先级：生产级多实例与告警闭环

- 将限流、登录锁定、任务队列状态迁移到 Redis 或同类集中式存储。
- 引入 TTS 异步 worker，将 `tts_tasks` 从“任务记录”升级为真实异步生成队列。
- 接入异常告警渠道，例如邮件、企业微信、飞书、云监控或 Sentry。
- 补充后端接口自动化测试和前端端到端验收流程。

#### 4.7.1 当前执行状态

- 已完成：新增 `SECURITY_STATE_DRIVER`，支持 `memory` 与 `mysql` 两种安全状态驱动，多实例可使用 MySQL 集中保存限流和登录锁定状态。
- 已完成：新增 `rate_limit_buckets`、`login_failure_buckets`、`alert_events` 表结构和迁移脚本。
- 已完成：限流超限、登录锁定、限流状态异常、TTS worker 异常会写入 `alert_events`，并可通过 `ALERT_WEBHOOK_URL` 推送。
- 已完成：新增 `GET /api/admin/alerts` 与 `PATCH /api/admin/alerts/:id/handled`，供 hAdmin 做告警列表和处理闭环。
- 已完成：新增 `backend/scripts/tts-worker.js` 与 `npm run backend:worker:tts`，从 `tts_tasks` 认领 `pending` 任务并回写 `completed` / `failed`。
- 已完成：`/api/admin/metrics` 增加安全状态驱动、告警配置和 24 小时告警统计。
- 已验证：`node --check backend/app.js` 与 `node --check backend/scripts/tts-worker.js` 通过。
- 当前阻塞：TTS worker 实际生成依赖 `DASHSCOPE_API_KEY` 和可访问的供应商接口；数据库迁移仍需 MySQL 启动后执行。

### 4.8 第八优先级：自动化测试与上线验收

- 为认证、社区、资源库、TTS 任务、后台管理接口补充自动化 API 测试。
- 为前端登录、社区发布、资源查询、TTS 任务创建补充端到端测试。
- 建立 CI 流程，串联环境检查、后端语法检查、前端类型检查、构建和迁移脚本检查。
- 输出上线验收清单，覆盖安全、数据、hAdmin 后台、AI/TTS 成本和告警链路。

#### 4.8.1 当前执行状态

- 已完成：提取 `backend/lib/runtime-utils.js` 与 `backend/lib/env-validator.js`，将可复用纯逻辑从 `app.js` 中拆出，便于单元测试。
- 已完成：新增 `backend/tests/runtime-utils.test.js` 与 `backend/tests/env-validator.test.js`，使用 Node 内置 `node:test` 覆盖环境校验、限流桶、登录键生成、告警级别判断、AI 成本估算等核心逻辑。
- 已完成：新增 `npm run backend:test` 与根脚本 `npm run check:ci`。
- 已完成：新增 GitHub Actions 工作流 `.github/workflows/ci.yml`，串联后端安装、后端检查、后端测试、前端类型检查与前端构建。
- 已完成：新增根目录 `RELEASE_CHECKLIST.md`，用于上线前后人工验收。
- 已验证：`node --test backend/tests/*.test.js` 通过，`npm run backend:test` 通过。
- 已验证：`npm run frontend:type-check` 与 `npm run frontend:build` 已可执行通过，前端依赖已完成安装。
- 已完成：前端自动化测试框架已在第九优先级接入，`Playwright` 冒烟用例骨架、CI 编排与本地浏览器安装均已落地。
- 下一阶段重点：真实 `Express` 登录态、hAdmin 后台页面联调用例与验收编排，归入第十优先级继续推进。

### 4.9 第九优先级：前端端到端测试与灰度发布

- 引入 Playwright 或 Cypress，覆盖登录、社区发帖、资源查询、TTS 任务创建与后台审核链路。
- 为 hAdmin 后台增加基础冒烟测试，验证指标、告警、用户管理、资源管理页面可用。
- 补充灰度发布与回滚方案，包括数据库迁移回退、worker 单独启停和告警观察窗口。
- 在发布流程中加入 smoke test，确保核心业务链路上线后 5-10 分钟内可自动验证。

#### 4.9.1 当前执行状态

- 已完成：前端接入 `Playwright`，新增 `vue-project/playwright.config.ts` 与 `vue-project/tests/e2e/smoke.spec.ts`。
- 已完成：登录、注册、社区、资源库、TTS 页面补充稳定的 `data-testid` 测试锚点。
- 已完成：根目录新增 `frontend:e2e`、`frontend:e2e:install`，前端新增 `e2e`、`e2e:headed`、`e2e:install` 脚本。
- 已完成：后端新增 `backend/scripts/smoke-check.js` 与根脚本 `backend:smoke`，用于发布后接口冒烟检查。
- 已完成：新增 `GRAY_RELEASE_GUIDE.md`，明确灰度放量、观察窗口、回滚与止损条件。
- 已完成：`.github/workflows/ci.yml` 增加 `frontend-e2e` job，串联依赖安装、浏览器安装与 E2E smoke。
- 已完成：本机已安装 `Playwright Chromium`，`npm run frontend:e2e:install` 已验证可执行。
- 已验证：`npm run frontend:e2e` 已通过 4 条前端冒烟用例（登录/注册、社区发帖本地回退、资源查询本地回退、TTS 自定义生成流程）。
- 已固化：E2E 改用独立端口 `4193`、单 worker、禁用 `service worker`，并在测试中屏蔽外部 Font Awesome CDN 依赖，降低旧 dev server 与外网资源导致的假失败。
- 边界说明：当前 E2E 仍以“前端本地降级链路 + 页面交互冒烟”为主，真实 `Express` 登录态与 hAdmin 后台页面覆盖放入第十优先级处理。

### 4.10 第十优先级：真实联调环境下的前后台验收编排

- 为 Playwright 增加基于真实 `Express` API 的登录态用例，不再只验证前端本地降级路径。
- 增加种子数据或测试账号初始化脚本，打通社区发帖、资源浏览、TTS 任务创建的真实后端链路。
- 为 hAdmin 管理后台补充最小可用冒烟用例，至少覆盖登录、社区审核、资源维护、指标查看。
- 将 `backend:smoke` 与前端 E2E 拆分为“本地静态冒烟”和“集成环境联调冒烟”两套执行档位。

## 5. hAdmin 接入总体建议

### 5.1 接入目标

hAdmin 后台建议承担以下职责：

- 管理用户、角色、权限、会员等级。
- 管理道德经章节、解读内容、学习路径、资源库内容。
- 审核社区帖子、评论、举报内容。
- 管理 AI 供应商、模型配置、提示词模板、调用限额。
- 管理 TTS 音频资源、生成任务、音色配置。
- 查看平台统计数据、学习数据、AI 用量和运营报表。
- 记录管理员操作日志，支持问题追溯。

### 5.2 推荐接入架构

```text
普通用户
    │
    ▼
Vue 前台应用
    │  /api/*
    ▼
Express 前台业务后端
    │
    ├── MySQL 主业务数据库
    │
    ├── AI/TTS/文件存储等外部服务代理
    │
    └── 内部管理 API（供 hAdmin 高风险操作调用）

管理员
    │
    ▼
hAdmin 后台管理后端
    │
    ├── 低风险内容/配置：直接读写 MySQL
    │
    └── 高风险业务操作：调用 Express 内部管理 API
    │
    ▼
同一个 MySQL 主业务数据库
```

双后端并存时，Express 和 hAdmin 不是互相替代关系，而是按职责拆分：Express 保证前台业务一致性，hAdmin 提供后台运营管理效率。

### 5.3 接入边界

| 模块 | 前台 Vue | Express API | hAdmin 后台 |
| --- | --- | --- | --- |
| 用户登录注册 | 使用 | 提供用户端认证 | 管理用户和角色 |
| 学习路径 | 展示和交互 | 提供学习数据 API | 配置路径和课程 |
| AI 解读 | 展示对话 | 代理 AI 调用 | 配置模型、提示词、限额 |
| 社区 | 发帖互动 | 提供社区 API | 审核、封禁、举报处理 |
| 资源库 | 查询展示 | 提供资源 API | 内容维护、上下架 |
| TTS | 播放和提交任务 | 创建任务、返回音频 | 管理音频、任务和音色 |
| 数据报表 | 少量用户侧统计 | 汇总业务数据 | 查看运营数据 |

## 6. hAdmin 接入模式选择

### 6.1 最终模式：双后端并存

当前项目采用双后端并存模式：Express 负责前台业务一致性，hAdmin 负责后台管理效率，两者通过同一个 MySQL 数据库和内部 API 协作。

#### 职责划分

| 服务 | 核心职责 | 不建议承担 |
| --- | --- | --- |
| Express 前台业务后端 | 前台认证、用户业务、AI 调用代理、学习进度、社区互动、业务校验 | 后台菜单、后台 CRUD 页面、管理员操作界面 |
| hAdmin 后台管理后端 | 后台登录、RBAC、内容管理、配置管理、审核管理、运营报表 | 前台用户请求入口、平台级 AI 直连暴露、绕过业务规则的高风险写入 |

#### 协作规则

- 同库协作：章节、资源、提示词模板、AI 模型配置等低风险配置数据可由 hAdmin 直接读写 MySQL。
- 内部 API 协作：会员权益、AI 用量、用户封禁、社区审核、批量迁移等高风险操作应通过 Express 内部管理 API 执行。
- 权限隔离：hAdmin 管理员账号不等同于前台用户账号。
- 日志统一：hAdmin 写操作和 Express 内部 API 写操作都必须进入 `admin_operation_logs`。
- 表结构统一：数据库迁移脚本必须由项目统一维护，避免两个后端各自修改表结构。

#### 优点

- 保留当前 Express 后端，降低重构风险。
- hAdmin 可以快速补齐后台管理能力。
- 前台业务和后台运营边界清晰。
- 后续可以按模块逐步迁移，不影响前台上线。

#### 风险与控制

| 风险 | 控制方式 |
| --- | --- |
| 两个后端同时写库导致规则不一致 | 高风险写操作统一走 Express 内部 API |
| 表结构被多个项目修改 | 建立统一 migrations 目录和变更评审 |
| 管理员越权操作 | hAdmin RBAC + Express 内部 API 二次鉴权 |
| 操作无法追溯 | 所有后台写操作记录审计日志 |
| 配置修改影响前台稳定性 | 配置表增加启用状态、版本号、灰度字段 |

### 6.2 可选子模式 A：hAdmin 独立连接同一 MySQL 数据库

适合内容、资源、提示词、基础配置等低风险模块。

优点：

- 改造成本低。
- hAdmin 可直接管理业务表。
- Express 前台接口改动较小。

风险：

- 两个后端都能写数据库，容易出现业务规则不一致。
- 需要严格约定表结构和字段含义。
- 管理操作必须写入审计日志，否则难以追踪。

建议：

- hAdmin 只管理配置型、内容型、审核型数据。
- 会员扣费、AI 用量、用户登录等强业务逻辑仍通过 Express 或统一服务层处理。
- 数据库约束必须补齐，例如唯一索引、外键、状态枚举。

### 6.3 可选子模式 B：hAdmin 通过 Express 管理端 API 操作数据

适合中长期稳定架构。

优点：

- 业务规则集中在 Express 后端。
- 更容易做权限、审计、校验、日志。
- 后续替换 hAdmin 成本更低。

风险：

- 初期需要开发较多管理端 API。
- hAdmin 的自动 CRUD 能力可能无法完全发挥。

建议：

- Express 新增 `/api/admin/*` 路由。
- hAdmin 只作为管理 UI 或低代码管理端。
- 管理端 API 使用独立 JWT、管理员角色和操作日志。

### 6.4 不采用模式：hAdmin 接管全部后端能力

当前阶段不采用，仅作为未来重构选项。

优点：

- 后端和后台管理统一。
- 数据模型、权限、后台表单可以一体化设计。

风险：

- 迁移成本最高。
- 当前 Express 登录注册逻辑需要重写或迁移。
- 前端 API 适配工作量较大。

建议：

- 仅在 hAdmin 已经拥有成熟认证、RBAC、CRUD、文件上传、审计日志能力时采用。
- 先迁移内容管理和资源库，再迁移用户、AI、社区等核心业务。

## 7. 推荐数据库模型规划

### 7.1 用户与权限

| 表名 | 说明 |
| --- | --- |
| `users` | 前台用户基础信息 |
| `admin_users` | 后台管理员账号 |
| `roles` | 角色表 |
| `permissions` | 权限点表 |
| `role_permissions` | 角色权限关联 |
| `user_roles` | 用户角色关联 |
| `admin_operation_logs` | 管理员操作日志 |

### 7.2 内容与学习

| 表名 | 说明 |
| --- | --- |
| `dao_chapters` | 道德经章节原文、译文、注释 |
| `chapter_interpretations` | 多版本 AI/人工解读 |
| `learning_paths` | 学习路径 |
| `learning_path_nodes` | 路径节点 |
| `learning_progress` | 用户学习进度 |
| `learning_notes` | 用户笔记 |
| `quizzes` | 测验题库 |
| `quiz_records` | 测验记录 |

### 7.3 AI 与会话

| 表名 | 说明 |
| --- | --- |
| `ai_providers` | AI 供应商配置 |
| `ai_models` | 模型配置 |
| `prompt_templates` | 提示词模板 |
| `ai_conversations` | AI 对话会话 |
| `ai_messages` | AI 消息记录 |
| `ai_usage_logs` | AI 调用量、Token、成本统计 |
| `ai_safety_logs` | 敏感词、审核、异常记录 |

### 7.4 社区与资源

| 表名 | 说明 |
| --- | --- |
| `community_posts` | 社区帖子 |
| `community_comments` | 评论 |
| `community_likes` | 点赞 |
| `community_bookmarks` | 收藏 |
| `community_reports` | 举报 |
| `resources` | 资源库条目 |
| `resource_categories` | 资源分类 |
| `resource_files` | 附件、音频、图片、PDF |

### 7.5 TTS 与音频

| 表名 | 说明 |
| --- | --- |
| `tts_voices` | 音色配置 |
| `tts_tasks` | 语音生成任务 |
| `audio_assets` | 音频资源 |
| `audio_play_logs` | 播放统计 |

## 8. hAdmin 后台菜单建议

```text
首页仪表盘
├── 数据概览
├── AI 调用统计
├── 用户增长
└── 学习活跃度

用户管理
├── 前台用户
├── 会员与订阅
├── 用户学习记录
└── 登录与风控日志

内容管理
├── 道德经章节
├── 章节解读
├── 学习路径
├── 测验题库
└── 资源库

AI 管理
├── 供应商配置
├── 模型配置
├── 提示词模板
├── 调用日志
└── 成本统计

社区管理
├── 帖子管理
├── 评论管理
├── 举报处理
└── 用户封禁

语音与素材
├── TTS 音色
├── 生成任务
├── 音频资源
└── 文件管理

系统管理
├── 管理员
├── 角色权限
├── 系统配置
└── 操作日志
```

## 9. 管理端权限设计

### 9.1 建议角色

| 角色 | 权限范围 |
| --- | --- |
| `super_admin` | 全部权限、系统配置、权限管理 |
| `content_admin` | 章节、解读、学习路径、资源库管理 |
| `community_moderator` | 社区帖子、评论、举报、封禁处理 |
| `ai_operator` | AI 模型、提示词、调用日志、成本统计 |
| `support_staff` | 查询用户、处理反馈、查看基础日志 |
| `data_analyst` | 只读统计报表和导出数据 |

### 9.2 权限粒度

建议采用“模块 + 动作”的权限点，例如：

```text
user:list
user:update
user:disable
content:create
content:update
content:publish
community:moderate
ai_config:update
ai_usage:read
system_config:update
operation_log:read
```

### 9.3 审计要求

后台所有写操作建议记录：

- 管理员 ID。
- 操作模块。
- 操作类型。
- 目标资源 ID。
- 修改前数据摘要。
- 修改后数据摘要。
- IP、User-Agent。
- 操作时间。

## 10. 前端需要配合的改造

### 10.1 API 调用统一化

建议将前端所有后端请求收敛到 `src/services/api.ts`，并增加：

- `VITE_API_BASE_URL`：后端 API 地址。
- `VITE_API_PREFIX`：默认为 `/api`。
- 响应拦截：统一处理 401、403、500。
- Token 过期处理：跳转登录或弹出登录弹窗。
- 错误码映射：统一展示中文错误信息。

### 10.2 移除浏览器中的服务端逻辑

建议逐步删除或迁移：

- 前端 MySQL 直连逻辑。
- 前端 Supabase service key 相关逻辑。
- 平台级 AI Key 前端直连逻辑。
- 重要业务数据只保存在 LocalStorage 的逻辑。

### 10.3 管理后台不嵌入前台应用

建议 hAdmin 独立部署，不作为 Vue 前台路由的一部分。理由：

- 权限模型不同。
- 依赖和构建方式不同。
- 安全边界更清晰。
- 便于后台单独升级和运维。

## 11. Express 后端需要配合的改造

### 11.1 增加管理端接口分组

建议新增：

```text
backend/
├── app.js
├── routes/
│   ├── auth.js
│   ├── adminAuth.js
│   ├── adminUsers.js
│   ├── adminContent.js
│   ├── adminCommunity.js
│   └── adminAi.js
├── middleware/
│   ├── auth.js
│   ├── adminAuth.js
│   ├── rateLimit.js
│   └── auditLog.js
├── services/
│   ├── aiProviderService.js
│   ├── contentService.js
│   └── userService.js
└── db/
    ├── pool.js
    └── migrations/
```

### 11.2 管理端 API 前缀

建议保留：

```text
/api/auth/*          # 前台用户认证
/api/user/*          # 前台用户功能
/api/content/*       # 前台内容查询
/api/community/*     # 前台社区功能
/api/ai/*            # 前台 AI 功能
/api/admin/*         # 管理端接口
```

### 11.3 管理端鉴权

管理端建议使用独立中间件：

- 校验管理员 Token。
- 校验管理员状态是否启用。
- 校验角色权限。
- 记录操作日志。
- 高危操作二次确认或二次认证。

## 12. hAdmin 与现有登录体系的关系

### 12.1 不建议共用前台用户 Token

前台用户和后台管理员应使用不同 Token、不同登录入口、不同权限模型。

建议：

- 前台用户表：`users`。
- 后台管理员表：`admin_users`。
- 前台 Token Secret：`JWT_SECRET`。
- 后台 Token Secret：`ADMIN_JWT_SECRET`。
- 前台 Token 有效期：适合用户体验。
- 后台 Token 有效期：更短，并支持强制下线。

### 12.2 可以关联但不要混淆

如果某些内部成员也需要前台账号，可以通过关联字段绑定：

```text
admin_users.user_id -> users.id
```

但权限判断仍应以 `admin_users` 和后台 RBAC 为准。

## 13. AI 配置接入 hAdmin 的建议

### 13.1 配置项

hAdmin 后台建议可管理：

- AI 供应商名称。
- Base URL。
- 模型名称。
- 是否启用。
- 默认模型。
- Token 单价或调用成本。
- 每日调用上限。
- 用户等级限额。
- 提示词模板。
- 敏感词和安全策略。

### 13.2 密钥保存

AI API Key 不应下发给前端。

建议：

- 密钥仅保存在后端环境变量或加密配置表。
- hAdmin 只显示脱敏后的 Key。
- 更新 Key 需要高权限角色。
- 所有 AI 调用经后端代理，并记录用量。

### 13.3 调用链路

```text
Vue 前台
  -> POST /api/ai/chat
  -> Express 校验用户、限额、会员等级
  -> 读取 AI 配置和提示词
  -> 调用第三方 AI
  -> 写入 ai_usage_logs
  -> 返回结果给前台
```

## 14. 内容管理接入 hAdmin 的建议

### 14.1 道德经章节管理

建议后台支持：

- 章节原文维护。
- 译文维护。
- 注释维护。
- 关键词维护。
- 推荐问题维护。
- 关联音频、图片、资源。
- 发布状态控制。

### 14.2 学习路径管理

建议后台支持：

- 创建路径。
- 拖拽排序节点。
- 绑定章节、测验、资源、音频。
- 配置推荐人群和难度。
- 配置完成条件和经验值。

### 14.3 资源库管理

建议后台支持：

- 资源分类。
- 标题、摘要、封面、标签。
- 文件上传。
- 外链资源。
- 上下架。
- 推荐位。
- 浏览和收藏统计。

## 15. 社区管理接入 hAdmin 的建议

建议后台支持：

- 帖子列表和详情。
- 评论列表和详情。
- 敏感词命中记录。
- 举报处理流。
- 用户禁言、封禁、解封。
- 热门、置顶、精选配置。
- 删除或隐藏内容时记录原因。

建议帖子状态设计：

```text
draft       # 草稿
pending     # 待审核
published   # 已发布
hidden      # 已隐藏
deleted     # 已删除
rejected    # 审核拒绝
```

## 16. 数据迁移建议

### 16.1 LocalStorage 迁移

当前大量用户数据在浏览器本地，建议提供登录后迁移机制：

1. 用户登录后读取本地缓存。
2. 调用后端迁移接口。
3. 后端校验数据归属和格式。
4. 写入数据库。
5. 返回迁移结果。
6. 前端确认成功后清理本地缓存。

### 16.2 建议迁移接口

```text
POST /api/user/migrations/local-storage
```

请求数据按模块分组：

```json
{
  "learningProgress": {},
  "learningGoals": [],
  "notes": [],
  "conversations": [],
  "communityDrafts": []
}
```

### 16.3 迁移注意事项

- 迁移接口必须登录后才能调用。
- 每条数据写入时绑定当前用户 ID。
- 避免重复迁移，可使用本地数据 ID 或内容哈希去重。
- 迁移失败时不要立即删除本地数据。

## 17. 接入实施步骤

### 阶段 1：准备阶段

- 明确 hAdmin 技术栈、部署方式、认证方式、数据库连接方式。
- 统一当前项目后端为 Express + MySQL，修正文档不一致内容。
- 新增 `.env.example`，梳理公开变量和私密变量。
- 设计管理后台数据表和权限模型。

### 阶段 2：数据库阶段

- 补齐业务表结构。
- 新增管理员、角色、权限、操作日志表。
- 为核心表增加索引、状态字段、创建时间、更新时间。
- 编写初始化管理员账号脚本。

### 阶段 3：后台接入阶段

- hAdmin 连接数据库或对接 `/api/admin/*`。
- 配置后台菜单。
- 配置角色权限。
- 接入用户管理、内容管理、资源管理。
- 接入社区审核和 AI 配置管理。

### 阶段 4：前台改造阶段

- 前端移除平台级密钥直连。
- 前端调用统一后端 API。
- 将学习、社区、资源、会话数据逐步从 LocalStorage 迁移到数据库。
- 增加用户侧错误处理和 Token 过期处理。

### 阶段 5：测试与上线阶段

- 编写登录注册接口测试。
- 编写管理端权限测试。
- 验证普通用户无法访问管理端接口。
- 验证内容上下架、社区审核、AI 配置生效。
- 验证生产环境不暴露任何私密 Key。

## 18. 验收清单

### 18.1 基础验收

- [ ] 前台 Vue 应用可正常启动。
- [ ] Express 后端可正常启动。
- [ ] MySQL 数据库连接正常。
- [ ] hAdmin 后台可正常登录。
- [ ] 管理员和前台用户账号体系隔离。

### 18.2 权限验收

- [ ] 未登录用户不能访问管理端接口。
- [ ] 普通用户不能访问管理端接口。
- [ ] 不同管理员角色只能访问授权菜单。
- [ ] 高危操作写入操作日志。
- [ ] 禁用管理员后 Token 失效或无法继续操作。

### 18.3 数据验收

- [ ] 章节内容可在后台新增、编辑、发布、下架。
- [ ] 学习路径可在后台配置并在前台展示。
- [ ] 社区帖子可在后台审核和隐藏。
- [ ] AI 配置修改后前台调用生效。
- [ ] 用户学习进度能持久化到数据库。

### 18.4 安全验收

- [ ] 前端构建产物中不存在 AI API Key。
- [ ] 前端构建产物中不存在 Supabase service key。
- [ ] 生产环境未使用默认 JWT Secret。
- [ ] CORS 限制为可信域名。
- [ ] 登录接口具有限流或失败次数控制。

## 19. 推荐近期任务拆分

### 任务 1：维护双后端文档与环境变量

- 持续保持启动文档、认证部署指南和项目介绍中的双后端口径一致。
- 新增前后端 `.env.example`。
- 标注哪些变量只能服务端使用。

### 任务 2：抽离管理后台数据模型

- 整理现有 MySQL 初始化脚本。
- 新增管理员、角色、权限、审计日志表。
- 补齐内容、资源、社区、AI 配置核心表。

### 任务 3：建立 `/api/admin/*`

- 增加管理员登录接口。
- 增加管理员鉴权中间件。
- 增加 RBAC 权限校验。
- 增加操作日志中间件。

### 任务 4：hAdmin 首批菜单接入

- 用户管理。
- 道德经章节管理。
- 资源库管理。
- 社区审核。
- AI 配置管理。

### 任务 5：前台数据真实化

- 学习进度入库。
- 会话历史入库。
- 社区交互入库。
- 用户笔记入库。

## 20. 需要进一步确认的问题

接入 hAdmin 前建议确认：

- hAdmin 是独立项目还是当前仓库子模块？
- hAdmin 使用什么技术栈和数据库？
- hAdmin 是否已有 RBAC 权限系统？
- hAdmin 是直接连数据库，还是只能调用外部 API？
- hAdmin 是否支持文件上传、富文本、表格 CRUD、操作日志？
- 后续是否希望 hAdmin 接管全部后端，还是只做管理后台？

确认这些问题后，可以将本文档进一步细化为数据库迁移脚本、接口清单和开发排期。

## 21. hAdmin 版本辨析与参考资料

### 21.1 版本辨析

- `hadmin` Python 包：公开说明为“HAdmin 后端对 DRF 封装”，核心作用是为前端输出标准化配置数据，适合 Django/DRF 技术栈。
- hAdmin 静态后台模板：公开说明为基于 jQuery、Bootstrap、HTML5 的后台模板，偏前端 UI 模板，不直接提供后端业务能力。
- 当前项目是 Express + MySQL 后端，因此如果接入的是 DRF 版 hAdmin，需要考虑跨技术栈集成；如果接入的是静态模板版 hAdmin，则需要自行实现管理端 API 和权限系统。

### 21.2 参考资料

- 当前仓库源码与文档。
- HAdmin 公开包说明：<https://pypi.org/project/hadmin/>。
- hAdmin 静态后台模板示例：<https://www.jq22.com/jquery-info10489>。

## 22. 第十优先级执行状态

### 22.1 已落地内容

- 新增 `backend/scripts/seed-smoke-data.js`，统一准备 smoke 用户、管理员、资源分类和资源种子数据。
- 将后端联调脚本拆分为 `basic` 与 `integration` 两档，分别覆盖基础可用性与双后端协作验收。
- 新增前端 `Playwright` 集成用例，验证登录、社区发帖、资源检索、TTS 历史回读都走真实 Express 后端。
- 新增根脚本与子项目脚本，支持一键执行 `backend:seed:smoke`、`backend:smoke:integration`、`frontend:e2e:integration` 与 `smoke:integration`。

### 22.2 当前协作边界

- 当前仓库内没有真实 hAdmin 前端工程，因此“后台管理端验收”暂以 `Express` 提供的 `/api/admin/*` 与 `/api/admin/internal/*` 接口联调为准。
- 这已经覆盖“双后端并存”的核心链路：前台业务写库、后台管理改库、内部协作接口回写、前台再次读到最新状态。
- 待 hAdmin 前端项目接入本仓库或形成独立联调环境后，再补一轮后台 UI 级别的端到端验收。

### 22.3 建议执行顺序

- 先执行 `npm run backend:seed:smoke` 准备联调数据。
- 再执行 `npm run backend:smoke:integration` 验证 Express 与 hAdmin 管理接口协作。
- 最后执行 `npm run frontend:e2e:integration` 验证前台页面读取的是真实后端数据。

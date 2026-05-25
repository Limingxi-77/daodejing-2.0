# 道德经 AI 平台 2.0

[![CI](https://github.com/Limingxi-77/daodejing-2.0/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/Limingxi-77/daodejing-2.0/actions/workflows/ci.yml)
[![Node](https://img.shields.io/badge/node-%3E%3D20-43853d)](https://nodejs.org)
[![Vue](https://img.shields.io/badge/vue-3.4-42b883)](https://vuejs.org)
[![Vite](https://img.shields.io/badge/vite-5-646cff)](https://vitejs.dev)
[![PWA](https://img.shields.io/badge/PWA-ready-5a0fc8)](https://web.dev/progressive-web-apps/)

借助 AI 智慧探索老子思想的现代价值 —— Vue 3 + Express + DeepSeek/OpenRouter/OpenAI 兼容流式接入。

---

## 项目结构

```
daodejing-2.0/
├── backend/           Express + MySQL,认证、AI 代理、TTS
│   ├── app.js         主应用
│   ├── lib/sse-utils.js  SSE 工具(纯函数,已单元测试覆盖)
│   └── tests/         node --test 单元测试
├── vue-project/       Vue 3 + Vite 前端
│   ├── src/services/  AI / 对话 / 资源 服务封装
│   ├── src/stores/    Pinia 状态管理(chat、auth)
│   └── tests/e2e/     Playwright E2E
├── .github/workflows/ CI(backend / frontend / e2e / lighthouse)
└── 演示文档包/         比赛演示资料
```

## 快速启动

```bash
# 1. 安装依赖
npm install
npm --prefix backend install
npm --prefix vue-project install

# 2. 配置后端 .env(MySQL、JWT、AI key 任一)
#    DeepSeek / OpenRouter / OpenAI 三家任一即可,代码兼容

# 3. 启动
npm run backend:dev      # 后端: http://localhost:8000
npm run frontend:dev     # 前端: http://localhost:3000
```

## 关键特性

- **AI 流式对话(SSE)** — `/api/ai/chat/stream`,token 逐字推送,支持 DeepSeek/OpenRouter/OpenAI,客户端断开自动取消上游
- **PWA 离线** — Service Worker + Workbox,资源/社区列表 SWR 缓存,AI 路径白名单避免拦截流式
- **RAG 检索增强** — 多策略召回(模糊+章节+概念) + TF-IDF 字符二元组重排,问题相关章节注入 system prompt
- **多人格 AI** — 现代学者 / 道家隐士 / 心理疗愈,不同温度与提示词
- **三人议事 (Multi-Agent)** — `/api/ai/council` 并行调用三种人格,Promise.all + 失败隔离,同一问题三种视角同屏对照
- **浏览器语音输入** — Web Speech API(SpeechRecognition),`zh-CN` 中文识别,实时回填到聊天框
- **TTS 朗读** — 浏览器原生 SpeechSynthesis,无需服务端 key

## AI 流式架构

```
浏览器 fetch POST /api/ai/chat/stream
   └─ Express 路由(SSE 头 + 心跳)
       └─ resolveAIProvider(deepseek/openrouter/openai)
           ├─ 无 key:buildMockAIResponse → chunkTextForMock 50ms 推送
           └─ 有 key:上游 stream:true → 滚动 buffer 切分 \n\n → 逐 chunk 转发
       └─ 客户端断开:req.on('close') → upstreamAbort.abort()
       └─ 完成:data: {event:done, usage, estimatedCost} + [DONE]
       └─ 写 ai_usage_logs(prompt/completion/total tokens)
```

特性开关:`VITE_AI_STREAM=false` 一键回退到非流式。

## RAG 检索增强

```
用户提问
   └─ preprocessQuery(去标点/停用词)
       └─ 三路召回
       │   ├─ fuse.js 模糊匹配
       │   ├─ CHAPTER_KEYWORDS 章节关键词命中
       │   └─ CONCEPT_KEYWORDS 概念命中
       └─ 候选去重
           └─ TF-IDF 字符二元组重排
               · 语料: knowledgeBase.content + modern + keywords
               · 余弦相似度 + strategy 权重(chapter 1.2 / concept 1.1 / fuzzy 1.0)
           └─ Top-1 注入 system prompt + Top-4 作为候选
```

## 多 Agent 议事

```
POST /api/ai/council { question }
   └─ Promise.all 并行调用三个 persona(scholar 0.5 / hermit 0.9 / healer 0.7)
       ├─ 每个 persona 独立 system prompt + temperature
       ├─ 任一失败 .catch → buildCouncilFailureFallback 保留 persona 身份
       └─ aggregateCouncilResults: succeed/fail 计数 + token 汇总
   └─ 写 ai_usage_logs(status=success-council|partial-council)
   └─ 返回 personas[] + totalTokens + estimatedCost
```

前端在 `/ai-interpretation` 页面通过工具栏的 "单人解读 / 三家会议" 切换进入议事模式,三栏卡片同屏渲染,失败 persona 单独显示错误,不影响其他视角。
纯逻辑(`backend/lib/council-utils.js`)21 个单元测试覆盖 validate / aggregate / fallback / debate。

## 创意特性 — 道家智慧的三种新交互

P1 批针对"创意原创"维度,在不增加新页面、不破坏路由的前提下加了三个高识别度交互:

### 1. 道之签 — 每日 AI 卦签

首页"今日道签"卡片,把静态"每日摘句"升级成 AI 生成的「今日提点 + 行动建议」。

```
POST /api/ai/divination { reroll? }
   └─ pickChapterDeterministic(userId, dateKey, salt?)
       └─ SHA256(userId + ':' + UTC-YYYY-MM-DD).hex[0..8] → int → mod 23
       └─ 同用户同日首抽必同章;reroll 时加 randomUUID 盐重抽
   └─ AI 系统提示词强制 JSON {insight, action} 输出
       └─ JSON.parse 失败 → 围栏代码块 → 正则提取 → 兜底 mock
   └─ 写 ai_usage_logs(status=success-divination)
```

前端缓存键 `daoSign:<userId>:<YYYY-MM-DD>`,同日刷新走缓存。再抽消耗 30 cultivation XP,XP 不足时禁用按钮并提示"明日再来"。

### 2. 场景共鸣卡 — 12 张现代焦虑情境

`/ai-interpretation` 单人模式底部 4×3 网格,12 张卡片覆盖失眠/拖延/失恋/迷茫/职场内卷/育儿/经济/亲密关系/信息焦虑/完美主义/自我怀疑/突发变故。点击直接走现有 `/api/ai/chat/stream`(零后端新增),把"我不知道该问什么"的潜在用户拉进来。

- 数据:`vue-project/src/data/scenarioCards.ts`(纯数据,可热替换)
- 组件:`vue-project/src/components/chat/ScenarioCards.vue`
- e2e:`tests/e2e/scenario-cards.spec.ts`(网格渲染 / 点击触发流式 / 议事模式下隐藏)

### 3. 三人议事辩论模式 — Multi-Agent 二轮对话

`/api/ai/council` 新增可选 `mode: 'parallel' | 'debate'`,默认 parallel(向后兼容)。

```
POST /api/ai/council { question, mode: 'debate' }
   └─ Round 1:同 parallel,三 persona 并行答题,Promise.all + 各自 .catch
   └─ Round 2:对每个 persona,system prompt 拼接其他两位 round-1 内容
       └─ buildDebatePeerPrompt(persona, question, peers)
       └─ 第 1 轮无可参考 peers → 跳过 Round 2,返回 partial-debate
   └─ aggregateDebateResults: round1 + round2 token / 失败计数汇总
   └─ 写 ai_usage_logs(status=success-debate|partial-debate)
```

`CouncilPanel.vue` 加 "会议 / 辩论" Tab 切换,辩论时展示纵向 Round 1 → Round 2 三栏 × 二行时间线,每个 Round 2 卡片有"· 回应"标签。

## 商业可行性

P2 批针对"商业价值与可行性"维度,在保留全部 P0/P1 基础设施前提下加三件事 — 让评委 30 秒看见"这玩意怎么赚钱、规模化通路是什么":

### 1. 价值仪表盘 / 修行账单

登录用户首页头部新增「我的修行账单」卡片,4 块数据让付费 ROI 一目了然。

```
GET /api/user/value-report (authMiddleware)
   └─ 3 路并行 SQL 聚合(MySQL DATE_FORMAT(NOW(),'%Y-%m-01'))
       ├─ 当月:COUNT(*) calls, SUM(total_tokens), SUM(estimated_cost)
       ├─ 累计:同上去掉日期条件
       └─ 学习进度:COUNT(DISTINCT chapter_id) FROM learning_progress WHERE completed=1
   └─ formatValueReport(rows, progress)
       · savedAdvisory = calls × ¥30(对标心理咨询单次 ¥300/小时 ≈ ¥30/6分钟)
       · progress.percent = min(100, round(learned/23 × 100))
   └─ 5 分钟 localStorage 缓存(valueReportService.ts)
```

前端 `ValueReportCard.vue`:4 卡网格 + SVG 圆环进度(stroke-dasharray 动画)。纯函数 `value-report-utils.js` 10 单测覆盖系数注入 / 边界 / 0 调用 / null 行。

### 2. B 端 / 团队订阅入口

`PricingModal.vue` 从 3 档 C 端扩到 5 档(2 行布局)。

| 方案 | 价格 | 目标 |
|------|------|------|
| 布衣 / Free | ¥0/月 | 新用户尝鲜 |
| 居士 / Pro | ¥19/月 | C 端核心 |
| 宗师 / Master | ¥49/月 | 高频用户 |
| **团队 / Team** | **¥299/月 · 10 席** | 中小企业 |
| **企业 / Enterprise** | **联系洽谈** | 大型机构 |

Enterprise 卡 →「预约洽谈」打开 `EnterpriseContactModal.vue` 表单 → `POST /api/leads`(无需登录,B 端匿名可填)→ 写 leads 表 → toast 确认。

```
backend/lib/leads-utils.js  纯校验
   ├─ EMAIL_REGEX / PHONE_REGEX / TEAM_SIZE_OPTIONS / INTENT_OPTIONS
   ├─ validateLeadInput(input) → { valid, errors }
   └─ normalizeLeadInput(input) → trim / 小写 email / 默认 intent='enterprise'

backend/app.js 三新路由
   ├─ POST /api/leads — 无 auth,验证 + normalize + INSERT,返回 {success, id}
   ├─ GET  /api/admin/leads — adminAuthMiddleware,分页 + status 过滤
   └─ PATCH /api/admin/leads/:id — 改 status(new/contacted/qualified/closed)
```

`subscription_tier='team'` 全链路打通:后端 validTiers 白名单 + 前端 `SubscriptionTier` 类型 + `checkLimit` 给 500 次/日额度。

leads-utils 10 单测覆盖 7 类校验路径 + 安全降级(null / 非对象)。

### 3. 商业蓝图展示页 /business-plan

纯前端 7-section 长卷 (`BusinessPlanView.vue`,约 350 行),不进顶部导航(已 6 项满),由 About 页底部「查看商业蓝图」CTA + 直接 URL 入口。

- §1 目标用户画像 — C 端 / B 端 / 机构 三类付费意愿
- §2 市场规模 — ¥600 亿(心理咨询) / ¥250 亿(AI 心理 2030E) / ¥420 亿(国学教育)
- §3 定价矩阵 — 5 档表格化对比
- §4 单元经济学 — 87% 毛利 / LTV ¥114 / CAC ¥20 / LTV/CAC 5.7×
- §5 竞品对比 — vs 文心一言 / Kimi / 通义,7 维度差异化
- §6 变现矩阵 — 订阅 / 团队席位 / 企业 API / 内容课程 四曲线
- §7 路线图 — Q2 2026(MVP)→ Q4 2026-2027(扩张)→ 2028+(平台化)

`business-plan.spec.ts` 三个 e2e:7 section 可见 / 关键数字渲染 / About → 蓝图跳转。

## 语音输入

`vue-project/src/utils/speechRecognition.ts` — Web Speech API 薄包装:
- 自动探测 `SpeechRecognition` / `webkitSpeechRecognition`(Chrome / Edge)
- 中间结果 + 最终结果 onResult 回调,interimText 实时填充输入框
- 错误码本地化(no-speech / not-allowed / network 等),用户友好提示
- AI 解读页麦克风按钮:点击开始/停止,听写过程红色脉冲

## Performance

Lighthouse(desktop preset)CI 实测分数(由 `treosh/lighthouse-ci-action` 每次 PR 自动生成,artifact 可下载):

| 类别 | 目标 | 当前 |
|------|------|------|
| Performance | ≥ 70 | 见 CI |
| Accessibility | ≥ 90 | 见 CI |
| Best Practices | ≥ 90 | 见 CI |
| SEO | ≥ 85 | 见 CI |
| PWA | ≥ 80 | 见 CI |

跑本地基线:

```bash
npm --prefix vue-project run build
npm run frontend:lighthouse
```

报告输出到 `vue-project/.lighthouseci/`。CI 上传到 temporary-public-storage,链接见 Actions 日志。

性能优化项:
- 路由懒加载 + 大依赖手动分包(three / markdown / search / vue-core)
- ES2020 target + CSS code split + PWA precache
- Workbox runtime caching(资源 / 社区列表 SWR)
- AI 流式路径排除 SW 拦截(`navigateFallbackDenylist`)

## CI

| Job | 内容 | 工件 |
|-----|------|------|
| backend | check + node --test + c8 覆盖率 | `backend-coverage/lcov.info` |
| frontend | lint:check + type-check + vite build | `frontend-dist/` |
| frontend-e2e | Playwright(smoke + ai-stream + council) | `playwright-report/` |
| frontend-lighthouse | Lighthouse CI(treosh) | `.lighthouseci/` |

`concurrency.cancel-in-progress` 保证 30s 内两次 push 仅跑最新一次。

## 测试

```bash
# 后端单元测试(纯函数:SSE 解析、env 校验、runtime 工具)
npm run backend:test
npm run backend:test:coverage          # 含 c8 覆盖率

# 前端 e2e
npm run frontend:e2e                    # smoke
npm run frontend:e2e:stream             # 流式 mock 测试
npm run frontend:e2e:council            # 多 agent 议事
npm run frontend:e2e:integration        # 完整集成
npm run frontend:e2e:enterprise         # B 端订阅 + leads
npm run frontend:e2e:business-plan      # 商业蓝图长卷

# 类型检查
npm run frontend:type-check
```

## 演示文档

详见 [`演示文档包/`](./演示文档包/) — 包含演示脚本、讲解稿、技术说明、检查清单。

# 道德经 AI 平台 2.0 — 传智杯 AI Web 开发赛道项目讲解

---

## 一、项目概述

**道德经 AI 平台 2.0** 是一个借助 AI 智慧探索老子思想现代价值的 Web 应用。

**核心理念**：不是把古文翻译成白话，而是让《道德经》能进入一个 2026 年的人面对的真实问题（职业焦虑、人际、决策、伦理），并仍然有效。

**成功标准**：用户在某一次具体的犹豫里，真的回到了某一章，并用它做了一个决定。

**技术栈**：Vue 3 + Vite + Express + MySQL + DeepSeek/OpenRouter/OpenAI

---

## 二、目标用户

### C 端用户（主要）

- **当代学习者（20-35 岁）**：接受过完整高等教育，对国学有好奇但被传统呈现劝退
- **修行者 / 长期读者（30-55 岁）**：已经在读《道德经》，需要跨章查证、追问、记录的工具
- **儿童家长**：希望用现代方式让孩子接触传统文化

### B 端用户（次要）

- **企业团队 / 教培机构**：把"道学 + AI 解读"作为员工人文素养课、企业文化课的载体

### 关键评估者

- **传智杯评委**：学术 + 产业混合背景，30 秒内要看明白"这是什么 / 凭什么不一样 / 凭什么能赚钱"

---

## 三、核心功能与技术实现

---

### 【模块一：AI 对话系统】

#### 1. AI 流式对话（SSE）

**功能描述**：
- token 逐字推送，真正的实时对话体验
- 多模型兼容：DeepSeek / OpenRouter / OpenAI 无缝切换
- 客户端断开自动取消上游请求

**技术实现**：

```
后端架构（backend/app.js + backend/lib/sse-utils.js）：
├── Express 路由 POST /api/ai/chat/stream
│   ├── 设置 SSE 响应头（Content-Type: text/event-stream）
│   ├── 启动心跳定时器（SSE_COMMENT_PING）
│   └── 调用 resolveAIProvider() 选择上游
│
├── sse-utils.js（纯函数，21 个单元测试）
│   ├── splitSSEBuffer(prevBuffer, incomingText)
│   │   └── 滚动 buffer 聚合 + \n\n 切分
│   │   └── 解决 TCP chunk 跨包问题
│   ├── parseSSEEvent(rawEventBlock)
│   │   └── 解析 data: 行，支持 [DONE] / JSON / 注释
│   ├── extractDeltaAndUsage(payload)
│   │   └── 提取 choices[0].delta.content + usage
│   ├── chunkTextForMock(text, chunkSize=5)
│   │   └── Mock 模式 50ms 推送
│   └── formatSSEData(obj)
│       └── 格式化 SSE data 行
│
├── 三家 Provider 兼容
│   ├── DeepSeek: POST https://api.deepseek.com/chat/completions
│   ├── OpenRouter: POST https://openrouter.ai/api/v1/chat/completions
│   └── OpenAI: POST https://api.openai.com/v1/chat/completions
│   └── 统一 stream:true + 逐 chunk 转发
│
└── 客户端断开处理
    └── req.on('close') → upstreamAbort.abort()
    └── 写 ai_usage_logs(prompt/completion/total tokens)
```

**核心代码（sse-utils.js）**：
```javascript
// 滚动 buffer 切分 —— 解决 SSE 代理最常见的 bug
function splitSSEBuffer(prevBuffer, incomingText) {
  const combined = (prevBuffer || '') + (incomingText || '')
  const parts = combined.split('\n\n')
  const remainingBuffer = parts.pop()
  return {
    events: parts.filter(p => p.length > 0),
    remainingBuffer: remainingBuffer || ''
  }
}

// 三家供应商统一格式提取
function extractDeltaAndUsage(payload) {
  const choice = Array.isArray(payload.choices) ? payload.choices[0] : null
  const delta = choice?.delta?.content || ''
  const usage = payload.usage || null
  return { delta, usage }
}
```

**特性开关**：`VITE_AI_STREAM=false` 一键回退到非流式

---

#### 2. RAG 检索增强

**功能描述**：
- 三路召回策略，精准匹配道德经章节
- TF-IDF 字符二元组重排，提高相关性
- Top-1 注入 system prompt + Top-4 作为候选

**技术实现**：

```
前端架构（vue-project/src/services/ragService.ts）：
├── Fuse.js 模糊匹配引擎
│   ├── 配置：threshold: 0.3, distance: 100
│   ├── 搜索键：content(0.5) + keywords(0.3) + annotations.modern(0.2)
│   └── 返回带 score 的匹配结果
│
├── CHAPTER_KEYWORDS 章节关键词
│   └── 23 章 × 5-8 个关键词
│   └── 如：8 → ['上善若水', '水', '不争', '第八章']
│
├── CONCEPT_KEYWORDS 概念关键词
│   └── 10 个核心概念 → 章节映射
│   └── 如：'道' → [1, 4, 25, 34, 42]
│   └── '无为' → [2, 3, 10, 37, 43, 48, 57, 63]
│
├── TF-IDF 字符二元组重排
│   ├── tokenize(text) → 字符二元组数组
│   │   └── 去除标点/空格，滑动窗口 2 字符
│   ├── buildDoc(item) → content + modern + keywords 拼接
│   ├── ensureIndex() → 惰性构建 TF-IDF 索引
│   │   ├── df: Map<bigram, 出现文档数>
│   │   ├── idf: Map<bigram, log(N/df)>
│   │   ├── vectors: Map<docId, Map<bigram, tf-idf>>
│   │   └── norms: Map<docId, L2 范数>
│   └── cosineSimilarity(queryVec, docVec, docNorm)
│       └── 余弦相似度计算
│
└── 检索流程
    ├── preprocessQuery(去标点/停用词)
    ├── 三路召回并行执行
    │   ├── fuse.js 模糊匹配
    │   ├── CHAPTER_KEYWORDS 章节命中
    │   └── CONCEPT_KEYWORDS 概念命中
    ├── 候选去重（按 chapter_id）
    ├── TF-IDF 重排
    │   ├── 余弦相似度 × strategy 权重
    │   │   └── chapter: 1.2 / concept: 1.1 / fuzzy: 1.0
    │   └── 取 Top-5 候选
    └── 注入策略
        ├── Top-1 → system prompt
        └── Top-4 → 候选列表
```

**核心代码（ragService.ts）**：
```typescript
// 字符二元组分词
const tokenize = (text: string): string[] => {
  const cleaned = text.replace(/[\s　，。！？；：""''《》、（）()\[\]【】.,!?;:'"\\-]+/g, '')
  const tokens: string[] = []
  for (let i = 0; i < cleaned.length - 1; i++) {
    tokens.push(cleaned.slice(i, i + 2))
  }
  return tokens
}

// TF-IDF 索引构建
const ensureIndex = (): TfIdfIndex => {
  const df = new Map<string, number>()
  // 遍历文档计算 df
  for (const item of knowledgeBase) {
    const seen = new Set(tokenize(buildDoc(item)))
    for (const t of seen) df.set(t, (df.get(t) || 0) + 1)
  }
  // 计算 idf
  const idf = new Map<string, number>()
  for (const [t, count] of df) {
    idf.set(t, Math.log(docCount / count))
  }
  // ... 构建向量和范数
}
```

---

#### 3. 多人格 AI 系统

**功能描述**：
- 三种 AI 人格，各有独立的 system prompt 和 temperature
- 支持单人解读和三人议事两种模式

**技术实现**：

```
后端架构（backend/lib/council-utils.js）：
├── COUNCIL_PERSONAS 常量（21 个单元测试覆盖）
│   ├── scholar（现代学者）
│   │   ├── temperature: 0.5
│   │   └── system: '严谨的道家文化学者，学术风格，引用历史与训诂'
│   ├── hermit（道家隐士）
│   │   ├── temperature: 0.9
│   │   └── system: '云游山林的道家隐士，诗意比喻，贴近自然'
│   └── healer（心理疗愈师）
│       ├── temperature: 0.7
│       └── system: '擅长以道家智慧抚慰现代人，共情、可执行建议'
│
├── validateQuestion(question)
│   ├── 空值检查
│   └── 长度检查（>1500 字拒绝）
│
└── aggregateCouncilResults(results)
    ├── succeed/fail 计数
    ├── totalTokens 汇总
    └── status: 'success-council' | 'partial-council'
```

---

#### 4. 三人议事（Multi-Agent）

**功能描述**：
- 并行模式：三种视角同屏对照
- 辩论模式：二轮对话，互相回应
- 失败隔离：任一 persona 失败不影响其他

**技术实现**：

```
后端路由 POST /api/ai/council：
├── 并行模式（mode: 'parallel'）
│   ├── Promise.all 并行调用三个 persona
│   ├── 每个 persona 独立 system prompt + temperature
│   ├── 任一失败 .catch → buildCouncilFailureFallback
│   └── aggregateCouncilResults 汇总
│
├── 辩论模式（mode: 'debate'）
│   ├── Round 1: 同 parallel，三 persona 并行答题
│   ├── Round 2: 对每个 persona
│   │   ├── buildDebatePeerPrompt(persona, question, peers)
│   │   │   ├── 拼接其他两位 round-1 内容
│   │   │   └── system: '基于你自己的视角，认同的补充，不认同的温和反驳'
│   │   └── 第 1 轮无可参考 peers → 跳过 Round 2
│   └── aggregateDebateResults(round1, round2)
│       └── round1 + round2 token / 失败计数汇总
│
└── 写 ai_usage_logs
    └── status: success-council | partial-council | success-debate | partial-debate
```

**核心代码（council-utils.js）**：
```javascript
// 辩论模式提示词构建
function buildDebatePeerPrompt(persona, question, peerResponses) {
  const peers = peerResponses.filter(p => p && !p.error)
  const peerBlock = peers
    .map(p => `【${p.personaName}】${p.content}`)
    .join('\n\n')
  
  return {
    messages: [
      { role: 'system', content: `${persona.system}\n\n现在进入第二轮...` },
      { role: 'user', content: `本轮问题：${question}\n\n其他两位回答：\n${peerBlock}` }
    ]
  }
}
```

---

### 【模块二：道家智慧应用】

#### 5. 道家决策辅助系统

**功能描述**：
- 将西方 SWOT 分析与东方道家智慧结合
- 四维分析：阳（优势）、阴（劣势）、天时（机遇）、地利（威胁）
- AI 深度解读 + 经文匹配

**技术实现**：

```
前端页面（vue-project/src/views/DecisionHelperView.vue）：
├── Step 1: 输入表单
│   ├── 决策主题输入
│   └── SWOT 四象限 textarea
│       ├── 阳（优势）- 红色系
│       ├── 阴（劣势）- 蓝色系
│       ├── 天时（机遇）- 黄色系
│       └── 地利（威胁）- 绿色系
│
├── Step 2: AI 分析
│   ├── 构建 system prompt
│   │   └── '基于道家智慧分析用户的 SWOT...'
│   ├── 构建 user message
│   │   └── 决策主题 + 四象限内容
│   └── 调用 /api/ai/chat/stream
│
└── Step 3: 结果展示
    ├── SWOT 分析总结
    ├── 道家智慧解读
    ├── 匹配经文章节
    └── 行动建议
```

**Prompt 工程**：
```
系统提示词：
"你是道家智慧决策顾问。基于用户提供的 SWOT 分析，结合《道德经》的智慧：
1. 分析四象限的内在联系
2. 引用相关章节（如'上善若水'对应不争策略）
3. 给出符合道家思想的决策建议
4. 保持'无为而无不为'的核心理念"
```

---

#### 6. 道之签 — 每日 AI 卦签

**功能描述**：
- SHA256 确定性算法，同用户同日首抽必同章
- AI 生成今日提点 + 行动建议
- 再抽消耗 30 cultivation XP

**技术实现**：

```
后端架构（backend/lib/divination-utils.js）：
├── KNOWLEDGE_CHAPTERS 常量
│   └── 23 章数组，对应知识库完整注释的章节
│
├── CHAPTER_TEXTS 常量
│   └── 23 章 × { content, modern }
│   └── 如：第 8 章 → { content: '上善若水...', modern: '最高的善像水一样...' }
│
├── getDateKey(date)
│   └── UTC 时区避免跨时区重复抽取
│   └── 返回 'YYYY-MM-DD' 格式
│
├── pickChapterDeterministic(userId, dateKey, salt)
│   ├── seed = `${userId}:${dateKey}${salt ? ':' + salt : ''}`
│   ├── hash = SHA256(seed).hex[0..8]
│   ├── n = parseInt(hash, 16)
│   └── idx = n % 23
│   └── 首抽无 salt，reroll 加 randomUUID 盐
│
├── buildDivinationPrompt(chapter, content, modern)
│   ├── system: '道家智慧现代导师，生成 JSON'
│   ├── 要求：insight(50字) + action(20字)
│   └── 输出：{"insight":"...","action":"..."}
│
└── parseDivinationContent(rawText)
    ├── 尝试严格 JSON 解析
    ├── 尝试 ```json ``` 代码块提取
    ├── 尝试正则 {[\s\S]*} 匹配
    └── 兜底：返回 mock 内容
```

**核心代码（divination-utils.js）**：
```javascript
// 确定性抽取算法
function pickChapterDeterministic(userId, dateKey, salt) {
  const seed = `${userId || 'anonymous'}:${dateKey || ''}${salt ? ':' + salt : ''}`
  const hash = crypto.createHash('sha256').update(seed).digest('hex')
  const slice = hash.slice(0, 8)
  const n = parseInt(slice, 16)
  return KNOWLEDGE_CHAPTERS[n % KNOWLEDGE_CHAPTERS.length]
}

// AI 输出解析（三级兜底）
function parseDivinationContent(rawText) {
  const candidates = []
  candidates.push(trimmed)
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]+?)\s*```/i)
  if (fenced) candidates.push(fenced[1].trim())
  const objMatch = trimmed.match(/\{[\s\S]*\}/)
  if (objMatch) candidates.push(objMatch[0])
  // 逐个尝试解析...
}
```

**前端缓存**：`daoSign:<userId>:<YYYY-MM-DD>`，同日刷新走 localStorage

---

#### 7. 场景共鸣卡

**功能描述**：
- 12 张现代焦虑情境卡片
- 点击直接走流式对话，降低使用门槛
- 议事模式下自动隐藏

**技术实现**：

```
前端架构：
├── vue-project/src/data/scenarioCards.ts（纯数据）
│   └── 12 张卡片
│       ├── id, title, description
│       ├── icon（FontAwesome）
│       ├── prompt（预设提问模板）
│       └── tags（分类标签）
│
├── vue-project/src/components/chat/ScenarioCards.vue
│   ├── 4×3 网格布局
│   ├── 点击事件 → emit('select', card.prompt)
│   └── 议事模式下 v-if="!isCouncilMode"
│
└── 调用流程
    ├── 用户点击卡片
    ├── 获取 card.prompt
    ├── 填充到聊天输入框
    └── 触发 /api/ai/chat/stream
```

**卡片内容覆盖**：
```
失眠 | 拖延 | 失恋 | 迷茫
职场内卷 | 育儿 | 经济压力
亲密关系 | 信息焦虑
完美主义 | 自我怀疑 | 突发变故
```

---

### 【模块三：数字文创与社区】

#### 8. 道境 · 数字艺术画廊

**功能描述**：
- AI 生成道家意境数字艺术
- 经文模式 + 自由输入模式
- 7 种艺术风格选择

**技术实现**：

```
后端架构（backend/lib/art-utils.js）：
├── VALID_STYLES 常量
│   └── ['ink', 'cyber', 'abstract', 'zen', 'landscape', 'ink_splash', 'fantasy']
│
├── STYLE_PROMPTS 风格提示词
│   ├── ink: '中国传统水墨画风格，宣纸质感，留白写意'
│   ├── cyber: '赛博朋克修仙风格，霓虹灯光，未来科技感'
│   ├── abstract: '抽象写意风格，现代艺术，色彩流动'
│   ├── zen: '禅意极简风格，大面积留白，淡墨晕染'
│   ├── landscape: '中国山水画风格，青绿山水，云雾缭绕'
│   ├── ink_splash: '泼墨大写意风格，墨色飞溅，气韵生动'
│   └── fantasy: '仙侠奇幻风格，仙山楼阁，瑞气祥云'
│
├── STYLE_NEGATIVE 负面提示词
│   └── 每个风格对应的 negative prompt
│
├── buildArtPrompt(quote, style)
│   └── `道家哲学意境画：「${quote}」，${styleDesc}，高质量，精细`
│
└── buildNegativePrompt(style)
    └── 返回对应风格的负面提示词

前端页面（vue-project/src/views/DaoArtView.vue）：
├── 引文模式选择
│   ├── 经文模式：下拉选择道德经名句
│   └── 自由输入：用户自定义意境描述（200 字限制）
│
├── 风格选择
│   └── 4 宫格按钮选择艺术风格
│
├── 生成流程
│   ├── 调用 AI 图像生成 API
│   │   └── prompt = buildArtPrompt(quote, style)
│   │   └── negative = buildNegativePrompt(style)
│   ├── 生成进度显示（elapsedTime）
│   └── 结果展示 + 保存/分享
│
└── 画廊展示
    ├── 社区作品瀑布流
    ├── 点赞、收藏、分享
    └── 作品详情页
```

**核心代码（art-utils.js）**：
```javascript
// 7 种风格提示词
const STYLE_PROMPTS = {
  ink: '中国传统水墨画风格，宣纸质感，留白写意，墨色浓淡变化，山水意境，道家美学',
  cyber: '赛博朋克修仙风格，霓虹灯光，未来科技感，科幻与道家哲学融合，暗色调发光',
  // ... 其他风格
}

// 构建生成提示词
function buildArtPrompt(quote, style) {
  const styleDesc = STYLE_PROMPTS[style] || STYLE_PROMPTS.ink
  return `道家哲学意境画：「${quote}」，${styleDesc}，高质量，精细`
}
```

---

#### 9. 共创社区

**功能描述**：
- 发帖、评论、点赞
- 标签分类、草稿箱功能
- 社区统计

**技术实现**：

```
后端架构（backend/app.js + vue-project/src/services/communityService.ts）：
├── 数据库表设计
│   ├── posts 表
│   │   ├── id, user_id, title, content
│   │   ├── tags（JSON 数组）
│   │   ├── likes_count, comments_count
│   │   └── created_at, updated_at
│   ├── comments 表
│   │   ├── id, post_id, user_id, content
│   │   └── created_at
│   └── drafts 表
│       ├── id, user_id, title, content, tags
│       └── updated_at
│
├── API 路由
│   ├── GET /api/community/posts（分页 + 标签过滤）
│   ├── POST /api/community/posts（创建帖子）
│   ├── PUT /api/community/posts/:id（更新帖子）
│   ├── DELETE /api/community/posts/:id（删除帖子）
│   ├── POST /api/community/posts/:id/like（点赞）
│   ├── GET /api/community/posts/:id/comments（获取评论）
│   └── POST /api/community/posts/:id/comments（添加评论）
│
└── 草稿箱功能
    ├── POST /api/community/drafts（保存草稿）
    ├── GET /api/community/drafts（获取草稿列表）
    └── DELETE /api/community/drafts/:id（删除草稿）

前端页面（vue-project/src/views/CommunityView.vue）：
├── 社区统计卡片
│   ├── 社区成员数
│   ├── 讨论帖子数
│   └── 今日活跃数
│
├── 创建帖子表单
│   ├── 标题输入
│   ├── 内容输入（textarea）
│   ├── 标签输入（空格分隔）
│   ├── 保存草稿按钮
│   └── 发布按钮
│
├── 帖子列表
│   ├── 卡片式布局
│   ├── 标签展示
│   ├── 点赞/评论数
│   └── 点击进入详情
│
└── 帖子详情
    ├── 完整内容展示
    ├── 评论列表
    └── 添加评论
```

---

### 【模块四：学习与成长】

#### 10. 学习路径系统

**功能描述**：
- 23 章体系，道德经 81 章按主题分组
- 学习进度追踪
- 章节内容：原文、白话、AI 解读、现代应用

**技术实现**：

```
后端架构：
├── learning_progress 表
│   ├── id, user_id, chapter_id
│   ├── completed（boolean）
│   ├── study_time（学习时长秒数）
│   └── last_studied_at
│
├── API 路由
│   ├── GET /api/learning/progress（获取学习进度）
│   ├── POST /api/learning/progress/:chapterId（更新进度）
│   └── GET /api/learning/stats（学习统计）
│
└── 学习统计聚合
    ├── 已学章节数
    ├── 总学习时长
    └── 连续学习天数

前端页面（vue-project/src/views/LearningPathView.vue）：
├── 章节列表（<ol> 表格化）
│   ├── 章号（IBM Plex Mono）
│   ├── 章名（Source Han Serif Heavy）
│   ├── 副标题
│   └── 状态（未学/学习中/已完成）
│
├── 进度可视化
│   ├── 细线条 + 百分比
│   └── 不使用圆环渐变
│
└── 章节详情
    ├── 原文展示（LXGW WenKai）
    ├── 白话翻译
    ├── AI 解读（调用 /api/ai/chat/stream）
    └── 现代应用场景
```

---

#### 11. 资源库

**功能描述**：
- 经典原文、注释版本
- 推荐书单、视频/音频资源

**技术实现**：

```
前端页面（vue-project/src/views/ResourceLibraryView.vue）：
├── 数据结构
│   ├── resources 表
│   │   ├── id, title, type（book/video/audio/article）
│   │   ├── url, description, cover_image
│   │   └── tags, category
│   └── 静态数据 + 动态加载
│
├── 分类展示
│   ├── 经典原文（81 章完整）
│   ├── 注释版本（多家注释对比）
│   ├── 推荐书单
│   ├── 视频资源（名家讲解）
│   └── 音频资源（朗诵、解读）
│
└── 搜索过滤
    ├── 关键词搜索
    ├── 类型过滤
    └── 标签过滤
```

---

### 【模块五：语音与多媒体】

#### 12. TTS 语音合成器

**功能描述**：
- DeepSeek × MiMo 智能语音合成
- 三种模式：原文朗读、解读模式、自定义内容
- 多音色、语速、音调调节

**技术实现**：

```
后端架构（backend/lib/tts-utils.js）：
├── TTS Provider 选择
│   ├── edge-tts（默认，免费）
│   │   └── 微软 Edge 浏览器 TTS 引擎
│   ├── ElevenLabs（高质量，付费）
│   ├── MiniMax（中文优化）
│   └── CosyVoice（阿里云）
│
├── 语音配置参数
│   ├── voice（音色 ID）
│   ├── speed（语速 0.5x - 2.0x）
│   ├── pitch（音调）
│   └── volume（音量）
│
└── 合成流程
    ├── 接收文本 + 配置
    ├── 选择 Provider
    ├── 调用 TTS API
    ├── 返回音频流
    └── 支持下载

前端页面（vue-project/src/views/TTSView.vue）：
├── 合成模式选择
│   ├── 原文朗读：选择章节
│   ├── 解读模式：AI 解读 + 语音化
│   └── 自定义内容：用户输入文本（5000 字限制）
│
├── 语音配置面板
│   ├── 音色选择（下拉框）
│   ├── 语速调节（0.5x - 2.0x）
│   ├── 音调调节
│   └── 音量调节
│
├── 播放控制
│   ├── 播放/暂停
│   ├── 进度条
│   └── 下载按钮
│
└── 解读风格选择（解读模式）
    ├── 通俗易懂
    ├── 详细解读
    └── 深度哲学
```

---

#### 13. 语音输入系统

**功能描述**：
- Web Speech API 浏览器原生语音识别
- 中文识别，实时回显
- 错误码本地化

**技术实现**：

```
前端工具（vue-project/src/utils/speechRecognition.ts）：
├── 浏览器兼容性检测
│   ├── isSpeechRecognitionSupported()
│   └── 支持 SpeechRecognition / webkitSpeechRecognition
│
├── SpeechRecognizer 类
│   ├── start()
│   │   ├── 创建 SpeechRecognition 实例
│   │   ├── 设置 lang: 'zh-CN'
│   │   ├── 设置 continuous: false
│   │   ├── 设置 interimResults: true
│   │   └── 绑定事件处理器
│   ├── stop() / abort()
│   └── isListening 状态
│
├── 事件处理
│   ├── onresult
│   │   ├── 遍历 event.results
│   │   ├── 区分 isFinal 和 interim
│   │   └── 回调 onResult({ transcript, isFinal })
│   ├── onerror
│   │   └── mapErrorCode(code) 本地化错误信息
│   ├── onstart / onend
│   │   └── 更新 listening 状态
│
└── 错误码映射
    ├── 'no-speech' → '没有检测到语音，请重试'
    ├── 'not-allowed' → '用户拒绝了麦克风权限'
    ├── 'network' → '网络错误，语音识别需要联网'
    └── 'audio-capture' → '无法访问麦克风，请检查权限'
```

**核心代码（speechRecognition.ts）**：
```typescript
// 语音识别类
export class SpeechRecognizer {
  start(): boolean {
    const rec = new Ctor()
    rec.lang = 'zh-CN'
    rec.continuous = false
    rec.interimResults = true
    
    rec.onresult = (event) => {
      for (let i = event.resultIndex; i < results.length; i++) {
        const r = results[i]
        if (r.isFinal) {
          this.options.onResult?.({ transcript: r[0].transcript, isFinal: true })
        } else {
          this.options.onResult?.({ transcript: r[0].transcript, isFinal: false })
        }
      }
    }
  }
}

// 错误码本地化
const ERROR_MESSAGES: Record<string, string> = {
  'no-speech': '没有检测到语音，请重试',
  'not-allowed': '用户拒绝了麦克风权限',
  'network': '网络错误，语音识别需要联网'
}
```

---

### 【模块六：儿童教育】

#### 14. 小小道童 · 智慧绘本

**功能描述**：
- 道德经经典故事改编，适合儿童
- 互动阅读，翻页动画
- 年龄分级，自动播放

**技术实现**：

```
前端页面（vue-project/src/views/PictureBookView.vue）：
├── 故事数据结构
│   ├── stories 数组
│   │   ├── id, title, chapter（对应章节）
│   │   ├── summary（故事简介）
│   │   ├── icon（FontAwesome 图标）
│   │   ├── age（适合年龄：4-6/7-9/10-12）
│   │   └── pages 数组
│   │       ├── content（故事文字）
│   │       ├── icon（页面插图图标）
│   │       └── narration（TTS 旁白文本）
│
├── 故事选择器
│   ├── 卡片式布局
│   ├── 年龄标签
│   └── 点击开始阅读
│
├── 绘本阅读器
│   ├── 翻页控制（上一页/下一页）
│   ├── 自动播放模式
│   │   └── toggleAutoPlay()
│   ├── 页面过渡动画
│   │   └── <transition name="page-flip">
│   ├── 左侧插图区
│   │   └── 动态图标 + 纹理背景
│   └── 右侧文字区
│       ├── 故事内容
│       ├── TTS 朗读按钮
│       └── 章节信息
│
└── TTS 集成
    ├── 调用 /api/tts/synthesize
    └── 自动播放时同步朗读
```

---

### 【模块七：用户与商业化】

#### 15. 用户认证系统

**功能描述**：
- JWT 认证
- 注册/登录
- 个人中心

**技术实现**：

```
后端架构：
├── users 表
│   ├── id, username, email, password_hash
│   ├── avatar, bio
│   ├── subscription_tier（free/pro/master/team/enterprise）
│   ├── cultivation_xp（修行经验值）
│   └── created_at, last_login_at
│
├── JWT 中间件（authMiddleware）
│   ├── 验证 Authorization: Bearer <token>
│   ├── 解码 payload（userId, email, tier）
│   └── 附加到 req.user
│
├── API 路由
│   ├── POST /api/auth/register
│   │   └── 密码 bcrypt 哈希
│   ├── POST /api/auth/login
│   │   └── 验证密码 + 签发 JWT
│   ├── GET /api/user/profile
│   │   └── 返回用户信息
│   └── PUT /api/user/profile
│       └── 更新个人信息
│
└── 使用限额（checkLimit）
    ├── free: 基础额度
    ├── pro: 无限对话
    ├── team: 500 次/日
    └── enterprise: 无限制

前端状态管理（vue-project/src/stores/auth.ts）：
├── Pinia store
│   ├── state: { user, token, isAuthenticated }
│   ├── actions: { login, register, logout, fetchProfile }
│   └── getters: { subscriptionTier, cultivationXP }
│
└── 路由守卫
    └── meta.requiresAuth → 检查登录状态
```

---

#### 16. 价值仪表盘 / 修行账单

**功能描述**：
- 当月/累计 API 调用次数
- Token 消耗统计
- 学习进度追踪
- 节省咨询费计算

**技术实现**：

```
后端架构（backend/lib/value-report-utils.js）：
├── 数据库聚合查询
│   ├── 当月统计
│   │   └── SELECT COUNT(*), SUM(total_tokens), SUM(estimated_cost)
│   │       FROM ai_usage_logs
│   │       WHERE user_id = ? AND created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')
│   ├── 累计统计
│   │   └── 同上去掉日期条件
│   └── 学习进度
│       └── SELECT COUNT(DISTINCT chapter_id)
│           FROM learning_progress
│           WHERE user_id = ? AND completed = 1
│
├── formatValueReport(rows, progress)
│   ├── savedAdvisory = calls × ¥30
│   │   └── 对标心理咨询 ¥300/小时 ≈ ¥30/6分钟
│   ├── progress.percent = min(100, round(learned/23 × 100))
│   └── 格式化数字（千分位）
│
└── 单元测试（10 个）
    ├── 系数注入测试
    ├── 边界值测试
    ├── 0 调用测试
    └── null 行测试

前端服务（vue-project/src/services/valueReportService.ts）：
├── fetchValueReport()
│   ├── GET /api/user/value-report
│   └── 5 分钟 localStorage 缓存
│
└── 缓存键：valueReport:<userId>

前端组件（vue-project/src/components/ValueReportCard.vue）：
├── 4 卡网格布局
│   ├── 当月调用次数
│   ├── 累计 Token 消耗
│   ├── 节省咨询费（朱砂高亮）
│   └── 学习进度
│
└── SVG 圆环进度
    └── stroke-dasharray 动画
```

**核心代码（value-report-utils.js）**：
```javascript
// 格式化价值报告
function formatValueReport(rows, progress) {
  const calls = rows[0]?.calls || 0
  const tokens = rows[0]?.total_tokens || 0
  const cost = rows[0]?.estimated_cost || 0
  const learned = progress?.learned || 0
  
  return {
    calls,
    tokens,
    cost,
    savedAdvisory: calls * 30,  // ¥30/次
    progress: {
      learned,
      total: 23,
      percent: Math.min(100, Math.round(learned / 23 * 100))
    }
  }
}
```

---

#### 17. 对话历史管理

**功能描述**：
- 持久化存储
- 多轮对话上下文
- 对话列表

**技术实现**：

```
后端架构：
├── conversations 表
│   ├── id, user_id, title
│   └── created_at, updated_at
│
├── messages 表
│   ├── id, conversation_id
│   ├── role（user/assistant/system）
│   ├── content
│   └── created_at
│
└── API 路由
    ├── GET /api/conversations（对话列表）
    ├── POST /api/conversations（创建对话）
    ├── GET /api/conversations/:id/messages（获取消息）
    └── POST /api/conversations/:id/messages（添加消息）

前端服务（vue-project/src/services/conversationService.ts）：
├── getConversations()
│   └── 获取对话列表，按 updated_at 排序
│
├── createConversation(title)
│   └── 创建新对话
│
├── getMessages(conversationId)
│   └── 获取对话消息列表
│
└── addMessage(conversationId, role, content)
    └── 添加消息到对话

前端状态管理（vue-project/src/stores/chat.ts）：
├── state
│   ├── conversations: Conversation[]
│   ├── currentConversation: Conversation | null
│   ├── messages: Message[]
│   └── isLoading: boolean
│
└── actions
    ├── loadConversations()
    ├── switchConversation(id)
    ├── sendMessage(content)
    └── deleteConversation(id)
```

---

#### 18. 企业订阅系统

**功能描述**：
- Leads 系统：B 端匿名提交
- 后台管理：分页 + 状态过滤
- 状态流转：new → contacted → qualified → closed

**技术实现**：

```
后端架构（backend/lib/leads-utils.js）：
├── 校验规则
│   ├── EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
│   ├── PHONE_REGEX: /^[+0-9\-\s()]{6,30}$/
│   ├── TEAM_SIZE_OPTIONS: ['1-10', '11-50', '51-200', '200+']
│   └── INTENT_OPTIONS: ['team', 'enterprise', 'consulting', 'other']
│
├── validateLeadInput(input)
│   ├── name: 必填，≤100 字
│   ├── email: 必填，格式校验，≤200 字
│   ├── phone: 可选，格式校验
│   ├── company: 可选，≤200 字
│   ├── teamSize: 可选，枚举校验
│   ├── intent: 可选，枚举校验，默认 'enterprise'
│   └── note: 可选，≤1000 字
│
├── normalizeLeadInput(input)
│   ├── trim 所有字段
│   ├── email 小写
│   └── 截断超长字段
│
└── 单元测试（10 个）
    ├── 7 类校验路径
    └── 安全降级（null / 非对象）

数据库表：
├── leads 表
│   ├── id, name, email, phone
│   ├── company, team_size, intent, note
│   ├── status（new/contacted/qualified/closed）
│   └── created_at, updated_at

API 路由：
├── POST /api/leads（无需登录）
│   └── 校验 + normalize + INSERT
├── GET /api/admin/leads（adminAuthMiddleware）
│   └── 分页 + status 过滤
└── PATCH /api/admin/leads/:id
    └── 更新 status
```

**核心代码（leads-utils.js）**：
```javascript
// 校验函数
function validateLeadInput(input) {
  const errors = []
  
  if (isBlank(input.name)) {
    errors.push('name is required')
  } else if (input.name.length > 100) {
    errors.push('name too long')
  }
  
  if (isBlank(input.email)) {
    errors.push('email is required')
  } else if (!EMAIL_REGEX.test(input.email)) {
    errors.push('email format invalid')
  }
  
  // ... 其他字段校验
  
  return { valid: errors.length === 0, errors }
}

// 归一化函数
function normalizeLeadInput(input) {
  return {
    name: String(input.name || '').trim().slice(0, 100),
    email: String(input.email || '').trim().toLowerCase().slice(0, 200),
    // ... 其他字段
  }
}
```

---

#### 19. 五档定价策略

| 方案 | 价格 | 目标用户 | 特点 | 额度 |
|------|------|----------|------|------|
| 布衣 / Free | ¥0/月 | 新用户尝鲜 | 基础功能 | 每日限额 |
| 居士 / Pro | ¥19/月 | C 端核心 | 无限对话 | 无限 |
| 宗师 / Master | ¥49/月 | 高频用户 | 优先响应 | 无限 |
| 团队 / Team | ¥299/月·10 席 | 中小企业 | 团队管理 | 500次/日/席 |
| 企业 / Enterprise | 联系洽谈 | 大型机构 | 定制部署 | 无限制 |

---

#### 20. 商业蓝图展示

**功能描述**：
- 7 章节滚动长卷
- 关键数据可视化
- 竞品对比

**技术实现**：

```
前端页面（vue-project/src/views/BusinessPlanView.vue）：
├── §1 目标用户画像
│   └── C 端 / B 端 / 机构 三类付费意愿
│
├── §2 市场规模
│   ├── 心理咨询：¥600 亿
│   ├── AI 心理（2030E）：¥250 亿
│   └── 国学教育：¥420 亿
│
├── §3 定价矩阵
│   └── 5 档表格化对比
│
├── §4 单元经济学
│   ├── 毛利率：87%
│   ├── LTV：¥114
│   ├── CAC：¥20
│   └── LTV/CAC：5.7×
│
├── §5 竞品对比
│   └── vs 文心一言 / Kimi / 通义，7 维度差异化
│
├── §6 变现矩阵
│   └── 订阅 / 团队席位 / 企业 API / 内容课程
│
└── §7 路线图
    ├── Q2 2026（MVP）
    ├── Q4 2026-2027（扩张）
    └── 2028+（平台化）

E2E 测试（business-plan.spec.ts）：
├── 7 section 可见
├── 关键数字渲染
└── About → 蓝图跳转
```

---

### 【模块八：技术基础设施】

#### 21. PWA 离线支持

**技术实现**：

```
vue-project/vite.config.ts：
├── VitePWA 插件配置
│   ├── registerType: 'autoUpdate'
│   ├── workbox
│   │   ├── globPatterns: ['**/*.{js,css,html,ico,png,svg}']
│   │   ├── navigateFallbackDenylist: [/^\/api/]
│   │   │   └── AI 流式路径排除 SW 拦截
│   │   └── runtimeCaching
│   │       ├── 资源缓存：StaleWhileRevalidate
│   │       └── 社区列表：StaleWhileRevalidate
│   └── manifest
│       ├── name: '道德经 AI 平台'
│       ├── short_name: '道德经'
│       └── theme_color: '#FDFBF7'
│
└── Service Worker 注册
    └── 自动更新策略

性能优化：
├── 路由懒加载
│   └── () => import('@/views/xxx')
├── 大依赖手动分包
│   ├── three: ['three']
│   ├── markdown: ['marked', 'highlight.js']
│   ├── search: ['fuse.js']
│   └── vue-core: ['vue', 'vue-router', 'pinia']
├── ES2020 target
└── CSS code split
```

---

#### 22. CI/CD 自动化

**技术实现**：

```
.github/workflows/ci.yml：
├── Jobs
│   ├── backend
│   │   ├── npm run backend:test
│   │   ├── c8 覆盖率
│   │   └── 上传 lcov.info
│   ├── frontend
│   │   ├── npm run frontend:lint:check
│   │   ├── npm run frontend:type-check
│   │   └── npm run frontend:build
│   ├── frontend-e2e
│   │   ├── Playwright 测试
│   │   │   ├── smoke
│   │   │   ├── ai-stream
│   │   │   ├── council
│   │   │   ├── integration
│   │   │   ├── enterprise
│   │   │   └── business-plan
│   │   └── 上传 playwright-report
│   └── frontend-lighthouse
│       └── treosh/lighthouse-ci-action
│
├── concurrency
│   └── cancel-in-progress: true
│       └── 30s 内两次 push 仅跑最新一次
│
└── 触发条件
    └── push / pull_request on main
```

---

#### 23. 测试体系

**后端测试**：

```bash
# 运行测试
npm run backend:test

# 含覆盖率
npm run backend:test:coverage

# 覆盖范围
├── sse-utils.js（SSE 解析）
├── council-utils.js（议事逻辑，21 测试）
├── value-report-utils.js（价值报告，10 测试）
├── leads-utils.js（Leads 校验，10 测试）
├── divination-utils.js（道之签）
└── env-validator.js（环境变量校验）
```

**前端测试**：

```bash
# 类型检查
npm run frontend:type-check

# E2E 测试
npm run frontend:e2e              # smoke
npm run frontend:e2e:stream       # 流式 mock
npm run frontend:e2e:council      # 多 agent 议事
npm run frontend:e2e:integration  # 完整集成
npm run frontend:e2e:enterprise   # B 端订阅
npm run frontend:e2e:business-plan # 商业蓝图
```

---

## 四、技术架构全景

```
道德经 AI 平台 2.0 技术栈
│
├── 【前端】
│   ├── Vue 3 + Vite
│   ├── Pinia（状态管理）
│   ├── Vue Router（路由）
│   ├── Fuse.js（模糊搜索）
│   ├── Web Speech API（语音识别）
│   ├── SpeechSynthesis（TTS）
│   ├── Service Worker（PWA）
│   └── Playwright（E2E 测试）
│
├── 【后端】
│   ├── Express.js
│   ├── MySQL（数据库）
│   ├── JWT（认证）
│   ├── bcrypt（密码哈希）
│   ├── SSE（流式传输）
│   ├── node --test（单元测试）
│   └── c8（覆盖率）
│
├── 【AI 服务】
│   ├── DeepSeek
│   ├── OpenRouter
│   ├── OpenAI
│   ├── edge-tts（TTS）
│   └── AI 图像生成 API
│
└── 【DevOps】
    ├── GitHub Actions（CI/CD）
    ├── Lighthouse（性能监控）
    └── Playwright（E2E 测试）
```

---

## 五、设计哲学

### 品牌个性

三个词：**安静、克制、当代**

- **安静**：不喊、不弹窗、不用感叹号，让用户主动靠近
- **克制**：每一像素都在做事，装饰即罪，留白即设计
- **当代**：道学是 2500 年前的思想，但呈现必须像 2026 年的成熟印刷品

### 色彩体系（OKLCH）

| Token | HEX | 用途 |
|-------|-----|------|
| ink-50 | #FDFBF7 | 骨白底色 |
| ink-100 | #F8F5EE | 次级背景 |
| ink-300 | #E0DDD6 | 分割线 |
| ink-700 | #3D3D3D | 正文 |
| ink-900 | #1A1A1A | 标题 |
| cinnabar | #C44A2B | 朱砂强调（≤8%） |

### 字体体系

| 角色 | 字体 | 用途 |
|------|------|------|
| 标题 | LXGW WenKai | 有楷书韵但非仿宋 |
| 正文 | Microsoft YaHei | PPT 安全 |
| 数据 | Consolas | 代码/数字 |

---

## 六、项目亮点总结

### 技术亮点

1. **SSE 流式架构** — 真正的实时 AI 对话，token 逐字推送
2. **RAG 检索增强** — 三路召回 + TF-IDF 重排，精准匹配
3. **Multi-Agent 议事** — 三种人格并行 + 辩论模式
4. **PWA 离线支持** — Service Worker + Workbox

### 产品亮点

1. **道家决策辅助** — SWOT + 道家智慧，东西方融合
2. **道之签** — SHA256 确定性算法，每日 AI 卦签
3. **道境画廊** — AI 生成道家意境数字艺术
4. **智慧绘本** — 儿童友好设计，传统文化触达下一代
5. **TTS 语音合成** — 多模式多音色
6. **场景共鸣卡** — 12 张焦虑情境，降低门槛

### 商业亮点

1. **五档定价** — Free → Enterprise 全覆盖
2. **87% 毛利** — 轻资产高利润
3. **5.7× LTV/CAC** — 健康商业模型
4. **¥1270 亿市场** — 心理 + AI + 国学

---

**谢谢！**

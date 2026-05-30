# 道德经 AI 平台 2.0 — 项目文档

---

## 一、项目详情及使用方式

### 1.1 项目简介

**道德经 AI 平台 2.0** 是一个借助 AI 智慧探索老子思想现代价值的 Web 应用平台。项目将中国传统经典《道德经》与现代 AI 技术深度融合，为用户提供智能化的学习、决策辅助和心灵疗愈服务。

**核心理念**：不是把古文翻译成白话，而是让《道德经》能进入一个 2026 年的人面对的真实问题（职业焦虑、人际、决策、伦理），并仍然有效。

**成功标准**：用户在某一次具体的犹豫里，真的回到了某一章，并用它做了一个决定。

### 1.2 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 前端 | Vue 3 + Vite + Pinia | Vue 3.4, Vite 5 |
| 后端 | Express + MySQL | Express 4.x |
| AI 服务 | DeepSeek / OpenRouter / OpenAI | 兼容三家 |
| 测试 | Playwright + node --test | E2E + 单元测试 |
| 部署 | GitHub Actions + PWA | CI/CD 自动化 |

### 1.3 项目结构

```
daodejing-2.0/
├── vue-project/              # 前端项目
│   ├── src/
│   │   ├── views/           # 16 个页面组件
│   │   ├── services/        # 服务封装
│   │   ├── stores/          # Pinia 状态管理
│   │   ├── components/      # 组件库
│   │   ├── data/            # 静态数据
│   │   └── utils/           # 工具函数
│   └── tests/e2e/           # Playwright E2E 测试
│
├── backend/                  # 后端项目
│   ├── app.js               # 主应用 + 路由
│   ├── lib/                 # 纯函数库
│   ├── tests/               # 单元测试
│   └── data/                # 数据文件
│
└── .github/workflows/       # CI/CD 配置
```

### 1.4 快速启动

#### 环境要求

- Node.js >= 20
- MySQL 5.7+
- Python 3.10+（PPT 生成工具）

#### 安装步骤

```bash
# 1. 克隆项目
git clone https://github.com/Limingxi-77/daodejing-2.0.git
cd daodejing-2.0

# 2. 安装依赖
npm install
npm --prefix backend install
npm --prefix vue-project install

# 3. 配置后端 .env
cp backend/.env.example backend/.env
# 编辑 .env，配置 MySQL、JWT、AI key

# 4. 启动
npm run backend:dev      # 后端: http://localhost:8000
npm run frontend:dev     # 前端: http://localhost:3000
```

### 1.5 核心功能使用指南

#### AI 对话

1. 登录后进入「AI 解读」页面
2. 在输入框输入问题，或点击场景共鸣卡快速提问
3. AI 会实时流式返回回答，引用道德经相关章节
4. 支持语音输入（点击麦克风图标）

#### 三人议事

1. 在「AI 解读」页面工具栏切换到「三家会议」模式
2. 输入问题，三种 AI 人格会同时回答
3. 支持「辩论模式」：二轮对话，互相回应

#### 道家决策辅助

1. 进入「决策辅助」页面
2. 输入决策主题
3. 填写 SWOT 四象限（阳/阴/天时/地利）
4. 点击分析，AI 会结合道家智慧给出建议

#### 道之签

1. 首页显示「今日道签」卡片
2. 每天自动抽取一章，AI 生成今日提点
3. 点击「再抽」消耗 30 XP，重新抽取

#### 道境画廊

1. 进入「道境画廊」页面
2. 选择经文或自由输入意境
3. 选择艺术风格（水墨山水/禅意极简等）
4. AI 生成数字艺术作品，可保存到社区

#### 智慧绘本

1. 进入「智慧绘本」页面
2. 选择适合年龄的故事（4-6/7-9/10-12 岁）
3. 翻页阅读，支持自动播放和 TTS 朗读

#### TTS 语音合成

1. 进入「语音合成」页面
2. 选择模式（原文朗读/解读/自定义）
3. 配置音色、语速、音调
4. 点击生成，支持下载音频

---

## 二、项目亮点

### 2.1 技术亮点

#### SSE 流式对话架构

采用 Server-Sent Events 实现真正的实时 AI 对话体验：

```
浏览器 → Express 路由 → AI Provider (stream:true) → 逐 chunk 转发 → 客户端渲染
```

- **三家兼容**：DeepSeek / OpenRouter / OpenAI 无缝切换
- **客户端断开处理**：`req.on('close') → upstreamAbort.abort()`
- **特性开关**：`VITE_AI_STREAM=false` 一键回退非流式
- **Mock 模式**：无 API Key 时自动使用 mock 响应

#### RAG 检索增强

三路召回 + TF-IDF 字符二元组重排，精准匹配道德经章节：

- **fuse.js 模糊匹配**（weight: 1.0）
- **CHAPTER_KEYWORDS 章节关键词**（weight: 1.2）
- **CONCEPT_KEYWORDS 概念关键词**（weight: 1.1）

#### Multi-Agent 议事系统

三种 AI 人格并行对话，多视角解读：

| 人格 | Temperature | 特点 |
|------|-------------|------|
| 现代学者 | 0.5 | 严谨学术，引用历史 |
| 道家隐士 | 0.9 | 诗意比喻，意境深远 |
| 心理疗愈师 | 0.7 | 温暖共情，疗愈导向 |

支持**并行模式**和**辩论模式**（二轮对话，互相回应）

#### PWA 离线支持

- Service Worker + Workbox
- 资源/社区列表 SWR 缓存
- AI 路径白名单避免拦截流式请求

### 2.2 产品亮点

#### 道家决策辅助

将西方 SWOT 分析与东方道家智慧融合：

- **四维分析**：阳（优势）· 阴（劣势）· 天时（机遇）· 地利（威胁）
- **AI 深度解读**：引用相关道德经章节，给出符合道家思想的建议
- **应用场景**：职业选择、创业决策、项目评估、人生规划

#### 道之签 — 每日 AI 卦签

- **SHA256 确定性算法**：同用户同日首抽必同章
- **AI 生成**：今日提点 + 行动建议
- **消耗机制**：再抽消耗 30 cultivation XP

#### 场景共鸣卡

12 张现代焦虑情境卡片，覆盖：
- 失眠、拖延、失恋、迷茫
- 职场内卷、育儿、经济压力
- 亲密关系、信息焦虑
- 完美主义、自我怀疑、突发变故

点击直接走流式对话，降低使用门槛

#### 道境数字画廊

AI 生成道家意境数字艺术：
- 7 种艺术风格（水墨山水、禅意极简、仙侠奇幻等）
- 经文变画作，社区展示互动

#### 智慧绘本

让传统文化触达下一代：
- 3 个年龄分级（4-6/7-9/10-12 岁）
- 互动阅读 + TTS 朗读
- 翻页动画 + 自动播放

### 2.3 商业亮点

#### 五档定价策略

| 方案 | 价格 | 目标用户 |
|------|------|----------|
| 布衣 / Free | ¥0/月 | 新用户尝鲜 |
| 居士 / Pro | ¥19/月 | C 端核心用户 |
| 宗师 / Master | ¥49/月 | 高频用户 |
| 团队 / Team | ¥299/月·10 席 | 中小企业 |
| 企业 / Enterprise | 联系洽谈 | 大型机构 |

#### 单元经济学

- **毛利率**：87%
- **LTV**：¥114
- **CAC**：¥20
- **LTV/CAC**：5.7×

#### 市场规模

- 心理咨询市场：¥600 亿
- AI 心理市场（2030E）：¥250 亿
- 国学教育市场：¥420 亿
- **总计**：¥1,270 亿

### 2.4 设计亮点

#### 品牌个性

三个词：**安静、克制、当代**

- **安静**：不喊、不弹窗、不用感叹号
- **克制**：每一像素都在做事，装饰即罪
- **当代**：呈现必须像 2026 年的成熟印刷品

#### 色彩体系（OKLCH）

| Token | HEX | 用途 |
|-------|-----|------|
| ink-50 | #FDFBF7 | 骨白底色 |
| ink-900 | #1A1A1A | 墨色标题 |
| cinnabar | #C44A2B | 朱砂强调（≤8%） |

#### 字体体系

- **标题**：LXGW WenKai（霞鹜文楷）
- **正文**：Microsoft YaHei（微软雅黑）
- **数据**：Consolas

---

## 三、Web 网页使用情况概述

### 3.1 页面清单

| 页面 | 路由 | 功能 |
|------|------|------|
| 首页 | `/` | 道之签、今日推荐、导航入口 |
| AI 解读 | `/ai-interpretation` | AI 对话、多人格、场景共鸣卡 |
| 决策辅助 | `/decision-helper` | SWOT + 道家智慧分析 |
| 学习路径 | `/learning-path` | 23 章体系、进度追踪 |
| 资源库 | `/resource-library` | 经典原文、注释、书籍 |
| 道境画廊 | `/dao-art` | AI 数字艺术生成 |
| 共创社区 | `/community` | 发帖、评论、互动 |
| 智慧绘本 | `/picture-book` | 儿童教育、互动阅读 |
| 语音合成 | `/tts` | TTS 语音合成器 |
| 个人中心 | `/profile` | 用户信息、学习统计 |
| 商业蓝图 | `/business-plan` | 7 章节商业展示 |
| 关于 | `/about` | 项目介绍 |
| 登录 | `/login` | 用户登录 |
| 注册 | `/register` | 用户注册 |

### 3.2 核心功能页面详解

#### 首页（Home）

![首页](./images/home-daosign.png)

- **今日道签**：AI 生成的每日卦签，包含今日提点和行动建议
- **功能入口**：快速跳转到各个功能模块
- **学习进度**：显示已学章节数和进度百分比

#### AI 解读（AIInterpretation）

![AI对话](./images/ai-chat.png)

- **对话区域**：流式显示 AI 回答，支持 Markdown 渲染
- **工具栏**：切换单人/三人模式、语音输入
- **场景共鸣卡**：12 张焦虑情境卡片
- **侧边栏**：对话历史列表

#### 三人议事

![三人议事](./images/ai-council.png)

- **三栏布局**：三种 AI 人格同屏展示
- **并行模式**：Promise.all 并行调用
- **辩论模式**：二轮对话，互相回应

#### 决策辅助（DecisionHelper）

![决策辅助](./images/decision-helper.png)

- **Step 1**：输入决策主题 + SWOT 四象限
- **Step 2**：AI 分析中（流式显示）
- **Step 3**：显示分析结果、匹配章节、行动建议

#### 道境画廊（DaoArt）

![道境画廊](./images/dao-art.png)

- **创作区**：选择经文/自由输入 + 选择风格
- **画廊展示**：社区作品瀑布流
- **作品详情**：经文 + 画作 + 创作说明

#### 共创社区（Community）

![共创社区](./images/community.png)

- **社区统计**：成员数、帖子数、今日活跃
- **数字文创专区**：跳转道境画廊
- **发帖表单**：标题、内容、标签、草稿箱
- **帖子列表**：卡片式展示，支持点赞评论

#### 学习路径（LearningPath）

![学习路径](./images/learning-path.png)

- **23 章体系**：道德经 81 章按主题分组
- **章节列表**：序号 + 章名 + 学习状态
- **进度追踪**：已学章节数、学习时长、进度百分比

#### 资源库（ResourceLibrary）

![资源库](./images/resource-library.png)

- **经典原文**：道德经 81 章完整原文
- **注释版本**：多家注释对比
- **推荐书单**：相关书籍推荐
- **多媒体资源**：视频、音频资源

#### 智慧绘本（PictureBook）

![智慧绘本](./images/picture-book.png)

- **年龄分级**：4-6 岁 / 7-9 岁 / 10-12 岁
- **互动阅读**：翻页动画、自动播放
- **TTS 朗读**：语音合成播放

#### 语音合成（TTS）

![语音合成](./images/tts.png)

- **三种模式**：原文朗读、解读模式、自定义内容
- **语音配置**：音色、语速、音调调节
- **下载功能**：生成音频文件下载

#### 个人中心（Profile）

![个人中心](./images/profile.png)

- **基本信息**：用户名、头像、简介
- **学习统计**：已学章节、学习时长
- **修行账单**：API 调用次数、节省咨询费
- **订阅管理**：当前套餐、升级入口

#### 商业蓝图（BusinessPlan）

![商业蓝图](./images/business-plan.png)

- **7 章节展示**：用户画像、市场规模、定价矩阵
- **关键数据**：87% 毛利、5.7× LTV/CAC
- **竞品对比**：7 维度差异化分析

### 3.3 用户认证系统

- **JWT 认证**：authMiddleware 中间件
- **订阅层级**：free / pro / master / team / enterprise
- **使用限额**：checkLimit 按层级分配额度

### 3.4 响应式设计

- **桌面优先**：1280px+ 最佳体验
- **移动可用**：768px+ 自适应布局
- **PWA 支持**：可安装到桌面，离线使用

### 3.5 性能指标

| 类别 | 目标 | 优化措施 |
|------|------|----------|
| Performance | ≥ 70 | 路由懒加载、代码分割 |
| Accessibility | ≥ 90 | 语义化 HTML、键盘导航 |
| Best Practices | ≥ 90 | HTTPS、安全头 |
| SEO | ≥ 85 | Meta 标签、结构化数据 |
| PWA | ≥ 80 | Service Worker、Manifest |

---

## 四、项目中涉及的关键技术

### 4.1 前端技术

#### Vue 3 + Composition API

```typescript
// 响应式状态管理
const chatStore = useChatStore()
const { messages, isLoading } = storeToRefs(chatStore)

// 组合式函数
const { startListening, stopListening, isListening } = useSpeechRecognition()
```

#### Vite 构建优化

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-core': ['vue', 'vue-router', 'pinia'],
          'three': ['three'],
          'markdown': ['marked', 'highlight.js'],
          'search': ['fuse.js']
        }
      }
    }
  }
})
```

#### Pinia 状态管理

```typescript
// stores/chat.ts
export const useChatStore = defineStore('chat', {
  state: () => ({
    messages: [],
    currentConversation: null,
    isLoading: false
  }),
  actions: {
    async sendMessage(content: string) {
      // SSE 流式发送
    }
  }
})
```

### 4.2 后端技术

#### 后端目录结构

```
backend/
├── app.js                    # 主应用入口 + 所有路由（209KB）
├── lib/                      # 纯函数库（无副作用，可独立测试）
│   ├── sse-utils.js          # SSE 流式工具
│   ├── council-utils.js      # 议事逻辑（21 个测试）
│   ├── divination-utils.js   # 道之签算法
│   ├── value-report-utils.js # 价值报告（10 个测试）
│   ├── leads-utils.js        # Leads 校验（10 个测试）
│   ├── art-utils.js          # 数字艺术画廊
│   ├── env-validator.js      # 环境变量校验
│   ├── runtime-utils.js      # 运行时工具
│   └── schema-utils.js       # 数据库 Schema
│
├── tests/                    # 单元测试
│   ├── sse-utils.test.js
│   ├── council-utils.test.js
│   ├── value-report-utils.test.js
│   └── leads-utils.test.js
│
├── data/                     # 数据文件
│   └── knowledge_base        # 道德经知识库
│
├── scripts/                  # 脚本工具
│   └── init-db.js            # 数据库初始化
│
├── .env                      # 环境变量配置
├── .env.example              # 环境变量示例
└── package.json              # 依赖配置
```

#### 数据库设计

**MySQL 表结构：**

```sql
-- 用户表
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar VARCHAR(255),
  bio TEXT,
  subscription_tier ENUM('free', 'pro', 'master', 'team', 'enterprise') DEFAULT 'free',
  cultivation_xp INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP
);

-- 对话表
CREATE TABLE conversations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 消息表
CREATE TABLE messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  conversation_id INT NOT NULL,
  role ENUM('user', 'assistant', 'system') NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id)
);

-- AI 使用日志
CREATE TABLE ai_usage_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  endpoint VARCHAR(50),
  prompt_tokens INT,
  completion_tokens INT,
  total_tokens INT,
  estimated_cost DECIMAL(10, 6),
  status VARCHAR(30),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 学习进度
CREATE TABLE learning_progress (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  chapter_id INT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  study_time INT DEFAULT 0,
  last_studied_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE KEY (user_id, chapter_id)
);

-- 社区帖子
CREATE TABLE community_posts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  tags JSON,
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 社区评论
CREATE TABLE community_comments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES community_posts(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 草稿
CREATE TABLE drafts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(200),
  content TEXT,
  tags JSON,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- B 端线索
CREATE TABLE leads (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(200) NOT NULL,
  phone VARCHAR(50),
  company VARCHAR(200),
  team_size VARCHAR(20),
  intent VARCHAR(50),
  note TEXT,
  status ENUM('new', 'contacted', 'qualified', 'closed') DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### Express 路由设计

```javascript
// app.js - 主要路由

// ==================== AI 对话 ====================

// AI 流式对话
app.post('/api/ai/chat/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  
  const provider = resolveAIProvider()
  const stream = await provider.chat(req.body.messages, { stream: true })
  
  // 逐 chunk 转发
  for await (const chunk of stream) {
    const delta = extractDeltaAndUsage(chunk)
    res.write(formatSSEData(delta))
  }
  
  res.write(SSE_DONE_LINE)
  res.end()
})

// 三人议事
app.post('/api/ai/council', async (req, res) => {
  const { question, mode = 'parallel' } = req.body
  
  if (mode === 'parallel') {
    // 并行模式
    const results = await Promise.all(
      COUNCIL_PERSONAS.map(persona => 
        callAI(persona, question).catch(err => buildFailureFallback(persona, err.message))
      )
    )
    res.json(aggregateCouncilResults(results))
  } else if (mode === 'debate') {
    // 辩论模式
    const round1 = await Promise.all(/* ... */)
    const round2 = await Promise.all(
      COUNCIL_PERSONAS.map(persona => {
        const prompt = buildDebatePeerPrompt(persona, question, round1)
        return callAI(persona, prompt).catch(/* ... */)
      })
    )
    res.json(aggregateDebateResults(round1, round2))
  }
})

// 道之签
app.post('/api/ai/divination', async (req, res) => {
  const userId = req.user?.id || 'anonymous'
  const dateKey = getDateKey()
  const salt = req.body.reroll ? randomUUID() : null
  
  const chapter = pickChapterDeterministic(userId, dateKey, salt)
  const { content, modern } = getChapterText(chapter)
  const prompt = buildDivinationPrompt(chapter, content, modern)
  
  const aiResponse = await callAI(prompt)
  const parsed = parseDivinationContent(aiResponse)
  
  res.json({ chapter, ...parsed })
})

// ==================== 用户认证 ====================

// 注册
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body
  
  // 校验
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' })
  }
  
  // 密码哈希
  const passwordHash = await bcrypt.hash(password, 10)
  
  // 插入数据库
  const [result] = await db.query(
    'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
    [username, email, passwordHash]
  )
  
  // 签发 JWT
  const token = jwt.sign({ userId: result.insertId }, JWT_SECRET, { expiresIn: '7d' })
  
  res.json({ token, user: { id: result.insertId, username, email } })
})

// 登录
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body
  
  // 查询用户
  const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email])
  if (users.length === 0) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }
  
  const user = users[0]
  
  // 验证密码
  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }
  
  // 签发 JWT
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })
  
  res.json({ token, user: { id: user.id, username: user.username, email: user.email } })
})

// ==================== 价值报告 ====================

// 获取价值报告
app.get('/api/user/value-report', authMiddleware, async (req, res) => {
  const userId = req.user.id
  
  // 3 路并行查询
  const [monthlyStats, totalStats, learningProgress] = await Promise.all([
    // 当月统计
    db.query(`
      SELECT COUNT(*) as calls, SUM(total_tokens), SUM(estimated_cost)
      FROM ai_usage_logs
      WHERE user_id = ? AND created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')
    `, [userId]),
    // 累计统计
    db.query(`
      SELECT COUNT(*) as calls, SUM(total_tokens), SUM(estimated_cost)
      FROM ai_usage_logs
      WHERE user_id = ?
    `, [userId]),
    // 学习进度
    db.query(`
      SELECT COUNT(DISTINCT chapter_id) as learned
      FROM learning_progress
      WHERE user_id = ? AND completed = 1
    `, [userId])
  ])
  
  res.json(formatValueReport(monthlyStats, totalStats, learningProgress))
})

// ==================== 社区 ====================

// 获取帖子列表
app.get('/api/community/posts', async (req, res) => {
  const { page = 1, limit = 20, tag } = req.query
  const offset = (page - 1) * limit
  
  let query = 'SELECT * FROM community_posts'
  const params = []
  
  if (tag) {
    query += ' WHERE JSON_CONTAINS(tags, ?)'
    params.push(JSON.stringify(tag))
  }
  
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
  params.push(parseInt(limit), offset)
  
  const [posts] = await db.query(query, params)
  res.json(posts)
})

// 创建帖子
app.post('/api/community/posts', authMiddleware, async (req, res) => {
  const { title, content, tags } = req.body
  const userId = req.user.id
  
  const [result] = await db.query(
    'INSERT INTO community_posts (user_id, title, content, tags) VALUES (?, ?, ?, ?)',
    [userId, title, content, JSON.stringify(tags)]
  )
  
  res.json({ id: result.insertId, title, content, tags })
})

// 点赞
app.post('/api/community/posts/:id/like', authMiddleware, async (req, res) => {
  const postId = req.params.id
  
  await db.query(
    'UPDATE community_posts SET likes_count = likes_count + 1 WHERE id = ?',
    [postId]
  )
  
  res.json({ success: true })
})

// ==================== B 端线索 ====================

// 提交线索（无需登录）
app.post('/api/leads', async (req, res) => {
  const input = req.body
  
  // 校验
  const { valid, errors } = validateLeadInput(input)
  if (!valid) {
    return res.status(400).json({ errors })
  }
  
  // 归一化
  const normalized = normalizeLeadInput(input)
  
  // 插入数据库
  const [result] = await db.query(
    'INSERT INTO leads (name, email, phone, company, team_size, intent, note) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [normalized.name, normalized.email, normalized.phone, normalized.company, normalized.teamSize, normalized.intent, normalized.note]
  )
  
  res.json({ success: true, id: result.insertId })
})

// 管理后台 - 获取线索列表
app.get('/api/admin/leads', adminAuthMiddleware, async (req, res) => {
  const { page = 1, limit = 20, status } = req.query
  const offset = (page - 1) * limit
  
  let query = 'SELECT * FROM leads'
  const params = []
  
  if (status) {
    query += ' WHERE status = ?'
    params.push(status)
  }
  
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
  params.push(parseInt(limit), offset)
  
  const [leads] = await db.query(query, params)
  res.json(leads)
})

// 管理后台 - 更新线索状态
app.patch('/api/admin/leads/:id', adminAuthMiddleware, async (req, res) => {
  const { status } = req.body
  
  await db.query(
    'UPDATE leads SET status = ?, updated_at = NOW() WHERE id = ?',
    [status, req.params.id]
  )
  
  res.json({ success: true })
})
```

#### 中间件

```javascript
// 认证中间件
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

// 管理员认证中间件
function adminAuthMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' })
    }
    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

// 使用限额检查
async function checkLimit(req, res, next) {
  const userId = req.user.id
  const tier = req.user.subscription_tier || 'free'
  
  const limits = {
    free: 50,
    pro: Infinity,
    master: Infinity,
    team: 500,
    enterprise: Infinity
  }
  
  const [result] = await db.query(
    'SELECT COUNT(*) as count FROM ai_usage_logs WHERE user_id = ? AND created_at >= DATE_FORMAT(NOW(), "%Y-%m-01")',
    [userId]
  )
  
  if (result[0].count >= limits[tier]) {
    return res.status(429).json({ error: 'Monthly limit exceeded' })
  }
  
  next()
}
```

#### SSE 流式工具

```javascript
// lib/sse-utils.js

/**
 * 将新到来的字节串追加到滚动 buffer，按 \n\n 切分完整事件块
 */
function splitSSEBuffer(prevBuffer, incomingText) {
  const combined = (prevBuffer || '') + (incomingText || '')
  const parts = combined.split('\n\n')
  const remainingBuffer = parts.pop()
  return {
    events: parts.filter(p => p.length > 0),
    remainingBuffer: remainingBuffer || ''
  }
}

/**
 * 解析单个 SSE 事件块
 */
function parseSSEEvent(rawEventBlock) {
  if (!rawEventBlock || typeof rawEventBlock !== 'string') {
    return { type: 'unknown' }
  }
  
  const lines = rawEventBlock.split('\n')
  const dataLines = []
  let isCommentOnly = true
  
  for (const line of lines) {
    if (line.startsWith(':')) continue
    isCommentOnly = false
    if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trimStart())
    }
  }
  
  if (isCommentOnly) return { type: 'comment' }
  if (dataLines.length === 0) return { type: 'unknown' }
  
  const joined = dataLines.join('\n').trim()
  if (joined === '[DONE]') return { type: 'done' }
  
  try {
    return { type: 'message', payload: JSON.parse(joined) }
  } catch {
    return { type: 'unknown', raw: joined }
  }
}

/**
 * 从 OpenAI 兼容 chunk 中提取 delta 文本和 usage
 */
function extractDeltaAndUsage(payload) {
  if (!payload || typeof payload !== 'object') {
    return { delta: '', usage: null, finishReason: null }
  }
  
  const choice = Array.isArray(payload.choices) ? payload.choices[0] : null
  const delta = choice?.delta?.content || ''
  const finishReason = choice?.finish_reason || null
  const usage = payload.usage || null
  
  return { delta, usage, finishReason }
}

/**
 * 将文本按 chunkSize 切片，用于 mock 模式
 */
function chunkTextForMock(text, chunkSize = 5) {
  if (!text) return []
  const size = Math.max(1, chunkSize | 0)
  const chunks = []
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size))
  }
  return chunks
}

/**
 * 把对象格式化成 SSE data 行
 */
function formatSSEData(obj) {
  return `data: ${JSON.stringify(obj)}\n\n`
}

const SSE_DONE_LINE = 'data: [DONE]\n\n'
const SSE_COMMENT_PING = ': ping\n\n'

module.exports = {
  splitSSEBuffer,
  parseSSEEvent,
  extractDeltaAndUsage,
  chunkTextForMock,
  formatSSEData,
  SSE_DONE_LINE,
  SSE_COMMENT_PING
}
```

#### 纯函数库

**council-utils.js - 议事逻辑**

```javascript
const COUNCIL_PERSONAS = [
  {
    id: 'scholar',
    name: '现代学者',
    icon: 'fa-graduation-cap',
    temperature: 0.5,
    system: '你是一位严谨的道家文化学者。请用学术风格,引用历史与训诂,客观分析,避免空泛。回答控制在 200 字内。'
  },
  {
    id: 'hermit',
    name: '道家隐士',
    icon: 'fa-mountain',
    temperature: 0.9,
    system: '你是云游山林的道家隐士。回答用诗意比喻,贴近自然,留白启发。控制在 200 字内。'
  },
  {
    id: 'healer',
    name: '心理疗愈师',
    icon: 'fa-heart',
    temperature: 0.7,
    system: '你是擅长以道家智慧抚慰现代人的心理疗愈师。回答共情、给出可执行建议,语言温和。控制在 200 字内。'
  }
]

function validateQuestion(question) {
  if (!question || typeof question !== 'string' || !question.trim()) {
    return { ok: false, code: 'empty', message: 'question 不能为空' }
  }
  if (question.length > 1500) {
    return { ok: false, code: 'too-long', message: 'question 过长(>1500 字)' }
  }
  return { ok: true, value: question.trim() }
}

function aggregateCouncilResults(results) {
  const safeResults = Array.isArray(results) ? results : []
  const succeeded = safeResults.filter(r => r && !r.error)
  const failed = safeResults.filter(r => r && r.error)
  const totalTokens = succeeded.reduce((acc, r) => acc + (r.tokens || 0), 0)
  
  return {
    succeededCount: succeeded.length,
    failedCount: failed.length,
    totalTokens,
    status: failed.length === 0 ? 'success-council' : 'partial-council'
  }
}

function buildDebatePeerPrompt(persona, question, peerResponses) {
  const peers = (Array.isArray(peerResponses) ? peerResponses : [])
    .filter(p => p && !p.error && typeof p.content === 'string' && p.content.trim())

  if (peers.length === 0) return null

  const peerBlock = peers
    .map(p => `【${p.personaName || p.personaId}】${p.content.trim()}`)
    .join('\n\n')

  return {
    messages: [
      { role: 'system', content: `${persona.system}\n\n现在进入第二轮...` },
      { role: 'user', content: `本轮的问题是:${question}\n\n其他两位的第一轮回答:\n\n${peerBlock}` }
    ]
  }
}
```

**divination-utils.js - 道之签算法**

```javascript
const crypto = require('node:crypto')

const KNOWLEDGE_CHAPTERS = [
  1, 2, 7, 8, 10, 12, 16, 22, 25, 33,
  37, 38, 40, 42, 44, 48, 57, 63, 64, 66,
  76, 78, 81
]

function getDateKey(date) {
  const d = date instanceof Date ? date : new Date()
  const yyyy = d.getUTCFullYear()
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(d.getUTCDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function pickChapterDeterministic(userId, dateKey, salt) {
  const seed = `${userId || 'anonymous'}:${dateKey || ''}${salt ? ':' + salt : ''}`
  const hash = crypto.createHash('sha256').update(seed).digest('hex')
  const slice = hash.slice(0, 8)
  const n = parseInt(slice, 16)
  return KNOWLEDGE_CHAPTERS[n % KNOWLEDGE_CHAPTERS.length]
}

function buildDivinationPrompt(chapter, content, modern) {
  return {
    messages: [
      {
        role: 'system',
        content: '你是道家智慧的现代导师。基于《道德经》指定章节的原文,为用户生成"今日提点"与"今日行动建议",输出**严格的 JSON**。'
      },
      {
        role: 'user',
        content: `今日为我抽到的是《道德经》第 ${chapter} 章:\n\n原文:${content}\n现代解读参考:${modern}\n\n请按要求生成 JSON。`
      }
    ]
  }
}

function parseDivinationContent(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return { insight: '', action: '' }
  }
  
  const trimmed = rawText.trim()
  const candidates = [trimmed]
  
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]+?)\s*```/i)
  if (fenced) candidates.push(fenced[1].trim())
  
  const objMatch = trimmed.match(/\{[\s\S]*\}/)
  if (objMatch) candidates.push(objMatch[0])

  for (const c of candidates) {
    try {
      const obj = JSON.parse(c)
      if (obj.insight && obj.action) {
        return { insight: obj.insight, action: obj.action }
      }
    } catch {}
  }
  
  return { insight: '', action: '' }
}
```

**leads-utils.js - B 端线索校验**

```javascript
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^[+0-9\-\s()]{6,30}$/
const TEAM_SIZE_OPTIONS = ['1-10', '11-50', '51-200', '200+']
const INTENT_OPTIONS = ['team', 'enterprise', 'consulting', 'other']

function validateLeadInput(input) {
  const errors = []
  const safe = input && typeof input === 'object' ? input : {}

  if (!safe.name?.trim()) {
    errors.push('name is required')
  } else if (safe.name.length > 100) {
    errors.push('name too long')
  }

  if (!safe.email?.trim()) {
    errors.push('email is required')
  } else if (!EMAIL_REGEX.test(safe.email)) {
    errors.push('email format invalid')
  }

  if (safe.phone && !PHONE_REGEX.test(safe.phone)) {
    errors.push('phone format invalid')
  }

  if (safe.teamSize && !TEAM_SIZE_OPTIONS.includes(safe.teamSize)) {
    errors.push('teamSize invalid')
  }

  if (safe.intent && !INTENT_OPTIONS.includes(safe.intent)) {
    errors.push('intent invalid')
  }

  return { valid: errors.length === 0, errors }
}

function normalizeLeadInput(input) {
  const safe = input && typeof input === 'object' ? input : {}
  return {
    name: String(safe.name || '').trim().slice(0, 100),
    email: String(safe.email || '').trim().toLowerCase().slice(0, 200),
    company: safe.company?.trim() || null,
    phone: safe.phone?.trim() || null,
    teamSize: safe.teamSize || null,
    intent: safe.intent || 'enterprise',
    note: safe.note?.slice(0, 1000) || null
  }
}
```

#### 环境变量配置

```env
# ==================== 数据库 ====================
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=daodejing

# ==================== JWT ====================
JWT_SECRET=your_jwt_secret_key_here

# ==================== AI Keys（任一即可）====================
DEEPSEEK_API_KEY=sk-xxx
OPENROUTER_API_KEY=sk-or-xxx
OPENAI_API_KEY=sk-xxx

# ==================== TTS（可选）====================
ELEVENLABS_API_KEY=xxx
MINIMAX_API_KEY=xxx

# ==================== 图片生成（可选）====================
IMAGE_BACKEND=openai
OPENAI_API_KEY=sk-xxx

# ==================== 服务器 ====================
PORT=8000
NODE_ENV=development
```

#### SSE 流式工具

```javascript
// lib/sse-utils.js
function splitSSEBuffer(prevBuffer, incomingText) {
  const combined = (prevBuffer || '') + (incomingText || '')
  const parts = combined.split('\n\n')
  const remainingBuffer = parts.pop()
  return {
    events: parts.filter(p => p.length > 0),
    remainingBuffer: remainingBuffer || ''
  }
}
```

#### RAG 检索实现

```typescript
// services/ragService.ts
const searchEngine = new Fuse(knowledgeBase, {
  threshold: 0.3,
  distance: 100,
  keys: [
    { name: 'content', weight: 0.5 },
    { name: 'keywords', weight: 0.3 },
    { name: 'annotations.modern', weight: 0.2 }
  ]
})

// TF-IDF 重排
function rerankWithTfIdf(query: string, candidates: KnowledgeItem[]) {
  const queryTokens = tokenize(query)
  return candidates
    .map(doc => ({
      ...doc,
      score: cosineSimilarity(queryTokens, tokenize(buildDoc(doc))) * getStrategyWeight(doc.strategy)
    }))
    .sort((a, b) => b.score - a.score)
}
```

### 4.3 AI 技术

#### Multi-Agent 议事

```javascript
// lib/council-utils.js
const COUNCIL_PERSONAS = [
  {
    id: 'scholar',
    name: '现代学者',
    temperature: 0.5,
    system: '你是一位严谨的道家文化学者...'
  },
  {
    id: 'hermit',
    name: '道家隐士',
    temperature: 0.9,
    system: '你是云游山林的道家隐士...'
  },
  {
    id: 'healer',
    name: '心理疗愈师',
    temperature: 0.7,
    system: '你是擅长以道家智慧抚慰现代人的心理疗愈师...'
  }
]

// 辩论模式
function buildDebatePeerPrompt(persona, question, peerResponses) {
  const peerBlock = peerResponses
    .map(p => `【${p.personaName}】${p.content}`)
    .join('\n\n')
  
  return {
    messages: [
      { role: 'system', content: `${persona.system}\n\n现在进入第二轮...` },
      { role: 'user', content: `本轮的问题是：${question}\n\n其他两位的回答：\n${peerBlock}` }
    ]
  }
}
```

#### 道之签算法

```javascript
// lib/divination-utils.js
function pickChapterDeterministic(userId, dateKey, salt) {
  const seed = `${userId || 'anonymous'}:${dateKey || ''}${salt ? ':' + salt : ''}`
  const hash = crypto.createHash('sha256').update(seed).digest('hex')
  const slice = hash.slice(0, 8)
  const n = parseInt(slice, 16)
  return KNOWLEDGE_CHAPTERS[n % KNOWLEDGE_CHAPTERS.length]
}
```

### 4.4 Web API 技术

#### Web Speech API

```typescript
// utils/speechRecognition.ts
export class SpeechRecognizer {
  start(): boolean {
    const rec = new (window.SpeechRecognition || window.webkitSpeechRecognition)()
    rec.lang = 'zh-CN'
    rec.continuous = false
    rec.interimResults = true
    
    rec.onresult = (event) => {
      for (let i = event.resultIndex; i < results.length; i++) {
        const r = results[i]
        if (r.isFinal) {
          this.options.onResult?.({ transcript: r[0].transcript, isFinal: true })
        }
      }
    }
  }
}
```

#### SpeechSynthesis TTS

```typescript
// TTS 合成
function synthesize(text: string, config: VoiceConfig) {
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.voice = getVoiceById(config.voice)
  utterance.rate = config.speed
  utterance.pitch = config.pitch
  speechSynthesis.speak(utterance)
}
```

### 4.5 测试技术

#### Playwright E2E

```typescript
// tests/e2e/smoke.spec.ts
test('首页加载正常', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toContainText('道德经')
  await expect(page.locator('[data-testid="dao-sign"]')).toBeVisible()
})

test('AI 流式对话', async ({ page }) => {
  await page.goto('/ai-interpretation')
  await page.fill('textarea', '什么是道？')
  await page.click('button[type="submit"]')
  await expect(page.locator('.message-ai')).toBeVisible({ timeout: 10000 })
})
```

#### Node 单元测试

```javascript
// tests/council-utils.test.js
import { describe, it } from 'node:test'
import assert from 'node:assert'
import { validateQuestion, aggregateCouncilResults } from '../lib/council-utils.js'

describe('council-utils', () => {
  it('validateQuestion 应拒绝空字符串', () => {
    const result = validateQuestion('')
    assert.strictEqual(result.ok, false)
    assert.strictEqual(result.code, 'empty')
  })
  
  it('aggregateCouncilResults 应正确统计', () => {
    const results = [
      { tokens: 100 },
      { error: 'failed' },
      { tokens: 200 }
    ]
    const agg = aggregateCouncilResults(results)
    assert.strictEqual(agg.succeededCount, 2)
    assert.strictEqual(agg.failedCount, 1)
    assert.strictEqual(agg.totalTokens, 300)
  })
})
```

### 4.6 CI/CD 技术

#### GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm --prefix backend install
      - run: npm run backend:test
      - run: npm run backend:test:coverage
  
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm --prefix vue-project install
      - run: npm run frontend:lint:check
      - run: npm run frontend:type-check
      - run: npm run frontend:build
  
  frontend-e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm --prefix vue-project install
      - run: npx playwright install
      - run: npm run frontend:e2e
```

### 4.7 PWA 技术

```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.example\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 }
            }
          }
        ]
      }
    })
  ]
})
```

---

## 五、项目相关的图片/照片

### 5.1 项目截图

> 📸 **截图指南**：请参阅 [`images/README.md`](./images/README.md) 获取详细的截图步骤和规范。

以下截图需要您手动截取并保存到 `images/` 目录：

| 截图文件名 | 对应页面 | 截取重点 |
|------------|----------|----------|
| `home-daosign.png` | 首页 | 今日道签卡片 |
| `home-overview.png` | 首页 | 功能入口网格 |
| `ai-chat.png` | AI 解读 | 对话区域 |
| `ai-council.png` | AI 解读 | 三人议事模式 |
| `decision-helper.png` | 决策辅助 | SWOT 四象限 |
| `dao-art.png` | 道境画廊 | 创作界面 |
| `learning-path.png` | 学习路径 | 章节列表 |
| `picture-book.png` | 智慧绘本 | 阅读界面 |
| `tts.png` | 语音合成 | 合成界面 |
| `community.png` | 共创社区 | 帖子列表 |
| `business-plan.png` | 商业蓝图 | 数据展示 |

截取完成后，请在下方替换为实际图片引用：

> 详细页面截图请参见 **第三章 3.2节 核心功能页面详解**（第282-383行）

#### 页面布局说明

| 页面 | 布局特点 | 主要元素 |
|------|----------|----------|
| 首页 | 全屏 Hero + 功能入口网格 | 太极标记、道之签卡片、学习进度 |
| AI 解读 | 左侧对话列表 + 右侧对话区域 | 对话气泡、场景共鸣卡、工具栏 |
| 三人议事 | 三栏卡片同屏展示 | 三种人格对比、并行/辩论模式 |
| 决策辅助 | 左侧 SWOT 四象限 + 右侧 AI 解读 | 阴阳天地四象限、经文匹配 |
| 道境画廊 | 左侧创作区 + 右侧画廊展示 | 7种风格选择、瀑布流布局 |
| 学习路径 | 左侧章节列表 + 右侧内容区 | 23章列表、进度条 |
| 资源库 | 分类展示 | 经典原文、注释、书籍、多媒体 |
| 智慧绘本 | 卡片选择 + 阅读界面 | 年龄分级、翻页动画、TTS朗读 |
| 语音合成 | 控制面板 + 播放区域 | 三种模式、语音配置、下载 |
| 个人中心 | 信息卡片 + 统计面板 | 基本信息、学习统计、修行账单 |
| 商业蓝图 | 长卷滚动展示 | 7章节、关键数据、竞品对比 |

### 5.2 设计规范图

#### 色彩规范

```
┌─────────────────────────────────────────────────────┐
│  ink-50    ink-100   ink-300   ink-700   ink-900    │
│  #FDFBF7   #F8F5EE   #E0DDD6   #3D3D3D   #1A1A1A    │
│  骨白      次级背景   分割线     正文      标题       │
└─────────────────────────────────────────────────────┘
                    cinnabar
                    #C44A2B
                    朱砂强调
```

#### 字体规范

```
标题：LXGW WenKai（霞鹜文楷）
正文：Microsoft YaHei（微软雅黑）
数据：Consolas
```

### 5.3 架构图

#### 前端架构

```
Vue 3 + Vite
├── views/           16 个页面组件
├── services/        服务封装
│   ├── aiService.ts
│   ├── ragService.ts
│   ├── communityService.ts
│   └── valueReportService.ts
├── stores/          Pinia 状态管理
│   ├── chat.ts
│   └── auth.ts
└── utils/           工具函数
    └── speechRecognition.ts
```

#### 后端架构

```
Express + MySQL
├── app.js           主应用 + 路由
├── lib/             纯函数库
│   ├── sse-utils.js
│   ├── council-utils.js
│   ├── divination-utils.js
│   ├── value-report-utils.js
│   └── leads-utils.js
└── tests/           单元测试
```

#### AI 流式架构

```
浏览器 POST /api/ai/chat/stream
   └─ Express 路由（SSE 头 + 心跳）
       └─ resolveAIProvider()
           ├─ DeepSeek
           ├─ OpenRouter
           └─ OpenAI
       └─ stream:true → 逐 chunk 转发
       └─ 客户端断开 → abort()
```

### 5.4 功能模块图

```
道德经 AI 平台 2.0
│
├── 【AI 对话系统】
│   ├── SSE 流式对话
│   ├── RAG 检索增强
│   ├── 多人格 AI
│   └── 三人议事（并行 + 辩论）
│
├── 【道家智慧应用】
│   ├── 道家决策辅助（SWOT）
│   ├── 道之签（每日卦签）
│   └── 场景共鸣卡（12 张）
│
├── 【数字文创】
│   ├── 道境数字画廊
│   └── 共创社区
│
├── 【学习成长】
│   ├── 学习路径（23 章）
│   ├── 资源库
│   └── 学习统计
│
├── 【语音多媒体】
│   ├── TTS 语音合成
│   └── 语音输入识别
│
├── 【儿童教育】
│   └── 智慧绘本
│
├── 【用户商业】
│   ├── 用户认证
│   ├── 价值仪表盘
│   ├── 五档定价
│   └── 企业订阅
│
└── 【技术基建】
    ├── PWA 离线支持
    ├── CI/CD 自动化
    └── 测试覆盖
```

---

## 附录

### A. API 接口清单

| 方法 | 路径 | 功能 |
|------|------|------|
| POST | `/api/ai/chat/stream` | AI 流式对话 |
| POST | `/api/ai/council` | 三人议事 |
| POST | `/api/ai/divination` | 道之签 |
| GET | `/api/user/value-report` | 价值报告 |
| POST | `/api/leads` | B 端线索 |
| GET | `/api/community/posts` | 社区帖子 |
| POST | `/api/community/posts` | 创建帖子 |
| POST | `/api/tts/synthesize` | TTS 合成 |

### B. 环境变量

```env
# MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=daodejing

# JWT
JWT_SECRET=your_jwt_secret

# AI Keys（任一即可）
DEEPSEEK_API_KEY=your_deepseek_key
OPENROUTER_API_KEY=your_openrouter_key
OPENAI_API_KEY=your_openai_key

# TTS（可选）
ELEVENLABS_API_KEY=your_elevenlabs_key
```

### C. 测试命令

```bash
# 后端单元测试
npm run backend:test
npm run backend:test:coverage

# 前端 E2E 测试
npm run frontend:e2e
npm run frontend:e2e:stream
npm run frontend:e2e:council
npm run frontend:e2e:integration
npm run frontend:e2e:enterprise
npm run frontend:e2e:business-plan

# 类型检查
npm run frontend:type-check
```

---

**项目地址**：https://github.com/Limingxi-77/daodejing-2.0

**技术栈**：Vue 3 + Express + MySQL + DeepSeek/OpenRouter/OpenAI

**赛道**：传智杯 AI Web 开发赛道

# 道德经平台 2.0 项目分工与优化战略手册

> **版本**: 1.0  
> **日期**: 2026-02-11  
> **适用对象**: 3人开发小组  
> **目标**: 将“演示版”转化为具备商业化潜力的“实战版”

---

## 1. 现状分析

目前的《道德经平台 2.0》在前端视觉（水墨特效、禅模式）和交互逻辑（路由、组件）上已经非常成熟。但作为一款商业级应用，目前存在两个核心短板：
1.  **数据层**：依赖 `LocalStorage`，数据无法跨设备同步，易丢失。
2.  **AI 层**：依赖 Mock 数据和简单规则，缺乏真实的语义理解和生成能力。

---

## 2. 分工方案建议

### 方案一：技术栈水平分层（强烈推荐 🌟）
**适用场景**：团队成员技能点互补，希望通过“专人专事”实现效率最大化。

#### 👤 成员 A：前端交互与视觉专家 (Frontend & UX Lead)
*   **核心职责**：负责“面子”，打造极致的视觉体验和多端适配。
*   **关键任务**：
    1.  **移动端深度适配**：优化 `KnowledgeGraph`（知识图谱）和 `Three.js` 水墨背景在手机端的性能与触摸交互。
    2.  **视觉动效精修**：重构“每日一签”抽签动画、“境界升级”粒子特效，增加微交互（Haptic Feedback）。
    3.  **组件库维护**：建立统一的 UI Kit，确保全站（禅模式/古籍模式）风格严格一致。
*   **交付物**：Lighthouse 评分 90+ 的高性能 UI，PWA 离线包。

#### 👤 成员 B：后端架构与数据专家 (Backend & Data Lead)
*   **核心职责**：负责“里子”，构建稳健的数据基础设施。
*   **关键任务**：
    1.  **去 LocalStorage 化**：接入 **Supabase** 或 **MySQL**，设计 `User`、`Cultivation`、`Post` 等核心数据表。
    2.  **用户中心**：实现 JWT 身份验证，打通手机号/微信登录，实现数据云端同步。
    3.  **支付与订单**：对接沙箱支付接口（Alipay/Stripe），实现“布衣/居士/宗师”会员状态的真实流转。
*   **交付物**：API 接口文档（Swagger/Apifox），稳定的数据库实例。

#### 👤 成员 C：AI 智能体与内容策划 (AI Engineer & Content Lead)
*   **核心职责**：负责“灵魂”，赋予应用真实的智能与深度。
*   **关键任务**：
    1.  **RAG 2.0 实装**：搭建向量数据库（Coze/LangChain），将《道德经》八十一章及历代注疏向量化，实现真·语义搜索。
    2.  **Prompt 工程**：精调“隐士”、“学者”、“疗愈师”的 System Prompt，确保人格化回复的稳定性。
    3.  **内容资产生产**：利用 AI 生成 6 门“道商”课程的完整脚本，并合成高质量 TTS 语音包。
*   **交付物**：高准确率的 AI 问答接口，课程内容库。

---

### 方案二：业务模块垂直切分
**适用场景**：团队成员均具备全栈能力，希望锻炼独立负责业务闭环的能力。

#### 👤 成员 A：核心修仙系统
*   **模块**：`AI 解读`、`学习路径`、`知识图谱`、`境界系统`。
*   **目标**：负责用户的“学”与“练”。确保学习进度实时上云，优化 D3.js 图谱渲染。

#### 👤 成员 B：商业化与社区
*   **模块**：`道商修练`、`共创社区`、`会员体系`、`资源库`。
*   **目标**：负责用户的“留”与“买”。打通支付链路，完善社区互动（点赞/评论/举报）。

#### 👤 成员 C：创新场景应用
*   **模块**：`决策占卜`、`亲子绘本`、`数字文创`、`每日一签`。
*   **目标**：负责用户的“玩”与“传”。优化占卜算法，提升 AI 绘图质量，打造引流爆款。

---

## 3. 团队协作规范 (SOP)

为了避免多人开发导致的代码冲突和混乱，请严格遵守以下规范：

1.  **Git 分支管理策略**：
    *   严禁直接推送到 `main` 分支。
    *   **Feature 分支**：每人基于 `main` 创建自己的开发分支，命名格式：`feature/name-module`（如 `feature/alex-ui-fix`）。
    *   **Pull Request**：每天结束工作前，提交 PR 并请求队友 Code Review，确认无误后合并。

2.  **接口契约优先 (API First)**：
    *   后端（成员 B）在开发前必须先出具 API 定义（URL、参数、返回值）。
    *   前端可先根据契约 Mock 数据开发，后端完成后无缝切换。

3.  **环境隔离 (.env)**：
    *   所有敏感密钥（OpenAI Key, Supabase Key, DB Password）必须存放在 `.env` 文件中。
    *   **禁止**将 `.env` 提交到 Git 仓库，请提交 `.env.example` 作为模板。

---

## 4. GitHub 团队协作完整流程

### 4.1 初始设置（仅需一次）

#### 第一步：创建 GitHub 仓库
1.  **团队负责人**登录 GitHub，创建新的仓库
2.  仓库设置：
    *   仓库名称：`daodejing-2.0`
    *   设为 **Public** 或 **Private**（根据需求）
    *   初始化时添加 `.gitignore`（选择 Node/Vue）
    *   选择 `MIT` 或其他开源许可证

#### 第二步：邀请团队成员
1.  在仓库页面点击 **Settings** → **Collaborators**
2.  点击 **Add people**，输入队友的 GitHub 用户名或邮箱
3.  队友接受邀请后，获得仓库的读写权限

#### 第三步：克隆仓库到本地
```bash
# 每位团队成员执行
git clone https://github.com/你的用户名/daodejing-2.0.git
cd daodejing-2.0
```

---

### 4.2 日常开发工作流

#### 工作流程总览
```
main 分支 (稳定版)
    ↓
创建 feature 分支
    ↓
开发 & 提交
    ↓
推送分支到 GitHub
    ↓
创建 Pull Request (PR)
    ↓
Code Review & 讨论
    ↓
合并到 main
    ↓
删除 feature 分支
```

#### 详细步骤说明

**📝 第一步：同步最新代码（每次开始开发前）**
```bash
# 切换到 main 分支
git checkout main

# 拉取最新代码
git pull origin main
```

**🌿 第二步：创建新的功能分支**
```bash
# 基于 main 创建新分支，命名规范：feature/姓名-功能名
git checkout -b feature/zhang-san-login-page

# 查看当前分支（确认）
git branch
```

**💻 第三步：开发并提交代码**
```bash
# 查看修改的文件
git status

# 添加修改的文件
git add .
# 或指定文件
git add src/components/Login.vue

# 提交代码（Commit Message 规范）
git commit -m "feat: 添加用户登录页面"
```

**Commit Message 规范：**
*   `feat:` 新功能（feature）
*   `fix:` 修复 bug
*   `docs:` 文档更新
*   `style:` 代码格式调整（不影响代码运行）
*   `refactor:` 重构（既不是新增功能，也不是修改 bug）
*   `test:` 测试相关
*   `chore:` 构建过程或辅助工具的变动

**☁️ 第四步：推送分支到 GitHub**
```bash
# 推送分支到远程仓库
git push origin feature/zhang-san-login-page
```

**🔀 第五步：创建 Pull Request (PR)**
1.  打开 GitHub 仓库页面
2.  会看到 **Compare & pull request** 按钮，点击它
3.  填写 PR 信息：
    *   **Title**: 简洁描述（如 "feat: 添加用户登录页面"）
    *   **Description**: 详细说明做了什么、为什么这么做、如何测试
    *   **Reviewers**: 选择至少一位队友进行代码审查
    *   **Assignees**: 可以指派给自己或负责人
    *   **Labels**: 添加标签（如 `enhancement`, `bug`）
4.  点击 **Create pull request**

**👀 第六步：Code Review（代码审查）**
1.  **审查者**收到通知后，查看 PR
2.  在 **Files changed** 标签页查看代码变更
3.  可以在具体代码行添加评论，提出修改建议
4.  如果没问题，点击 **Review changes** → **Approve**
5.  如果需要修改，点击 **Request changes**

**✏️ 第七步：根据反馈修改代码（如需要）**
```bash
# 在本地的 feature 分支上继续修改
# 修改后提交
git add .
git commit -m "fix: 根据 PR 反馈调整登录表单验证"
git push origin feature/zhang-san-login-page
```
*新的提交会自动添加到 PR 中*

**✅ 第八步：合并 PR 到 main**
1.  当 PR 获得至少一个 Approval 后，可以合并
2.  点击 **Merge pull request**
3.  选择 **Squash and merge**（将多个提交合并为一个，保持历史整洁）
4.  点击 **Confirm squash and merge**
5.  合并成功后，点击 **Delete branch** 删除远程 feature 分支

**🧹 第九步：本地清理**
```bash
# 切换回 main 分支
git checkout main

# 拉取最新的合并代码
git pull origin main

# 删除本地 feature 分支
git branch -d feature/zhang-san-login-page
```

---

### 4.3 常见问题处理

#### 问题 1：代码冲突（Merge Conflict）
**场景**：多人同时修改了同一文件的同一部分

**解决方法：**
```bash
# 1. 先确保在你的 feature 分支上
git checkout feature/your-branch

# 2. 拉取最新的 main 分支
git fetch origin main

# 3. 将 main 分支合并到你的 feature 分支
git merge origin/main

# 4. 此时 Git 会提示冲突，打开冲突文件
# 5. 手动编辑文件，保留需要的代码，删除冲突标记 <<<<<<<, =======, >>>>>>>
# 6. 标记冲突已解决
git add .

# 7. 完成合并
git commit -m "fix: 解决合并冲突"

# 8. 推送
git push origin feature/your-branch
```

#### 问题 2：提交了错误的代码，想撤销
```bash
# 场景 1：还没有 push，想撤销最后一次 commit（保留代码）
git reset --soft HEAD~1

# 场景 2：还没有 push，想彻底撤销最后一次 commit（不保留代码）
git reset --hard HEAD~1

# 场景 3：已经 push 了，创建一个新的 commit 来撤销
git revert HEAD
git push origin feature/your-branch
```

#### 问题 3：想查看历史记录
```bash
# 查看提交历史
git log

# 查看简洁的提交历史
git log --oneline --graph

# 查看某个人的提交
git log --author="张三"

# 查看某个文件的变更历史
git log --follow src/components/Login.vue
```

---

### 4.4 GitHub 协作最佳实践

1.  **小步提交**：每次 commit 只做一件事，便于回滚和审查
2.  **频繁推送**：每天至少 push 一次，避免代码丢失
3.  **及时合并**：PR 完成后尽快合并，避免长期 divergence
4.  **写好注释**：Commit Message 和 PR Description 要清晰
5.  **尊重审查**：认真对待 Code Review 的反馈，有不同意见时友好讨论
6.  **保护 main 分支**：在仓库 Settings → Branches 中设置 Branch protection rules：
    *   Require pull request reviews before merging
    *   Require status checks to pass before merging
    *   Do not allow bypassing the above settings

---

## 5. 推荐实施路径

**第一周：基础设施搭建**
*   B 搭建数据库与 API 框架。
*   A 优化现有 UI 细节与移动端适配。
*   C 跑通真实 LLM 接口与向量库。

**第二周：核心功能联调**
*   实现真实登录与数据同步。
*   替换 AI 对话接口为真实调用。

**第三周：商业化与完善**
*   接入支付流程。
*   补充课程内容与文创资源。
*   全站集成测试。

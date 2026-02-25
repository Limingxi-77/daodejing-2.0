# Git 分支管理策略

## 📋 分支策略概述

本项目采用**功能分支工作流**，确保代码管理的规范性和可维护性。

## 🌿 分支结构

### 主要分支
- **main** - 主分支，用于生产环境部署
- **develop** - 开发分支，集成所有功能开发

### 功能分支（前缀：feature/）
- `feature/ai-interpretation-optimization` - AI解读模块优化
- `feature/learning-path-enhancement` - 学习路径功能增强
- `feature/knowledge-graph-upgrade` - 知识图谱升级
- `feature/cultivation-system-improvement` - 境界系统改进

### 修复分支（前缀：bugfix/）
- `bugfix/ui-responsive-issues` - UI响应式问题修复
- `bugfix/api-integration-fixes` - API集成问题修复

### 发布分支（前缀：release/）
- `release/v1.0.0` - 版本发布分支

## 🚀 分支管理流程

### 1. 功能开发流程
```bash
# 1. 从develop分支创建功能分支
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name

# 2. 开发功能并提交
git add .
git commit -m "feat: 功能描述"

# 3. 推送到远程
git push origin feature/your-feature-name

# 4. 创建Pull Request到develop分支
```

### 2. 代码审查流程
- 所有功能分支必须通过Pull Request合并
- 至少需要1名团队成员审查
- 通过自动化测试和代码质量检查

### 3. 发布流程
```bash
# 1. 从develop分支创建发布分支
git checkout develop
git checkout -b release/v1.0.0

# 2. 版本号更新和最终测试
# 3. 合并到main分支
git checkout main
git merge release/v1.0.0

# 4. 打标签
git tag -a v1.0.0 -m "版本1.0.0发布"
git push origin v1.0.0

# 5. 合并回develop分支
git checkout develop
git merge release/v1.0.0
```

## 📝 提交信息规范

### 提交类型
- `feat` - 新功能
- `fix` - 问题修复
- `docs` - 文档更新
- `style` - 代码格式调整
- `refactor` - 代码重构
- `test` - 测试相关
- `chore` - 构建过程或辅助工具变动

### 提交格式
```bash
git commit -m "类型(范围): 描述"

# 示例
git commit -m "feat(ai-interpretation): 实现真实AI服务集成"
git commit -m "fix(ui): 修复响应式布局问题"
git commit -m "docs(readme): 更新项目启动说明"
```

## 🔧 当前分支状态

### 已创建的分支
- ✅ `feature/ai-interpretation-optimization` - AI解读模块企业级优化

### 待创建的分支
- ⏳ `feature/learning-path-enhancement` - 学习路径功能增强
- ⏳ `feature/knowledge-graph-upgrade` - 知识图谱升级
- ⏳ `feature/cultivation-system-improvement` - 境界系统改进

## 📊 分支保护规则

### main分支保护
- 禁止直接推送
- 必须通过Pull Request合并
- 需要代码审查
- 必须通过自动化测试

### develop分支保护
- 禁止直接推送
- 必须通过功能分支合并
- 需要代码审查

## 🛠️ 常用命令

### 分支操作
```bash
# 查看所有分支
git branch -a

# 切换分支
git checkout branch-name

# 创建并切换分支
git checkout -b feature/new-feature

# 删除本地分支
git branch -d branch-name

# 删除远程分支
git push origin --delete branch-name
```

### 合并操作
```bash
# 合并分支
git merge feature/branch-name

# 变基合并
git rebase develop

# 解决冲突后继续
git rebase --continue
```

## 🎯 最佳实践

### 1. 分支命名规范
- 使用小写字母和连字符
- 明确描述功能或修复内容
- 遵循前缀规范（feature/, bugfix/, release/）

### 2. 提交频率
- 频繁提交，每次提交解决一个具体问题
- 提交信息清晰明确
- 避免大而全的提交

### 3. 分支生命周期
- 功能分支在合并后及时删除
- 发布分支在版本发布后删除
- 保持分支列表的整洁

### 4. 代码审查
- 认真审查同事的代码
- 提供建设性反馈
- 确保代码质量和一致性

## 📈 分支管理工具推荐

### Git图形化工具
- **GitKraken** - 强大的跨平台Git客户端
- **SourceTree** - Atlassian出品的免费Git工具
- **GitHub Desktop** - GitHub官方桌面客户端

### IDE集成
- **VS Code GitLens** - 增强的Git功能
- **WebStorm** - 内置强大的Git支持

## 🔄 工作流示例

### 日常开发流程
```bash
# 开始新功能开发
git checkout develop
git pull origin develop
git checkout -b feature/user-authentication

# 开发功能并提交
git add .
git commit -m "feat(auth): 实现用户登录功能"
git push origin feature/user-authentication

# 创建Pull Request进行代码审查
# 审查通过后合并到develop分支
```

### 紧急修复流程
```bash
# 从main分支创建修复分支
git checkout main
git checkout -b hotfix/critical-bug

# 修复问题并提交
git add .
git commit -m "fix: 紧急修复关键问题"
git push origin hotfix/critical-bug

# 创建Pull Request快速审查合并
# 同时合并回develop分支
```

---

**最后更新：2026-02-25**
**维护者：开发团队**
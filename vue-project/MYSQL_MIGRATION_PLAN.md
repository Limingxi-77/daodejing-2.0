# 道德经平台 - MySQL 数据库迁移计划

## 1. 迁移目标
将当前使用的 Supabase (PostgreSQL) 数据库迁移到 MySQL 数据库，保持功能完整性和数据一致性。

## 2. 数据库设计

### 2.1 数据库表结构

#### 2.1.1 用户表 (users)
| 字段名 | 数据类型 | 约束 | 描述 |
|-------|---------|------|------|
| id | VARCHAR(36) | PRIMARY KEY | 用户ID (UUID) |
| username | VARCHAR(50) | UNIQUE NOT NULL | 用户名 |
| email | VARCHAR(255) | UNIQUE NOT NULL | 邮箱 |
| password_hash | VARCHAR(255) | NOT NULL | 密码哈希 |
| display_name | VARCHAR(100) | | 显示名称 |
| avatar_url | TEXT | | 头像URL |
| subscription_tier | VARCHAR(20) | DEFAULT 'free' | 订阅等级 |
| subscription_expiry | DATETIME | | 订阅过期时间 |
| daily_usage_count | INT | DEFAULT 0 | 每日使用次数 |
| last_usage_date | DATE | DEFAULT CURRENT_DATE | 最后使用日期 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |
| last_login | DATETIME | | 最后登录时间 |
| is_active | BOOLEAN | DEFAULT TRUE | 是否活跃 |
| email_verified | BOOLEAN | DEFAULT FALSE | 邮箱是否验证 |

#### 2.1.2 学习进度表 (learning_progress)
| 字段名 | 数据类型 | 约束 | 描述 |
|-------|---------|------|------|
| id | VARCHAR(36) | PRIMARY KEY | 进度ID (UUID) |
| user_id | VARCHAR(36) | NOT NULL, FOREIGN KEY | 用户ID |
| course_id | VARCHAR(36) | NOT NULL, FOREIGN KEY | 课程ID |
| chapter_id | VARCHAR(36) | NOT NULL, FOREIGN KEY | 章节ID |
| progress_percentage | INT | DEFAULT 0 | 进度百分比 |
| completed | BOOLEAN | DEFAULT FALSE | 是否完成 |
| last_accessed | DATETIME | DEFAULT CURRENT_TIMESTAMP | 最后访问时间 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

#### 2.1.3 课程表 (courses)
| 字段名 | 数据类型 | 约束 | 描述 |
|-------|---------|------|------|
| id | VARCHAR(36) | PRIMARY KEY | 课程ID (UUID) |
| title | VARCHAR(255) | NOT NULL | 课程标题 |
| description | TEXT | | 课程描述 |
| level | VARCHAR(20) | DEFAULT 'beginner' | 难度等级 |
| duration | INT | | 课程时长 |
| total_chapters | INT | DEFAULT 0 | 总章节数 |
| thumbnail_url | TEXT | | 缩略图URL |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

#### 2.1.4 章节表 (chapters)
| 字段名 | 数据类型 | 约束 | 描述 |
|-------|---------|------|------|
| id | VARCHAR(36) | PRIMARY KEY | 章节ID (UUID) |
| course_id | VARCHAR(36) | NOT NULL, FOREIGN KEY | 课程ID |
| title | VARCHAR(255) | NOT NULL | 章节标题 |
| content | TEXT | | 章节内容 |
| order_number | INT | DEFAULT 0 | 章节顺序 |
| duration | INT | | 章节时长 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

## 3. 迁移步骤

### 3.1 环境准备
1. 安装 MySQL 数据库
2. 安装 MySQL 客户端库：`npm install mysql2`
3. 安装 ORM 库（可选）：`npm install sequelize`

### 3.2 数据库初始化
1. 创建数据库：`CREATE DATABASE daodejing_platform;`
2. 创建用户：`CREATE USER 'daodejing'@'localhost' IDENTIFIED BY 'password';`
3. 授权：`GRANT ALL PRIVILEGES ON daodejing_platform.* TO 'daodejing'@'localhost';`
4. 刷新权限：`FLUSH PRIVILEGES;`

### 3.3 表结构创建
执行以下 SQL 语句创建表结构：

```sql
-- 创建用户表
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  avatar_url TEXT,
  subscription_tier VARCHAR(20) DEFAULT 'free',
  subscription_expiry DATETIME,
  daily_usage_count INT DEFAULT 0,
  last_usage_date DATE DEFAULT CURRENT_DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login DATETIME,
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE
);

-- 创建课程表
CREATE TABLE courses (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  level VARCHAR(20) DEFAULT 'beginner',
  duration INT,
  total_chapters INT DEFAULT 0,
  thumbnail_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 创建章节表
CREATE TABLE chapters (
  id VARCHAR(36) PRIMARY KEY,
  course_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  order_number INT DEFAULT 0,
  duration INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- 创建学习进度表
CREATE TABLE learning_progress (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  course_id VARCHAR(36) NOT NULL,
  chapter_id VARCHAR(36) NOT NULL,
  progress_percentage INT DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
  UNIQUE KEY (user_id, course_id, chapter_id)
);
```

### 3.4 代码修改

#### 3.4.1 环境变量配置
修改 `.env` 文件：

```env
# MySQL 配置
VITE_MYSQL_HOST=localhost
VITE_MYSQL_PORT=3306
VITE_MYSQL_USER=daodejing
VITE_MYSQL_PASSWORD=password
VITE_MYSQL_DATABASE=daodejing_platform

# 应用配置
VITE_APP_URL=http://localhost:5173
VITE_NODE_ENV=development
```

#### 3.4.2 创建 MySQL 服务
创建 `src/services/mysqlService.ts`：

```typescript
import mysql from 'mysql2/promise'

// 从环境变量获取 MySQL 配置
const mysqlConfig = {
  host: import.meta.env.VITE_MYSQL_HOST || 'localhost',
  port: parseInt(import.meta.env.VITE_MYSQL_PORT || '3306'),
  user: import.meta.env.VITE_MYSQL_USER || 'daodejing',
  password: import.meta.env.VITE_MYSQL_PASSWORD || 'password',
  database: import.meta.env.VITE_MYSQL_DATABASE || 'daodejing_platform',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}

// 创建数据库连接池
const pool = mysql.createPool(mysqlConfig)

// 测试数据库连接
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection()
    console.log('MySQL 连接成功')
    connection.release()
    return true
  } catch (error) {
    console.error('MySQL 连接失败:', error)
    return false
  }
}

// 执行 SQL 查询
export const query = async (sql: string, params?: any[]) => {
  try {
    const [rows, fields] = await pool.execute(sql, params)
    return { data: rows, error: null }
  } catch (error) {
    console.error('SQL 查询失败:', error)
    return { data: null, error }
  }
}

// 认证服务
export const authService = {
  // 注册用户
  async register(username: string, email: string, passwordHash: string) {
    const sql = `
      INSERT INTO users (id, username, email, password_hash)
      VALUES (UUID(), ?, ?, ?)
    `
    return await query(sql, [username, email, passwordHash])
  },

  // 登录用户
  async login(email: string) {
    const sql = `
      SELECT * FROM users WHERE email = ?
    `
    return await query(sql, [email])
  },

  // 更新用户信息
  async updateUser(userId: string, data: any) {
    const fields = Object.keys(data).map(key => `${key} = ?`).join(', ')
    const values = Object.values(data)
    values.push(userId)
    
    const sql = `
      UPDATE users SET ${fields} WHERE id = ?
    `
    return await query(sql, values)
  }
}

// 学习进度服务
export const learningProgressService = {
  // 更新学习进度
  async updateProgress(userId: string, courseId: string, chapterId: string, progress: number) {
    // 检查是否已有进度记录
    const checkSql = `
      SELECT id FROM learning_progress
      WHERE user_id = ? AND course_id = ? AND chapter_id = ?
    `
    const { data: existingProgress } = await query(checkSql, [userId, courseId, chapterId])

    if (existingProgress && Array.isArray(existingProgress) && existingProgress.length > 0) {
      // 更新现有记录
      const updateSql = `
        UPDATE learning_progress
        SET progress_percentage = ?, completed = ?, last_accessed = NOW()
        WHERE id = ?
      `
      return await query(updateSql, [progress, progress >= 100, existingProgress[0].id])
    } else {
      // 创建新记录
      const insertSql = `
        INSERT INTO learning_progress (id, user_id, course_id, chapter_id, progress_percentage, completed)
        VALUES (UUID(), ?, ?, ?, ?, ?)
      `
      return await query(insertSql, [userId, courseId, chapterId, progress, progress >= 100])
    }
  },

  // 获取学习进度
  async getProgress(userId: string, courseId: string, chapterId: string) {
    const sql = `
      SELECT * FROM learning_progress
      WHERE user_id = ? AND course_id = ? AND chapter_id = ?
    `
    return await query(sql, [userId, courseId, chapterId])
  }
}

// 课程服务
export const courseService = {
  // 获取课程列表
  async getCourses() {
    const sql = `
      SELECT * FROM courses ORDER BY created_at DESC
    `
    return await query(sql)
  },

  // 获取课程详情
  async getCourse(courseId: string) {
    const sql = `
      SELECT * FROM courses WHERE id = ?
    `
    return await query(sql, [courseId])
  },

  // 获取章节列表
  async getChapters(courseId: string) {
    const sql = `
      SELECT * FROM chapters WHERE course_id = ? ORDER BY order_number
    `
    return await query(sql, [courseId])
  }
}

export default pool
```

#### 3.4.3 修改认证服务
修改 `src/stores/auth.ts`，替换 Supabase 认证为 MySQL 认证。

#### 3.4.4 修改数据迁移服务
修改 `src/services/dataMigrationService.ts`，使用 MySQL 服务。

#### 3.4.5 修改数据同步服务
修改 `src/services/dataSyncService.ts`，使用 MySQL 服务。

### 3.5 数据迁移
1. 从 Supabase 导出数据
2. 转换数据格式
3. 导入到 MySQL 数据库

### 3.6 测试验证
1. 测试用户注册登录功能
2. 测试学习进度跟踪功能
3. 测试课程管理功能
4. 测试数据同步功能

## 4. 技术栈调整

### 4.1 后端技术栈
- **数据库**: MySQL
- **ORM**: 可选 Sequelize
- **API**: 可选 Express.js 或 Fastify

### 4.2 前端技术栈
- **状态管理**: Pinia (保持不变)
- **路由**: Vue Router (保持不变)
- **样式**: Tailwind CSS (保持不变)
- **PWA**: Vite PWA (保持不变)

## 5. 优势与劣势分析

### 5.1 优势
- **性能**: MySQL 在某些场景下性能优于 PostgreSQL
- **生态**: MySQL 生态更成熟，工具更丰富
- **成本**: 自托管 MySQL 成本更低
- **兼容性**: 与更多系统和服务兼容

### 5.2 劣势
- **迁移成本**: 需要修改代码和数据结构
- **功能差异**: 某些 PostgreSQL 特有功能在 MySQL 中可能不同
- **学习曲线**: 团队需要熟悉 MySQL 的特性

## 6. 风险评估

### 6.1 潜在风险
- **数据丢失**: 迁移过程中可能出现数据丢失
- **功能异常**: 代码修改可能导致功能异常
- **性能问题**: MySQL 配置不当可能导致性能问题

### 6.2 风险缓解
- **数据备份**: 迁移前进行完整数据备份
- **测试验证**: 迁移后进行全面测试
- **渐进式迁移**: 分阶段进行迁移，确保每个阶段都正常

## 7. 时间估算

| 阶段 | 时间 | 任务 |
|------|------|------|
| 环境准备 | 1天 | 安装 MySQL 数据库和依赖 |
| 数据库设计 | 1天 | 设计 MySQL 表结构 |
| 代码修改 | 2-3天 | 修改前端代码，替换 Supabase 为 MySQL |
| 数据迁移 | 1天 | 导出、转换、导入数据 |
| 测试验证 | 2天 | 测试所有功能，确保正常运行 |
| 总计 | 7-8天 | 完成整个迁移过程 |

## 8. 结论

将数据库从 Supabase 迁移到 MySQL 是可行的，需要合理规划和执行。迁移后，系统将获得更灵活的数据库管理能力和更低的运行成本。建议按照本计划逐步实施，确保迁移过程顺利完成。
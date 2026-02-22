# 道德经平台 - 数据库连接指南

> **版本**: 1.0  
> **日期**: 2026-02-22  
> **适用对象**: 开发团队

---

## 概述

本文档提供多种数据库连接方案，包括：
1. **Supabase** - 最简单的 BaaS 方案（推荐）
2. **SQLite** - 本地开发快速方案
3. **MySQL** - 传统关系型数据库
4. **PostgreSQL** - 高级关系型数据库

---

## 方案一：Supabase（推荐 ⭐⭐⭐⭐⭐）

### 1.1 什么是 Supabase

Supabase 是一个开源的 Firebase 替代品，提供：
- PostgreSQL 数据库
- 实时订阅
- 认证系统
- 存储
- 自动生成的 API

### 1.2 快速开始

#### 第一步：注册 Supabase

1. 访问 [https://supabase.com](https://supabase.com)
2. 点击 "Start your project"
3. 使用 GitHub 账号登录

#### 第二步：创建新项目

1. 点击 "New Project"
2. 填写项目信息：
   - **Name**: `daodejing-2.0`
   - **Database Password**: 设置一个强密码（请保存好！）
   - **Region**: 选择离你最近的区域（如 `Singapore`）
3. 点击 "Create new project"
4. 等待 2-3 分钟，项目创建完成

#### 第三步：获取连接信息

项目创建完成后，进入 **Project Settings** → **API**：

复制以下信息：
- **Project URL**: `https://xxxx.supabase.co`
- **anon public**: `eyJhbGciOi...`（公开 API Key）
- **service_role**: `eyJhbGciOi...`（服务端密钥，保密！）

### 1.3 Python 后端集成

#### 安装依赖

```bash
cd "c:\Users\39937\Desktop\新建文件夹\daodejing-2.0\道德经平台\AI"
pip install supabase python-dotenv
```

#### 创建 .env 文件

在 `AI` 目录下创建 `.env` 文件：

```env
# Supabase 配置
SUPABASE_URL=https://你的项目ID.supabase.co
SUPABASE_KEY=你的anon_key
SUPABASE_SERVICE_KEY=你的service_role_key

# 数据库连接（可选，直接用 PostgreSQL）
DATABASE_URL=postgresql://postgres:密码@db.你的项目ID.supabase.co:5432/postgres
```

#### 修改 config.py

```python
"""
AI问答系统配置文件
"""
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# Supabase 配置
SUPABASE_URL = os.getenv('SUPABASE_URL', '')
SUPABASE_KEY = os.getenv('SUPABASE_KEY', '')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY', '')

# DeepSeek API配置
DEEPSEEK_API_KEY = os.getenv('DEEPSEEK_API_KEY', 'sk-a19b67ee4188411d90d773b1cb3d0e69')
DEEPSEEK_ENABLED = True

# 其他配置保持不变...
```

#### 修改 app.py - 添加数据库功能

在 `app.py` 开头添加：

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
import sys
import importlib.util
from supabase import create_client, Client

app = Flask(__name__)
CORS(app)

# 初始化 Supabase 客户端
def init_supabase():
    try:
        config = load_config()
        if config and hasattr(config, 'SUPABASE_URL') and hasattr(config, 'SUPABASE_KEY'):
            supabase: Client = create_client(config.SUPABASE_URL, config.SUPABASE_KEY)
            print("✅ Supabase 连接成功")
            return supabase
        return None
    except Exception as e:
        print(f"⚠️  Supabase 连接失败: {e}")
        return None

supabase_client = init_supabase()
```

### 1.4 创建数据库表

在 Supabase 控制台的 **SQL Editor** 中执行以下 SQL：

```sql
-- 创建用户表
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255),
    subscription_tier VARCHAR(20) DEFAULT 'free',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建学习进度表
CREATE TABLE learning_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    path_type VARCHAR(20) NOT NULL, -- beginner, intermediate, advanced
    lesson_id INTEGER NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, path_type, lesson_id)
);

-- 创建对话历史表
CREATE TABLE conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100),
    persona VARCHAR(20) DEFAULT 'scholar',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建对话消息表
CREATE TABLE messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(10) NOT NULL, -- user, ai
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 创建修炼记录表
CREATE TABLE cultivation (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    exp INTEGER DEFAULT 0,
    level VARCHAR(20) DEFAULT '凡人',
    total_lessons_completed INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    last_checkin_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建成就表
CREATE TABLE achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_id VARCHAR(50) NOT NULL,
    unlocked_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- 创建笔记表
CREATE TABLE notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    lesson_id INTEGER,
    content TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 启用行级安全策略 (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE cultivation ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- 创建索引以提高查询性能
CREATE INDEX idx_learning_progress_user ON learning_progress(user_id);
CREATE INDEX idx_conversations_user ON conversations(user_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_notes_user ON notes(user_id);
```

### 1.5 在后端中使用数据库

添加 API 端点到 `app.py`：

```python
# ========== 用户相关 API ==========

@app.route('/api/users', methods=['POST'])
def create_user():
    """创建新用户"""
    if not supabase_client:
        return jsonify({'error': '数据库未连接'}), 500
    
    data = request.get_json()
    try:
        result = supabase_client.table('users').insert({
            'username': data['username'],
            'email': data['email'],
            'password_hash': data['password_hash']  # 实际应该用 bcrypt 加密
        }).execute()
        return jsonify({'user': result.data[0]})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/users/<user_id>', methods=['GET'])
def get_user(user_id):
    """获取用户信息"""
    if not supabase_client:
        return jsonify({'error': '数据库未连接'}), 500
    
    try:
        result = supabase_client.table('users').select('*').eq('id', user_id).execute()
        if result.data:
            return jsonify({'user': result.data[0]})
        return jsonify({'error': '用户不存在'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# ========== 学习进度相关 API ==========

@app.route('/api/learning-progress/<user_id>', methods=['GET'])
def get_learning_progress(user_id):
    """获取用户学习进度"""
    if not supabase_client:
        return jsonify({'error': '数据库未连接'}), 500
    
    try:
        result = supabase_client.table('learning_progress').select('*').eq('user_id', user_id).execute()
        return jsonify({'progress': result.data})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/learning-progress', methods=['POST'])
def update_learning_progress():
    """更新学习进度"""
    if not supabase_client:
        return jsonify({'error': '数据库未连接'}), 500
    
    data = request.get_json()
    try:
        result = supabase_client.table('learning_progress').upsert({
            'user_id': data['user_id'],
            'path_type': data['path_type'],
            'lesson_id': data['lesson_id'],
            'completed': data.get('completed', True),
            'completed_at': 'now()' if data.get('completed') else None
        }).execute()
        return jsonify({'progress': result.data[0]})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# ========== 修炼系统相关 API ==========

@app.route('/api/cultivation/<user_id>', methods=['GET'])
def get_cultivation(user_id):
    """获取用户修炼状态"""
    if not supabase_client:
        return jsonify({'error': '数据库未连接'}), 500
    
    try:
        result = supabase_client.table('cultivation').select('*').eq('user_id', user_id).execute()
        if result.data:
            return jsonify({'cultivation': result.data[0]})
        # 如果不存在，创建新记录
        new_result = supabase_client.table('cultivation').insert({
            'user_id': user_id
        }).execute()
        return jsonify({'cultivation': new_result.data[0]})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/cultivation/<user_id>/exp', methods=['POST'])
def add_exp(user_id):
    """增加经验值"""
    if not supabase_client:
        return jsonify({'error': '数据库未连接'}), 500
    
    data = request.get_json()
    try:
        # 先获取当前 exp
        result = supabase_client.table('cultivation').select('exp').eq('user_id', user_id).execute()
        if not result.data:
            return jsonify({'error': '用户修炼记录不存在'}), 404
        
        current_exp = result.data[0]['exp']
        new_exp = current_exp + data['amount']
        
        # 更新
        update_result = supabase_client.table('cultivation').update({
            'exp': new_exp,
            'updated_at': 'now()'
        }).eq('user_id', user_id).execute()
        
        return jsonify({'cultivation': update_result.data[0]})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# ========== 对话相关 API ==========

@app.route('/api/conversations', methods=['POST'])
def create_conversation():
    """创建新对话"""
    if not supabase_client:
        return jsonify({'error': '数据库未连接'}), 500
    
    data = request.get_json()
    try:
        result = supabase_client.table('conversations').insert({
            'user_id': data['user_id'],
            'title': data.get('title', '新对话'),
            'persona': data.get('persona', 'scholar')
        }).execute()
        return jsonify({'conversation': result.data[0]})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/conversations/<user_id>', methods=['GET'])
def get_conversations(user_id):
    """获取用户对话列表"""
    if not supabase_client:
        return jsonify({'error': '数据库未连接'}), 500
    
    try:
        result = supabase_client.table('conversations').select('*').eq('user_id', user_id).order('updated_at', desc=True).execute()
        return jsonify({'conversations': result.data})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/messages/<conversation_id>', methods=['GET'])
def get_messages(conversation_id):
    """获取对话消息"""
    if not supabase_client:
        return jsonify({'error': '数据库未连接'}), 500
    
    try:
        result = supabase_client.table('messages').select('*').eq('conversation_id', conversation_id).order('created_at').execute()
        return jsonify({'messages': result.data})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/messages', methods=['POST'])
def add_message():
    """添加消息"""
    if not supabase_client:
        return jsonify({'error': '数据库未连接'}), 500
    
    data = request.get_json()
    try:
        result = supabase_client.table('messages').insert({
            'conversation_id': data['conversation_id'],
            'role': data['role'],
            'content': data['content']
        }).execute()
        
        # 更新对话的 updated_at
        supabase_client.table('conversations').update({
            'updated_at': 'now()'
        }).eq('id', data['conversation_id']).execute()
        
        return jsonify({'message': result.data[0]})
    except Exception as e:
        return jsonify({'error': str(e)}), 400
```

---

## 方案二：SQLite（本地开发 ⭐⭐⭐）

### 2.1 安装依赖

SQLite 是 Python 内置的，无需额外安装！

### 2.2 创建数据库

在 `AI` 目录下创建 `database.py`：

```python
import sqlite3
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), 'daodejing.db')

def get_db_connection():
    """获取数据库连接"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_database():
    """初始化数据库表"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 用户表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            avatar_url TEXT,
            subscription_tier TEXT DEFAULT 'free',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # 学习进度表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS learning_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            path_type TEXT NOT NULL,
            lesson_id INTEGER NOT NULL,
            completed INTEGER DEFAULT 0,
            completed_at TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, path_type, lesson_id)
        )
    ''')
    
    # 对话表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS conversations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            title TEXT,
            persona TEXT DEFAULT 'scholar',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # 消息表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            conversation_id INTEGER NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (conversation_id) REFERENCES conversations (id)
        )
    ''')
    
    # 修炼表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS cultivation (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT UNIQUE NOT NULL,
            exp INTEGER DEFAULT 0,
            level TEXT DEFAULT '凡人',
            total_lessons_completed INTEGER DEFAULT 0,
            streak_days INTEGER DEFAULT 0,
            last_checkin_date TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # 成就表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS achievements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            achievement_id TEXT NOT NULL,
            unlocked_at TEXT DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, achievement_id)
        )
    ''')
    
    # 笔记表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            lesson_id INTEGER,
            content TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()
    print("✅ SQLite 数据库初始化完成")

# 初始化数据库
if __name__ == '__main__':
    init_database()
```

### 2.3 在 app.py 中使用

```python
from database import get_db_connection, init_database

# 启动时初始化数据库
init_database()

# 示例：创建用户
@app.route('/api/users', methods=['POST'])
def create_user():
    data = request.get_json()
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO users (id, username, email, password_hash)
            VALUES (?, ?, ?, ?)
        ''', (
            str(uuid.uuid4()),
            data['username'],
            data['email'],
            data['password_hash']
        ))
        conn.commit()
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    finally:
        conn.close()
```

---

## 方案三：MySQL（传统数据库 ⭐⭐⭐）

### 3.1 安装 MySQL

1. 下载 MySQL：https://dev.mysql.com/downloads/mysql/
2. 安装并启动 MySQL 服务
3. 创建数据库：

```sql
CREATE DATABASE daodejing CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'daodejing'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON daodejing.* TO 'daodejing'@'localhost';
FLUSH PRIVILEGES;
```

### 3.2 安装依赖

```bash
pip install mysql-connector-python python-dotenv
```

### 3.3 配置连接

在 `.env` 中添加：

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=daodejing
MYSQL_USER=daodejing
MYSQL_PASSWORD=your_password
```

---

## 方案四：PostgreSQL（高级数据库 ⭐⭐⭐⭐）

### 4.1 安装 PostgreSQL

1. 下载 PostgreSQL：https://www.postgresql.org/download/
2. 安装并启动服务
3. 创建数据库

### 4.2 安装依赖

```bash
pip install psycopg2-binary python-dotenv
```

---

## 前端集成（Vue）

### 创建 API 客户端

在 `src/utils/api.ts` 中创建：

```typescript
const API_BASE_URL = 'http://localhost:8000/api'

// 通用请求函数
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// API 接口
export const api = {
  // 用户
  users: {
    create: (data: any) => request('/users', { method: 'POST', body: JSON.stringify(data) }),
    get: (userId: string) => request(`/users/${userId}`),
  },

  // 学习进度
  learningProgress: {
    get: (userId: string) => request(`/learning-progress/${userId}`),
    update: (data: any) => request('/learning-progress', { method: 'POST', body: JSON.stringify(data) }),
  },

  // 修炼
  cultivation: {
    get: (userId: string) => request(`/cultivation/${userId}`),
    addExp: (userId: string, amount: number) => 
      request(`/cultivation/${userId}/exp`, { 
        method: 'POST', 
        body: JSON.stringify({ amount }) 
      }),
  },

  // 对话
  conversations: {
    create: (data: any) => request('/conversations', { method: 'POST', body: JSON.stringify(data) }),
    list: (userId: string) => request(`/conversations/${userId}`),
  },

  messages: {
    list: (conversationId: string) => request(`/messages/${conversationId}`),
    add: (data: any) => request('/messages', { method: 'POST', body: JSON.stringify(data) }),
  },
}
```

### 在 Store 中使用

修改 `src/stores/cultivation.ts`：

```typescript
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { api } from '@/utils/api'

export const useCultivationStore = defineStore('cultivation', () => {
  const exp = ref(0)
  const userId = ref('') // 从 auth store 获取

  // 从数据库加载
  const loadFromDatabase = async () => {
    if (!userId.value) return
    try {
      const result = await api.cultivation.get(userId.value)
      exp.value = result.cultivation.exp
    } catch (error) {
      console.error('加载修炼数据失败:', error)
    }
  }

  // 保存到数据库
  const saveToDatabase = async () => {
    if (!userId.value) return
    try {
      await api.cultivation.addExp(userId.value, 0) // 更新
    } catch (error) {
      console.error('保存修炼数据失败:', error)
    }
  }

  return { exp, loadFromDatabase, saveToDatabase }
})
```

---

## 推荐实施步骤

### 第一阶段：本地开发
1. 使用 **SQLite** 快速搭建
2. 实现基本 CRUD 操作
3. 测试功能完整性

### 第二阶段：升级到 Supabase
1. 注册 Supabase 账号
2. 迁移数据结构
3. 更新后端代码
4. 测试实时功能

### 第三阶段：生产部署
1. 配置环境变量
2. 设置安全规则（RLS）
3. 性能优化和索引
4. 监控和备份

---

## 安全注意事项

1. **永远不要**将 `.env` 文件提交到 Git
2. 使用环境变量管理敏感信息
3. 密码必须使用 bcrypt 等哈希加密
4. 配置 Supabase RLS（行级安全）
5. 使用 HTTPS 传输数据

---

## 总结

| 方案 | 难度 | 成本 | 推荐度 | 适用场景 |
|------|------|------|--------|----------|
| Supabase | ⭐ | 免费/付费 | ⭐⭐⭐⭐⭐ | 快速上线，生产环境 |
| SQLite | ⭐ | 免费 | ⭐⭐⭐ | 本地开发，原型 |
| MySQL | ⭐⭐ | 免费/付费 | ⭐⭐⭐ | 传统项目 |
| PostgreSQL | ⭐⭐⭐ | 免费/付费 | ⭐⭐⭐⭐ | 高级功能需求 |

**建议：** 先用 SQLite 本地开发，稳定后迁移到 Supabase！

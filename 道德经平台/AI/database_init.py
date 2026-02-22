#!/usr/bin/env python3
"""
数据库初始化脚本
用于创建认证系统所需的数据库表
"""

import os
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def get_db_config():
    """获取数据库配置"""
    return {
        'host': os.getenv('DB_HOST', 'localhost'),
        'database': os.getenv('DB_NAME', 'daodejing'),
        'user': os.getenv('DB_USER', 'postgres'),
        'password': os.getenv('DB_PASSWORD', 'password'),
        'port': os.getenv('DB_PORT', '5432')
    }

def create_database():
    """创建数据库"""
    config = get_db_config()
    
    # 连接到默认数据库来创建目标数据库
    conn_config = config.copy()
    conn_config['database'] = 'postgres'
    
    try:
        conn = psycopg2.connect(**conn_config)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = conn.cursor()
        
        # 检查数据库是否存在
        cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (config['database'],))
        exists = cur.fetchone()
        
        if not exists:
            print(f"创建数据库: {config['database']}")
            cur.execute(f'CREATE DATABASE {config["database"]}')
            print("✅ 数据库创建成功")
        else:
            print(f"✅ 数据库 {config['database']} 已存在")
        
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ 创建数据库失败: {e}")
        return False
    
    return True

def create_tables():
    """创建数据表"""
    config = get_db_config()
    
    try:
        conn = psycopg2.connect(**config)
        cur = conn.cursor()
        
        # 启用UUID扩展
        cur.execute("CREATE EXTENSION IF NOT EXISTS "uuid-ossp";")
        
        # 创建用户表
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                display_name VARCHAR(100),
                avatar_url TEXT,
                subscription_tier VARCHAR(20) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'master')),
                subscription_expiry TIMESTAMP WITH TIME ZONE,
                daily_usage_count INTEGER DEFAULT 0,
                last_usage_date DATE DEFAULT CURRENT_DATE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                last_login TIMESTAMP WITH TIME ZONE,
                is_active BOOLEAN DEFAULT true,
                email_verified BOOLEAN DEFAULT false
            );
        """)
        
        # 创建会话表
        cur.execute("""
            CREATE TABLE IF NOT EXISTS user_sessions (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                token_hash VARCHAR(255) UNIQUE NOT NULL,
                expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                user_agent TEXT,
                ip_address INET
            );
        """)
        
        # 创建密码重置表
        cur.execute("""
            CREATE TABLE IF NOT EXISTS password_resets (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                token_hash VARCHAR(255) UNIQUE NOT NULL,
                expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
                used BOOLEAN DEFAULT false,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        """)
        
        # 创建索引
        cur.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);")
        
        # 创建更新时间的触发器函数
        cur.execute("""
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = NOW();
                RETURN NEW;
            END;
            $$ language 'plpgsql';
        """)
        
        # 为用户表创建触发器
        cur.execute("""
            DROP TRIGGER IF EXISTS update_users_updated_at ON users;
            CREATE TRIGGER update_users_updated_at 
                BEFORE UPDATE ON users 
                FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        """)
        
        conn.commit()
        cur.close()
        conn.close()
        
        print("✅ 数据表创建成功")
        print("✅ 索引创建成功")
        print("✅ 触发器创建成功")
        
    except Exception as e:
        print(f"❌ 创建数据表失败: {e}")
        return False
    
    return True

def create_sample_data():
    """创建示例数据"""
    config = get_db_config()
    
    try:
        conn = psycopg2.connect(**config)
        cur = conn.cursor()
        
        # 检查是否已有用户数据
        cur.execute("SELECT COUNT(*) FROM users")
        user_count = cur.fetchone()[0]
        
        if user_count == 0:
            import bcrypt
            
            # 创建示例用户
            password_hash = bcrypt.hashpw(b'test123456', bcrypt.gensalt()).decode('utf-8')
            
            cur.execute("""
                INSERT INTO users (username, email, password_hash, display_name, email_verified)
                VALUES (%s, %s, %s, %s, %s)
            """, ('testuser', 'test@example.com', password_hash, '测试用户', True))
            
            conn.commit()
            print("✅ 示例用户创建成功")
            print("   用户名: testuser")
            print("   邮箱: test@example.com")
            print("   密码: test123456")
        else:
            print(f"✅ 数据库中已有 {user_count} 个用户")
        
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ 创建示例数据失败: {e}")
        return False
    
    return True

def main():
    """主函数"""
    print("🚀 开始初始化数据库...")
    
    # 检查数据库连接
    try:
        config = get_db_config()
        conn = psycopg2.connect(**config)
        conn.close()
        print("✅ 数据库连接正常")
    except Exception as e:
        print(f"❌ 数据库连接失败: {e}")
        print("请检查数据库配置和连接")
        return
    
    # 创建数据库
    if not create_database():
        return
    
    # 创建数据表
    if not create_tables():
        return
    
    # 创建示例数据
    if not create_sample_data():
        return
    
    print("🎉 数据库初始化完成!")
    print("\n📋 下一步操作:")
    print("1. 启动后端服务: python app.py")
    print("2. 启动前端服务: npm run dev")
    print("3. 访问 http://localhost:3000 测试登录注册功能")

if __name__ == '__main__':
    main()
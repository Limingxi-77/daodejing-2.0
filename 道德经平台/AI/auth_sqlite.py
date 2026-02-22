import os
import jwt
import bcrypt
import uuid
import sqlite3
from datetime import datetime, timedelta
from flask import jsonify, request
import re

# JWT配置
JWT_SECRET = os.getenv('JWT_SECRET', 'your-super-secret-jwt-key-change-this-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRES_IN = 7  # 天

# SQLite数据库路径
DB_PATH = os.path.join(os.path.dirname(__file__), 'auth.db')

def get_db_connection():
    """获取SQLite数据库连接"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_database():
    """初始化数据库表"""
    conn = get_db_connection()
    try:
        # 创建用户表
        conn.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                display_name TEXT,
                avatar_url TEXT,
                subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'master')),
                subscription_expiry TEXT,
                daily_usage_count INTEGER DEFAULT 0,
                last_usage_date TEXT DEFAULT CURRENT_DATE,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                last_login TEXT,
                is_active BOOLEAN DEFAULT true,
                email_verified BOOLEAN DEFAULT false
            )
        ''')
        
        # 创建会话表
        conn.execute('''
            CREATE TABLE IF NOT EXISTS user_sessions (
                id TEXT PRIMARY KEY,
                user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
                token_hash TEXT UNIQUE NOT NULL,
                expires_at TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                last_accessed TEXT DEFAULT CURRENT_TIMESTAMP,
                user_agent TEXT,
                ip_address TEXT
            )
        ''')
        
        # 创建索引
        conn.execute('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)')
        conn.execute('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)')
        conn.execute('CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id)')
        conn.execute('CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at)')
        
        # 创建示例用户（如果不存在）
        cursor = conn.execute('SELECT COUNT(*) FROM users')
        user_count = cursor.fetchone()[0]
        
        if user_count == 0:
            # 创建示例用户
            password_hash = bcrypt.hashpw(b'test123456', bcrypt.gensalt()).decode('utf-8')
            user_id = str(uuid.uuid4())
            
            conn.execute('''
                INSERT INTO users (id, username, email, password_hash, display_name, email_verified)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (user_id, 'testuser', 'test@example.com', password_hash, '测试用户', True))
            
            print("✅ 示例用户创建成功")
            print(f"   用户ID: {user_id}")
            print("   用户名: testuser")
            print("   邮箱: test@example.com")
            print("   密码: test123456")
        
        conn.commit()
        print("✅ 数据库初始化完成")
        
    except Exception as e:
        print(f"❌ 数据库初始化失败: {e}")
        conn.rollback()
    finally:
        conn.close()

def hash_password(password):
    """密码哈希"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(password, hashed_password):
    """验证密码"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

def generate_jwt_token(user_id, username):
    """生成JWT token"""
    payload = {
        'user_id': str(user_id),
        'username': username,
        'exp': datetime.utcnow() + timedelta(days=JWT_EXPIRES_IN),
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_jwt_token(token):
    """验证JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def validate_email(email):
    """验证邮箱格式"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """验证密码强度"""
    if len(password) < 8:
        return False, "密码至少需要8个字符"
    if not re.search(r'[A-Za-z]', password):
        return False, "密码必须包含字母"
    if not re.search(r'\d', password):
        return False, "密码必须包含数字"
    return True, "密码强度符合要求"

def register_user():
    """用户注册"""
    try:
        data = request.get_json()
        username = data.get('username', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        display_name = data.get('display_name', username)
        
        # 验证输入
        if not username or not email or not password:
            return jsonify({'error': '用户名、邮箱和密码不能为空'}), 400
        
        if not validate_email(email):
            return jsonify({'error': '邮箱格式不正确'}), 400
        
        is_valid_password, password_msg = validate_password(password)
        if not is_valid_password:
            return jsonify({'error': password_msg}), 400
        
        # 检查用户名和邮箱是否已存在
        conn = get_db_connection()
        try:
            # 检查用户名
            cursor = conn.execute('SELECT id FROM users WHERE username = ?', (username,))
            if cursor.fetchone():
                return jsonify({'error': '用户名已存在'}), 400
            
            # 检查邮箱
            cursor = conn.execute('SELECT id FROM users WHERE email = ?', (email,))
            if cursor.fetchone():
                return jsonify({'error': '邮箱已被注册'}), 400
            
            # 创建用户
            user_id = str(uuid.uuid4())
            password_hash = hash_password(password)
            
            conn.execute('''
                INSERT INTO users (id, username, email, password_hash, display_name, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
            ''', (user_id, username, email, password_hash, display_name))
            
            conn.commit()
            
            # 生成JWT token
            token = generate_jwt_token(user_id, username)
            
            return jsonify({
                'message': '注册成功',
                'token': token,
                'user': {
                    'id': user_id,
                    'username': username,
                    'email': email,
                    'display_name': display_name,
                    'subscription_tier': 'free',
                    'email_verified': False
                }
            }), 201
            
        except Exception as e:
            conn.rollback()
            return jsonify({'error': f'注册失败: {str(e)}'}), 500
        finally:
            conn.close()
            
    except Exception as e:
        return jsonify({'error': f'服务器错误: {str(e)}'}), 500

def login_user():
    """用户登录"""
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        # 验证输入
        if not email or not password:
            return jsonify({'error': '邮箱和密码不能为空'}), 400
        
        conn = get_db_connection()
        try:
            # 查找用户
            cursor = conn.execute('''
                SELECT id, username, email, password_hash, display_name, subscription_tier, 
                       subscription_expiry, is_active, email_verified
                FROM users WHERE email = ?
            ''', (email,))
            
            user_row = cursor.fetchone()
            
            if not user_row:
                return jsonify({'error': '邮箱或密码错误'}), 401
            
            if not user_row['is_active']:
                return jsonify({'error': '账户已被禁用'}), 401
            
            # 验证密码
            if not verify_password(password, user_row['password_hash']):
                return jsonify({'error': '邮箱或密码错误'}), 401
            
            # 更新最后登录时间
            conn.execute("UPDATE users SET last_login = datetime('now') WHERE id = ?", (user_row['id'],))
            conn.commit()
            
            # 生成JWT token
            token = generate_jwt_token(user_row['id'], user_row['username'])
            
            return jsonify({
                'message': '登录成功',
                'token': token,
                'user': {
                    'id': user_row['id'],
                    'username': user_row['username'],
                    'email': user_row['email'],
                    'display_name': user_row['display_name'],
                    'subscription_tier': user_row['subscription_tier'],
                    'email_verified': bool(user_row['email_verified'])
                }
            })
            
        except Exception as e:
            return jsonify({'error': f'登录失败: {str(e)}'}), 500
        finally:
            conn.close()
            
    except Exception as e:
        return jsonify({'error': f'服务器错误: {str(e)}'}), 500

def get_user_profile():
    """获取用户信息"""
    try:
        # 从请求头获取token
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': '未提供认证token'}), 401
        
        token = auth_header.split(' ')[1]
        payload = verify_jwt_token(token)
        
        if not payload:
            return jsonify({'error': '无效的token'}), 401
        
        conn = get_db_connection()
        try:
            cursor = conn.execute('''
                SELECT id, username, email, display_name, avatar_url, subscription_tier, 
                       subscription_expiry, created_at, last_login, email_verified
                FROM users WHERE id = ? AND is_active = 1
            ''', (payload['user_id'],))
            
            user_row = cursor.fetchone()
            
            if not user_row:
                return jsonify({'error': '用户不存在'}), 404
            
            return jsonify({
                'user': {
                    'id': user_row['id'],
                    'username': user_row['username'],
                    'email': user_row['email'],
                    'display_name': user_row['display_name'],
                    'avatar_url': user_row['avatar_url'],
                    'subscription_tier': user_row['subscription_tier'],
                    'subscription_expiry': user_row['subscription_expiry'],
                    'created_at': user_row['created_at'],
                    'last_login': user_row['last_login'],
                    'email_verified': bool(user_row['email_verified'])
                }
            })
            
        except Exception as e:
            return jsonify({'error': f'获取用户信息失败: {str(e)}'}), 500
        finally:
            conn.close()
            
    except Exception as e:
        return jsonify({'error': f'服务器错误: {str(e)}'}), 500

def logout_user():
    """用户登出"""
    # 由于使用JWT，客户端只需删除token即可
    return jsonify({'message': '登出成功'})

def refresh_token():
    """刷新token"""
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': '未提供认证token'}), 401
        
        token = auth_header.split(' ')[1]
        payload = verify_jwt_token(token)
        
        if not payload:
            return jsonify({'error': '无效的token'}), 401
        
        # 生成新的token
        new_token = generate_jwt_token(payload['user_id'], payload['username'])
        
        return jsonify({
            'message': 'token刷新成功',
            'token': new_token
        })
        
    except Exception as e:
        return jsonify({'error': f'服务器错误: {str(e)}'}), 500

# 初始化数据库
init_database()
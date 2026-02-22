import os
import jwt
import bcrypt
import uuid
from datetime import datetime, timedelta
from flask import jsonify, request
import psycopg2
from psycopg2.extras import RealDictCursor
import re
import sys

# 添加当前目录到Python路径
sys.path.append(os.path.dirname(__file__))

# 数据库连接配置
class DatabaseConfig:
    def __init__(self):
        self.supabase_url = os.getenv('SUPABASE_URL', 'https://your-project-id.supabase.co')
        self.supabase_key = os.getenv('SUPABASE_KEY', 'your-anon-key')
        self.supabase_service_key = os.getenv('SUPABASE_SERVICE_KEY', 'your-service-role-key')
        
        # 从Supabase URL中提取数据库连接信息
        if 'supabase.co' in self.supabase_url:
            # Supabase连接配置
            self.db_config = {
                'host': self.supabase_url.replace('https://', '').replace('.supabase.co', '') + '.supabase.co',
                'database': 'postgres',
                'user': 'postgres',
                'password': os.getenv('SUPABASE_DB_PASSWORD', 'your-db-password'),
                'port': 5432
            }
        else:
            # 本地数据库配置
            self.db_config = {
                'host': 'localhost',
                'database': 'daodejing',
                'user': 'postgres',
                'password': os.getenv('DB_PASSWORD', 'password'),
                'port': 5432
            }

# JWT配置
JWT_SECRET = os.getenv('JWT_SECRET', 'your-super-secret-jwt-key-change-this-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRES_IN = 7  # 天

def get_db_connection():
    """获取数据库连接"""
    config = DatabaseConfig()
    try:
        conn = psycopg2.connect(**config.db_config)
        return conn
    except Exception as e:
        print(f"数据库连接失败: {e}")
        return None

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
        if not conn:
            return jsonify({'error': '数据库连接失败'}), 500
        
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # 检查用户名
                cur.execute("SELECT id FROM users WHERE username = %s", (username,))
                if cur.fetchone():
                    return jsonify({'error': '用户名已存在'}), 400
                
                # 检查邮箱
                cur.execute("SELECT id FROM users WHERE email = %s", (email,))
                if cur.fetchone():
                    return jsonify({'error': '邮箱已被注册'}), 400
                
                # 创建用户
                user_id = str(uuid.uuid4())
                password_hash = hash_password(password)
                
                cur.execute("""
                    INSERT INTO users (id, username, email, password_hash, display_name, created_at, updated_at)
                    VALUES (%s, %s, %s, %s, %s, NOW(), NOW())
                """, (user_id, username, email, password_hash, display_name))
                
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
                        'subscription_tier': 'free'
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
        if not conn:
            return jsonify({'error': '数据库连接失败'}), 500
        
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # 查找用户
                cur.execute("""
                    SELECT id, username, email, password_hash, display_name, subscription_tier, 
                           subscription_expiry, is_active, email_verified
                    FROM users WHERE email = %s
                """, (email,))
                
                user = cur.fetchone()
                
                if not user:
                    return jsonify({'error': '邮箱或密码错误'}), 401
                
                if not user['is_active']:
                    return jsonify({'error': '账户已被禁用'}), 401
                
                # 验证密码
                if not verify_password(password, user['password_hash']):
                    return jsonify({'error': '邮箱或密码错误'}), 401
                
                # 更新最后登录时间
                cur.execute("UPDATE users SET last_login = NOW() WHERE id = %s", (user['id'],))
                conn.commit()
                
                # 生成JWT token
                token = generate_jwt_token(user['id'], user['username'])
                
                return jsonify({
                    'message': '登录成功',
                    'token': token,
                    'user': {
                        'id': user['id'],
                        'username': user['username'],
                        'email': user['email'],
                        'display_name': user['display_name'],
                        'subscription_tier': user['subscription_tier'],
                        'email_verified': user['email_verified']
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
        if not conn:
            return jsonify({'error': '数据库连接失败'}), 500
        
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                    SELECT id, username, email, display_name, avatar_url, subscription_tier, 
                           subscription_expiry, created_at, last_login, email_verified
                    FROM users WHERE id = %s AND is_active = true
                """, (payload['user_id'],))
                
                user = cur.fetchone()
                
                if not user:
                    return jsonify({'error': '用户不存在'}), 404
                
                return jsonify({
                    'user': {
                        'id': user['id'],
                        'username': user['username'],
                        'email': user['email'],
                        'display_name': user['display_name'],
                        'avatar_url': user['avatar_url'],
                        'subscription_tier': user['subscription_tier'],
                        'subscription_expiry': user['subscription_expiry'].isoformat() if user['subscription_expiry'] else None,
                        'created_at': user['created_at'].isoformat(),
                        'last_login': user['last_login'].isoformat() if user['last_login'] else None,
                        'email_verified': user['email_verified']
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

def forgot_password():
    """忘记密码"""
    # 实现密码重置邮件发送逻辑
    return jsonify({'message': '密码重置功能待实现'}), 501

def reset_password():
    """重置密码"""
    # 实现密码重置逻辑
    return jsonify({'message': '密码重置功能待实现'}), 501
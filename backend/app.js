const express = require('express')
const mysql = require('mysql2/promise')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const { randomUUID } = require('crypto')
require('dotenv').config()

const app = express()
app.use(cors())
app.use(express.json())

// 创建数据库连接池
const pool = mysql.createPool({
  host: process.env.VITE_MYSQL_HOST || 'localhost',
  port: parseInt(process.env.VITE_MYSQL_PORT || '3306'),
  user: process.env.VITE_MYSQL_USER || 'daodejing',
  password: process.env.VITE_MYSQL_PASSWORD || 'password',
  database: process.env.VITE_MYSQL_DATABASE || 'daodejing_platform',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

// 测试连接
pool.getConnection()
  .then(connection => {
    console.log('MySQL 连接成功')
    connection.release()
  })
  .catch(error => {
    console.error('MySQL 连接失败:', error)
  })

// 注册接口
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body
    
    // 验证输入
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: '请填写所有必填字段' })
    }
    
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: '密码长度至少8位' })
    }
    
    // 检查用户是否已存在
    const [existingUsers] = await pool.execute(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [email, username]
    )
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: '邮箱或用户名已存在' })
    }
    
    // 生成密码哈希
    const passwordHash = await bcrypt.hash(password, 10)
    
    // 插入用户
    const [result] = await pool.execute(
      'INSERT INTO users (id, username, email, password_hash, display_name) VALUES (?, ?, ?, ?, ?)',
      [randomUUID(), username, email, passwordHash, username]
    )
    
    res.status(201).json({ success: true, message: '注册成功' })
  } catch (error) {
    console.error('注册失败:', error)
    res.status(500).json({ success: false, message: '注册失败' })
  }
})

// 登录接口
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    
    // 验证输入
    if (!email || !password) {
      return res.status(400).json({ success: false, message: '请填写邮箱和密码' })
    }
    
    // 查询用户
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    )
    
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: '用户不存在' })
    }
    
    const user = users[0]
    
    // 验证密码
    const passwordMatch = await bcrypt.compare(password, user.password_hash)
    
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: '密码错误' })
    }
    
    // 更新最后登录时间
    await pool.execute(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    )
    
    // 返回用户信息
    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        display_name: user.display_name || user.username,
        subscription_tier: user.subscription_tier || 'free',
        email_verified: user.email_verified || false,
        created_at: user.created_at,
        last_login: new Date().toISOString(),
        subscription_expiry: user.subscription_expiry
      }
    })
  } catch (error) {
    console.error('登录失败:', error)
    res.status(500).json({ success: false, message: '登录失败' })
  }
})

// 健康检查接口
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: '服务运行正常' })
})

// 启动服务器
const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
  console.log(`后端服务运行在 http://localhost:${PORT}`)
  console.log('登录注册功能已就绪')
  console.log('测试账号：test@example.com / test123456')
})
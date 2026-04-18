// 检查是否在浏览器环境中
const isBrowser = typeof window !== 'undefined'

let pool: any = null
let mysql: any = null

if (!isBrowser) {
  // 只在非浏览器环境中导入 mysql2
  mysql = require('mysql2/promise')
  
  // 从环境变量获取 MySQL 配置
  const mysqlConfig = {
    host: process.env.VITE_MYSQL_HOST || 'localhost',
    port: parseInt(process.env.VITE_MYSQL_PORT || '3306'),
    user: process.env.VITE_MYSQL_USER || 'daodejing',
    password: process.env.VITE_MYSQL_PASSWORD || 'password',
    database: process.env.VITE_MYSQL_DATABASE || 'daodejing_platform',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  }
  
  // 创建数据库连接池
  pool = mysql.createPool(mysqlConfig)
}

// 测试数据库连接
export const testConnection = async () => {
  if (isBrowser) {
    console.log('浏览器环境，跳过 MySQL 连接测试')
    return true
  }
  
  try {
    if (!pool) {
      console.error('MySQL 连接池未初始化')
      return false
    }
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
  if (isBrowser) {
    console.log('浏览器环境，返回模拟数据')
    // 返回模拟数据，避免在浏览器中出错
    return { data: [], error: null }
  }
  
  try {
    if (!pool) {
      console.error('MySQL 连接池未初始化')
      return { data: null, error: new Error('连接池未初始化') }
    }
    const [rows] = await pool.execute(sql, params)
    return { data: rows, error: null }
  } catch (error) {
    console.error('SQL 查询失败:', error)
    return { data: null, error }
  }
}

// 生成 UUID
export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// 认证服务
export const authService = {
  // 注册用户
  async register(username: string, email: string, passwordHash: string) {
    const sql = `
      INSERT INTO users (id, username, email, password_hash)
      VALUES (?, ?, ?, ?)
    `
    return await query(sql, [generateUUID(), username, email, passwordHash])
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
  },

  // 获取用户信息
  async getUser(userId: string) {
    const sql = `
      SELECT * FROM users WHERE id = ?
    `
    return await query(sql, [userId])
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
      return await query(updateSql, [progress, progress >= 100, (existingProgress as any)[0].id])
    } else {
      // 创建新记录
      const insertSql = `
        INSERT INTO learning_progress (id, user_id, course_id, chapter_id, progress_percentage, completed)
        VALUES (?, ?, ?, ?, ?, ?)
      `
      return await query(insertSql, [generateUUID(), userId, courseId, chapterId, progress, progress >= 100])
    }
  },

  // 获取学习进度
  async getProgress(userId: string, courseId: string, chapterId: string) {
    const sql = `
      SELECT * FROM learning_progress
      WHERE user_id = ? AND course_id = ? AND chapter_id = ?
    `
    return await query(sql, [userId, courseId, chapterId])
  },

  // 获取用户所有学习进度
  async getUserProgress(userId: string) {
    const sql = `
      SELECT * FROM learning_progress
      WHERE user_id = ?
    `
    return await query(sql, [userId])
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
  },

  // 获取章节详情
  async getChapter(chapterId: string) {
    const sql = `
      SELECT * FROM chapters WHERE id = ?
    `
    return await query(sql, [chapterId])
  },

  // 创建课程
  async createCourse(data: any) {
    const sql = `
      INSERT INTO courses (id, title, description, level, duration, total_chapters, thumbnail_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
    return await query(sql, [
      generateUUID(),
      data.title,
      data.description,
      data.level,
      data.duration,
      data.total_chapters,
      data.thumbnail_url
    ])
  },

  // 创建章节
  async createChapter(data: any) {
    const sql = `
      INSERT INTO chapters (id, course_id, title, content, order_number, duration)
      VALUES (?, ?, ?, ?, ?, ?)
    `
    return await query(sql, [
      generateUUID(),
      data.course_id,
      data.title,
      data.content,
      data.order_number,
      data.duration
    ])
  }
}

export default pool
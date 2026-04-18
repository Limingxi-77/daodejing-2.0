import { createClient } from '@supabase/supabase-js'

// 从环境变量获取 Supabase 配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY || ''

// 创建 Supabase 客户端实例
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 创建服务端客户端（用于需要管理员权限的操作）
export const supabaseService = createClient(supabaseUrl, supabaseServiceKey)

// 认证服务
export const authService = {
  // 注册新用户
  async register(email: string, password: string, username: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          display_name: username,
          subscription_tier: 'free'
        }
      }
    })
    return { data, error }
  },

  // 用户登录
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  // 用户登出
  async logout() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // 获取当前用户
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  // 更新用户信息
  async updateUser(data: any) {
    const { data: updatedUser, error } = await supabase.auth.updateUser(data)
    return { data: updatedUser, error }
  },

  // 刷新 token
  async refreshToken() {
    const { data, error } = await supabase.auth.refreshSession()
    return { data, error }
  },

  // 发送密码重置邮件
  async sendPasswordResetEmail(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${(import.meta.env.VITE_APP_URL || 'http://localhost:5173')}/auth/reset-password`
    })
    return { data, error }
  },

  // 重置密码
  async resetPassword(password: string) {
    const { data, error } = await supabase.auth.updateUser({
      password
    })
    return { data, error }
  },

  // 验证邮箱
  async verifyEmail(email: string) {
    const { data, error } = await supabase.auth.resend({ 
      type: 'signup',
      email
    })
    return { data, error }
  }
}

// 用户服务
export const userService = {
  // 获取用户详细信息
  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  // 更新用户个人资料
  async updateUserProfile(userId: string, data: any) {
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(data)
      .eq('id', userId)
      .select()
      .single()
    return { data: updatedUser, error }
  },

  // 获取用户学习进度
  async getUserLearningProgress(userId: string) {
    const { data, error } = await supabase
      .from('learning_progress')
      .select('*')
      .eq('user_id', userId)
    return { data, error }
  }
}

// 课程服务
export const courseService = {
  // 获取所有课程
  async getAllCourses() {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
    return { data, error }
  },

  // 获取课程详情
  async getCourseById(courseId: string) {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single()
    return { data, error }
  },

  // 获取课程章节
  async getCourseChapters(courseId: string) {
    const { data, error } = await supabase
      .from('chapters')
      .select('*')
      .eq('course_id', courseId)
      .order('order_number', { ascending: true })
    return { data, error }
  },

  // 创建课程
  async createCourse(data: any) {
    const { data: newCourse, error } = await supabase
      .from('courses')
      .insert(data)
      .select()
      .single()
    return { data: newCourse, error }
  },

  // 更新课程
  async updateCourse(courseId: string, data: any) {
    const { data: updatedCourse, error } = await supabase
      .from('courses')
      .update(data)
      .eq('id', courseId)
      .select()
      .single()
    return { data: updatedCourse, error }
  }
}

// 学习进度服务
export const learningProgressService = {
  // 更新学习进度
  async updateProgress(userId: string, courseId: string, chapterId: string, progress: number) {
    // 检查是否已有进度记录
    const { data: existingProgress } = await supabase
      .from('learning_progress')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .eq('chapter_id', chapterId)
      .single()

    let result
    if (existingProgress) {
      // 更新现有记录
      result = await supabase
        .from('learning_progress')
        .update({
          progress_percentage: progress,
          completed: progress >= 100,
          last_accessed: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingProgress.id)
        .select()
        .single()
    } else {
      // 创建新记录
      result = await supabase
        .from('learning_progress')
        .insert({
          user_id: userId,
          course_id: courseId,
          chapter_id: chapterId,
          progress_percentage: progress,
          completed: progress >= 100
        })
        .select()
        .single()
    }

    return { data: result.data, error: result.error }
  },

  // 获取用户课程进度
  async getCourseProgress(userId: string, courseId: string) {
    const { data, error } = await supabase
      .from('learning_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
    return { data, error }
  },

  // 获取用户已完成的课程
  async getCompletedCourses(userId: string) {
    const { data, error } = await supabase
      .from('learning_progress')
      .select('course_id')
      .eq('user_id', userId)
      .eq('completed', true)
    
    // 手动去重
    if (data) {
      const uniqueCourseIds = Array.from(new Set(data.map(item => item.course_id)))
      return { data: uniqueCourseIds.map(id => ({ course_id: id })), error }
    }
    
    return { data, error }
  }
}

// 导出默认服务
export default {
  auth: authService,
  user: userService,
  course: courseService,
  learningProgress: learningProgressService,
  supabase
}
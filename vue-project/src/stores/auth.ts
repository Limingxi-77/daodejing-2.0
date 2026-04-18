import { defineStore } from 'pinia'
import { ref, onMounted } from 'vue'

export type SubscriptionTier = 'free' | 'pro' | 'master'

export interface User {
  id: string
  username: string
  email: string
  display_name: string
  avatar_url?: string
  subscription: {
    tier: SubscriptionTier
    expiryDate?: string
  }
  email_verified: boolean
  created_at: string
  last_login?: string
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const isLoggedIn = ref(false)
  const isAuthModalOpen = ref(false)
  const showPricingModal = ref(false)
  const authMode = ref<'login' | 'register'>('login')
  
  // Usage tracking
  const dailyUsage = ref({
    count: 0,
    date: new Date().toDateString()
  })

  // Initialize from localStorage
  const initAuth = async () => {
    try {
      // 从本地存储恢复
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          user.value = JSON.parse(storedUser)
          isLoggedIn.value = true
        } catch (e) {
          console.error('Failed to parse user from localStorage', e)
          localStorage.removeItem('user')
        }
      }
    } catch (error) {
      console.error('初始化认证失败:', error)
    }
    
    // Init usage
    const storedUsage = localStorage.getItem('daily_usage')
    if (storedUsage) {
      const parsed = JSON.parse(storedUsage)
      if (parsed.date === new Date().toDateString()) {
        dailyUsage.value = parsed
      } else {
        // Reset for new day
        dailyUsage.value = { count: 0, date: new Date().toDateString() }
        localStorage.setItem('daily_usage', JSON.stringify(dailyUsage.value))
      }
    }
  }

  // Actions
  const login = async (email: string, password: string) => {
    try {
      // 从localStorage获取用户列表
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      const foundUser = users.find((u: any) => u.email === email)
      
      if (!foundUser) {
        throw new Error('用户不存在')
      }
      
      // 验证密码
      if (foundUser.password !== password) {
        throw new Error('密码错误')
      }
      
      // 设置当前用户
      user.value = {
        id: foundUser.id,
        username: foundUser.username,
        email: foundUser.email,
        display_name: foundUser.display_name || foundUser.username,
        avatar_url: foundUser.avatar_url,
        subscription: {
          tier: foundUser.subscription_tier || 'free',
          expiryDate: foundUser.subscription_expiry
        },
        email_verified: foundUser.email_verified || true,
        created_at: foundUser.created_at,
        last_login: new Date().toISOString()
      }
      isLoggedIn.value = true

      // 保存到本地存储
      localStorage.setItem('user', JSON.stringify(user.value))

      closeAuthModal()
      return user.value
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    }
  }

  const register = async (username: string, email: string, password: string) => {
    try {
      // 验证输入
      if (!username || !email || !password) {
        throw new Error('请填写所有必填字段')
      }
      
      if (password.length < 8) {
        throw new Error('密码长度至少8位')
      }
      
      // 从localStorage获取用户列表
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      
      // 检查用户是否已存在
      const existingUser = users.find((u: any) => u.email === email || u.username === username)
      if (existingUser) {
        throw new Error('邮箱或用户名已存在')
      }
      
      // 创建新用户
      const newUser = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        username,
        email,
        password, // 注意：实际项目中应该加密存储
        display_name: username,
        subscription_tier: 'free',
        email_verified: true,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      }
      
      // 保存到用户列表
      users.push(newUser)
      localStorage.setItem('users', JSON.stringify(users))
      
      // 注册成功后自动登录
      return await login(email, password)
    } catch (error) {
      console.error('注册失败:', error)
      throw error
    }
  }

  const upgradeSubscription = (tier: SubscriptionTier) => {
    if (!user.value) return
    
    user.value.subscription.tier = tier
    // Mock expiry: 1 month from now
    const expiry = new Date()
    expiry.setMonth(expiry.getMonth() + 1)
    user.value.subscription.expiryDate = expiry.toISOString()
    
    localStorage.setItem('user', JSON.stringify(user.value))
    showPricingModal.value = false
  }
  
  const checkLimit = () => {
    const tier = user.value?.subscription.tier || 'free'
    const limits = {
      free: 5,
      pro: 50,
      master: 9999
    }
    
    if (dailyUsage.value.count >= limits[tier]) {
      return false
    }
    return true
  }
  
  const incrementUsage = () => {
    dailyUsage.value.count++
    localStorage.setItem('daily_usage', JSON.stringify(dailyUsage.value))
  }

  const logout = async () => {
    try {
      // 清除本地状态
      user.value = null
      isLoggedIn.value = false
      localStorage.removeItem('user')
    } catch (error) {
      console.error('登出失败:', error)
    }
  }

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    authMode.value = mode
    isAuthModalOpen.value = true
  }

  const closeAuthModal = () => {
    isAuthModalOpen.value = false
  }

  // 组件挂载时初始化认证
  onMounted(() => {
    initAuth()
  })

  return {
    user,
    isLoggedIn,
    isAuthModalOpen,
    showPricingModal,
    authMode,
    dailyUsage,
    initAuth,
    login,
    register,
    logout,
    openAuthModal,
    closeAuthModal,
    upgradeSubscription,
    checkLimit,
    incrementUsage
  }
})

import { defineStore } from 'pinia'
import { ref, onMounted } from 'vue'
import { authService } from '../services/mysqlService'
import { dataSyncService } from '../services/dataSyncService'
import bcrypt from 'bcryptjs'

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
      const { data, error } = await authService.login(email)
      
      if (error) {
        throw new Error('登录失败')
      }
      
      if (data && Array.isArray(data) && data.length > 0) {
        const userProfile = data[0] as any
        
        // 验证密码
        const passwordMatch = await bcrypt.compare(password, userProfile.password_hash)
        if (!passwordMatch) {
          throw new Error('密码错误')
        }
        
        user.value = {
          id: userProfile.id,
          username: userProfile.username,
          email: userProfile.email,
          display_name: userProfile.display_name || userProfile.username,
          avatar_url: userProfile.avatar_url,
          subscription: {
            tier: userProfile.subscription_tier as SubscriptionTier,
            expiryDate: userProfile.subscription_expiry
          },
          email_verified: userProfile.email_verified,
          created_at: userProfile.created_at,
          last_login: userProfile.last_login
        }
        isLoggedIn.value = true

        // 保存到本地存储
        localStorage.setItem('user', JSON.stringify(user.value))

        // 从 MySQL 同步数据
        await dataSyncService.syncFromMySQL(user.value.id)

        closeAuthModal()
        return user.value
      }
      
      throw new Error('用户不存在')
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    }
  }

  const register = async (username: string, email: string, password: string) => {
    try {
      // 生成密码哈希
      const passwordHash = await bcrypt.hash(password, 10)
      
      const { error } = await authService.register(username, email, passwordHash)
      
      if (error) {
        throw new Error('注册失败')
      }
      
      // 注册成功后，获取用户信息
      const { data: userData } = await authService.login(email)
      
      if (userData && Array.isArray(userData) && userData.length > 0) {
        const userProfile = userData[0] as any
        
        user.value = {
          id: userProfile.id,
          username: userProfile.username,
          email: userProfile.email,
          display_name: userProfile.display_name || userProfile.username,
          avatar_url: userProfile.avatar_url,
          subscription: {
            tier: userProfile.subscription_tier as SubscriptionTier,
            expiryDate: userProfile.subscription_expiry
          },
          email_verified: userProfile.email_verified,
          created_at: userProfile.created_at,
          last_login: userProfile.last_login
        }
        isLoggedIn.value = true

        // 保存到本地存储
        localStorage.setItem('user', JSON.stringify(user.value))

        // 从 MySQL 同步数据
        await dataSyncService.syncFromMySQL(user.value.id)

        closeAuthModal()
        return user.value
      }
      
      throw new Error('注册失败')
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

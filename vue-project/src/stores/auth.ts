import { defineStore } from 'pinia'
import { ref, onMounted } from 'vue'

// API基础URL配置
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

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
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })
      
      const data = await response.json()
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || '登录失败')
      }
      
      user.value = {
        id: data.user.id,
        username: data.user.username,
        email: data.user.email,
        display_name: data.user.display_name || data.user.username,
        avatar_url: data.user.avatar_url,
        subscription: {
          tier: data.user.subscription_tier as SubscriptionTier,
          expiryDate: data.user.subscription_expiry
        },
        email_verified: data.user.email_verified || false,
        created_at: data.user.created_at || new Date().toISOString(),
        last_login: data.user.last_login || new Date().toISOString()
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
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
      })
      
      const data = await response.json()
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || '注册失败')
      }
      
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

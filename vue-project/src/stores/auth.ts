import { defineStore } from 'pinia'
import { ref } from 'vue'

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
  const token = ref<string | null>(null)
  
  // Usage tracking
  const dailyUsage = ref({
    count: 0,
    date: new Date().toDateString()
  })

  // API配置
  const API_BASE_URL = 'http://localhost:8000'

  // Initialize from localStorage
  const initAuth = () => {
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('token')
    
    if (storedUser && storedToken) {
      try {
        user.value = JSON.parse(storedUser)
        token.value = storedToken
        isLoggedIn.value = true
        
        // 验证token是否有效
        verifyToken()
      } catch (e) {
        console.error('Failed to parse user from localStorage', e)
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      }
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

  // API请求函数
  const apiRequest = async (url: string, options: RequestInit = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(token.value ? { 'Authorization': `Bearer ${token.value}` } : {}),
      ...options.headers
    }

    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: '请求失败' }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API请求错误:', error)
      throw error
    }
  }

  // 验证token
  const verifyToken = async () => {
    try {
      await apiRequest('/api/auth/profile')
    } catch (error) {
      // Token无效，清除本地存储
      logout()
    }
  }

  // Actions
  const login = async (email: string, password: string) => {
    try {
      const response = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      })

      token.value = response.token
      user.value = response.user
      isLoggedIn.value = true

      // 保存到本地存储
      localStorage.setItem('user', JSON.stringify(response.user))
      localStorage.setItem('token', response.token)

      closeAuthModal()
      return response
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    }
  }

  const register = async (username: string, email: string, password: string, displayName?: string) => {
    try {
      const response = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ 
          username, 
          email, 
          password,
          display_name: displayName || username 
        })
      })

      token.value = response.token
      user.value = response.user
      isLoggedIn.value = true

      // 保存到本地存储
      localStorage.setItem('user', JSON.stringify(response.user))
      localStorage.setItem('token', response.token)

      closeAuthModal()
      return response
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
      // 调用后端登出API
      await apiRequest('/api/auth/logout', {
        method: 'POST'
      })
    } catch (error) {
      console.error('登出API调用失败:', error)
    } finally {
      // 清除本地状态
      user.value = null
      isLoggedIn.value = false
      token.value = null
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    }
  }

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    authMode.value = mode
    isAuthModalOpen.value = true
  }

  const closeAuthModal = () => {
    isAuthModalOpen.value = false
  }

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

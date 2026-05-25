import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiClient, setToken, getToken, removeToken } from '@/services/api'

export type SubscriptionTier = 'free' | 'pro' | 'master' | 'team'

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
  const user = ref<User | null>(null)
  const isLoggedIn = ref(false)
  const isAuthModalOpen = ref(false)
  const showPricingModal = ref(false)
  const authMode = ref<'login' | 'register'>('login')

  const dailyUsage = ref({
    count: 0,
    date: new Date().toDateString()
  })

  function toStoreUser(raw: Record<string, unknown>): User {
    return {
      id: raw.id as string,
      username: raw.username as string,
      email: raw.email as string,
      display_name: (raw.display_name as string) || (raw.username as string),
      avatar_url: raw.avatar_url as string | undefined,
      subscription: {
        tier: (raw.subscription_tier as SubscriptionTier) || 'free',
        expiryDate: raw.subscription_expiry as string | undefined
      },
      email_verified: (raw.email_verified as boolean) || false,
      created_at: raw.created_at as string,
      last_login: raw.last_login as string | undefined
    }
  }

  function persistUser(u: User) {
    localStorage.setItem('user', JSON.stringify(u))
  }

  function clearPersistedUser() {
    localStorage.removeItem('user')
  }

  const initAuth = async () => {
    const token = getToken()
    if (!token) return

    try {
      const data = await apiClient<{ success: boolean; user: Record<string, unknown> }>('/auth/me')
      user.value = toStoreUser(data.user)
      isLoggedIn.value = true
      persistUser(user.value)
    } catch {
      removeToken()
      clearPersistedUser()
    }

    initUsage()
  }

  function initUsage() {
    const storedUsage = localStorage.getItem('daily_usage')
    if (storedUsage) {
      const parsed = JSON.parse(storedUsage)
      if (parsed.date === new Date().toDateString()) {
        dailyUsage.value = parsed
      } else {
        dailyUsage.value = { count: 0, date: new Date().toDateString() }
        localStorage.setItem('daily_usage', JSON.stringify(dailyUsage.value))
      }
    }
  }

  const login = async (email: string, password: string) => {
    const data = await apiClient<{ success: boolean; token: string; user: Record<string, unknown> }>(
      '/auth/login',
      { method: 'POST', body: { email, password }, auth: false }
    )

    setToken(data.token)
    user.value = toStoreUser(data.user)
    isLoggedIn.value = true
    persistUser(user.value)
    closeAuthModal()
    return user.value
  }

  const register = async (username: string, email: string, password: string) => {
    const data = await apiClient<{ success: boolean; token: string; user: Record<string, unknown> }>(
      '/auth/register',
      { method: 'POST', body: { username, email, password }, auth: false }
    )

    setToken(data.token)
    user.value = toStoreUser(data.user)
    isLoggedIn.value = true
    persistUser(user.value)
    closeAuthModal()
    return user.value
  }

  const upgradeSubscription = async (tier: SubscriptionTier) => {
    if (!user.value) {
      throw new Error('请先登录后再升级会员')
    }

    const data = await apiClient<{ success: boolean; user: Record<string, unknown> }>(
      '/auth/subscription',
      { method: 'PATCH', body: { tier } }
    )

    if (!data.success || !data.user) {
      throw new Error('升级失败，服务器返回异常')
    }

    user.value = toStoreUser(data.user)
    persistUser(user.value)
  }

  const checkLimit = () => {
    const tier = user.value?.subscription.tier || 'free'
    const limits: Record<string, number> = { free: 5, pro: 50, team: 500, master: 9999 }
    return dailyUsage.value.count < limits[tier]
  }

  const incrementUsage = () => {
    dailyUsage.value.count++
    localStorage.setItem('daily_usage', JSON.stringify(dailyUsage.value))
  }

  const logout = () => {
    user.value = null
    isLoggedIn.value = false
    removeToken()
    clearPersistedUser()
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

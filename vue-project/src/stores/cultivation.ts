import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { apiClient } from '@/services/api'

// 境界定义
export interface Realm {
  name: string
  minExp: number
  desc: string
  icon: string
}

// 境界列表（参考修仙体系）
const REALMS: Realm[] = [
  { name: '凡人', minExp: 0, desc: '初入道门，懵懂无知', icon: 'fas fa-user' },
  { name: '炼气', minExp: 100, desc: '引气入体，初窥门径', icon: 'fas fa-wind' },
  { name: '筑基', minExp: 500, desc: '大道之基，脱胎换骨', icon: 'fas fa-dungeon' },
  { name: '金丹', minExp: 1500, desc: '金丹大道，性命双修', icon: 'fas fa-circle' },
  { name: '元婴', minExp: 3000, desc: '破丹成婴，神游太虚', icon: 'fas fa-child' },
  { name: '化神', minExp: 6000, desc: '元神分化，神念通天', icon: 'fas fa-ghost' },
  { name: '炼虚', minExp: 10000, desc: '炼神还虚，返璞归真', icon: 'fas fa-cloud' },
  { name: '合体', minExp: 15000, desc: '神人合一，法力无边', icon: 'fas fa-users' },
  { name: '大乘', minExp: 25000, desc: '大道将成，飞升在即', icon: 'fas fa-dragon' },
  { name: '渡劫', minExp: 40000, desc: '历经雷劫，羽化登仙', icon: 'fas fa-bolt' }
]

export const useCultivationStore = defineStore('cultivation', () => {
  // 状态
  const exp = ref(0)
  const showUpgradeModal = ref(false)
  const lastRealmName = ref('')

  // 计算属性：当前境界
  const currentRealm = computed(() => {
    // 从高到低遍历，找到第一个符合条件的境界
    for (let i = REALMS.length - 1; i >= 0; i--) {
      if (exp.value >= REALMS[i].minExp) {
        return REALMS[i]
      }
    }
    return REALMS[0]
  })

  // 计算属性：下一境界
  const nextRealm = computed(() => {
    const currentIndex = REALMS.findIndex(r => r.name === currentRealm.value.name)
    if (currentIndex < REALMS.length - 1) {
      return REALMS[currentIndex + 1]
    }
    return null // 已达最高境界
  })

  // 计算属性：当前境界进度百分比
  const progress = computed(() => {
    if (!nextRealm.value) return 100
    
    const currentMin = currentRealm.value.minExp
    const nextMin = nextRealm.value.minExp
    const range = nextMin - currentMin
    const current = exp.value - currentMin
    
    return Math.min(Math.round((current / range) * 100), 100)
  })

  // 方法：增加经验值
  const addExp = (amount: number, _reason?: string) => {
    const oldRealm = currentRealm.value.name
    exp.value += amount
    
    // 检查升级
    if (currentRealm.value.name !== oldRealm) {
      // 触发升级提示
      lastRealmName.value = oldRealm
      showUpgradeModal.value = true
    }
  }

  // 方法：关闭升级弹窗
  const closeUpgradeModal = () => {
    showUpgradeModal.value = false
  }

  // 初始化：优先从 API 加载，回退到本地存储
  const init = async () => {
    try {
      const res = await apiClient<{ success: boolean; data: { exp: number; realm: string } }>('/cultivation')
      if (res.success && res.data) {
        exp.value = res.data.exp || 0
        localStorage.setItem('cultivation_exp', exp.value.toString())
        return
      }
    } catch {
      // 未登录或网络异常，回退到本地存储
    }
    const savedExp = localStorage.getItem('cultivation_exp')
    if (savedExp) {
      exp.value = parseInt(savedExp, 10)
    }
  }

  // 防抖同步到后端
  let syncTimeout: ReturnType<typeof setTimeout> | null = null
  const debouncedSync = (val: number) => {
    if (syncTimeout) clearTimeout(syncTimeout)
    syncTimeout = setTimeout(() => {
      apiClient('/cultivation', {
        method: 'PUT',
        body: { exp: val, realm: currentRealm.value.name }
      }).catch(() => {})
    }, 2000)
  }

  // 监听：保存到本地存储 + 防抖同步到后端
  watch(exp, (val) => {
    localStorage.setItem('cultivation_exp', val.toString())
    debouncedSync(val)
  })

  // 立即初始化
  init()

  return {
    exp,
    currentRealm,
    nextRealm,
    progress,
    showUpgradeModal,
    addExp,
    closeUpgradeModal
  }
})

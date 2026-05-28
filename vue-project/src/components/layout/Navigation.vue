<template>
  <nav id="mainNav" :class="['fixed w-full top-0 z-50 transition-all duration-300 py-4', { 'nav-scrolled': isScrolled }]">
    <div class="container mx-auto px-4 md:px-8 flex justify-between items-center">
      <!-- 品牌标识 -->
      <div class="flex items-center">
        <div class="text-2xl font-bold text-primary mr-2">
          <i class="fas fa-book-open"></i>
        </div>
        <div class="text-xl font-semibold text-primary">道德经AI解读者</div>
      </div>
      
      <!-- 桌面端导航 -->
      <div class="nav-links hidden md:flex space-x-8">
        <router-link
          v-for="route in routes"
          :key="route.name"
          :to="{ name: route.name }"
          @mouseenter="prefetchRoute(route.name)"
          @focus="prefetchRoute(route.name)"
          @touchstart.passive="prefetchRoute(route.name)"
          :class="['transition-colors', $route.name === route.name ? 'text-accent font-semibold' : 'text-primary hover:text-accent']"
        >
          {{ route.title }}
        </router-link>
      </div>
      
      <!-- 登录/注册按钮 -->
      <div class="hidden md:flex items-center space-x-4">
        <!-- 境界徽章 (仅桌面端显示) -->
        <div class="hidden lg:flex items-center mr-2 bg-primary/5 px-3 py-1 rounded-full border border-primary/20 cursor-help group relative" title="当前修仙境界">
          <div class="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs mr-2">
            <i :class="currentRealm.icon"></i>
          </div>
          <div class="flex flex-col">
            <span class="text-xs font-bold text-primary leading-none">{{ currentRealm.name }}</span>
            <div class="w-12 h-1 bg-gray-200 rounded-full mt-1 overflow-hidden">
              <div class="h-full bg-accent transition-all duration-500" :style="{ width: progress + '%' }"></div>
            </div>
          </div>
          
          <!-- 境界详情悬浮窗 -->
          <div class="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-white p-3 rounded-lg shadow-xl border border-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            <div class="text-center">
              <div class="w-10 h-10 mx-auto bg-primary text-white rounded-full flex items-center justify-center mb-2">
                <i :class="currentRealm.icon" class="text-lg"></i>
              </div>
              <h4 class="font-bold text-primary mb-1">{{ currentRealm.name }}</h4>
              <p class="text-xs text-gray-500 mb-2">{{ currentRealm.desc }}</p>
              <div class="text-xs text-gray-400">当前进度: {{ progress }}%</div>
            </div>
          </div>
        </div>

        <!-- 音效控制 -->
        <SoundControl />

        <!-- 古籍模式开关 -->
        <button
          @click="toggleRetroMode"
          class="w-10 h-10 rounded-full flex items-center justify-center transition-colors text-primary hover:bg-secondary/10"
          :title="isRetroMode ? '退出古籍模式' : '进入古籍模式'"
        >
          <i :class="isRetroMode ? 'fas fa-align-left' : 'fas fa-scroll'"></i>
        </button>

        <!-- 禅模式开关 -->
        <button
          @click="toggleZenMode"
          class="w-10 h-10 rounded-full flex items-center justify-center transition-colors text-primary hover:bg-secondary/10"
          :title="isZenMode ? '退出禅模式' : '进入禅模式'"
        >
          <i :class="isZenMode ? 'fas fa-sun' : 'fas fa-moon'"></i>
        </button>

        <!-- 收件箱(登录后显示,位于会员按钮前) -->
        <router-link v-if="isLoggedIn" to="/inbox" class="relative text-primary hover:text-accent transition-colors p-1" title="收件箱">
          <i class="fas fa-envelope text-lg"></i>
          <span v-if="notifStore.unreadCount > 0" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {{ notifStore.unreadCount > 99 ? '99+' : notifStore.unreadCount }}
          </span>
        </router-link>

        <!-- 会员状态 / 付费入口 -->
        <button
          type="button"
          @click="openPricingModal"
          :class="['flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all shadow-sm hover:shadow-md border', membershipStatus.buttonClass]"
          :title="membershipStatus.title"
          :aria-label="membershipStatus.title"
          data-testid="membership-status-button"
          :data-membership-state="membershipStatus.state"
        >
          <span :class="['w-5 h-5 rounded-full flex items-center justify-center text-xs', membershipStatus.iconClass]">
            <i :class="membershipStatus.icon"></i>
          </span>
          <span>{{ membershipStatus.label }}</span>
          <span v-if="membershipStatus.state === 'level' && remainingDaysText" class="hidden xl:inline text-xs font-medium opacity-80">
            {{ remainingDaysText }}
          </span>
        </button>

        <div v-if="!isLoggedIn" class="flex space-x-4">
          <router-link to="/login" class="px-4 py-2 btn-secondary rounded-md ink-splash">登录</router-link>
          <router-link to="/register" class="px-4 py-2 btn-primary rounded-md ink-splash">注册</router-link>
        </div>

        <!-- 用户信息（登录后显示） -->
        <div v-else class="flex items-center space-x-4">
          <div ref="xpPopoverRef" class="relative flex items-center space-x-2">
            <button
              type="button"
              class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
              :aria-expanded="isXpPopoverOpen"
              aria-controls="user-xp-popover"
              title="查看经验值"
              data-testid="user-avatar-xp-trigger"
              @click="toggleXpPopover"
            >
              <img v-if="user?.avatar_url" :src="user.avatar_url" alt="" class="w-full h-full rounded-full object-cover">
              <i v-else class="fas fa-user"></i>
            </button>
            <router-link
              :to="{ name: 'Profile' }"
              class="text-primary font-semibold hover:text-accent transition-colors"
              data-testid="profile-nav-link"
            >
              {{ user?.display_name || '用户' }}
            </router-link>
            <transition name="fade">
              <div
                v-if="isXpPopoverOpen"
                id="user-xp-popover"
                class="absolute right-0 top-full mt-3 w-72 rounded-lg border border-primary/15 bg-white p-4 text-primary shadow-xl z-50"
                data-testid="user-xp-popover"
              >
                <div class="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p class="text-xs text-gray-500">当前经验</p>
                    <p class="text-2xl font-bold leading-tight">{{ formattedExp }} XP</p>
                  </div>
                  <div class="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                    <i :class="currentRealm.icon"></i>
                  </div>
                </div>

                <div class="flex items-center justify-between text-sm mb-2">
                  <span class="font-semibold">{{ currentRealm.name }}</span>
                  <span class="text-gray-500">{{ nextRealm ? nextRealm.name : '最高境界' }}</span>
                </div>
                <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                  <div class="h-full bg-accent transition-all duration-500" :style="{ width: progress + '%' }"></div>
                </div>
                <p class="text-xs text-gray-500 mb-3">
                  <span v-if="nextRealm">还差 {{ formattedRemainingExp }} XP</span>
                  <span v-else>已达最高境界</span>
                </p>

                <div class="grid grid-cols-2 gap-2 text-xs">
                  <div class="rounded-md bg-primary/5 px-3 py-2">
                    <span class="font-bold text-primary">每日一签 +50 XP</span>
                  </div>
                  <div class="rounded-md bg-accent/10 px-3 py-2">
                    <span class="font-bold text-primary">再抽 -30 XP</span>
                  </div>
                </div>
              </div>
            </transition>
          </div>
          <button @click="logout" class="text-sm text-secondary hover:text-red-500 transition-colors flex items-center">
            <i class="fas fa-sign-out-alt mr-1"></i>退出
          </button>
        </div>
      </div>
      
      <!-- 移动端菜单按钮 -->
      <button 
        @click="toggleMobileMenu"
        class="mobile-menu-btn md:hidden text-primary"
      >
        <i class="fas fa-bars text-xl"></i>
      </button>
    </div>
    
    <!-- 移动端菜单 -->
    <div id="mobileMenu" :class="['mobile-menu', { 'hidden': !isMobileMenuOpen }]">
      <div class="container mx-auto px-4 py-3 flex flex-col space-y-3">
        <router-link
          v-for="route in routes"
          :key="route.name"
          :to="{ name: route.name }"
          @mouseenter="prefetchRoute(route.name)"
          @focus="prefetchRoute(route.name)"
          @touchstart.passive="prefetchRoute(route.name)"
          :class="['py-2 transition-colors', $route.name === route.name ? 'text-accent font-semibold' : 'text-primary hover:text-accent']"
          @click="closeMobileMenu"
        >
          {{ route.title }}
        </router-link>
        
        <div v-if="!isLoggedIn" class="flex space-x-4 pt-2">
          <router-link to="/login" class="flex-1 px-4 py-2 btn-secondary rounded-md ink-splash" @click="closeMobileMenu">登录</router-link>
          <router-link to="/register" class="flex-1 px-4 py-2 btn-primary rounded-md ink-splash" @click="closeMobileMenu">注册</router-link>
        </div>

        <!-- 移动端设置区域 -->
        <div class="pt-4 pb-2 border-t border-gray-200 grid grid-cols-4 gap-2">
           <!-- 境界 (移动端) -->
           <div class="flex flex-col items-center justify-center p-2 rounded-lg bg-gray-50 text-primary relative">
             <div class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm mb-1">
               <i :class="currentRealm.icon"></i>
             </div>
             <span class="text-xs font-medium">{{ currentRealm.name }}</span>
             <div class="w-full h-1 bg-gray-200 rounded-full mt-1 overflow-hidden">
                <div class="h-full bg-accent" :style="{ width: progress + '%' }"></div>
             </div>
           </div>

           <!-- 古籍模式 -->
           <button 
             @click="toggleRetroMode" 
             class="flex flex-col items-center justify-center p-2 rounded-lg bg-gray-50 text-primary transition-colors active:scale-95"
             :class="{ 'bg-primary/10 border border-primary/20': isRetroMode }"
           >
             <i :class="isRetroMode ? 'fas fa-align-left' : 'fas fa-scroll'" class="text-xl mb-1"></i>
             <span class="text-xs font-medium">{{ isRetroMode ? '普通' : '古籍' }}</span>
           </button>
           
           <!-- 禅模式 -->
           <button 
             @click="toggleZenMode" 
             class="flex flex-col items-center justify-center p-2 rounded-lg bg-gray-50 text-primary transition-colors active:scale-95"
             :class="{ 'bg-primary/10 border border-primary/20': isZenMode }"
           >
             <i :class="isZenMode ? 'fas fa-sun' : 'fas fa-moon'" class="text-xl mb-1"></i>
             <span class="text-xs font-medium">{{ isZenMode ? '日间' : '禅' }}</span>
           </button>
           
           <!-- 音效控制 -->
           <div class="flex flex-col items-center justify-center p-2 rounded-lg bg-gray-50 text-primary relative">
              <SoundControl />
              <span class="text-xs font-medium mt-1">音效</span>
           </div>
        </div>

        <div v-if="isLoggedIn" class="flex flex-col space-y-3 pt-2 border-t border-gray-200 mt-2">
          <router-link @click="isMobileMenuOpen = false" to="/inbox" class="w-full text-left px-2 py-2 text-primary hover:text-accent transition-colors flex items-center">
            <i class="fas fa-envelope mr-2"></i>收件箱
            <span v-if="notifStore.unreadCount > 0" class="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-bold">{{ notifStore.unreadCount }}</span>
          </router-link>
          <button
            type="button"
            @click="openPricingFromMobile"
            :class="['w-full px-2 py-2 rounded-lg flex items-center text-left transition-colors border', membershipStatus.mobileButtonClass]"
            :title="membershipStatus.title"
            :aria-label="membershipStatus.title"
            data-testid="mobile-membership-status-button"
            :data-membership-state="membershipStatus.state"
          >
            <span :class="['w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm', membershipStatus.iconClass]">
              <i :class="membershipStatus.icon"></i>
            </span>
            <span class="font-semibold">{{ membershipStatus.mobileLabel }}</span>
            <span v-if="membershipStatus.state === 'level' && remainingDaysText" class="ml-2 text-xs opacity-75">{{ remainingDaysText }}</span>
            <i class="fas fa-chevron-right ml-auto text-xs opacity-50"></i>
          </button>
          <div class="px-2">
            <button
              type="button"
              class="w-full flex items-center space-x-3 text-left"
              :aria-expanded="isMobileXpPanelOpen"
              aria-controls="mobile-user-xp-panel"
              data-testid="mobile-user-avatar-xp-trigger"
              @click="toggleMobileXpPanel"
            >
              <div class="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                <img v-if="user?.avatar_url" :src="user.avatar_url" alt="" class="w-full h-full rounded-full object-cover">
                <i v-else class="fas fa-user text-lg"></i>
              </div>
              <div class="flex flex-col min-w-0 flex-1">
                <span class="text-primary font-semibold truncate">{{ user?.display_name || '用户' }}</span>
                <span class="text-xs text-gray-500 mt-0.5">{{ membershipStatus.mobileLabel }}</span>
              </div>
              <i :class="isMobileXpPanelOpen ? 'fas fa-chevron-up' : 'fas fa-chevron-down'" class="text-xs text-gray-400"></i>
            </button>

            <div
              v-if="isMobileXpPanelOpen"
              id="mobile-user-xp-panel"
              class="mt-3 rounded-lg border border-primary/10 bg-primary/5 p-3 text-primary"
              data-testid="mobile-user-xp-panel"
            >
              <div class="flex items-center justify-between mb-2">
                <div>
                  <p class="text-xs text-gray-500">当前经验</p>
                  <p class="text-xl font-bold">{{ formattedExp }} XP</p>
                </div>
                <div class="text-right text-sm">
                  <p class="font-semibold">{{ currentRealm.name }}</p>
                  <p class="text-xs text-gray-500">
                    <span v-if="nextRealm">还差 {{ formattedRemainingExp }} XP</span>
                    <span v-else>已达最高境界</span>
                  </p>
                </div>
              </div>
              <div class="w-full h-2 bg-white rounded-full overflow-hidden mb-2">
                <div class="h-full bg-accent" :style="{ width: progress + '%' }"></div>
              </div>
              <div class="flex justify-between text-xs text-gray-500">
                <span>每日一签 +50 XP</span>
                <span>再抽 -30 XP</span>
              </div>
            </div>
            <router-link
              :to="{ name: 'Profile' }"
              class="mt-3 inline-flex items-center text-sm font-semibold text-primary hover:text-accent transition-colors"
              data-testid="mobile-profile-nav-link"
              @click="isMobileMenuOpen = false"
            >
              <i class="fas fa-id-card mr-2"></i>进入个人中心
            </router-link>
          </div>
          <button @click="logout" class="w-full text-left px-2 py-2 text-secondary hover:text-red-500 transition-colors flex items-center">
            <i class="fas fa-sign-out-alt mr-2"></i>退出登录
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useCultivationStore } from '@/stores/cultivation'
import { useNotificationStore } from '@/stores/notification'
import { prefetchRoute } from '@/router'
import SoundControl from './SoundControl.vue'

const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)
const isZenMode = ref(false)
const isRetroMode = ref(false)
const isXpPopoverOpen = ref(false)
const isMobileXpPanelOpen = ref(false)
const xpPopoverRef = ref<HTMLElement | null>(null)

const authStore = useAuthStore()
const { isLoggedIn, user, showPricingModal } = storeToRefs(authStore)
const { logout } = authStore

const notifStore = useNotificationStore()

const expiryDate = computed(() => {
  const expiry = user.value?.subscription?.expiryDate
  if (!expiry) return null
  return new Date(expiry)
})

const remainingDaysText = computed(() => {
  if (!expiryDate.value) return ''
  const now = new Date()
  const diff = Math.ceil((expiryDate.value.getTime() - now.getTime()) / 86400000)
  if (diff < 0) return '(已过期)'
  if (diff === 0) return '(今日到期)'
  if (diff < 30) return '(剩余 ' + diff + ' 天)'
  if (diff < 365) {
    const months = Math.floor(diff / 30)
    const days = diff % 30
    return days > 0 ? `(剩余 ${months} 个月 ${days} 天)` : `(剩余 ${months} 个月)`
  }
  const years = Math.floor(diff / 365)
  const months = Math.floor((diff % 365) / 30)
  return months > 0 ? `(剩余 ${years} 年 ${months} 个月)` : `(剩余 ${years} 年)`
})

const expiryTooltip = computed(() => {
  if (!expiryDate.value) return '永不过期'
  return '到期时间: ' + expiryDate.value.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
})

const currentTier = computed(() => user.value?.subscription?.tier || 'free')

const tierMeta = computed(() => {
  const map: Record<string, { label: string; icon: string; buttonClass: string; mobileButtonClass: string; iconClass: string }> = {
    free: {
      label: '会员',
      icon: 'fas fa-crown',
      buttonClass: 'border-transparent bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:from-amber-500 hover:to-orange-600',
      mobileButtonClass: 'border-transparent bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:from-amber-500 hover:to-orange-600',
      iconClass: 'bg-white/20 text-white'
    },
    pro: {
      label: '居士',
      icon: 'fas fa-seedling',
      buttonClass: 'border-primary/20 bg-primary/10 text-primary hover:bg-primary/15',
      mobileButtonClass: 'border-primary/15 bg-primary/5 text-primary hover:bg-primary/10',
      iconClass: 'bg-primary text-white'
    },
    master: {
      label: '宗师',
      icon: 'fas fa-gem',
      buttonClass: 'border-amber-300 bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600',
      mobileButtonClass: 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100',
      iconClass: 'bg-amber-500 text-white'
    },
    team: {
      label: '团队',
      icon: 'fas fa-users',
      buttonClass: 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100',
      mobileButtonClass: 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100',
      iconClass: 'bg-blue-600 text-white'
    }
  }

  return map[currentTier.value] || {
    label: currentTier.value,
    icon: 'fas fa-certificate',
    buttonClass: 'border-primary/20 bg-primary/10 text-primary hover:bg-primary/15',
    mobileButtonClass: 'border-primary/15 bg-primary/5 text-primary hover:bg-primary/10',
    iconClass: 'bg-primary text-white'
  }
})

const hasMembershipLevel = computed(() => isLoggedIn.value && currentTier.value !== 'free')

const membershipStatus = computed(() => {
  if (!hasMembershipLevel.value) {
    return {
      state: 'upgrade',
      label: '会员',
      mobileLabel: '开通会员',
      icon: 'fas fa-crown',
      buttonClass: 'border-transparent bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:from-amber-500 hover:to-orange-600',
      mobileButtonClass: 'border-transparent bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:from-amber-500 hover:to-orange-600',
      iconClass: 'bg-white/20 text-white',
      title: '升级会员'
    }
  }

  return {
    state: 'level',
    label: tierMeta.value.label,
    mobileLabel: `${tierMeta.value.label}会员`,
    icon: tierMeta.value.icon,
    buttonClass: tierMeta.value.buttonClass,
    mobileButtonClass: tierMeta.value.mobileButtonClass,
    iconClass: tierMeta.value.iconClass,
    title: `${tierMeta.value.label}会员，${expiryTooltip.value}`
  }
})

const cultivationStore = useCultivationStore()
const { exp, currentRealm, nextRealm, progress } = storeToRefs(cultivationStore)

const numberFormatter = new Intl.NumberFormat('zh-CN')
const formattedExp = computed(() => numberFormatter.format(exp.value))
const remainingExp = computed(() => {
  if (!nextRealm.value) return 0
  return Math.max(nextRealm.value.minExp - exp.value, 0)
})
const formattedRemainingExp = computed(() => numberFormatter.format(remainingExp.value))


const routes = [
  { name: 'Home', title: '首页' },
  { name: 'AIInterpretation', title: 'AI解读' },
  { name: 'LearningPath', title: '学习路径' },
  { name: 'ResourceLibrary', title: '资源库' },
  { name: 'Community', title: '共创社区' },
  { name: 'About', title: '关于' }
]

let scrollTicking = false
const handleScroll = () => {
  // 用 rAF 节流：每帧最多读一次 scrollY，避免与 Three.js 背景帧抢主线程
  if (scrollTicking) return
  scrollTicking = true
  requestAnimationFrame(() => {
    isScrolled.value = window.scrollY > 50
    scrollTicking = false
  })
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

const openPricingModal = () => {
  showPricingModal.value = true
}

const openPricingFromMobile = () => {
  openPricingModal()
  closeMobileMenu()
}

const toggleXpPopover = () => {
  isXpPopoverOpen.value = !isXpPopoverOpen.value
}

const toggleMobileXpPanel = () => {
  isMobileXpPanelOpen.value = !isMobileXpPanelOpen.value
}

const closeXpPopover = () => {
  isXpPopoverOpen.value = false
}

const handleDocumentClick = (event: MouseEvent) => {
  if (!isXpPopoverOpen.value) return
  const target = event.target as Node | null
  if (target && xpPopoverRef.value?.contains(target)) return
  closeXpPopover()
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeXpPopover()
    isMobileXpPanelOpen.value = false
  }
}

const toggleZenMode = () => {
  isZenMode.value = !isZenMode.value
  if (isZenMode.value) {
    document.documentElement.classList.add('zen-mode')
  } else {
    document.documentElement.classList.remove('zen-mode')
  }
}

const toggleRetroMode = () => {
  isRetroMode.value = !isRetroMode.value
  if (isRetroMode.value) {
    document.documentElement.classList.add('retro-mode')
  } else {
    document.documentElement.classList.remove('retro-mode')
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  document.addEventListener('click', handleDocumentClick)
  document.addEventListener('keydown', handleKeydown)
  notifStore.startPolling()

  // 空闲时预取高频主路由 chunk，避免首次点击导航时才下载产生卡顿
  // 已访问过的路由会命中模块缓存，prefetchRoute 内部也有去重
  const idlePrefetch = () => {
    const targets = ['Home', 'AIInterpretation', 'LearningPath', 'Community', 'ResourceLibrary']
    targets.forEach(name => prefetchRoute(name))
  }
  const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback
  if (typeof ric === 'function') {
    ric(idlePrefetch, { timeout: 3000 })
  } else {
    setTimeout(idlePrefetch, 1500)
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('click', handleDocumentClick)
  document.removeEventListener('keydown', handleKeydown)
  notifStore.stopPolling()
})
</script>

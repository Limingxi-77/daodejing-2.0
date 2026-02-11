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

        <div v-if="!isLoggedIn" class="flex space-x-4">
          <button @click="openAuthModal('login')" class="px-4 py-2 btn-secondary rounded-md ink-splash">登录</button>
          <button @click="openAuthModal('register')" class="px-4 py-2 btn-primary rounded-md ink-splash">注册</button>
        </div>

        <!-- 用户信息（登录后显示） -->
        <div v-else class="flex items-center space-x-4">
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
              <i class="fas fa-user"></i>
            </div>
            <span class="text-primary font-semibold">{{ user?.name || '用户' }}</span>
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
          :class="['py-2 transition-colors', $route.name === route.name ? 'text-accent font-semibold' : 'text-primary hover:text-accent']"
          @click="closeMobileMenu"
        >
          {{ route.title }}
        </router-link>
        
        <div v-if="!isLoggedIn" class="flex space-x-4 pt-2">
          <button @click="openAuthModal('login')" class="flex-1 px-4 py-2 btn-secondary rounded-md ink-splash">登录</button>
          <button @click="openAuthModal('register')" class="flex-1 px-4 py-2 btn-primary rounded-md ink-splash">注册</button>
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
          <div class="flex items-center space-x-3 px-2">
            <div class="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
              <i class="fas fa-user text-lg"></i>
            </div>
            <span class="text-primary font-semibold">{{ user?.name || '用户' }}</span>
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
import { ref, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useCultivationStore } from '@/stores/cultivation'
import SoundControl from './SoundControl.vue'

const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)
const isZenMode = ref(false)
const isRetroMode = ref(false)

const authStore = useAuthStore()
const { isLoggedIn, user } = storeToRefs(authStore)
const { openAuthModal, logout } = authStore

const cultivationStore = useCultivationStore()
const { currentRealm, progress } = storeToRefs(cultivationStore)


const routes = [
  { name: 'Home', title: '首页' },
  { name: 'AIInterpretation', title: 'AI解读' },
  { name: 'LearningPath', title: '学习路径' },
  { name: 'ResourceLibrary', title: '资源库' },
  { name: 'Community', title: '共创社区' },
  { name: 'About', title: '关于' }
]

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
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
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

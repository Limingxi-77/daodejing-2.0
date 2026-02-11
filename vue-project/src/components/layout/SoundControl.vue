<template>
  <div class="relative group">
    <!-- 触发按钮 -->
    <button 
      @click="togglePanel"
      class="w-10 h-10 rounded-full flex items-center justify-center transition-colors text-primary hover:bg-secondary/10"
      :class="{ 'bg-secondary/10': isOpen }"
      title="环境音效"
    >
      <i class="fas fa-music"></i>
    </button>

    <!-- 控制面板 -->
    <transition name="fade">
      <div 
        v-if="isOpen"
        class="absolute right-0 top-14 w-64 bg-white rounded-xl shadow-xl p-4 border border-secondary/20 z-50 backdrop-blur-md bg-white/90"
      >
        <div class="text-sm font-bold text-primary mb-4 flex justify-between items-center">
          <span>白噪音 · 冥想</span>
          <button @click="isOpen = false" class="text-gray-400 hover:text-primary">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- 雨声控制 -->
        <div class="mb-4">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm text-dark flex items-center">
              <i class="fas fa-cloud-rain w-6 text-center mr-2 text-blue-400"></i>
              听雨
            </span>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="isRainOn" class="sr-only peer">
              <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          <input 
            type="range" 
            v-model="rainVolume" 
            min="0" 
            max="1" 
            step="0.1"
            :disabled="!isRainOn"
            class="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50 accent-primary"
          >
        </div>

        <!-- 自动播放设置 -->
        <div class="mb-4 pt-3 border-t border-gray-100">
          <div class="flex justify-between items-center">
            <span class="text-sm text-dark flex items-center">
              <i class="fas fa-magic w-6 text-center mr-2 text-purple-400"></i>
              入场自动播放
            </span>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="autoPlay" class="sr-only peer">
              <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          <p class="text-xs text-gray-400 mt-1">
            开启后，进入网站将尝试自动播放雨声（需浏览器权限）。
          </p>
        </div>

        <!-- 静心打坐 -->
        <div class="mb-2 pt-3 border-t border-gray-100">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm text-dark flex items-center">
              <i class="fas fa-spa w-6 text-center mr-2 text-green-500"></i>
              静心打坐
            </span>
          </div>
          
          <div v-if="!isMeditating" class="flex flex-col gap-2">
            <div class="flex justify-between gap-2">
              <button 
                v-for="time in [5, 15, 30]" 
                :key="time"
                @click="selectedTime = time"
                class="flex-1 py-1 text-xs rounded border transition-colors"
                :class="selectedTime === time ? 'bg-primary text-white border-primary' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'"
              >
                {{ time }}分
              </button>
            </div>
            <button 
              @click="startMeditation"
              class="w-full py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors"
            >
              开始静修
            </button>
          </div>

          <div v-else class="text-center py-2 bg-primary/5 rounded-lg border border-primary/10">
            <div class="text-2xl font-mono text-primary font-bold mb-1">
              {{ formatTime(timeLeft) }}
            </div>
            <div class="text-xs text-gray-500 mb-2">静修中... +{{ selectedTime * 10 }} 功德</div>
            <button 
              @click="stopMeditation"
              class="text-xs text-red-400 hover:text-red-500 underline"
            >
              结束静修
            </button>
          </div>
        </div>

        <!-- 颂钵控制 -->
        <div class="mb-2">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm text-dark flex items-center">
              <i class="fas fa-bell w-6 text-center mr-2 text-yellow-500"></i>
              颂钵
            </span>
            <button 
              @click="playBowl"
              class="px-3 py-1 text-xs bg-primary text-white rounded-full hover:bg-primary/90 active:scale-95 transition-transform relative overflow-hidden group"
            >
              <span class="relative z-10">敲击</span>
              <span 
                v-if="isBowlAnimating" 
                class="absolute inset-0 bg-white/30 rounded-full animate-ripple"
              ></span>
            </button>
          </div>
          
          <!-- 颂钵波纹动画 -->
          <div class="h-12 flex items-center justify-center relative overflow-hidden rounded-lg bg-gray-50 border border-gray-100 transition-colors" :class="{ 'bg-primary/5 border-primary/20': isBowlAnimating }">
            <div v-if="isBowlAnimating" class="absolute inset-0 flex items-center justify-center">
              <div class="w-2 h-2 bg-yellow-500 rounded-full absolute animate-ping-slow opacity-75"></div>
              <div class="w-6 h-6 border border-yellow-500 rounded-full absolute animate-ping-slow delay-150 opacity-50"></div>
              <div class="w-10 h-10 border border-yellow-500 rounded-full absolute animate-ping-slow delay-300 opacity-25"></div>
            </div>
            <p v-else class="text-xs text-gray-400">
              点击上方按钮敲击
            </p>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted, onMounted } from 'vue'
import { audioEngine } from '@/utils/audioEngine'
import { useZenStore } from '@/stores/zen'
import { useCultivationStore } from '@/stores/cultivation'
import { storeToRefs } from 'pinia'

const zenStore = useZenStore()
const cultivationStore = useCultivationStore()
const { isBowlAnimating } = storeToRefs(zenStore)
const { triggerBowl } = zenStore

const isOpen = ref(false)
const isRainOn = ref(false)
const rainVolume = ref(0.5)
const autoPlay = ref(false)

// 打坐相关
const isMeditating = ref(false)
const selectedTime = ref(5)
const timeLeft = ref(0)
let meditationTimer: number | null = null

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

const startMeditation = () => {
  isMeditating.value = true
  timeLeft.value = selectedTime.value * 60
  
  // 自动开启雨声（如果没开）
  if (!isRainOn.value) {
    isRainOn.value = true
  }
  
  // 敲一声钵
  triggerBowl()
  
  meditationTimer = window.setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) {
      completeMeditation()
    }
  }, 1000)
}

const stopMeditation = () => {
  if (meditationTimer) {
    clearInterval(meditationTimer)
    meditationTimer = null
  }
  isMeditating.value = false
}

const completeMeditation = () => {
  stopMeditation()
  triggerBowl() // 结束钟声
  cultivationStore.addExp(selectedTime.value * 10, '静心打坐')
}

const togglePanel = () => {
  isOpen.value = !isOpen.value
}

// 监听雨声开关
watch(isRainOn, (val) => {
  audioEngine.toggleRain(val, rainVolume.value)
})

// 监听自动播放开关
watch(autoPlay, (val) => {
  localStorage.setItem('soundAutoPlay', val ? 'true' : 'false')
})

// 监听音量变化
watch(rainVolume, (val) => {
  if (isRainOn.value) {
    audioEngine.setRainVolume(val)
  }
})

// 播放颂钵
const playBowl = () => {
  triggerBowl()
}

// 初始化
onMounted(() => {
  // 读取自动播放设置
  const savedAutoPlay = localStorage.getItem('soundAutoPlay')
  if (savedAutoPlay === 'true') {
    autoPlay.value = true
    
    // 尝试自动播放
    const tryPlay = () => {
      isRainOn.value = true
      document.removeEventListener('click', tryPlay)
    }
    document.addEventListener('click', tryPlay, { once: true })
  }
})

// 组件销毁时停止声音
onUnmounted(() => {
  if (meditationTimer) {
    clearInterval(meditationTimer)
  }
})
</script>

<style scoped>
/* 禅模式适配 */
:global(html.zen-mode) .bg-white\/90 {
  background-color: rgba(44, 44, 46, 0.95) !important;
  border-color: #d4b483;
}

:global(html.zen-mode) .text-dark {
  color: #d1d5db !important;
}

:global(html.zen-mode) .text-gray-500 {
  color: #9ca3af !important;
}
</style>
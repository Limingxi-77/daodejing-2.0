<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
    <div 
      class="bg-white rounded-xl shadow-2xl max-w-md w-full relative overflow-hidden transform transition-all duration-500 animate-slide-up border-2 border-primary/20"
      :class="{'border-yellow-500': type === 'epiphany', 'border-purple-500': type === 'guest', 'border-blue-500': type === 'relic'}"
    >
      <!-- 背景装饰 -->
      <div class="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none">
        <i class="fas fa-yin-yang text-9xl"></i>
      </div>
      
      <!-- 内容区域 -->
      <div class="p-8 text-center relative z-10">
        <!-- 图标 -->
        <div 
          class="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl mb-6 shadow-lg animate-float"
          :class="{
            'bg-yellow-100 text-yellow-600': type === 'epiphany',
            'bg-purple-100 text-purple-600': type === 'guest',
            'bg-blue-100 text-blue-600': type === 'relic'
          }"
        >
          <i :class="icon"></i>
        </div>
        
        <!-- 标题 -->
        <h3 class="text-2xl font-bold text-dark mb-2 font-serif">{{ title }}</h3>
        
        <!-- 描述 -->
        <p class="text-gray-600 mb-6 leading-relaxed italic">
          "{{ description }}"
        </p>
        
        <!-- 奖励 -->
        <div class="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-100">
          <p class="text-sm text-gray-500 mb-1">获得机缘</p>
          <p class="text-xl font-bold text-primary">+{{ xp }} 功德</p>
        </div>
        
        <!-- 按钮 -->
        <button 
          @click="$emit('close')"
          class="px-8 py-3 rounded-full text-white font-bold shadow-md transition-transform hover:-translate-y-1 active:scale-95"
          :class="{
            'bg-yellow-500 hover:bg-yellow-600': type === 'epiphany',
            'bg-purple-500 hover:bg-purple-600': type === 'guest',
            'bg-blue-500 hover:bg-blue-600': type === 'relic'
          }"
        >
          收入囊中
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  type: 'epiphany' | 'guest' | 'relic'
  description: string
  xp: number
}>()

defineEmits(['close'])

const title = computed(() => {
  switch (props.type) {
    case 'epiphany': return '顿悟时刻'
    case 'guest': return '贵人相助'
    case 'relic': return '发现遗物'
    default: return '奇遇'
  }
})

const icon = computed(() => {
  switch (props.type) {
    case 'epiphany': return 'fas fa-lightbulb'
    case 'guest': return 'fas fa-user-friends'
    case 'relic': return 'fas fa-scroll'
    default: return 'fas fa-star'
  }
})
</script>

<style scoped>
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.animate-slide-up {
  animation: slideUp 0.4s ease-out forwards;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

/* 禅模式适配 */
:global(html.zen-mode) .bg-white {
  background-color: #2c2c2e;
  color: #d4b483;
}

:global(html.zen-mode) .text-dark {
  color: #d4b483;
}

:global(html.zen-mode) .bg-gray-50 {
  background-color: rgba(255,255,255,0.05);
  border-color: rgba(255,255,255,0.1);
}
</style>
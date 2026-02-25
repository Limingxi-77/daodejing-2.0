<template>
  <div class="fixed inset-0 pointer-events-none z-[9999] flex items-center justify-center overflow-hidden">
    <!-- 钵音波纹容器 -->
    <div v-if="isBowlAnimating" class="relative w-full h-full flex items-center justify-center">
      <!-- 核心光点 -->
      <div class="absolute w-4 h-4 bg-primary/80 rounded-full shadow-[0_0_20px_theme('colors.primary')] animate-fade-out"></div>
      
      <!-- 多层扩散波纹 -->
      <div class="ripple-ring delay-0"></div>
      <div class="ripple-ring delay-150"></div>
      <div class="ripple-ring delay-300"></div>
      <div class="ripple-ring delay-500"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useZenStore } from '@/stores/zen'

const zenStore = useZenStore()
const { isBowlAnimating } = storeToRefs(zenStore)
</script>

<style scoped>
.ripple-ring {
  @apply absolute rounded-full border border-primary/40 opacity-0;
  animation: ripple-expand 3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

.delay-0 { animation-delay: 0s; }
.delay-150 { animation-delay: 0.3s; }
.delay-300 { animation-delay: 0.6s; }
.delay-500 { animation-delay: 1s; }

@keyframes ripple-expand {
  0% {
    width: 0;
    height: 0;
    opacity: 0.8;
    border-width: 4px;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    width: 150vmax; /* 确保覆盖全屏 */
    height: 150vmax;
    opacity: 0;
    border-width: 0px;
  }
}

.animate-fade-out {
  animation: fadeOut 1s ease-out forwards;
}

@keyframes fadeOut {
  from { opacity: 1; transform: scale(1); }
  to { opacity: 0; transform: scale(2); }
}

/* 禅模式适配：波纹更亮一点 */
:global(html.zen-mode) .ripple-ring {
  @apply border-[#d4b483]/50;
  box-shadow: 0 0 15px rgba(212, 180, 131, 0.1);
}
</style>

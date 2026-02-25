<template>
  <div v-if="showPricingModal" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
    <div class="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto relative border border-secondary/20">
      
      <!-- Close Button -->
      <button @click="closeModal" class="absolute top-4 right-4 text-gray-400 hover:text-dark transition-colors z-10">
        <i class="fas fa-times text-2xl"></i>
      </button>

      <div class="p-8 md:p-12">
        <div class="text-center mb-10">
          <h2 class="text-3xl font-bold text-primary mb-3 font-serif">选择您的修行之路</h2>
          <p class="text-gray-500">解锁更多智慧，开启深度悟道之旅</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Free Plan -->
          <div class="border rounded-xl p-6 relative flex flex-col hover:shadow-lg transition-shadow bg-gray-50/50">
            <div class="mb-4">
              <h3 class="text-xl font-bold text-dark">布衣 (免费版)</h3>
              <div class="text-3xl font-bold text-primary mt-2">¥0<span class="text-sm text-gray-500 font-normal">/月</span></div>
            </div>
            <ul class="space-y-3 mb-8 flex-1">
              <li class="flex items-center text-sm text-gray-600">
                <i class="fas fa-check text-green-500 mr-2"></i> 每日 5 次 AI 对话
              </li>
              <li class="flex items-center text-sm text-gray-600">
                <i class="fas fa-check text-green-500 mr-2"></i> 基础解读模型
              </li>
              <li class="flex items-center text-sm text-gray-600">
                <i class="fas fa-check text-green-500 mr-2"></i> 每日一签
              </li>
            </ul>
            <button class="w-full py-3 rounded-lg border border-primary text-primary font-bold cursor-not-allowed opacity-50" disabled>
              当前方案
            </button>
          </div>

          <!-- Pro Plan -->
          <div class="border-2 border-primary rounded-xl p-6 relative flex flex-col shadow-xl transform md:-translate-y-4 bg-white">
            <div class="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-bold shadow-md">
              最受欢迎
            </div>
            <div class="mb-4">
              <h3 class="text-xl font-bold text-dark">居士 (修行版)</h3>
              <div class="text-3xl font-bold text-primary mt-2">¥19<span class="text-sm text-gray-500 font-normal">/月</span></div>
            </div>
            <ul class="space-y-3 mb-8 flex-1">
              <li class="flex items-center text-sm text-dark font-medium">
                <i class="fas fa-check text-primary mr-2"></i> 每日 50 次 AI 对话
              </li>
              <li class="flex items-center text-sm text-dark font-medium">
                <i class="fas fa-check text-primary mr-2"></i> 解锁“道家隐士”人格
              </li>
              <li class="flex items-center text-sm text-dark font-medium">
                <i class="fas fa-check text-primary mr-2"></i> 深度哲学解析
              </li>
              <li class="flex items-center text-sm text-dark font-medium">
                <i class="fas fa-check text-primary mr-2"></i> 优先响应速度
              </li>
            </ul>
            <button 
              @click="upgrade('pro')" 
              class="w-full py-3 rounded-lg bg-primary text-white font-bold hover:bg-primary/90 transition-colors shadow-lg"
            >
              立即升级
            </button>
          </div>

          <!-- Master Plan -->
          <div class="border rounded-xl p-6 relative flex flex-col hover:shadow-lg transition-shadow bg-gradient-to-b from-yellow-50 to-white">
            <div class="mb-4">
              <h3 class="text-xl font-bold text-dark">宗师 (悟道版)</h3>
              <div class="text-3xl font-bold text-primary mt-2">¥49<span class="text-sm text-gray-500 font-normal">/月</span></div>
            </div>
            <ul class="space-y-3 mb-8 flex-1">
              <li class="flex items-center text-sm text-gray-600">
                <i class="fas fa-check text-yellow-600 mr-2"></i> 无限次 AI 对话
              </li>
              <li class="flex items-center text-sm text-gray-600">
                <i class="fas fa-check text-yellow-600 mr-2"></i> 解锁全套人格 (含心理疗愈)
              </li>
              <li class="flex items-center text-sm text-gray-600">
                <i class="fas fa-check text-yellow-600 mr-2"></i> 专属 1v1 深度问答
              </li>
              <li class="flex items-center text-sm text-gray-600">
                <i class="fas fa-check text-yellow-600 mr-2"></i> 新功能优先体验
              </li>
            </ul>
            <button 
              @click="upgrade('master')" 
              class="w-full py-3 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-bold hover:from-yellow-600 hover:to-yellow-700 transition-colors shadow-md"
            >
              成为宗师
            </button>
          </div>
        </div>
        
        <p class="text-center text-xs text-gray-400 mt-8">
          * 这是一个演示项目，点击按钮将模拟支付过程并直接升级
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAuthStore, type SubscriptionTier } from '@/stores/auth'

const authStore = useAuthStore()
const { showPricingModal } = storeToRefs(authStore)

const closeModal = () => {
  showPricingModal.value = false
}

const upgrade = (tier: SubscriptionTier) => {
  // Simulate payment processing
  const btn = document.activeElement as HTMLButtonElement
  const originalText = btn.innerText
  btn.innerText = '支付中...'
  btn.disabled = true
  
  setTimeout(() => {
    authStore.upgradeSubscription(tier)
    btn.innerText = originalText
    btn.disabled = false
    alert(`恭喜！您已成功升级为 ${tier === 'pro' ? '居士' : '宗师'}！`)
  }, 1500)
}
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

/* Zen Mode Adaptation */
:global(html.zen-mode) .bg-white {
  background-color: #2c2c2e;
  color: #d4b483;
  border-color: #3f3f46;
}

:global(html.zen-mode) .bg-gray-50\/50,
:global(html.zen-mode) .bg-gradient-to-b {
  background: rgba(255,255,255,0.05);
  background-image: none;
}

:global(html.zen-mode) .text-dark {
  color: #d4b483;
}

:global(html.zen-mode) .text-gray-500,
:global(html.zen-mode) .text-gray-600 {
  color: #9ca3af;
}

:global(html.zen-mode) .border {
  border-color: #3f3f46;
}
</style>

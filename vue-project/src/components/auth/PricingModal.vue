<template>
  <div v-if="showPricingModal" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
    <div class="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto relative border border-secondary/20">
      
      <button @click="closeModal" class="absolute top-4 right-4 text-gray-400 hover:text-dark transition-colors z-10">
        <i class="fas fa-times text-2xl"></i>
      </button>

      <div class="p-8 md:p-12">
        <div class="text-center mb-10">
          <h2 class="text-3xl font-bold text-primary mb-3 font-serif">选择您的修行之路</h2>
          <p class="text-gray-500">解锁更多智慧，开启深度悟道之旅</p>
        </div>

        <div v-if="couponCode" class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-center">
          <div class="flex items-center justify-center gap-2 text-green-700">
            <i class="fas fa-tag"></i>
            <span class="font-bold">优惠码已应用</span>
          </div>
          <p class="text-sm text-green-600 mt-1">{{ couponCode }} - 立减 ¥{{ discountAmount }}</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="border rounded-xl p-6 relative flex flex-col hover:shadow-lg transition-shadow bg-gray-50/50">
            <div class="mb-4">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <i class="fas fa-user text-gray-500"></i>
                </div>
                <h3 class="text-xl font-bold text-dark">布衣</h3>
              </div>
              <div class="text-3xl font-bold text-primary mt-2">¥0<span class="text-sm text-gray-500 font-normal">/月</span></div>
              <p class="text-xs text-gray-400 mt-1">永久免费</p>
            </div>
            
            <div class="space-y-2 mb-6 flex-1">
              <div class="text-sm font-medium text-dark mb-2">AI 对话</div>
              <div class="flex items-center text-sm text-gray-600">
                <i class="fas fa-comment-dots text-gray-400 w-5 mr-2"></i>
                每日 5 次 AI 对话
              </div>
              <div class="flex items-center text-sm text-gray-600">
                <i class="fas fa-user-tie text-gray-400 w-5 mr-2"></i>
                基础"学者"人格
              </div>
              
              <div class="text-sm font-medium text-dark mb-2 mt-4">学习功能</div>
              <div class="flex items-center text-sm text-gray-600">
                <i class="fas fa-book-open text-gray-400 w-5 mr-2"></i>
                基础章节解读
              </div>
              <div class="flex items-center text-sm text-gray-600">
                <i class="fas fa-calendar-day text-gray-400 w-5 mr-2"></i>
                每日一签
              </div>
              <div class="flex items-center text-sm text-gray-600">
                <i class="fas fa-users text-gray-400 w-5 mr-2"></i>
                社区基础功能
              </div>
              
              <div class="text-sm font-medium text-dark mb-2 mt-4">资源库</div>
              <div class="flex items-center text-sm text-gray-600">
                <i class="fas fa-file-alt text-gray-400 w-5 mr-2"></i>
                免费资源访问
              </div>
            </div>
            
            <button 
              v-if="currentTier === 'free'"
              class="w-full py-3 rounded-lg border border-gray-300 text-gray-400 font-bold cursor-not-allowed" 
              disabled
            >
              当前方案
            </button>
            <button 
              v-else
              @click="downgrade('free')"
              class="w-full py-3 rounded-lg border border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition-colors"
            >
              降级为此方案
            </button>
          </div>

          <div class="border-2 border-primary rounded-xl p-6 relative flex flex-col shadow-xl transform md:-translate-y-4 bg-white">
            <div class="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-bold shadow-md">
              最受欢迎
            </div>
            <div class="mb-4">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <i class="fas fa-graduation-cap text-primary"></i>
                </div>
                <h3 class="text-xl font-bold text-dark">居士</h3>
              </div>
              <div class="text-3xl font-bold text-primary mt-2">
                <span v-if="couponCode" class="line-through text-gray-400 text-xl mr-2">¥19</span>
                ¥{{ getDiscountedPrice(19) }}<span class="text-sm text-gray-500 font-normal">/月</span>
              </div>
              <p class="text-xs text-gray-400 mt-1">按月订阅，随时取消</p>
            </div>
            
            <div class="space-y-2 mb-6 flex-1">
              <div class="text-sm font-medium text-dark mb-2">AI 对话</div>
              <div class="flex items-center text-sm text-dark">
                <i class="fas fa-comment-dots text-primary w-5 mr-2"></i>
                <span class="font-medium">每日 50 次 AI 对话</span>
              </div>
              <div class="flex items-center text-sm text-dark">
                <i class="fas fa-user-tie text-primary w-5 mr-2"></i>
                <span class="font-medium">解锁"道家隐士"人格</span>
              </div>
              <div class="flex items-center text-sm text-dark">
                <i class="fas fa-bolt text-primary w-5 mr-2"></i>
                <span class="font-medium">优先响应速度</span>
              </div>
              
              <div class="text-sm font-medium text-dark mb-2 mt-4">学习功能</div>
              <div class="flex items-center text-sm text-dark">
                <i class="fas fa-book-open text-primary w-5 mr-2"></i>
                <span class="font-medium">深度哲学解析</span>
              </div>
              <div class="flex items-center text-sm text-dark">
                <i class="fas fa-download text-primary w-5 mr-2"></i>
                <span class="font-medium">对话历史导出</span>
              </div>
              <div class="flex items-center text-sm text-dark">
                <i class="fas fa-users text-primary w-5 mr-2"></i>
                <span class="font-medium">社区高级功能</span>
              </div>
              
              <div class="text-sm font-medium text-dark mb-2 mt-4">资源库</div>
              <div class="flex items-center text-sm text-dark">
                <i class="fas fa-file-alt text-primary w-5 mr-2"></i>
                <span class="font-medium">高级资源访问</span>
              </div>
              <div class="flex items-center text-sm text-dark">
                <i class="fas fa-percent text-primary w-5 mr-2"></i>
                <span class="font-medium">付费资源 9 折优惠</span>
              </div>
            </div>
            
            <button 
              v-if="currentTier === 'pro'"
              class="w-full py-3 rounded-lg bg-primary/20 text-primary font-bold cursor-not-allowed" 
              disabled
            >
              当前方案
            </button>
            <button 
              v-else
              @click="upgrade('pro')" 
              class="w-full py-3 rounded-lg bg-primary text-white font-bold hover:bg-primary/90 transition-colors shadow-lg"
            >
              立即升级
            </button>
          </div>

          <div class="border rounded-xl p-6 relative flex flex-col hover:shadow-lg transition-shadow bg-gradient-to-b from-yellow-50 to-white">
            <div class="absolute top-2 right-2">
              <span class="px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded">VIP</span>
            </div>
            <div class="mb-4">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                  <i class="fas fa-crown text-white"></i>
                </div>
                <h3 class="text-xl font-bold text-dark">宗师</h3>
              </div>
              <div class="text-3xl font-bold text-primary mt-2">
                <span v-if="couponCode" class="line-through text-gray-400 text-xl mr-2">¥49</span>
                ¥{{ getDiscountedPrice(49) }}<span class="text-sm text-gray-500 font-normal">/月</span>
              </div>
              <p class="text-xs text-gray-400 mt-1">尊享全部特权</p>
            </div>
            
            <div class="space-y-2 mb-6 flex-1">
              <div class="text-sm font-medium text-dark mb-2">AI 对话</div>
              <div class="flex items-center text-sm text-gray-700">
                <i class="fas fa-infinity text-yellow-500 w-5 mr-2"></i>
                <span class="font-medium">无限次 AI 对话</span>
              </div>
              <div class="flex items-center text-sm text-gray-700">
                <i class="fas fa-user-tie text-yellow-500 w-5 mr-2"></i>
                <span class="font-medium">解锁全部人格（含心理疗愈）</span>
              </div>
              <div class="flex items-center text-sm text-gray-700">
                <i class="fas fa-headset text-yellow-500 w-5 mr-2"></i>
                <span class="font-medium">专属 1v1 深度问答</span>
              </div>
              
              <div class="text-sm font-medium text-dark mb-2 mt-4">学习功能</div>
              <div class="flex items-center text-sm text-gray-700">
                <i class="fas fa-briefcase text-yellow-500 w-5 mr-2"></i>
                <span class="font-medium">道商课程全部解锁</span>
              </div>
              <div class="flex items-center text-sm text-gray-700">
                <i class="fas fa-flask text-yellow-500 w-5 mr-2"></i>
                <span class="font-medium">新功能优先体验</span>
              </div>
              <div class="flex items-center text-sm text-gray-700">
                <i class="fas fa-certificate text-yellow-500 w-5 mr-2"></i>
                <span class="font-medium">学习证书认证</span>
              </div>
              
              <div class="text-sm font-medium text-dark mb-2 mt-4">资源库</div>
              <div class="flex items-center text-sm text-gray-700">
                <i class="fas fa-file-alt text-yellow-500 w-5 mr-2"></i>
                <span class="font-medium">全部资源免费访问</span>
              </div>
              <div class="flex items-center text-sm text-gray-700">
                <i class="fas fa-percent text-yellow-500 w-5 mr-2"></i>
                <span class="font-medium">付费资源 8 折优惠</span>
              </div>
            </div>
            
            <button 
              v-if="currentTier === 'master'"
              class="w-full py-3 rounded-lg bg-yellow-100 text-yellow-700 font-bold cursor-not-allowed" 
              disabled
            >
              当前方案
            </button>
            <button 
              v-else
              @click="upgrade('master')" 
              class="w-full py-3 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-bold hover:from-yellow-600 hover:to-yellow-700 transition-colors shadow-md"
            >
              成为宗师
            </button>
          </div>
        </div>

        <div class="mt-8 p-4 bg-gray-50 rounded-lg">
          <div class="flex items-center gap-2 mb-3">
            <i class="fas fa-tag text-primary"></i>
            <span class="font-medium text-dark">优惠码</span>
          </div>
          <div class="flex gap-2">
            <input
              v-model="inputCouponCode"
              type="text"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="输入优惠码"
            >
            <button
              @click="applyCoupon"
              class="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              应用
            </button>
          </div>
          <p v-if="couponError" class="text-red-500 text-sm mt-2">{{ couponError }}</p>
        </div>
        
        <p class="text-center text-xs text-gray-400 mt-6">
          * 这是一个演示项目，点击按钮将模拟支付过程并直接升级
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore, type SubscriptionTier } from '@/stores/auth'

const authStore = useAuthStore()
const { showPricingModal, user } = storeToRefs(authStore)

const inputCouponCode = ref('')
const couponCode = ref('')
const discountAmount = ref(0)
const couponError = ref('')

const currentTier = computed(() => user.value?.subscription.tier || 'free')

const validCoupons: Record<string, { discount: number; type: 'fixed' | 'percent' }> = {
  'DAO2024': { discount: 10, type: 'fixed' },
  'WELCOME20': { discount: 20, type: 'percent' },
  'VIP50': { discount: 50, type: 'percent' }
}

const getDiscountedPrice = (originalPrice: number): number => {
  if (!couponCode.value) return originalPrice
  
  const coupon = validCoupons[couponCode.value]
  if (!coupon) return originalPrice
  
  if (coupon.type === 'fixed') {
    return Math.max(0, originalPrice - coupon.discount)
  } else {
    return Math.round(originalPrice * (1 - coupon.discount / 100))
  }
}

const applyCoupon = () => {
  couponError.value = ''
  
  const code = inputCouponCode.value.toUpperCase().trim()
  
  if (!code) {
    couponError.value = '请输入优惠码'
    return
  }
  
  const coupon = validCoupons[code]
  
  if (coupon) {
    couponCode.value = code
    if (coupon.type === 'fixed') {
      discountAmount.value = coupon.discount
    } else {
      discountAmount.value = Math.round(49 * coupon.discount / 100)
    }
    inputCouponCode.value = ''
  } else {
    couponError.value = '无效的优惠码'
  }
}

const closeModal = () => {
  showPricingModal.value = false
  couponCode.value = ''
  discountAmount.value = 0
  couponError.value = ''
}

const downgrade = (tier: SubscriptionTier) => {
  if (confirm('确定要降级吗？降级后将失去当前的高级功能。')) {
    authStore.upgradeSubscription(tier)
    closeModal()
  }
}

const upgrade = (tier: SubscriptionTier) => {
  const btn = document.activeElement as HTMLButtonElement
  const originalText = btn.innerText
  btn.innerText = '支付中...'
  btn.disabled = true
  
  setTimeout(() => {
    authStore.upgradeSubscription(tier)
    btn.innerText = originalText
    btn.disabled = false
    alert(`恭喜！您已成功升级为 ${tier === 'pro' ? '居士' : '宗师'}！`)
    closeModal()
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

:global(html.zen-mode) .bg-white {
  background-color: #2c2c2e;
  color: #d4b483;
  border-color: #3f3f46;
}

:global(html.zen-mode) .bg-gray-50,
:global(html.zen-mode) .bg-gray-50\/50,
:global(html.zen-mode) .bg-gradient-to-b {
  background: rgba(255,255,255,0.05);
  background-image: none;
}

:global(html.zen-mode) .text-dark {
  color: #d4b483;
}

:global(html.zen-mode) .text-gray-500,
:global(html.zen-mode) .text-gray-600,
:global(html.zen-mode) .text-gray-700 {
  color: #9ca3af;
}

:global(html.zen-mode) .border {
  border-color: #3f3f46;
}

:global(html.zen-mode) .bg-green-50 {
  background-color: rgba(34, 197, 94, 0.1);
}

:global(html.zen-mode) .bg-yellow-50 {
  background-color: rgba(234, 179, 8, 0.1);
}
</style>

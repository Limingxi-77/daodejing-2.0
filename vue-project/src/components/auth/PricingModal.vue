<template>
  <div v-if="showPricingModal" @click.self="closeModal" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in cursor-pointer">
    <div class="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto relative border border-secondary/20 cursor-default" @click.stop>

      <!-- Close Button -->
      <button @click="closeModal" class="absolute top-4 right-4 text-gray-400 hover:text-dark transition-colors z-10">
        <i class="fas fa-times text-2xl"></i>
      </button>

      <div class="p-8 md:p-12">
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold text-primary mb-3 font-serif">选择您的修行之路</h2>
          <p class="text-gray-500">个人订阅 · 团队席位 · 企业定制,因材施教</p>
        </div>

        <div
          v-if="orderNotice"
          :class="[
            'mb-6 rounded-xl border px-5 py-4 text-sm flex items-start gap-3',
            orderNoticeType === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-700'
          ]"
          data-testid="subscription-order-notice"
        >
          <i :class="orderNoticeType === 'success' ? 'fas fa-circle-check mt-0.5' : 'fas fa-circle-exclamation mt-0.5'"></i>
          <div>
            <p class="font-bold">{{ orderNoticeTitle }}</p>
            <p class="mt-1">{{ orderNotice }}</p>
          </div>
        </div>

        <OrderHistory v-if="showOrderHistory" @close="showOrderHistory = false" />

        <!-- C 端 3 档 -->
        <div class="mb-4">
          <div class="flex items-center mb-4">
            <div class="h-px flex-1 bg-secondary/20"></div>
            <span class="px-4 text-sm text-dark/60 font-serif">个人方案</span>
            <div class="h-px flex-1 bg-secondary/20"></div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <!-- Free Plan -->
          <div data-testid="tier-card-free" class="border rounded-xl p-6 relative flex flex-col hover:shadow-lg transition-shadow bg-gray-50/50">
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
            <button disabled class="w-full py-3 rounded-lg border font-bold cursor-not-allowed opacity-50"
              :class="currentTierOrder === 0 ? 'border-primary text-primary' : 'border-gray-300 text-gray-400'">
              {{ currentTierOrder === 0 ? '当前方案' : '基础方案' }}
            </button>
          </div>

          <!-- Pro Plan -->
          <div data-testid="tier-card-pro" class="border-2 border-primary rounded-xl p-6 relative flex flex-col shadow-xl transform md:-translate-y-4 bg-white">
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
                <i class="fas fa-check text-primary mr-2"></i> 解锁道家隐士人格
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
              :disabled="proDisabled || Boolean(processingTier)"
              class="w-full py-3 rounded-lg font-bold transition-colors shadow-lg"
              :class="proBtnClass"
            >
              {{ processingTier === 'pro' ? '提交中...' : proBtnLabel }}
            </button>
          </div>

          <!-- Master Plan -->
          <div data-testid="tier-card-master" class="border rounded-xl p-6 relative flex flex-col hover:shadow-lg transition-shadow bg-gradient-to-b from-yellow-50 to-white">
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
              :disabled="masterDisabled || Boolean(processingTier)"
              class="w-full py-3 rounded-lg font-bold transition-colors shadow-md"
              :class="masterBtnClass"
            >
              {{ processingTier === 'master' ? '提交中...' : masterBtnLabel }}
            </button>
          </div>
        </div>

        <!-- B 端 2 档 -->
        <div class="mb-4">
          <div class="flex items-center mb-4">
            <div class="h-px flex-1 bg-secondary/20"></div>
            <span class="px-4 text-sm text-dark/60 font-serif">企业 / 团队方案</span>
            <div class="h-px flex-1 bg-secondary/20"></div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Team Plan -->
          <div data-testid="tier-card-team" class="border rounded-xl p-6 relative flex flex-col hover:shadow-lg transition-shadow bg-gradient-to-br from-slate-50 to-blue-50/40 border-blue-200">
            <div class="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">
              NEW
            </div>
            <div class="mb-4">
              <div class="flex items-center mb-2">
                <i class="fas fa-users text-blue-600 mr-2"></i>
                <h3 class="text-xl font-bold text-dark">团队 (Team)</h3>
              </div>
              <div class="text-3xl font-bold text-blue-700 mt-2">¥299<span class="text-sm text-gray-500 font-normal">/月 · 10 席</span></div>
              <p class="text-xs text-dark/50 mt-1">折合 ¥29.9/人,5 折优惠</p>
            </div>
            <ul class="space-y-2 mb-8 flex-1">
              <li class="flex items-center text-sm text-dark">
                <i class="fas fa-check text-blue-600 mr-2"></i> 10 个团队席位
              </li>
              <li class="flex items-center text-sm text-dark">
                <i class="fas fa-check text-blue-600 mr-2"></i> Pro 全部权益(每日 500 次/账号)
              </li>
              <li class="flex items-center text-sm text-dark">
                <i class="fas fa-check text-blue-600 mr-2"></i> 团队修行仪表盘
              </li>
              <li class="flex items-center text-sm text-dark">
                <i class="fas fa-check text-blue-600 mr-2"></i> 优先技术支持
              </li>
            </ul>
            <button
              @click="upgrade('team')"
              :disabled="teamDisabled || Boolean(processingTier)"
              class="w-full py-3 rounded-lg font-bold transition-colors shadow-md"
              :class="teamBtnClass"
              data-testid="upgrade-team-btn"
            >
              {{ processingTier === 'team' ? '提交中...' : teamBtnLabel }}
            </button>
          </div>

          <!-- Enterprise Plan -->
          <div data-testid="tier-card-enterprise" class="border rounded-xl p-6 relative flex flex-col hover:shadow-lg transition-shadow bg-gradient-to-br from-slate-100 to-amber-50/60 border-amber-300">
            <div class="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-600 text-white">
              定制
            </div>
            <div class="mb-4">
              <div class="flex items-center mb-2">
                <i class="fas fa-building text-amber-600 mr-2"></i>
                <h3 class="text-xl font-bold text-dark">企业 (Enterprise)</h3>
              </div>
              <div class="text-3xl font-bold text-amber-700 mt-2">联系洽谈<span class="text-sm text-gray-500 font-normal block">私有部署 · 无限席位</span></div>
            </div>
            <ul class="space-y-2 mb-8 flex-1">
              <li class="flex items-center text-sm text-dark">
                <i class="fas fa-check text-amber-600 mr-2"></i> 无限席位 / 用量
              </li>
              <li class="flex items-center text-sm text-dark">
                <i class="fas fa-check text-amber-600 mr-2"></i> 私有化部署(物理隔离)
              </li>
              <li class="flex items-center text-sm text-dark">
                <i class="fas fa-check text-amber-600 mr-2"></i> 定制 Persona / 语料库
              </li>
              <li class="flex items-center text-sm text-dark">
                <i class="fas fa-check text-amber-600 mr-2"></i> Open API + SLA 保障
              </li>
            </ul>
            <button
              @click="openEnterpriseModal"
              class="w-full py-3 rounded-lg font-bold transition-colors shadow-md bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
              data-testid="enterprise-contact-btn"
            >
              <i class="fas fa-handshake mr-2"></i>预约洽谈
            </button>
          </div>
        </div>

        <p class="text-center text-xs text-gray-400 mt-8">
          * 会员方案提交后会生成后台确认订单,管理员确认后自动开通对应会员;企业方案将打开预约表单
        </p>
        <p class="text-center mt-3">
          <button
            @click="showOrderHistory = !showOrderHistory"
            class="text-sm text-primary hover:text-primary/80 underline transition-colors"
          >
            {{ showOrderHistory ? '收起订单' : '查看我的订单' }}
          </button>
        </p>
      </div>
    </div>

    <EnterpriseContactModal
      v-if="enterpriseModalOpen"
      @close="enterpriseModalOpen = false"
      @submitted="onEnterpriseSubmitted"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore, type SubscriptionTier } from '@/stores/auth'
import EnterpriseContactModal from '@/components/auth/EnterpriseContactModal.vue'
import OrderHistory from '@/components/auth/OrderHistory.vue'

const authStore = useAuthStore()
const { showPricingModal, user } = storeToRefs(authStore)

const enterpriseModalOpen = ref(false)
const showOrderHistory = ref(false)
const processingTier = ref<SubscriptionTier | null>(null)
const orderNotice = ref('')
const orderNoticeTitle = ref('')
const orderNoticeType = ref<'success' | 'error'>('success')

const tierOrder: Record<string, number> = { free: 0, pro: 1, team: 2, master: 3 }
const currentTierOrder = computed(() => tierOrder[user.value?.subscription?.tier || 'free'] || 0)

// Pro Plan button
const proDisabled = computed(() => currentTierOrder.value > 1)
const proBtnLabel = computed(() => {
  if (currentTierOrder.value > 1) return '已拥有'
  if (currentTierOrder.value === 1) return '续费'
  return '立即升级'
})
const proBtnClass = computed(() => {
  if (currentTierOrder.value > 1) return 'bg-gray-200 text-gray-500 cursor-not-allowed'
  return 'bg-primary text-white hover:bg-primary/90'
})

// Master Plan button
const masterDisabled = computed(() => user.value?.subscription?.tier === 'master')
const masterBtnLabel = computed(() => {
  if (user.value?.subscription?.tier === 'master') return '当前方案'
  return '成为宗师'
})
const masterBtnClass = computed(() => {
  if (user.value?.subscription?.tier === 'master') return 'bg-gray-200 text-gray-500 cursor-not-allowed'
  return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700'
})

// Team Plan button
const teamDisabled = computed(() => user.value?.subscription?.tier === 'team' || user.value?.subscription?.tier === 'master')
const teamBtnLabel = computed(() => {
  if (user.value?.subscription?.tier === 'team') return '当前方案'
  if (user.value?.subscription?.tier === 'master') return '已包含在宗师版'
  return '升级团队版'
})
const teamBtnClass = computed(() => {
  if (teamDisabled.value) return 'bg-gray-200 text-gray-500 cursor-not-allowed'
  return 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
})

const closeModal = () => {
  showPricingModal.value = false
}

const openEnterpriseModal = () => {
  enterpriseModalOpen.value = true
}

const onEnterpriseSubmitted = () => {
  enterpriseModalOpen.value = false
}

const tierLabel: Record<string, string> = {
  pro: '居士',
  team: '团队版',
  master: '宗师'
}

const upgrade = async (tier: SubscriptionTier) => {
  processingTier.value = tier
  orderNotice.value = ''
  orderNoticeTitle.value = ''
  try {
    const result = await authStore.upgradeSubscription(tier)
    orderNoticeType.value = 'success'
    orderNoticeTitle.value = result.reused ? '已有待确认订单' : '订单已提交'
    orderNotice.value = `订单号 ${result.order.orderNo}, ${tierLabel[tier] || tier}会员 ${result.order.durationDays} 天, 金额 ¥${result.order.amountYuan}。后台确认后会员会自动生效。`
    showOrderHistory.value = true
  } catch (error: any) {
    orderNoticeType.value = 'error'
    orderNoticeTitle.value = '订单提交失败'
    orderNotice.value = error?.message || '订单提交失败,请稍后再试'
  } finally {
    processingTier.value = null
  }
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
:global(html.zen-mode) .bg-gradient-to-b,
:global(html.zen-mode) .bg-gradient-to-br {
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

<template>
  <div class="mt-6 border-t border-gray-100 pt-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-bold text-gray-800 font-serif">我的订单</h3>
      <button
        @click="$emit('close')"
        class="text-gray-400 hover:text-gray-600 transition-colors"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>

    <div v-if="loading" class="text-center py-8 text-gray-400">
      <i class="fas fa-spinner fa-spin mr-2"></i>加载中...
    </div>

    <div v-else-if="orders.length === 0" class="text-center py-8 text-gray-400">
      <i class="fas fa-receipt text-3xl mb-2 block"></i>
      <p>暂无订单</p>
    </div>

    <div v-else class="space-y-3 max-h-64 overflow-y-auto">
      <div
        v-for="order in orders"
        :key="order.id"
        class="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm"
      >
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <span class="font-medium text-gray-800">{{ order.tierLabel }}</span>
            <span :class="statusClass(order.status)">{{ statusText(order.status) }}</span>
          </div>
          <div class="text-gray-400 text-xs">
            {{ order.orderNo }} · {{ formatDate(order.createdAt) }}
          </div>
        </div>
        <div class="text-right ml-4">
          <span class="font-bold text-gray-700">¥{{ order.amountYuan }}</span>
          <div class="text-xs text-gray-400">{{ order.durationDays }}天</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore, type SubscriptionOrder } from '@/stores/auth'

defineEmits<{ close: [] }>()

const authStore = useAuthStore()
const orders = ref<SubscriptionOrder[]>([])
const loading = ref(true)

const statusText = (status: string) => {
  if (status === 'paid') return '已开通'
  if (status === 'canceled') return '已取消'
  return '待确认'
}

const statusClass = (status: string) => {
  if (status === 'paid') return 'px-1.5 py-0.5 text-xs rounded bg-emerald-100 text-emerald-700'
  if (status === 'canceled') return 'px-1.5 py-0.5 text-xs rounded bg-gray-100 text-gray-500'
  return 'px-1.5 py-0.5 text-xs rounded bg-amber-100 text-amber-700'
}

const formatDate = (iso: string) => {
  if (!iso) return '-'
  return new Date(iso).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

onMounted(async () => {
  try {
    orders.value = await authStore.fetchOrders()
  } catch {
    orders.value = []
  } finally {
    loading.value = false
  }
})
</script>

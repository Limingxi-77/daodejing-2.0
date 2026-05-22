<template>
  <div data-testid="inbox-page" class="pt-24 pb-20 px-4 md:px-8 min-h-screen bg-gray-50">
    <div class="container mx-auto max-w-3xl">
      <!-- Header -->
      <section class="text-center mb-10">
        <h1 class="text-4xl md:text-5xl font-bold text-primary mb-4">
          <i class="fas fa-envelope mr-3"></i>收件箱
        </h1>
        <p class="text-xl text-gray-600">查看您的系统通知和反馈消息</p>
      </section>

      <!-- Toolbar -->
      <div class="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <span class="text-gray-600">
          共 <strong>{{ store.totalPages > 0 ? store.notifications.length : 0 }}</strong> 条通知
          <span v-if="store.unreadCount > 0" class="text-red-500 ml-2">（{{ store.unreadCount }} 条未读）</span>
        </span>
        <button
          v-if="store.unreadCount > 0"
          @click="handleReadAll"
          class="text-sm text-primary hover:text-accent border border-primary px-3 py-1 rounded-full hover:bg-primary hover:text-white transition-colors"
        >
          <i class="fas fa-check-double mr-1"></i>全部已读
        </button>
      </div>

      <!-- List -->
      <div v-if="store.loading" class="text-center py-16">
        <i class="fas fa-spinner fa-spin text-3xl text-primary"></i>
        <p class="text-gray-500 mt-4">加载中...</p>
      </div>

      <div v-else-if="store.notifications.length === 0" class="text-center py-16 bg-white rounded-lg border border-dashed border-gray-300">
        <i class="fas fa-inbox text-5xl text-gray-300 mb-4"></i>
        <p class="text-lg text-gray-500">暂无通知</p>
        <p class="text-sm text-gray-400 mt-2">当您提交举报或管理员处理您的举报时，通知会出现在这里</p>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="item in store.notifications"
          :key="item.id"
          @click="handleClick(item)"
          :class="[
            'p-5 rounded-lg border cursor-pointer transition-all hover:shadow-md',
            item.is_read ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200 shadow-sm'
          ]"
        >
          <div class="flex items-start gap-4">
            <!-- Icon -->
            <div :class="[
              'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
              iconBg(item.type)
            ]">
              <i :class="[iconClass(item.type), iconColor(item.type)]"></i>
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-start gap-2">
                <h3 class="font-semibold text-gray-800" :class="{ 'text-primary': !item.is_read }">
                  {{ item.title }}
                  <span v-if="!item.is_read" class="inline-block w-2 h-2 bg-red-500 rounded-full ml-2 align-middle"></span>
                </h3>
                <span class="text-xs text-gray-400 flex-shrink-0">{{ formatTime(item.created_at) }}</span>
              </div>
              <p class="text-sm text-gray-600 mt-1 line-clamp-2">{{ item.message }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="store.totalPages > 1" class="flex justify-center mt-8 gap-2">
        <button
          v-for="page in store.totalPages"
          :key="page"
          @click="store.loadNotifications(page)"
          class="w-10 h-10 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center"
        >
          {{ page }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useNotificationStore } from '@/stores/notification'

const store = useNotificationStore()

onMounted(() => {
  store.loadNotifications(1)
})

async function handleClick(item: { id: string; is_read: boolean | number }) {
  if (!item.is_read) {
    await store.readOne(item.id)
  }
}

async function handleReadAll() {
  await store.readAll()
}

function iconBg(type: string) {
  const map: Record<string, string> = {
    report_submitted: 'bg-yellow-100',
    report_resolved: 'bg-green-100',
    report_rejected: 'bg-red-100'
  }
  return map[type] || 'bg-gray-100'
}

function iconClass(type: string) {
  const map: Record<string, string> = {
    report_submitted: 'fas fa-clock',
    report_resolved: 'fas fa-check-circle',
    report_rejected: 'fas fa-times-circle'
  }
  return map[type] || 'fas fa-bell'
}

function iconColor(type: string) {
  const map: Record<string, string> = {
    report_submitted: 'text-yellow-600',
    report_resolved: 'text-green-600',
    report_rejected: 'text-red-600'
  }
  return map[type] || 'text-gray-600'
}

function formatTime(dateStr: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins} 分钟前`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} 小时前`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} 天前`
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
</script>

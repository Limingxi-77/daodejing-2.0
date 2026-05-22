import { ref } from 'vue'
import { defineStore } from 'pinia'
import {
  fetchNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  type NotificationItem
} from '@/services/notificationService'
import { getToken } from '@/services/api'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<NotificationItem[]>([])
  const unreadCount = ref(0)
  const totalPages = ref(1)
  const loading = ref(false)
  let pollTimer: ReturnType<typeof setInterval> | null = null

  async function loadNotifications(page = 1, pageSize = 20) {
    loading.value = true
    try {
      const res = await fetchNotifications({ page, pageSize })
      notifications.value = res.data
      totalPages.value = Math.ceil(res.pagination.total / pageSize)
      unreadCount.value = res.data.filter(n => !n.is_read).length
    } catch (e) {
      console.warn('加载通知失败:', e)
    } finally {
      loading.value = false
    }
  }

  async function loadUnreadCount() {
    if (!getToken()) return
    try {
      const res = await getUnreadCount()
      unreadCount.value = res.count
    } catch (e) {
      // silent fail for polling
    }
  }

  async function readOne(id: string) {
    try {
      await markAsRead(id)
      const item = notifications.value.find(n => n.id === id)
      if (item && !item.is_read) {
        item.is_read = true
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
    } catch (e) {
      console.warn('标记已读失败:', e)
    }
  }

  async function readAll() {
    try {
      await markAllAsRead()
      notifications.value.forEach(n => { n.is_read = true })
      unreadCount.value = 0
    } catch (e) {
      console.warn('全部已读失败:', e)
    }
  }

  function startPolling(intervalMs = 30000) {
    stopPolling()
    if (!getToken()) return
    loadUnreadCount()
    pollTimer = setInterval(() => {
      if (!getToken()) { stopPolling(); return }
      loadUnreadCount()
    }, intervalMs)
  }

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  return {
    notifications,
    unreadCount,
    totalPages,
    loading,
    loadNotifications,
    loadUnreadCount,
    readOne,
    readAll,
    startPolling,
    stopPolling
  }
})

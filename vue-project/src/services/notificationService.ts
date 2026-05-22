import { apiClient } from './api'

export interface NotificationItem {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  related_id: string | null
  is_read: boolean | number
  created_at: string
}

interface NotifListResponse {
  success: boolean
  data: NotificationItem[]
  pagination: { page: number; pageSize: number; total: number }
}

interface UnreadCountResponse {
  success: boolean
  count: number
}

export async function fetchNotifications(params: { page?: number; pageSize?: number } = {}) {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.pageSize) query.set('pageSize', String(params.pageSize))
  const suffix = query.toString() ? `?${query.toString()}` : ''
  return apiClient<NotifListResponse>(`/notifications${suffix}`)
}

export async function getUnreadCount() {
  return apiClient<UnreadCountResponse>('/notifications/unread-count')
}

export async function markAsRead(id: string) {
  return apiClient<{ success: boolean }>(`/notifications/${id}/read`, { method: 'PATCH' })
}

export async function markAllAsRead() {
  return apiClient<{ success: boolean }>('/notifications/read-all', { method: 'PATCH' })
}

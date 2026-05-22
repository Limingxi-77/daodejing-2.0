import { apiClient } from './api'

export interface ResourceItem {
  id: string
  title: string
  summary: string
  content: string
  resourceType: string
  fileUrl: string
  tags: string[]
  viewCount: number
  downloadCount: number
  createdAt: string
}

interface ApiList<T> {
  success: boolean
  data: T[]
}

export async function fetchResources(params: { keyword?: string; type?: string } = {}) {
  const query = new URLSearchParams()
  if (params.keyword) query.set('keyword', params.keyword)
  if (params.type) query.set('type', params.type)
  const suffix = query.toString() ? `?${query.toString()}` : ''
  return apiClient<ApiList<ResourceItem>>(`/resources${suffix}`, { auth: false })
}

export async function recordResourceView(id: string) {
  return apiClient<{ success: boolean }>(`/resources/${id}/view`, { method: 'POST', auth: false })
}

export async function recordResourceDownload(id: string) {
  return apiClient<{ success: boolean }>(`/resources/${id}/download`, { method: 'POST', auth: false })
}

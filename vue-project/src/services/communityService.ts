import { apiClient } from './api'

export interface CommunityPost {
  id: string
  username: string
  authorName: string
  title: string
  content: string
  tags: string[]
  likeCount: number
  commentCount: number
  bookmarked: boolean
  liked: boolean
  isHot: boolean
  createdAt: string
}

interface ApiList<T> {
  success: boolean
  data: T[]
}

export async function fetchCommunityPosts(keyword = '') {
  const query = keyword ? `?keyword=${encodeURIComponent(keyword)}` : ''
  return apiClient<ApiList<CommunityPost>>(`/community/posts${query}`)
}

export async function createCommunityPost(payload: { title: string; content: string; tags: string[] }) {
  return apiClient<{ success: boolean; post: CommunityPost }>('/community/posts', {
    method: 'POST',
    body: payload
  })
}

export async function setCommunityLike(postId: string, liked: boolean) {
  return apiClient<{ success: boolean; liked: boolean; likeCount: number }>(`/community/posts/${postId}/like`, {
    method: 'POST',
    body: { liked }
  })
}

export async function setCommunityBookmark(postId: string, bookmarked: boolean) {
  return apiClient<{ success: boolean; bookmarked: boolean }>(`/community/posts/${postId}/bookmark`, {
    method: 'POST',
    body: { bookmarked }
  })
}

export async function reportCommunityContent(targetType: string, targetId: string, reason: string, detail = '') {
  return apiClient<{ success: boolean; id: string }>('/community/reports', {
    method: 'POST',
    body: { targetType, targetId, reason, detail }
  })
}

// ── 关注 ──────────────────────────────────────────────────
export async function followUser(userId: string) {
  return apiClient<{ success: boolean; followed: boolean }>('/community/follow', {
    method: 'POST',
    body: { userId }
  })
}

export async function unfollowUser(userId: string) {
  return apiClient<{ success: boolean; followed: boolean }>(`/community/follow/${userId}`, {
    method: 'DELETE'
  })
}

export async function fetchFollows() {
  return apiClient<{ success: boolean; data: string[] }>('/community/follows')
}

// ── 草稿 ──────────────────────────────────────────────────
export async function fetchDrafts() {
  return apiClient<{ success: boolean; data: any[] }>('/community/drafts')
}

export async function saveDraft(draft: { title: string; content: string; tags?: string[] }) {
  return apiClient<{ success: boolean; draft: any }>('/community/drafts', {
    method: 'POST',
    body: draft
  })
}

export async function updateDraft(id: string, draft: { title: string; content: string; tags?: string[] }) {
  return apiClient<{ success: boolean }>(`/community/drafts/${id}`, {
    method: 'PATCH',
    body: draft
  })
}

export async function deleteDraftApi(id: string) {
  return apiClient<{ success: boolean }>(`/community/drafts/${id}`, {
    method: 'DELETE'
  })
}

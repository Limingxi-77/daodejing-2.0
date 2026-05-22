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

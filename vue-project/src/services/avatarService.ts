import { apiClient } from '@/services/api'
import type { User } from '@/stores/auth'

export interface AvatarUploadResponse {
  success: boolean
  user: Record<string, unknown>
}

const MAX_AVATAR_BYTES = 2 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp'])

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('读取头像文件失败'))
    reader.readAsDataURL(file)
  })
}

export function validateAvatarFile(file: File): string {
  if (!ALLOWED_TYPES.has(file.type)) {
    return '仅支持 JPG、PNG、WebP 图片'
  }
  if (file.size > MAX_AVATAR_BYTES) {
    return '头像图片不能超过 2MB'
  }
  return ''
}

export async function uploadAvatar(file: File): Promise<User> {
  const validationError = validateAvatarFile(file)
  if (validationError) {
    throw new Error(validationError)
  }

  const imageData = await readFileAsDataUrl(file)
  const res = await apiClient<AvatarUploadResponse>('/user/avatar', {
    method: 'POST',
    body: {
      imageData,
      fileName: file.name
    }
  })
  return res.user as unknown as User
}

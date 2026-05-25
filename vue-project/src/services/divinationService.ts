import { apiClient } from '@/services/api'

export interface DivinationResponse {
  success: boolean
  provider: string
  model: string
  chapter: number
  content: string
  modern: string
  insight: string
  action: string
  dateKey: string
  reroll: boolean
  generatedAt: string
  totalTokens?: number
  estimatedCost?: number
  mode: string
}

const CACHE_PREFIX = 'daoSign'

function getTodayDateKeyUTC(): string {
  const d = new Date()
  const yyyy = d.getUTCFullYear()
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(d.getUTCDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function getCacheKey(userId: string): string {
  return `${CACHE_PREFIX}:${userId}:${getTodayDateKeyUTC()}`
}

export function readCachedDivination(userId: string): DivinationResponse | null {
  try {
    const raw = localStorage.getItem(getCacheKey(userId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as DivinationResponse
    if (!parsed || typeof parsed !== 'object') return null
    return parsed
  } catch {
    return null
  }
}

export function writeCachedDivination(userId: string, data: DivinationResponse): void {
  try {
    localStorage.setItem(getCacheKey(userId), JSON.stringify(data))
  } catch {
    /* quota / private-mode — ignore */
  }
}

export function clearAllDivinationCache(userId: string): void {
  // Clean up older days for this user
  try {
    const today = getCacheKey(userId)
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith(`${CACHE_PREFIX}:${userId}:`) && k !== today) {
        localStorage.removeItem(k)
      }
    }
  } catch { /* ignore */ }
}

export async function fetchTodayDivination(
  userId: string,
  opts: { reroll?: boolean } = {}
): Promise<DivinationResponse> {
  const reroll = Boolean(opts.reroll)
  if (!reroll) {
    const cached = readCachedDivination(userId)
    if (cached) return cached
  }
  const res = await apiClient<DivinationResponse>('/ai/divination', {
    method: 'POST',
    body: { reroll }
  })
  if (!reroll) {
    writeCachedDivination(userId, res)
    clearAllDivinationCache(userId)
  }
  return res
}

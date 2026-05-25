import { apiClient } from '@/services/api'

export interface ValueReportSection {
  calls: number
  tokens: number
  cost: number
  savedAdvisory: number
}

export interface ValueReportProgress {
  learned: number
  total: number
  percent: number
}

export interface ValueReport {
  success: boolean
  month: ValueReportSection
  lifetime: ValueReportSection
  progress: ValueReportProgress
  generatedAt: string
}

const CACHE_PREFIX = 'valueReport'
const CACHE_TTL_MS = 5 * 60 * 1000

interface CachedEnvelope {
  data: ValueReport
  ts: number
}

function getCacheKey(userId: string): string {
  return `${CACHE_PREFIX}:${userId}`
}

function readCache(userId: string): ValueReport | null {
  try {
    const raw = localStorage.getItem(getCacheKey(userId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as CachedEnvelope
    if (!parsed || typeof parsed !== 'object' || !parsed.data) return null
    if (Date.now() - parsed.ts > CACHE_TTL_MS) return null
    return parsed.data
  } catch {
    return null
  }
}

function writeCache(userId: string, data: ValueReport): void {
  try {
    const envelope: CachedEnvelope = { data, ts: Date.now() }
    localStorage.setItem(getCacheKey(userId), JSON.stringify(envelope))
  } catch {
    /* quota / private-mode — ignore */
  }
}

export function clearValueReportCache(userId: string): void {
  try { localStorage.removeItem(getCacheKey(userId)) } catch { /* ignore */ }
}

export async function fetchValueReport(
  userId: string,
  opts: { force?: boolean } = {}
): Promise<ValueReport> {
  if (!opts.force) {
    const cached = readCache(userId)
    if (cached) return cached
  }
  const res = await apiClient<ValueReport>('/user/value-report', { method: 'GET' })
  writeCache(userId, res)
  return res
}

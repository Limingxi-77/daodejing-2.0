import { ref } from 'vue'
import { intelligentSearch } from '@/services/ragService'
import { recordMessageSent } from '@/services/performanceMonitor'
import { apiClient, getToken } from '@/services/api'

interface AIProviderConfig {
  name: string
  enabled: boolean
  model: string
  mode: 'backend-proxy'
}

interface AIError {
  code: string
  message: string
  retryable: boolean
}

interface AIResponse {
  content: string
  provider?: string
  model?: string
  mode?: string
  citations?: Array<{
    chapter: string
    verse: string
    text: string
  }>
  suggestions?: string[]
}

const AI_PROVIDERS: AIProviderConfig[] = [
  { name: 'deepseek', enabled: true, model: 'deepseek-v4-flash', mode: 'backend-proxy' },
  { name: 'openrouter', enabled: true, model: 'google/gemini-2.0-flash-lite-preview-02-05:free', mode: 'backend-proxy' },
  { name: 'openai', enabled: true, model: 'gpt-3.5-turbo', mode: 'backend-proxy' },
  { name: 'coze', enabled: true, model: 'coze-v1', mode: 'backend-proxy' }
]

const PERSONA_CONFIG = {
  scholar: {
    systemPrompt: '你是一位研究《道德经》的现代学者，擅长用现代语言和科学视角解读经典。请用通俗易懂的语言，结合现代生活实例来解释《道德经》的智慧。',
    temperature: 0.7
  },
  hermit: {
    systemPrompt: '你是一位深居简出的道家隐士，精通《道德经》的深层含义。请用富有哲理的语言，从道家修炼的角度来解读经典。',
    temperature: 0.8
  },
  therapist: {
    systemPrompt: '你是一位将《道德经》智慧应用于心理疗愈的专家。请从心理健康和情绪管理的角度，帮助用户理解并应用道家智慧。',
    temperature: 0.6
  },
  sage: {
    systemPrompt: '你是一位道家智者，回答应简洁、温和、富有启发，尽量引用《道德经》的精神。',
    temperature: 0.75
  },
  healer: {
    systemPrompt: '你是一位结合道家智慧的心理陪伴者，回答应温柔、安定、可执行。',
    temperature: 0.65
  }
}

const isConnected = ref(false)
const isInitializing = ref(false)
const currentProvider = ref<AIProviderConfig | null>(AI_PROVIDERS[0])
const lastError = ref<string | null>(null)

export const initializeAIService = async (providerName: string = 'deepseek', _apiKey?: string): Promise<boolean> => {
  isInitializing.value = true
  lastError.value = null
  try {
    const provider = AI_PROVIDERS.find(item => item.name === providerName && item.enabled) || AI_PROVIDERS[0]
    currentProvider.value = provider
    // 不再依赖 /health 判定 AI 可用性。/health 仅代表 Express 在跑，与 AI Key 是否有效无关。
    // 真实可用性会在首次 /api/ai/chat 时通过 response.mode 判断。
    isConnected.value = true
    return true
  } finally {
    isInitializing.value = false
  }
}

export const sendDirectMessage = async (
  message: string,
  persona: string = 'scholar',
  conversationHistory: Array<{ role: string, content: string }> = []
): Promise<AIResponse> => {
  const provider = currentProvider.value || AI_PROVIDERS[0]
  const personaConfig = PERSONA_CONFIG[persona as keyof typeof PERSONA_CONFIG] || PERSONA_CONFIG.scholar

  recordMessageSent(message)

  const ragResult = intelligentSearch(message)
  let enhancedSystemPrompt = personaConfig.systemPrompt

  if (ragResult.knowledge && ragResult.relevance > 0.5) {
    enhancedSystemPrompt += `\n\n检索到的相关经文：\n${ragResult.context}\n\n请基于以上经文内容回答，确保回答准确且符合《道德经》的原意。`
  } else {
    enhancedSystemPrompt += '\n\n请基于《道德经》的整体思想回答，保持道家智慧的风格。'
  }

  const messages = [
    { role: 'system', content: enhancedSystemPrompt },
    ...conversationHistory.slice(-20),
    { role: 'user', content: message }
  ]

  const response = await apiClient<AIResponse & { success: boolean }>('/ai/chat', {
    method: 'POST',
    auth: true,
    body: {
      provider: provider.name,
      model: provider.model,
      messages,
      persona,
      temperature: personaConfig.temperature,
      max_tokens: 2000
    }
  })

  isConnected.value = true

  return {
    content: response.content,
    provider: response.provider,
    model: response.model,
    mode: response.mode,
    citations: extractCitations(response.content),
    suggestions: generateSuggestions(message, response.content)
  }
}

const extractCitations = (response: string): Array<{ chapter: string, verse: string, text: string }> => {
  const citations: Array<{ chapter: string, verse: string, text: string }> = []
  const chapterMatches = response.match(/第(\d+)章/g)

  if (chapterMatches) {
    chapterMatches.forEach(match => {
      const chapter = match.replace('第', '').replace('章', '')
      citations.push({ chapter, verse: '', text: `第${chapter}章相关内容` })
    })
  }

  return citations.slice(0, 3)
}

const generateSuggestions = (userMessage: string, aiResponse: string): string[] => {
  const suggestions: string[] = []

  if (aiResponse.includes('无为')) suggestions.push('无为思想如何应用到工作管理？')
  if (aiResponse.includes('道')) suggestions.push('什么是《道德经》中的“道”？')
  if (aiResponse.includes('水')) suggestions.push('上善若水对现代生活有什么启发？')
  if (userMessage.includes('情绪') || userMessage.includes('焦虑')) suggestions.push('如何用道家智慧缓解焦虑？')

  suggestions.push('这段智慧可以如何实践？')
  return suggestions.slice(0, 3)
}

export const getAvailableProviders = (): AIProviderConfig[] => {
  return AI_PROVIDERS.map(provider => ({ ...provider }))
}

export const setAPIKey = (_providerName: string, _apiKey: string): void => {
  lastError.value = '平台级 API Key 已迁移到 Express 后端配置，前端不再保存密钥。'
}

export const getUsageStats = () => ({
  totalRequests: 0,
  totalTokens: 0,
  providerStats: {},
  recentUsage: []
})

export interface StreamCallbacks {
  onDelta?: (delta: string) => void
  onDone?: (full: string, usage?: { total_tokens?: number } | null) => void
  onError?: (err: Error) => void
}

export interface StreamOptions extends StreamCallbacks {
  signal?: AbortSignal
  persona?: string
  conversationHistory?: Array<{ role: string, content: string }>
  provider?: string
  model?: string
  temperature?: number
  max_tokens?: number
}

/**
 * 真 SSE 流式 — 直连 /api/ai/chat/stream
 * EventSource 不支持 POST/Authorization,因此用 fetch + ReadableStream + TextDecoder
 */
export const sendDirectMessageStream = async (
  message: string,
  opts: StreamOptions = {}
): Promise<{ full: string, usage: { total_tokens?: number } | null }> => {
  const provider = currentProvider.value || AI_PROVIDERS[0]
  const personaKey = (opts.persona || 'scholar') as keyof typeof PERSONA_CONFIG
  const personaConfig = PERSONA_CONFIG[personaKey] || PERSONA_CONFIG.scholar

  recordMessageSent(message)

  const ragResult = intelligentSearch(message)
  let enhancedSystemPrompt = personaConfig.systemPrompt
  if (ragResult.knowledge && ragResult.relevance > 0.5) {
    enhancedSystemPrompt += `\n\n检索到的相关经文：\n${ragResult.context}\n\n请基于以上经文内容回答，确保回答准确且符合《道德经》的原意。`
  } else {
    enhancedSystemPrompt += '\n\n请基于《道德经》的整体思想回答，保持道家智慧的风格。'
  }

  const messages = [
    { role: 'system', content: enhancedSystemPrompt },
    ...(opts.conversationHistory || []).slice(-20),
    { role: 'user', content: message }
  ]

  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'text/event-stream'
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch('/api/ai/chat/stream', {
    method: 'POST',
    headers,
    signal: opts.signal,
    body: JSON.stringify({
      provider: opts.provider || provider.name,
      model: opts.model || provider.model,
      messages,
      persona: opts.persona || 'scholar',
      temperature: opts.temperature ?? personaConfig.temperature,
      max_tokens: opts.max_tokens ?? 2000
    })
  })

  if (!response.ok || !response.body) {
    const errText = await response.text().catch(() => '')
    throw new Error(`流式接口返回 ${response.status}: ${errText.slice(0, 200)}`)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''
  let full = ''
  let usage: { total_tokens?: number } | null = null

  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      const parts = buffer.split('\n\n')
      buffer = parts.pop() || ''

      for (const block of parts) {
        if (!block) continue
        // 注释行(心跳)
        if (block.startsWith(':')) continue
        // 多行 data: 处理
        const dataLines: string[] = []
        for (const line of block.split('\n')) {
          if (line.startsWith('data:')) dataLines.push(line.slice(5).trimStart())
        }
        if (!dataLines.length) continue
        const payload = dataLines.join('\n').trim()
        if (payload === '[DONE]') {
          // 后端在 done 事件后才发 [DONE],usage 应已经回填
          continue
        }
        try {
          const obj = JSON.parse(payload) as { delta?: string, event?: string, usage?: { total_tokens?: number }, message?: string }
          if (obj.event === 'done') {
            usage = obj.usage || null
            continue
          }
          if (obj.event === 'error') {
            throw new Error(obj.message || 'stream-error')
          }
          if (typeof obj.delta === 'string' && obj.delta.length) {
            full += obj.delta
            opts.onDelta?.(obj.delta)
          }
        } catch (parseErr) {
          // 单个 chunk 解析失败不致命,跳过
          if ((parseErr as Error).message === 'stream-error' || (parseErr as Error).message?.startsWith('stream-')) {
            throw parseErr
          }
          // JSON.parse 失败:吞掉但记一笔,避免一次抖动断流
          console.warn('[stream] 单 chunk 解析失败:', payload.slice(0, 80))
        }
      }
    }

    opts.onDone?.(full, usage)
    return { full, usage }
  } catch (err) {
    opts.onError?.(err as Error)
    throw err
  } finally {
    try { reader.releaseLock() } catch { /* ignore */ }
  }
}

/**
 * 兼容旧调用方:onChunk + onComplete 风格
 * 自动选择流式或非流式(由 VITE_AI_STREAM 决定,默认 true)
 */
export const sendStreamMessage = async (
  message: string,
  persona: string = 'scholar',
  onChunk: (chunk: string) => void,
  onComplete: (fullResponse: string) => void
): Promise<void> => {
  const streamEnabled = (import.meta as { env?: { VITE_AI_STREAM?: string } }).env?.VITE_AI_STREAM !== 'false'
  if (streamEnabled) {
    try {
      await sendDirectMessageStream(message, {
        persona,
        onDelta: (delta) => onChunk(delta),
        onDone: (full) => onComplete(full)
      })
      return
    } catch (err) {
      console.warn('[stream] 流式失败,降级非流式:', err)
    }
  }
  const response = await sendDirectMessage(message, persona)
  onChunk(response.content)
  onComplete(response.content)
}

export const getServiceStatus = () => ({
  isConnected: isConnected.value,
  isInitializing: isInitializing.value,
  currentProvider: currentProvider.value,
  lastError: lastError.value,
  mode: 'backend-proxy' as const
})

export type { AIResponse, AIError }


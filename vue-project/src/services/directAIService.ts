// 直接AI服务 - 前端直接调用第三方AI API
import { ref } from 'vue'
import { intelligentSearch } from '@/services/ragService'
import { recordPerformance, recordMessageSent } from '@/services/performanceMonitor'

// AI提供商配置
interface AIProviderConfig {
  name: string
  apiUrl: string
  apiKey?: string
  enabled: boolean
  model: string
}

// 支持的AI提供商
const AI_PROVIDERS: AIProviderConfig[] = [
  {
    name: 'deepseek',
    apiUrl: 'https://api.deepseek.com/v1/chat/completions',
    apiKey: '', // 需要用户配置
    enabled: true,
    model: 'deepseek-chat'
  },
  {
    name: 'openrouter',
    apiUrl: 'https://openrouter.ai/api/v1/chat/completions',
    apiKey: '', // 需要用户配置
    enabled: true,
    model: 'google/gemini-2.0-flash-lite-preview-02-05:free'
  },
  {
    name: 'openai',
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    apiKey: '', // 需要用户配置
    enabled: true,
    model: 'gpt-3.5-turbo'
  },
  {
    name: 'coze',
    apiUrl: 'https://api.coze.cn/v1/chat/completions',
    apiKey: '', // 需要用户配置
    enabled: true,
    model: 'coze-v1'
  }
]

// AI人格配置
const PERSONA_CONFIG = {
  scholar: {
    name: '现代学者',
    systemPrompt: '你是一位研究《道德经》的现代学者，擅长用现代语言和科学视角解读经典。请用通俗易懂的语言，结合现代生活实例来解释《道德经》的智慧。',
    temperature: 0.7
  },
  hermit: {
    name: '道家隐士',
    systemPrompt: '你是一位深居简出的道家隐士，精通《道德经》的深层含义。请用富有哲理的语言，从道家修炼的角度来解读经典。',
    temperature: 0.8
  },
  therapist: {
    name: '心理疗愈',
    systemPrompt: '你是一位将《道德经》智慧应用于心理疗愈的专家。请从心理健康和情绪管理的角度，帮助用户理解并应用道家智慧。',
    temperature: 0.6
  }
}

// 状态管理
const isConnected = ref(false)
const isInitializing = ref(false)
const currentProvider = ref<AIProviderConfig | null>(null)
const lastError = ref<string | null>(null)

// 错误类型定义
interface AIError {
  code: string
  message: string
  retryable: boolean
}

// AI响应类型定义
interface AIResponse {
  content: string
  citations?: Array<{
    chapter: string
    verse: string
    text: string
  }>
  suggestions?: string[]
}

/**
 * 初始化AI服务
 */
export const initializeAIService = async (providerName: string = 'deepseek', apiKey?: string): Promise<boolean> => {
  try {
    isInitializing.value = true
    lastError.value = null
    
    const provider = AI_PROVIDERS.find(p => p.name === providerName && p.enabled)
    if (!provider) {
      throw new Error(`AI提供商 ${providerName} 不可用或未启用`)
    }
    
    // 设置API密钥
    if (apiKey) {
      provider.apiKey = apiKey
    }
    
    if (!provider.apiKey) {
      throw new Error(`请配置 ${provider.name} 的API密钥`)
    }
    
    currentProvider.value = provider
    isConnected.value = true
    
    console.log(`AI服务初始化成功: ${provider.name}`)
    return true
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误'
    lastError.value = errorMessage
    console.error('AI服务初始化失败:', error)
    return false
  } finally {
    isInitializing.value = false
  }
}

/**
 * 直接调用AI API（支持上下文和RAG检索）
 */
export const sendDirectMessage = async (
  message: string,
  persona: string = 'scholar',
  conversationHistory: Array<{role: string, content: string}> = []
): Promise<AIResponse> => {
  if (!currentProvider.value || !isConnected.value) {
    throw new Error('AI服务未初始化，请先调用 initializeAIService()')
  }
  
  const provider = currentProvider.value
  const personaConfig = PERSONA_CONFIG[persona as keyof typeof PERSONA_CONFIG] || PERSONA_CONFIG.scholar
  
  try {
    // 记录消息发送
    recordMessageSent(message)
    
    // 执行RAG检索
    const ragResult = intelligentSearch(message)
    
    // 构建增强的系统提示词
    let enhancedSystemPrompt = personaConfig.systemPrompt
    
    if (ragResult.knowledge && ragResult.relevance > 0.5) {
      enhancedSystemPrompt += `\n\n**检索到的相关经文：**\n${ragResult.context}\n\n请基于以上经文内容进行回答，确保回答准确且符合《道德经》的原意。`
    } else {
      enhancedSystemPrompt += '\n\n请基于《道德经》的整体思想进行回答，保持道家智慧的风格。'
    }
    
    // 构建消息历史（包含上下文）
    const messages = [
      {
        role: 'system',
        content: enhancedSystemPrompt
      }
    ]
    
    // 添加上下文消息（最多保留最近10轮对话）
    const recentHistory = conversationHistory.slice(-20) // 最多20条消息
    messages.push(...recentHistory)
    
    // 添加当前用户消息
    messages.push({
      role: 'user',
      content: message
    })
    
    const requestBody = {
      model: provider.model,
      messages: messages,
      temperature: personaConfig.temperature,
      max_tokens: 2000, // 增加token限制以容纳RAG内容
      stream: false
    }
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30秒超时
    
    const startTime = Date.now()
    
    const response = await fetch(provider.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`,
        ...(provider.name === 'openrouter' && {
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': '道德经AI平台'
        })
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    const responseTime = Date.now() - startTime
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API调用失败: ${response.status} - ${errorText}`)
    }
    
    const data = await response.json()
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('AI响应格式错误')
    }
    
    const aiResponse = data.choices[0].message.content
    
    // 合并RAG检索结果和AI响应
    const citations = extractCitations(aiResponse)
    const suggestions = generateSuggestions(message, aiResponse)
    
    // 如果有RAG检索结果，增强响应内容
    let enhancedContent = aiResponse
    
    if (ragResult.knowledge && ragResult.relevance > 0.6) {
      // 添加RAG检索的引用信息
      enhancedContent += `\n\n---\n*基于《道德经》第${ragResult.knowledge.chapter}章的相关内容进行回答*`
      
      // 添加RAG生成的建议
      if (ragResult.suggestions.length > 0) {
        enhancedContent += `\n\n**相关探索建议：**\n${ragResult.suggestions.map(s => `• ${s}`).join('\n')}`
      }
    }
    
    // 记录使用统计
    recordUsage(provider.name, data.usage)
    
    // 记录性能指标
    recordPerformance({
      responseTime,
      tokenUsage: {
        prompt: data.usage?.prompt_tokens || 0,
        completion: data.usage?.completion_tokens || 0,
        total: data.usage?.total_tokens || 0
      },
      ragRelevance: ragResult.relevance,
      errorRate: 0
    }, provider.name)
    
    return {
      content: enhancedContent,
      citations,
      suggestions: [...suggestions, ...ragResult.suggestions].slice(0, 3)
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误'
    lastError.value = errorMessage
    console.error('AI API调用失败:', error)
    
    // 如果是网络错误，尝试备用提供商
    if (errorMessage.includes('Network') || errorMessage.includes('Failed to fetch')) {
      console.warn('网络错误，尝试备用提供商')
      await tryFallbackProvider(provider.name)
    }
    
    throw error
  }
}

/**
 * 从AI响应中提取道德经引用
 */
const extractCitations = (response: string): Array<{chapter: string, verse: string, text: string}> => {
  const citations: Array<{chapter: string, verse: string, text: string}> = []
  
  // 简单的引用识别逻辑
  const citationPatterns = [
    /第(\S+)章.*?[""""]([^"]+)[""""]/g,
    /《道德经》第(\S+)章.*?[""""]([^"]+)[""""]/g
  ]
  
  for (const pattern of citationPatterns) {
    const matches = response.matchAll(pattern)
    for (const match of matches) {
      citations.push({
        chapter: match[1],
        verse: '1', // 简化处理
        text: match[2]
      })
    }
  }
  
  return citations.slice(0, 3) // 最多返回3个引用
}

/**
 * 生成对话建议
 */
const generateSuggestions = (userMessage: string, aiResponse: string): string[] => {
  const suggestions: string[] = []
  
  // 基于用户消息和AI响应的简单建议生成
  if (userMessage.includes('意思') || userMessage.includes('含义')) {
    suggestions.push('能否举一个现代生活中的例子来说明？')
    suggestions.push('这个观点与其他哲学思想有什么联系？')
  }
  
  if (aiResponse.includes('道') || aiResponse.includes('德')) {
    suggestions.push('请进一步解释"道"和"德"的关系')
    suggestions.push('如何在日常生活中实践这个智慧？')
  }
  
  // 通用建议
  suggestions.push('这个观点对现代人有什么启发？')
  suggestions.push('能否从不同角度再解释一下？')
  
  return suggestions.slice(0, 3) // 最多返回3个建议
}

/**
 * 获取可用的AI提供商列表
 */
export const getAvailableProviders = (): AIProviderConfig[] => {
  return AI_PROVIDERS.filter(provider => provider.enabled)
}

/**
 * 设置API密钥
 */
export const setAPIKey = (providerName: string, apiKey: string): void => {
  const provider = AI_PROVIDERS.find(p => p.name === providerName)
  if (provider) {
    provider.apiKey = apiKey
  }
}

/**
 * 尝试备用提供商
 */
const tryFallbackProvider = async (failedProvider: string): Promise<boolean> => {
  const fallbackProviders = AI_PROVIDERS.filter(p => p.name !== failedProvider && p.enabled)
  
  for (const provider of fallbackProviders) {
    try {
      console.log(`尝试备用提供商: ${provider.name}`)
      await initializeAIService(provider.name)
      return true
    } catch (error) {
      console.warn(`备用提供商 ${provider.name} 也失败:`, error)
      continue
    }
  }
  
  return false
}

/**
 * 记录使用统计
 */
const recordUsage = (providerName: string, usage: any) => {
  if (!usage) return
  
  const usageData = {
    provider: providerName,
    timestamp: new Date().toISOString(),
    tokens: {
      prompt: usage.prompt_tokens || 0,
      completion: usage.completion_tokens || 0,
      total: usage.total_tokens || 0
    }
  }
  
  // 保存到本地存储
  const usageHistory = JSON.parse(localStorage.getItem('ai_usage_history') || '[]')
  usageHistory.push(usageData)
  
  // 只保留最近100条记录
  if (usageHistory.length > 100) {
    usageHistory.splice(0, usageHistory.length - 100)
  }
  
  localStorage.setItem('ai_usage_history', JSON.stringify(usageHistory))
}

/**
 * 获取使用统计
 */
export const getUsageStats = () => {
  const usageHistory = JSON.parse(localStorage.getItem('ai_usage_history') || '[]')
  
  const totalTokens = usageHistory.reduce((sum: number, record: any) => {
    return sum + (record.tokens?.total || 0)
  }, 0)
  
  const providerStats = usageHistory.reduce((stats: any, record: any) => {
    const provider = record.provider
    if (!stats[provider]) {
      stats[provider] = { count: 0, tokens: 0 }
    }
    stats[provider].count += 1
    stats[provider].tokens += record.tokens?.total || 0
    return stats
  }, {})
  
  return {
    totalRequests: usageHistory.length,
    totalTokens,
    providerStats,
    recentUsage: usageHistory.slice(-10) // 最近10次使用
  }
}

/**
 * 流式响应支持（实验性）
 */
export const sendStreamMessage = async (
  message: string,
  persona: string = 'scholar',
  onChunk: (chunk: string) => void,
  onComplete: (fullResponse: string) => void
): Promise<void> => {
  if (!currentProvider.value || !isConnected.value) {
    throw new Error('AI服务未初始化')
  }
  
  const provider = currentProvider.value
  const personaConfig = PERSONA_CONFIG[persona as keyof typeof PERSONA_CONFIG] || PERSONA_CONFIG.scholar
  
  const requestBody = {
    model: provider.model,
    messages: [
      {
        role: 'system',
        content: personaConfig.systemPrompt
      },
      {
        role: 'user',
        content: message
      }
    ],
    temperature: personaConfig.temperature,
    max_tokens: 1000,
    stream: true
  }
  
  try {
    const response = await fetch(provider.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`
      },
      body: JSON.stringify(requestBody)
    })
    
    if (!response.ok) {
      throw new Error(`流式请求失败: ${response.status}`)
    }
    
    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('无法获取响应流')
    }
    
    let fullResponse = ''
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      
      const chunk = new TextDecoder().decode(value)
      const lines = chunk.split('\n')
      
      for (const line of lines) {
        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
          try {
            const data = JSON.parse(line.slice(6))
            const content = data.choices?.[0]?.delta?.content
            if (content) {
              fullResponse += content
              onChunk(content)
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }
    
    onComplete(fullResponse)
    
  } catch (error) {
    console.error('流式响应失败:', error)
    throw error
  }
}

/**
 * 获取服务状态
 */
export const getServiceStatus = () => ({
  isConnected: isConnected.value,
  isInitializing: isInitializing.value,
  currentProvider: currentProvider.value,
  lastError: lastError.value
})

// 导出类型
export type { AIResponse, AIError }
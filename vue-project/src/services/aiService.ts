// AI服务 - 处理与AI API的交互
import { ref } from 'vue'

// AI配置
const AI_CONFIG = {
  baseURL: 'http://localhost:8000', // 后端API地址
  timeout: 30000, // 30秒超时
  maxRetries: 3, // 最大重试次数
}

// AI人格配置（后端API已处理人格设置）
// PERSONA_CONFIG 已移至后端处理

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

// 状态管理
const isConnected = ref(false)
const isInitializing = ref(false)
const lastError = ref<AIError | null>(null)

/**
 * 检查AI服务连接状态
 */
export const checkConnection = async (): Promise<boolean> => {
  try {
    isInitializing.value = true
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    
    const response = await fetch(`${AI_CONFIG.baseURL}/health`, {
      method: 'GET',
      signal: controller.signal,
    })
    
    clearTimeout(timeoutId)
    
    if (response.ok) {
      isConnected.value = true
      lastError.value = null
      return true
    }
  } catch (error) {
    console.error('AI服务连接检查失败:', error)
    lastError.value = {
      code: 'CONNECTION_ERROR',
      message: '无法连接到AI服务，请检查后端服务是否运行',
      retryable: true
    }
    isConnected.value = false
  } finally {
    isInitializing.value = false
  }
  return false
}

/**
 * 发送消息到AI服务
 */
export const sendMessageToAI = async (
  message: string,
  persona: string = 'scholar'
): Promise<AIResponse> => {
  // 检查连接状态
  if (!isConnected.value) {
    const connected = await checkConnection()
    if (!connected) {
      throw new Error('AI服务不可用')
    }
  }

  // 构建请求数据 - 适配后端API格式
  const requestData = {
    message: message,
    persona: persona
  }

  let retries = 0
  
  while (retries < AI_CONFIG.maxRetries) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), AI_CONFIG.timeout)
      
      const response = await fetch(`${AI_CONFIG.baseURL}/api/ai/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      // 验证响应格式 - 适配后端响应格式
      if (!data.answer && !data.content) {
        throw new Error('AI响应格式错误')
      }

      lastError.value = null
      
      // 适配后端响应格式
      return {
        content: data.answer || data.content || '抱歉，AI服务暂时无法提供回答',
        citations: data.citations,
        suggestions: data.suggestions
      }

    } catch (error) {
      retries++
      
      if (retries >= AI_CONFIG.maxRetries) {
        const errorMessage = error instanceof Error ? error.message : '未知错误'
        lastError.value = {
          code: 'API_ERROR',
          message: `AI服务调用失败: ${errorMessage}`,
          retryable: false
        }
        throw error
      }
      
      // 指数退避重试
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)))
    }
  }
  
  throw new Error('达到最大重试次数')
}

/**
 * 流式响应（用于实时打字效果）
 * 由于后端可能不支持流式响应，这里模拟打字效果
 */
export const sendMessageStream = async (
  message: string,
  persona: string = 'scholar',
  onChunk: (chunk: string) => void,
  onComplete: (fullResponse: string) => void
): Promise<void> => {
  try {
    // 先获取完整的AI回答
    const response = await sendMessageToAI(message, persona)
    const fullResponse = response.content
    
    // 模拟打字效果
    let currentText = ''
    const words = fullResponse.split('')
    
    for (let i = 0; i < words.length; i++) {
      // 每次添加一个字符
      currentText += words[i]
      onChunk(words[i])
      
      // 控制打字速度（每字符30-100ms）
      const delay = Math.random() * 70 + 30
      await new Promise(resolve => setTimeout(resolve, delay))
      
      // 每10个字符后稍微停顿一下
      if (i % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
    
    onComplete(fullResponse)
    
  } catch (error) {
    console.error('流式响应错误:', error)
    throw error
  }
}

/**
 * 获取对话建议（基于当前对话上下文）
 * 由于后端暂未实现suggestions API，返回本地预设问题
 */
export const getSuggestions = async (conversationHistory: Array<{role: string, content: string}>): Promise<string[]> => {
  try {
    // 本地预设的《道德经》相关问题
    const presetQuestions = [
      "什么是道？",
      "无为而治是什么意思？", 
      "上善若水如何理解？",
      "道德经的核心思想是什么？",
      "如何理解道法自然？",
      "柔弱胜刚强的道理是什么？",
      "知足不辱，知止不殆的含义",
      "大智若愚的智慧"
    ]
    
    // 简单模拟基于对话历史的建议
    if (conversationHistory.length > 0) {
      const lastUserMessage = conversationHistory.filter(msg => msg.role === 'user').pop()
      if (lastUserMessage) {
        const content = lastUserMessage.content.toLowerCase()
        
        // 根据用户提问内容返回相关建议
        if (content.includes('道')) {
          return ["道的本质是什么？", "道与德的关系", "如何体悟道？"]
        } else if (content.includes('无为')) {
          return ["无为而治的实践", "无为与有为的区别", "现代生活中的无为"]
        } else if (content.includes('水')) {
          return ["上善若水的智慧", "水的七德", "柔弱胜刚强的道理"]
        }
      }
    }
    
    // 默认返回预设问题
    return presetQuestions.slice(0, 4)

  } catch (error) {
    console.error('获取建议失败:', error)
    // 失败时返回本地预设问题
    return [
      "什么是道？",
      "无为而治是什么意思？", 
      "上善若水如何理解？",
      "道德经的核心思想是什么？"
    ]
  }
}

// 导出状态
export {
  isConnected,
  isInitializing,
  lastError
}
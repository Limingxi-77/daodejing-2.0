// 对话历史服务 - 处理对话的持久化和搜索
import { ref } from 'vue'

// 对话会话接口
export interface Conversation {
  id: string
  title: string
  persona: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
  tags?: string[]
}

// 聊天消息接口（与chat.ts保持一致）
export interface ChatMessage {
  id: string
  content: string
  type: 'user' | 'ai'
  timestamp: Date
}

// 搜索过滤器
export interface SearchFilter {
  keyword?: string
  persona?: string
  dateRange?: {
    start: Date
    end: Date
  }
  tags?: string[]
}

// 服务配置
const SERVICE_CONFIG = {
  baseURL: 'http://localhost:8000/api', // 后端API地址
  timeout: 10000,
  maxRetries: 3
}

// 状态管理
const conversations = ref<Conversation[]>([])
const currentConversation = ref<Conversation | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)

/**
 * 创建新会话
 */
export const createConversation = async (title: string, persona: string = 'scholar'): Promise<Conversation> => {
  try {
    isLoading.value = true
    error.value = null
    
    const newConversation: Conversation = {
      id: generateId(),
      title,
      persona,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: []
    }
    
    // 尝试保存到后端
    try {
      const response = await fetch(`${SERVICE_CONFIG.baseURL}/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConversation)
      })
      
      if (response.ok) {
        const savedConversation = await response.json()
        conversations.value.unshift(savedConversation)
        currentConversation.value = savedConversation
        return savedConversation
      }
    } catch (backendError) {
      console.warn('后端保存失败，使用本地存储:', backendError)
    }
    
    // 后端失败时使用本地存储
    saveToLocalStorage(newConversation)
    conversations.value.unshift(newConversation)
    currentConversation.value = newConversation
    
    return newConversation
    
  } catch (err) {
    error.value = err instanceof Error ? err.message : '创建会话失败'
    throw err
  } finally {
    isLoading.value = false
  }
}

/**
 * 保存消息到当前会话
 */
export const saveMessage = async (message: ChatMessage): Promise<void> => {
  if (!currentConversation.value) return
  
  try {
    currentConversation.value.messages.push(message)
    currentConversation.value.updatedAt = new Date()
    
    // 自动生成更具体的标题（如果会话刚开始）
    if (currentConversation.value.messages.length === 2) {
      const firstMessage = currentConversation.value.messages[0]
      if (firstMessage.type === 'user') {
        currentConversation.value.title = firstMessage.content.slice(0, 30) + '...'
      }
    }
    
    // 尝试保存到后端
    try {
      await fetch(`${SERVICE_CONFIG.baseURL}/conversations/${currentConversation.value.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      })
    } catch (backendError) {
      console.warn('后端保存失败，使用本地存储:', backendError)
      saveToLocalStorage(currentConversation.value)
    }
    
  } catch (err) {
    error.value = err instanceof Error ? err.message : '保存消息失败'
    throw err
  }
}

/**
 * 加载用户的所有会话
 */
export const loadConversations = async (): Promise<Conversation[]> => {
  try {
    isLoading.value = true
    error.value = null
    
    // 尝试从后端加载
    try {
      const response = await fetch(`${SERVICE_CONFIG.baseURL}/conversations`)
      if (response.ok) {
        const data = await response.json()
        conversations.value = data
        return data
      }
    } catch (backendError) {
      console.warn('后端加载失败，使用本地存储:', backendError)
    }
    
    // 后端失败时从本地存储加载
    const localConversations = loadFromLocalStorage()
    conversations.value = localConversations
    return localConversations
    
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载会话失败'
    throw err
  } finally {
    isLoading.value = false
  }
}

/**
 * 搜索对话历史
 */
export const searchConversations = async (filter: SearchFilter): Promise<Conversation[]> => {
  try {
    isLoading.value = true
    error.value = null
    
    // 尝试后端搜索
    try {
      const queryParams = new URLSearchParams()
      if (filter.keyword) queryParams.append('q', filter.keyword)
      if (filter.persona) queryParams.append('persona', filter.persona)
      
      const response = await fetch(`${SERVICE_CONFIG.baseURL}/conversations/search?${queryParams}`)
      if (response.ok) {
        return await response.json()
      }
    } catch (backendError) {
      console.warn('后端搜索失败，使用本地搜索:', backendError)
    }
    
    // 后端失败时使用本地搜索
    return searchLocalConversations(filter)
    
  } catch (err) {
    error.value = err instanceof Error ? err.message : '搜索失败'
    throw err
  } finally {
    isLoading.value = false
  }
}

/**
 * 导出对话为指定格式
 */
export const exportConversation = async (conversationId: string, format: 'txt' | 'md' | 'json' = 'md'): Promise<string> => {
  const conversation = conversations.value.find(c => c.id === conversationId)
  if (!conversation) {
    throw new Error('对话不存在')
  }
  
  switch (format) {
    case 'txt':
      return exportToTxt(conversation)
    case 'md':
      return exportToMarkdown(conversation)
    case 'json':
      return exportToJson(conversation)
    default:
      throw new Error('不支持的导出格式')
  }
}

/**
 * 删除会话
 */
export const deleteConversation = async (conversationId: string): Promise<void> => {
  try {
    // 尝试后端删除
    try {
      await fetch(`${SERVICE_CONFIG.baseURL}/conversations/${conversationId}`, {
        method: 'DELETE'
      })
    } catch (backendError) {
      console.warn('后端删除失败，使用本地删除:', backendError)
    }
    
    // 本地删除
    conversations.value = conversations.value.filter(c => c.id !== conversationId)
    deleteFromLocalStorage(conversationId)
    
    if (currentConversation.value?.id === conversationId) {
      currentConversation.value = null
    }
    
  } catch (err) {
    error.value = err instanceof Error ? err.message : '删除会话失败'
    throw err
  }
}

// 本地存储辅助函数
const LOCAL_STORAGE_KEY = 'dao_conversations'

const saveToLocalStorage = (conversation: Conversation): void => {
  const existing = loadFromLocalStorage()
  const index = existing.findIndex(c => c.id === conversation.id)
  
  if (index >= 0) {
    existing[index] = conversation
  } else {
    existing.unshift(conversation)
  }
  
  // 只保留最近50个会话
  const trimmed = existing.slice(0, 50)
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(trimmed))
}

const loadFromLocalStorage = (): Conversation[] => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

const deleteFromLocalStorage = (conversationId: string): void => {
  const existing = loadFromLocalStorage()
  const filtered = existing.filter(c => c.id !== conversationId)
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered))
}

// 本地搜索实现
const searchLocalConversations = (filter: SearchFilter): Conversation[] => {
  let results = conversations.value
  
  if (filter.keyword) {
    const keyword = filter.keyword.toLowerCase()
    results = results.filter(conversation => 
      conversation.title.toLowerCase().includes(keyword) ||
      conversation.messages.some(msg => 
        msg.content.toLowerCase().includes(keyword)
      )
    )
  }
  
  if (filter.persona) {
    results = results.filter(conversation => conversation.persona === filter.persona)
  }
  
  if (filter.dateRange) {
    results = results.filter(conversation => 
      conversation.updatedAt >= filter.dateRange!.start &&
      conversation.updatedAt <= filter.dateRange!.end
    )
  }
  
  return results.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
}

// 导出格式实现
const exportToTxt = (conversation: Conversation): string => {
  let content = `对话标题: ${conversation.title}\n`
  content += `AI人格: ${conversation.persona}\n`
  content += `创建时间: ${conversation.createdAt.toLocaleString()}\n\n`
  
  conversation.messages.forEach(msg => {
    const prefix = msg.type === 'user' ? '用户: ' : 'AI: '
    content += `${prefix}${msg.content}\n\n`
  })
  
  return content
}

const exportToMarkdown = (conversation: Conversation): string => {
  let content = `# ${conversation.title}\n\n`
  content += `**AI人格**: ${conversation.persona}  
`
  content += `**创建时间**: ${conversation.createdAt.toLocaleString()}  
\n`
  
  conversation.messages.forEach((msg, index) => {
    const prefix = msg.type === 'user' ? '**用户**: ' : '**AI**: '
    content += `${prefix}${msg.content}\n\n`
    
    if (index < conversation.messages.length - 1) {
      content += '---\n\n'
    }
  })
  
  return content
}

const exportToJson = (conversation: Conversation): string => {
  return JSON.stringify(conversation, null, 2)
}

// 工具函数
const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

// 导出状态和函数
export const useConversationService = () => ({
  conversations,
  currentConversation,
  isLoading,
  error,
  createConversation,
  saveMessage,
  loadConversations,
  searchConversations,
  exportConversation,
  deleteConversation
})

// 导出类型
export type { Conversation as ConversationType, ChatMessage as ChatMessageType, SearchFilter as SearchFilterType }
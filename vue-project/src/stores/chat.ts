import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ChatMessage } from '@/types/chat'
import { searchKnowledge } from '@/data/knowledge_base'
import { 
  createConversation, 
  saveMessage, 
  loadConversations,
  searchConversations,
  exportConversation,
  deleteConversation,
  useConversationService,
  type SearchFilterType as SearchFilter 
} from '@/services/conversationService'
import { 
  sendDirectMessage,
  initializeAIService,
  getServiceStatus,
  getAvailableProviders,
  setAPIKey,
  type AIResponse 
} from '@/services/directAIService'

export const useChatStore = defineStore('chat', () => {
  // 状态
  const messages = ref<ChatMessage[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  // 会话管理
  const {
    conversations,
    currentConversation,
    isLoading: conversationsLoading,
    error: conversationsError
  } = useConversationService()
  
  // 初始化当前会话
  const initializeConversation = async () => {
    if (!currentConversation.value) {
      const newConversation = await createConversation('新对话')
      messages.value = newConversation.messages
    } else {
      messages.value = currentConversation.value.messages
    }
  }
  
  // 初始化欢迎消息
  const initializeWelcomeMessage = () => {
    const welcomeMessage: ChatMessage = {
      id: '1',
      content: '您好！我是道德经AI解读者，我可以帮您解读《道德经》的章节，解释其中的概念，或者与您探讨其中的哲理。请问您想了解哪方面的内容？',
      type: 'ai',
      timestamp: new Date()
    }
    
    if (messages.value.length === 0) {
      messages.value.push(welcomeMessage)
      if (currentConversation.value) {
        saveMessage(welcomeMessage)
      }
    }
  }

  // 快捷问题
  const quickQuestions = ref([
    '解释第一章',
    '什么是"道"',
    '"无为而治"的含义',
    '"上善若水"的解释'
  ])

  // 章节列表
  const chapters = ref([
    '第一章 论道',
    '第二章 美善',
    '第三章 无为',
    '第四章 冲虚',
    '第五章 守中',
    '第六章 谷神',
    '第七章 无私',
    '第八章 上善若水'
  ])

  // 热门问题
  const popularQuestions = ref([
    {
      title: '如何理解"道可道，非常道"？',
      preview: '这句话的意思是：可以用言语描述的"道"，就不是永恒不变的"道"。老子认为真正的"道"是无法用言语完全表达的，它超越了语言的限制...'
    },
    {
      title: '什么是"无为而治"？',
      preview: '"无为而治"是老子政治思想的核心，不是指什么都不做，而是指顺应自然规律，不强行干预，让事物按照其本性发展...'
    },
    {
      title: '如何理解"上善若水"？',
      preview: '"上善若水"出自第八章，意思是最高境界的善行就像水一样。水滋养万物而不争功，处于众人厌恶的低洼之处，却最接近于"道"...'
    }
  ])

  // 动作
  const sendMessage = async (content: string, persona: string = 'scholar') => {
    if (!content.trim()) return

    // 确保有当前会话
    if (!currentConversation.value) {
      await initializeConversation()
    }

    // 添加用户消息
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: content.trim(),
      type: 'user',
      timestamp: new Date()
    }
    messages.value.push(userMessage)
    await saveMessage(userMessage)

    // 设置加载状态
    isLoading.value = true
    error.value = null

    try {
      // 检查AI服务状态，如果未初始化，使用模拟数据作为降级方案
      const serviceStatus = getServiceStatus()
      
      if (!serviceStatus.isConnected) {
        // 降级到模拟数据
        await sendMockMessage(content, persona)
        return
      }

      // 构建上下文历史
      const conversationHistory = messages.value.slice(0, -1).map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }))

      // 调用真实AI服务
      const aiResponse: AIResponse = await sendDirectMessage(content, persona, conversationHistory)
      
      // 构建AI消息
      let aiContent = aiResponse.content
      
      // 如果有引用，添加格式化
      if (aiResponse.citations && aiResponse.citations.length > 0) {
        aiContent += '\n\n**相关引用：**\n'
        aiResponse.citations.forEach(citation => {
          aiContent += `- **第${citation.chapter}章**："${citation.text}"\n`
        })
      }
      
      // 如果有建议，添加格式化
      if (aiResponse.suggestions && aiResponse.suggestions.length > 0) {
        aiContent += '\n**后续问题建议：**\n'
        aiResponse.suggestions.forEach(suggestion => {
          aiContent += `- ${suggestion}\n`
        })
      }
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: aiContent,
        type: 'ai',
        timestamp: new Date()
      }
      
      messages.value.push(aiMessage)
      await saveMessage(aiMessage)
      
    } catch (err) {
      // AI服务失败时降级到模拟数据
      console.error('AI服务调用失败，使用降级方案:', err)
      await sendMockMessage(content, persona)
    } finally {
      isLoading.value = false
    }
  }

  // 降级方案：模拟消息
  const sendMockMessage = async (content: string, persona: string) => {
    try {
      // 模拟 RAG 检索
      const knowledge = searchKnowledge(content)
      
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      let mockAnswer = ''
      const prefix = persona === 'sage' ? '善哉，道友。' : 
                     persona === 'healer' ? '深呼吸，慢慢来。' : ''

      if (knowledge) {
        // 构建 RAG 风格的回答
        if (persona === 'scholar') {
          mockAnswer = `关于您提到的内容，在《道德经》**第${knowledge.chapter}章**中有明确论述：\n\n> **原文**\n> ${knowledge.content}\n\n> **王弼注**\n> ${knowledge.annotations.wangbi}\n\n**现代解读**：\n${knowledge.annotations.modern}`
        } else if (persona === 'sage') {
          mockAnswer = `${prefix}此理可见于**第${knowledge.chapter}章**。\n\n> **老子曰**\n> ${knowledge.content}\n\n河上公解此句云：\n\n> ${knowledge.annotations.heshanggong}\n\n道友细品，岂不妙哉？`
        } else if (persona === 'healer') {
          mockAnswer = `${prefix}读读**第${knowledge.chapter}章**或许能解开心结：\n\n> ${knowledge.content}\n\n试着理解它的深意：\n\n${knowledge.annotations.modern}\n\n就像水一样流过心间，不要强求。`
        }
      } else {
        // 兜底逻辑
        if (content.includes('第一章') || content.includes('道可道')) {
          mockAnswer = `${prefix}《道德经》**第一章**"道可道，非常道"是全书的总纲。它告诉我们：\n\n> "道"如果是可以用语言完全描述出来的，那它就不是永恒不变的、真正的"道"了。\n\n语言是有限的，而道是无限的。`
        } else if (content.includes('无为')) {
          mockAnswer = `${prefix}"无为"并不是什么都不做，而是指**顺应自然规律**，不妄为、不强求。\n\n- 在治理国家上，意味着不干扰百姓的自然生活\n- 在个人修养上，意味着消除私欲，回归本真`
        } else if (content.includes('上善若水')) {
          mockAnswer = `${prefix}"上善若水"出自**第八章**。水有几个特性：\n\n1. 滋养万物而不争名利\n2. 甘心停留在众人厌恶的低洼之地\n\n正因为水不争，所以天下没有人能与它相争。这也是道家推崇的处世哲学。`
        } else {
          if (persona === 'sage') {
             mockAnswer = `善哉，道友所问："${content}"，颇具慧根。世间万物，皆有其道。此事不妨从"道法自然"观之，去其执念，方见真章。`
          } else if (persona === 'healer') {
             mockAnswer = `感受到你对"${content}"的关注。在道家看来，身心本一体。试着放下对结果的焦虑，像水一样顺流而下，或许答案自然浮现。`
          } else {
             mockAnswer = `这是一个很好的问题："${content}"。从道德经的角度来看，我们要学会透过现象看本质。虽然目前我还不能针对这个问题给出特定的经文解释，但建议您可以参考"道法自然"的思想，尝试放下执念，顺其自然地看待它。`
          }
        }
      }
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: mockAnswer,
        type: 'ai',
        timestamp: new Date()
      }
      
      messages.value.push(aiMessage)
      await saveMessage(aiMessage)
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : '发生了未知错误'
    }
  }

  const sendQuickQuestion = (question: string) => {
    sendMessage(question)
  }

  const sendChapterQuestion = (chapter: string) => {
    sendMessage(`请帮我解读《道德经》${chapter}`)
  }

  // 会话管理函数
  const switchConversation = async (conversationId: string) => {
    const conversation = conversations.value.find(c => c.id === conversationId)
    if (conversation) {
      currentConversation.value = conversation
      messages.value = conversation.messages
    }
  }

  const createNewConversation = async (title?: string) => {
    const newTitle = title || `对话 ${conversations.value.length + 1}`
    const newConversation = await createConversation(newTitle)
    messages.value = newConversation.messages
    initializeWelcomeMessage()
  }

  const searchHistory = async (filter: SearchFilter) => {
    return await searchConversations(filter)
  }

  const exportHistory = async (conversationId: string, format: 'txt' | 'md' | 'json' = 'md') => {
    return await exportConversation(conversationId, format)
  }

  const removeConversation = async (conversationId: string) => {
    await deleteConversation(conversationId)
    if (currentConversation.value?.id === conversationId) {
      await createNewConversation()
    }
  }

  const loadAllConversations = async () => {
    return await loadConversations()
  }

  // AI服务管理函数
  const initAIService = async (providerName: string, apiKey?: string) => {
    return await initializeAIService(providerName, apiKey)
  }

  const getAIServiceStatus = () => {
    return getServiceStatus()
  }

  const getAvailableAIProviders = () => {
    return getAvailableProviders()
  }

  const setAIProviderAPIKey = (providerName: string, apiKey: string) => {
    setAPIKey(providerName, apiKey)
  }

  return {
    messages,
    isLoading,
    error,
    quickQuestions,
    chapters,
    popularQuestions,
    conversations,
    currentConversation,
    conversationsLoading,
    conversationsError,
    sendMessage,
    sendQuickQuestion,
    sendChapterQuestion,
    switchConversation,
    createNewConversation,
    searchHistory,
    exportHistory,
    removeConversation,
    loadAllConversations,
    initializeWelcomeMessage,
    // AI服务管理
    initAIService,
    getAIServiceStatus,
    getAvailableAIProviders,
    setAIProviderAPIKey
  }
})
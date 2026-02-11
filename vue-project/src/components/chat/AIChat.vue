<template>
  <div class="bamboo-scroll p-6 mb-8">
    <!-- AI头像和标题 -->
    <div class="flex flex-col md:flex-row items-center justify-between mb-4">
      <div class="flex items-center mb-2 md:mb-0">
        <div class="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center mr-3 shadow-md">
          <i :class="currentPersonaIcon"></i>
        </div>
        <div>
          <div class="text-lg font-medium text-primary">道德经AI解读者</div>
          <div class="text-xs text-gray-500">当前模式：{{ currentPersonaLabel }}</div>
        </div>
      </div>
      
      <!-- 角色选择器 -->
      <div class="relative group">
        <select 
          v-model="selectedPersona" 
          class="appearance-none bg-white border border-secondary/30 rounded-full px-4 py-1.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer shadow-sm hover:border-primary transition-colors"
        >
          <option value="scholar">🎓 现代学者 (严谨)</option>
          <option value="sage">🧘 道家隐士 (智慧)</option>
          <option value="healer">🍃 心理疗愈 (治愈)</option>
        </select>
        <div class="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
          <i class="fas fa-chevron-down text-xs"></i>
        </div>
      </div>
    </div>
    
    <!-- 对话历史 -->
    <div ref="chatContainerRef" class="chat-container mb-6 max-h-96 overflow-y-auto">
      <div 
        v-for="message in messages" 
        :key="message.id"
        :class="['chat-message', message.type]"
      >
        <div class="chat-avatar">
          <i :class="message.type === 'ai' ? 'fas fa-robot' : 'fas fa-user'"></i>
        </div>
        <div class="relative group">
          <div class="chat-content markdown-body" v-html="renderMarkdown(message.content)"></div>
          
          <!-- TTS Button (Only for AI messages) -->
          <button 
            v-if="message.type === 'ai'"
            @click="toggleSpeech(message)"
            class="absolute -bottom-6 left-0 text-gray-400 hover:text-primary transition-colors text-xs flex items-center opacity-0 group-hover:opacity-100"
            :class="{'opacity-100 text-primary': currentPlayingId === message.id}"
          >
            <i :class="currentPlayingId === message.id && isSpeaking ? 'fas fa-volume-up animate-pulse' : 'fas fa-volume-off'" class="mr-1"></i>
            {{ currentPlayingId === message.id && isSpeaking ? '停止朗读' : '朗读' }}
          </button>
        </div>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="isLoading" class="chat-message ai loading">
        <div class="chat-avatar">
          <i class="fas fa-robot"></i>
        </div>
        <div class="chat-content">
          <div class="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 输入区域 -->
    <div class="relative">
      <input 
        v-model="inputMessage"
        type="text" 
        placeholder="请输入您的问题..." 
        class="chat-input"
        @keypress.enter="sendMessage"
        :disabled="isLoading"
      />
      <button 
        @click="sendMessage"
        class="absolute right-2 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="isLoading || !inputMessage.trim()"
      >
        <i class="fas fa-paper-plane text-lg"></i>
      </button>
    </div>
    
    <!-- 快捷问题 -->
    <div class="flex flex-wrap justify-center mt-4 gap-2">
      <button 
        v-for="(question, index) in quickQuestions" 
        :key="index"
        @click="sendQuickQuestion(question)"
        class="quick-question"
        :disabled="isLoading"
      >
        {{ question }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useAuthStore } from '@/stores/auth'
import { useTTS } from '@/composables/useTTS'
import { storeToRefs } from 'pinia'
import { marked } from 'marked'

const chatStore = useChatStore()
const authStore = useAuthStore()
const { messages, isLoading, quickQuestions } = storeToRefs(chatStore)
const { user, isLoggedIn } = storeToRefs(authStore)
const { sendMessage: sendStoreMessage, sendQuickQuestion: sendStoreQuickQuestion } = chatStore
const { checkLimit, incrementUsage } = authStore

// TTS Integration
const { isSpeaking, toggle, stop } = useTTS()
const currentPlayingId = ref<string | null>(null)

const toggleSpeech = (message: any) => {
  if (currentPlayingId.value === message.id && isSpeaking.value) {
    stop()
    currentPlayingId.value = null
  } else {
    // Strip markdown for cleaner reading
    const cleanText = message.content.replace(/[#*`]/g, '')
    toggle(cleanText, selectedPersona.value as any)
    currentPlayingId.value = message.id
  }
}

// Watch for speaking state change to reset icon if speech ends naturally
watch(isSpeaking, (newVal) => {
  if (!newVal) {
    currentPlayingId.value = null
  }
})

const inputMessage = ref('')
const selectedPersona = ref('scholar')
const chatContainerRef = ref<HTMLElement | null>(null)

// 自动滚动到底部
const scrollToBottom = async () => {
  await nextTick()
  if (chatContainerRef.value) {
    chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight
  }
}

watch(() => messages.value.length, scrollToBottom)

const renderMarkdown = (content: string) => {
  return marked.parse(content)
}

const currentPersonaLabel = computed(() => {
  const map: Record<string, string> = {
    scholar: '现代学者',
    sage: '道家隐士',
    healer: '心理疗愈'
  }
  return map[selectedPersona.value]
})

const currentPersonaIcon = computed(() => {
  const map: Record<string, string> = {
    scholar: 'fas fa-robot',
    sage: 'fas fa-yin-yang',
    healer: 'fas fa-leaf'
  }
  return map[selectedPersona.value]
})

const sendMessage = async () => {
  if (!inputMessage.value.trim() || isLoading.value) return

  // Check login
  if (!isLoggedIn.value) {
    authStore.openAuthModal()
    return
  }

  // Check limit
  if (!checkLimit()) {
    authStore.showPricingModal = true
    return
  }
  
  // Check persona permission
  const tier = user.value?.subscription.tier || 'free'
  if (selectedPersona.value === 'sage' && tier === 'free') {
    if (confirm('“道家隐士”人格仅限居士及以上会员使用，是否升级？')) {
      authStore.showPricingModal = true
    }
    return
  }
  if (selectedPersona.value === 'healer' && tier !== 'master') {
    if (confirm('“心理疗愈”人格仅限宗师会员使用，是否升级？')) {
      authStore.showPricingModal = true
    }
    return
  }
  
  const msg = inputMessage.value
  inputMessage.value = ''
  
  // Increment usage count
  incrementUsage()
  
  await sendStoreMessage(msg, selectedPersona.value)
}

const sendQuickQuestion = async (question: string) => {
  if (isLoading.value) return
  
  // Check login
  if (!isLoggedIn.value) {
    authStore.openAuthModal()
    return
  }

  // Check limit
  if (!checkLimit()) {
    authStore.showPricingModal = true
    return
  }
  
  incrementUsage()
  await sendStoreQuickQuestion(question)
}
</script>

<style scoped>
.chat-container {
  scroll-behavior: smooth;
}

.chat-container::-webkit-scrollbar {
  width: 6px;
}

.chat-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.chat-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.chat-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 古籍模式适配 */
:global(html.retro-mode) .chat-message.ai .chat-content {
  font-family: "KaiTi", "STKaiti", serif;
}

:global(html.retro-mode) .chat-content {
  background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNjY2MiLz4KPC9zdmc+');
  border: 1px solid #8d6e63;
}

:global(html.retro-mode.zen-mode) .chat-content {
  background-image: none;
  border-color: #d4b483;
}

/* Markdown 样式适配 */
:deep(.markdown-body) {
  font-size: 0.95rem;
  line-height: 1.6;
}

:deep(.markdown-body p) {
  margin-bottom: 0.75rem;
}

:deep(.markdown-body p:last-child) {
  margin-bottom: 0;
}

:deep(.markdown-body strong) {
  font-weight: 600;
  color: theme('colors.primary');
}

/* 引用块样式 - 模拟古籍卡片 */
:deep(.markdown-body blockquote) {
  margin: 1rem 0;
  padding: 0.75rem 1rem;
  border-left: 4px solid theme('colors.primary');
  background-color: theme('colors.secondary' / 0.1);
  border-radius: 0 0.5rem 0.5rem 0;
  color: theme('colors.dark');
  font-style: italic;
}

/* 禅模式下的引用块 */
:global(html.zen-mode) :deep(.markdown-body blockquote) {
  background-color: #2c2c2e;
  border-left-color: #d4b483;
  color: #d1d5db;
}

/* 古籍模式下的引用块 */
:global(html.retro-mode) :deep(.markdown-body blockquote) {
  writing-mode: vertical-rl;
  text-orientation: upright;
  max-height: 400px;
  overflow-x: auto;
  font-family: "KaiTi", "STKaiti", serif;
  letter-spacing: 0.15em;
  line-height: 2;
  padding: 1.5rem 1rem;
  border-left: none;
  border-top: 4px solid theme('colors.primary'); /* 竖排时边框改到顶部或右侧，这里试用顶部 */
  background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNjY2MiLz4KPC9zdmc+');
  box-shadow: inset 0 0 20px rgba(0,0,0,0.05);
}

/* 古籍模式+禅模式 */
:global(html.retro-mode.zen-mode) :deep(.markdown-body blockquote) {
  background-image: none;
  background-color: #2c2c2e;
  border-top-color: #d4b483;
  box-shadow: none;
}

:deep(.markdown-body ul) {
  list-style-type: disc;
  padding-left: 1.5rem;
  margin-bottom: 0.75rem;
}

:deep(.markdown-body ol) {
  list-style-type: decimal;
  padding-left: 1.5rem;
  margin-bottom: 0.75rem;
}
</style>
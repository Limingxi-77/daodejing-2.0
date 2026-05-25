<template>
  <div class="bamboo-scroll p-6 mb-8">
    <!-- AI头像和标题 -->
    <div class="flex flex-col md:flex-row items-center justify-between mb-4">
      <div class="flex items-center mb-2 md:mb-0 min-w-0">
        <div class="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center mr-3 shadow-md flex-shrink-0">
          <i :class="currentPersonaIcon" aria-hidden="true"></i>
        </div>
        <div class="min-w-0">
          <div class="text-lg font-medium text-primary">道德经AI解读者</div>
          <div class="text-xs text-gray-500">当前模式：{{ currentPersonaLabel }}</div>
        </div>
      </div>

      <!-- 角色选择器 -->
      <div class="relative group">
        <label for="ai-persona-select" class="sr-only">选择 AI 解读人格</label>
        <select
          id="ai-persona-select"
          v-model="selectedPersona"
          class="appearance-none bg-white border border-secondary/30 rounded-full px-4 py-1.5 pr-8 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer shadow-sm hover:border-primary transition-[color,background-color,border-color]"
        >
          <option value="scholar">🎓 现代学者 (严谨)</option>
          <option value="sage">🧘 道家隐士 (智慧)</option>
          <option value="healer">🍃 心理疗愈 (治愈)</option>
        </select>
        <div class="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
          <i class="fas fa-chevron-down text-xs" aria-hidden="true"></i>
        </div>
      </div>
    </div>

    <!-- 错误提示（AI 失败或降级时可见） -->
    <div
      v-if="serviceMessage"
      class="mb-4 p-3 rounded-lg border text-sm flex items-start gap-2"
      :class="serviceMessageClass"
      role="status"
      aria-live="polite"
    >
      <i :class="serviceMessageIcon" class="mt-0.5" aria-hidden="true"></i>
      <span class="flex-1 min-w-0">{{ serviceMessage }}</span>
      <button
        type="button"
        class="text-xs underline hover:no-underline"
        @click="dismissServiceMessage"
        aria-label="关闭提示"
      >关闭</button>
    </div>

    <!-- 对话历史 -->
    <div
      ref="chatContainerRef"
      data-testid="ai-chat-messages"
      class="chat-container mb-6 h-80 overflow-y-auto"
      role="log"
      aria-live="polite"
      aria-relevant="additions"
      :aria-busy="isLoading"
    >
      <div
        v-for="message in messages"
        :key="message.id"
        :class="['chat-message', message.type]"
        :data-testid="message.type === 'ai' ? 'ai-chat-message-ai' : 'ai-chat-message-user'"
      >
        <div class="chat-avatar" aria-hidden="true">
          <i :class="message.type === 'ai' ? 'fas fa-robot' : 'fas fa-user'"></i>
        </div>
        <div class="relative group min-w-0">
          <div data-testid="ai-chat-message-content" class="chat-content markdown-body" v-html="renderMarkdown(message.content)"></div>

          <!-- TTS Button (Only for AI messages) -->
          <button
            v-if="message.type === 'ai'"
            type="button"
            @click="toggleSpeech(message)"
            class="absolute -bottom-6 left-0 text-gray-400 hover:text-primary focus-visible:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary transition-colors text-xs flex items-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
            :class="{'opacity-100 text-primary': currentPlayingId === message.id}"
            :aria-label="currentPlayingId === message.id ? '停止朗读 AI 回复' : '朗读 AI 回复'"
          >
            <i
              :class="currentPlayingId === message.id ? 'fas fa-volume-up motion-safe:animate-pulse' : 'fas fa-volume-off'"
              class="mr-1"
              aria-hidden="true"
            ></i>
            <span>{{ currentPlayingId === message.id ? '停止朗读' : '朗读' }}</span>
          </button>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="isLoading" class="chat-message ai loading" aria-label="AI 正在思考">
        <div class="chat-avatar" aria-hidden="true">
          <i class="fas fa-robot"></i>
        </div>
        <div class="chat-content">
          <div class="loading-dots" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="relative">
      <label for="ai-chat-input" class="sr-only">输入您的问题</label>
      <input
        id="ai-chat-input"
        data-testid="ai-chat-input"
        v-model="inputMessage"
        type="text"
        name="ai-question"
        autocomplete="off"
        spellcheck="false"
        placeholder="请输入您的问题…"
        class="chat-input focus-visible:ring-2 focus-visible:ring-primary"
        @keydown.enter="onEnterPressed"
        @compositionstart="isComposing = true"
        @compositionend="isComposing = false"
      />
      <button
        v-if="supportsVoiceInput"
        type="button"
        data-testid="ai-chat-voice"
        @click="toggleVoiceInput"
        :class="[
          'absolute right-16 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
          isListening
            ? 'bg-red-500 text-white animate-pulse'
            : 'bg-secondary/10 text-primary hover:bg-secondary/20'
        ]"
        :disabled="isLoading"
        :aria-label="isListening ? '停止录音' : '开始语音输入'"
        :title="isListening ? '正在听… 点击停止' : '语音输入'"
      >
        <i :class="isListening ? 'fas fa-stop' : 'fas fa-microphone'" aria-hidden="true"></i>
      </button>
      <button
        type="button"
        data-testid="ai-chat-send"
        @click="sendMessage"
        class="absolute right-2 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="isLoading || !inputMessage.trim()"
        aria-label="发送消息"
      >
        <i class="fas fa-paper-plane text-lg" aria-hidden="true"></i>
      </button>
    </div>
    <p
      v-if="voiceError"
      data-testid="ai-chat-voice-error"
      class="text-xs text-red-500 mt-2 text-center"
      role="alert"
    >
      {{ voiceError }}
    </p>

    <!-- 快捷问题 -->
    <div class="flex flex-wrap justify-center mt-4 gap-2" role="group" aria-label="快捷问题">
      <button
        v-for="(question, index) in quickQuestions"
        :key="index"
        type="button"
        @click="sendQuickQuestion(question)"
        class="quick-question focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        :disabled="isLoading"
      >
        {{ question }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch, onBeforeUnmount } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { renderSafeMarkdown } from '@/utils/safeMarkdown'
import { SpeechRecognizer, isSpeechRecognitionSupported } from '@/utils/speechRecognition'

const chatStore = useChatStore()
const authStore = useAuthStore()
const { messages, isLoading, quickQuestions, error: storeError, lastMode } = storeToRefs(chatStore)
const { user, isLoggedIn } = storeToRefs(authStore)
const { sendMessage: sendStoreMessage, sendStream: sendStoreStream, sendQuickQuestion: sendStoreQuickQuestion } = chatStore
const streamEnabled = import.meta.env.VITE_AI_STREAM !== 'false'
const { checkLimit, incrementUsage } = authStore

// ============================================
// 朗读功能（重做：直接用 window.speechSynthesis，零中间层）
// ============================================
const currentPlayingId = ref<string | null>(null)
let currentUtterance: SpeechSynthesisUtterance | null = null

const supportsTTS = typeof window !== 'undefined' && 'speechSynthesis' in window

// ============================================
// 语音输入(SpeechRecognition)
// ============================================
const supportsVoiceInput = isSpeechRecognitionSupported()
const isListening = ref(false)
const voiceError = ref('')
let recognizer: SpeechRecognizer | null = null
let voiceBaseText = ''

const toggleVoiceInput = () => {
  if (isListening.value) {
    recognizer?.stop()
    return
  }
  if (!supportsVoiceInput) {
    voiceError.value = '当前浏览器不支持语音输入,请使用 Chrome 或 Edge'
    return
  }
  voiceError.value = ''
  voiceBaseText = inputMessage.value
  recognizer = new SpeechRecognizer({
    lang: 'zh-CN',
    interimResults: true,
    continuous: false,
    onStart: () => { isListening.value = true },
    onEnd: () => { isListening.value = false },
    onError: msg => {
      voiceError.value = msg
      isListening.value = false
    },
    onResult: ({ transcript, isFinal }) => {
      const merged = voiceBaseText ? `${voiceBaseText} ${transcript}` : transcript
      inputMessage.value = merged
      if (isFinal) voiceBaseText = merged
    }
  })
  recognizer.start()
}

const stripMarkdown = (text: string): string =>
  text
    .replace(/```[\s\S]*?```/g, '')          // 移除代码块
    .replace(/`([^`]+)`/g, '$1')             // 行内 code
    .replace(/!\[.*?\]\(.*?\)/g, '')         // 图片
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 链接 → 文字
    .replace(/[#*_~>]/g, '')                 // 其余 markdown 符号
    .replace(/\s+/g, ' ')                    // 折叠空白
    .trim()

const stopSpeech = () => {
  if (supportsTTS) {
    try { window.speechSynthesis.cancel() } catch { /* ignore */ }
  }
  currentUtterance = null
  currentPlayingId.value = null
}

const toggleSpeech = (message: { id: string; content: string }) => {
  // 同一条消息再次点击 → 停止
  if (currentPlayingId.value === message.id) {
    stopSpeech()
    return
  }

  if (!supportsTTS) {
    alert('当前浏览器不支持语音合成')
    return
  }

  // 切到新消息：先彻底取消上一次播放
  window.speechSynthesis.cancel()
  currentUtterance = null

  const text = stripMarkdown(message.content)
  if (!text) return

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'zh-CN'
  utterance.rate = 1.0
  utterance.volume = 1.0
  utterance.pitch = 1.0

  // 优先挑选中文音色
  const voices = window.speechSynthesis.getVoices()
  const zhVoice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('zh'))
  if (zhVoice) utterance.voice = zhVoice

  utterance.onend = () => {
    if (currentUtterance === utterance) {
      currentUtterance = null
      currentPlayingId.value = null
    }
  }

  utterance.onerror = (e) => {
    console.warn('TTS 播放出错:', e.error)
    if (currentUtterance === utterance) {
      currentUtterance = null
      currentPlayingId.value = null
    }
  }

  currentUtterance = utterance
  currentPlayingId.value = message.id
  window.speechSynthesis.speak(utterance)
}

// 组件卸载时停掉播放，避免离开页面后还在念
onBeforeUnmount(() => {
  if (supportsTTS) {
    try { window.speechSynthesis.cancel() } catch { /* ignore */ }
  }
  currentUtterance = null
  currentPlayingId.value = null
})

const inputMessage = ref('')
const selectedPersona = ref('scholar')
const chatContainerRef = ref<HTMLElement | null>(null)
const dismissedServiceKey = ref<string | null>(null)
const isComposing = ref(false)

const onEnterPressed = (e: KeyboardEvent) => {
  e.preventDefault()
  if (isComposing.value || e.isComposing) return
  sendMessage()
}

const scrollToBottom = async () => {
  await nextTick()
  if (chatContainerRef.value) {
    chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight
  }
}

watch(() => messages.value.length, scrollToBottom)

const renderMarkdown = (content: string) => {
  return renderSafeMarkdown(content)
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

const serviceMessage = computed(() => {
  if (dismissedServiceKey.value === serviceMessageKey.value) return ''
  if (storeError.value) return storeError.value
  if (lastMode.value === 'mock-no-server-key') {
    return 'AI 暂未配置 API Key，当前回复来自本地演示模板。请管理员在后台"AI 供应商"页面填入有效 Key。'
  }
  if (lastMode.value === 'local-fallback') {
    return 'AI 服务暂时不可用，已切换到本地知识库回答。'
  }
  return ''
})

const serviceMessageKey = computed(() =>
  storeError.value ? `err:${storeError.value}` : (lastMode.value || '')
)

const serviceMessageClass = computed(() =>
  storeError.value
    ? 'bg-red-50 border-red-200 text-red-700'
    : 'bg-amber-50 border-amber-200 text-amber-700'
)

const serviceMessageIcon = computed(() =>
  storeError.value ? 'fas fa-times-circle' : 'fas fa-info-circle'
)

const dismissServiceMessage = () => {
  dismissedServiceKey.value = serviceMessageKey.value
}

const sendMessage = async () => {
  if (!inputMessage.value.trim() || isLoading.value) return

  if (!isLoggedIn.value) {
    authStore.openAuthModal()
    return
  }

  if (!checkLimit()) {
    authStore.showPricingModal = true
    return
  }

  const tier = user.value?.subscription.tier || 'free'
  if (selectedPersona.value === 'sage' && tier === 'free') {
    if (confirm('"道家隐士"人格仅限居士及以上会员使用，是否升级？')) {
      authStore.showPricingModal = true
    }
    return
  }
  if (selectedPersona.value === 'healer' && tier !== 'master') {
    if (confirm('"心理疗愈"人格仅限宗师会员使用，是否升级？')) {
      authStore.showPricingModal = true
    }
    return
  }

  const msg = inputMessage.value
  inputMessage.value = ''
  dismissedServiceKey.value = null

  incrementUsage()

  if (streamEnabled) {
    await sendStoreStream(msg, selectedPersona.value)
  } else {
    await sendStoreMessage(msg, selectedPersona.value)
  }
}

const sendQuickQuestion = async (question: string) => {
  if (isLoading.value) return

  if (!isLoggedIn.value) {
    authStore.openAuthModal()
    return
  }

  if (!checkLimit()) {
    authStore.showPricingModal = true
    return
  }

  dismissedServiceKey.value = null
  incrementUsage()
  await sendStoreQuickQuestion(question)
}
</script>

<style scoped>
.chat-container {
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  .chat-container {
    scroll-behavior: auto;
  }
  .loading-dots span {
    animation: none !important;
  }
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

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
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
  border-top: 4px solid theme('colors.primary');
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

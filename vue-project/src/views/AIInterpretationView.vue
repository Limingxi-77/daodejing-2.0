<template>
  <div class="pt-32 pb-20 px-4 md:px-8 bg-transparent" data-testid="ai-interpretation-page">
    <div class="container mx-auto">
      <!-- 页面标题和工具栏 -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-3xl md:text-4xl font-bold text-primary">
            AI解读道德经
          </h1>
          <p class="text-xl text-dark mt-2">
            {{ mode === 'council' ? '三家视角并行回答你的提问,体会同一问题的不同解读' : '与AI对话，深入理解《道德经》的智慧' }}
          </p>
        </div>

        <!-- 工具栏 -->
        <div class="flex items-center gap-3">
          <!-- 模式切换 -->
          <div class="inline-flex rounded-lg border border-gray-200/70 bg-white/80 backdrop-blur-sm p-1" role="tablist" aria-label="解读模式">
            <button
              type="button"
              class="mode-tab"
              :class="{ active: mode === 'single' }"
              role="tab"
              :aria-selected="mode === 'single'"
              data-testid="mode-tab-single"
              @click="mode = 'single'"
            >
              <i class="fas fa-user mr-1" aria-hidden="true"></i>
              <span class="hidden sm:inline">单人解读</span>
            </button>
            <button
              type="button"
              class="mode-tab"
              :class="{ active: mode === 'council' }"
              role="tab"
              :aria-selected="mode === 'council'"
              data-testid="mode-tab-council"
              @click="mode = 'council'"
            >
              <i class="fas fa-users mr-1" aria-hidden="true"></i>
              <span class="hidden sm:inline">三家会议</span>
            </button>
          </div>

          <!-- 道德经语音合成入口 -->
          <button
            v-if="mode === 'single'"
            type="button"
            class="btn-toolbar btn-primary"
            @click="router.push('/tts')"
            aria-label="进入道德经语音合成页面"
          >
            <i class="fas fa-music" aria-hidden="true"></i>
            <span class="ml-2 hidden md:inline">道德经解读</span>
          </button>

          <!-- 语音合成按钮 -->
          <button
            v-if="mode === 'single' && lastAIMessage"
            type="button"
            class="btn-toolbar"
            :class="{ active: isPlaying }"
            @click="toggleSpeech"
            :aria-label="isPlaying ? '停止朗读 AI 回复' : '朗读最新 AI 回复'"
            :aria-pressed="isPlaying"
          >
            <i
              :class="isPlaying ? 'fas fa-volume-up motion-safe:animate-pulse' : 'fas fa-volume-off'"
              aria-hidden="true"
            ></i>
            <span class="ml-2 hidden md:inline">{{ isPlaying ? '停止朗读' : '朗读回复' }}</span>
          </button>

          <!-- 对话历史切换按钮 -->
          <button
            v-if="mode === 'single'"
            type="button"
            class="btn-toolbar"
            :class="{ active: showHistory }"
            @click="toggleHistory"
            aria-label="切换对话历史侧栏"
            :aria-pressed="showHistory"
          >
            <i class="fas fa-history" aria-hidden="true"></i>
            <span class="ml-2 hidden md:inline">对话历史</span>
          </button>

          <!-- 新建对话按钮 -->
          <button
            v-if="mode === 'single'"
            type="button"
            class="btn-toolbar"
            @click="createNewConversation"
            aria-label="新建对话"
          >
            <i class="fas fa-plus" aria-hidden="true"></i>
            <span class="ml-2 hidden md:inline">新建对话</span>
          </button>
        </div>
      </div>

      <!-- 单人解读模式 -->
      <div v-if="mode === 'single'" class="flex flex-col lg:flex-row gap-6">
        <!-- 可折叠对话历史侧边栏 -->
        <div
          class="lg:w-80 flex-shrink-0 transition-[opacity,transform] duration-300"
          :class="{
            'lg:block': showHistory,
            'hidden': !showHistory
          }"
        >
          <div class="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200/50 h-full">
            <div class="p-4 border-b border-gray-200/50 flex justify-between items-center">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">对话历史</h3>
                <p class="text-sm text-gray-600 mt-1">管理您的对话记录</p>
              </div>
              <button
                type="button"
                class="btn-icon"
                @click="toggleHistory"
                aria-label="隐藏对话历史侧栏"
              >
                <i class="fas fa-times" aria-hidden="true"></i>
              </button>
            </div>
            <ConversationHistory
              @conversation-selected="handleConversationSelected"
              @new-conversation="handleNewConversation"
              class="h-[calc(100vh-300px)]"
            />
          </div>
        </div>

        <!-- 主聊天区域 -->
        <div
          class="flex-1 min-w-0 transition-[width] duration-300"
          :class="showHistory ? 'lg:w-[calc(100%-20rem)]' : 'lg:w-full'"
        >
          <AIChat />
        </div>
      </div>

      <!-- 三家会议模式 -->
      <CouncilPanel v-else ref="councilPanelRef" />

      <!-- 公共辅助内容 — 章节、场景卡、热门问题(两种模式都显示,确保切换一致性) -->
      <div class="mt-8">
        <ChapterSelector />
      </div>
      <div class="mt-8">
        <ScenarioCards />
      </div>
      <div class="mt-8">
        <PopularQuestions />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, provide } from 'vue'
import { useRouter } from 'vue-router'
import AIChat from '@/components/chat/AIChat.vue'
import ChapterSelector from '@/components/chat/ChapterSelector.vue'
import PopularQuestions from '@/components/chat/PopularQuestions.vue'
import ScenarioCards from '@/components/chat/ScenarioCards.vue'
import ConversationHistory from '@/components/chat/ConversationHistory.vue'
import CouncilPanel from '@/components/chat/CouncilPanel.vue'
import { useChatStore } from '@/stores/chat'
import { useTTS } from '@/composables/useTTS'
import { storeToRefs } from 'pinia'

const router = useRouter()

const chatStore = useChatStore()
const { messages } = storeToRefs(chatStore)
const showHistory = ref(false)
const mode = ref<'single' | 'council'>('single')
const councilPanelRef = ref<InstanceType<typeof CouncilPanel> | null>(null)

// 模式感知的 prompt 分发:在单人模式直接走流式;在三家会议模式回填到 CouncilPanel 输入框
const handlePromptPick = (prompt: string) => {
  const text = (prompt ?? '').trim()
  if (!text) return
  if (mode.value === 'council') {
    councilPanelRef.value?.setQuestion(text)
    requestAnimationFrame(() => {
      const target = document.querySelector('[data-testid="council-question-input"]') as HTMLTextAreaElement | null
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' })
        target.focus()
      }
    })
    return
  }
  // 默认单人模式:走流式 AI 回复
  void chatStore.sendStream(text)
  requestAnimationFrame(() => {
    const target = document.querySelector('[data-testid="ai-chat"]') || document.querySelector('.ai-chat-container')
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

provide('aiInterpretationMode', mode)
provide('aiInterpretationPromptPick', handlePromptPick)

// 语音合成
const { speak, stop } = useTTS()
const isPlaying = ref(false)

// 获取最后一条 AI 消息
const lastAIMessage = computed(() => {
  const aiMessages = messages.value.filter(m => m.type === 'ai')
  return aiMessages[aiMessages.length - 1]
})

// 播放/停止语音
const toggleSpeech = async () => {
  if (isPlaying.value) {
    stop()
    isPlaying.value = false
  } else {
    if (lastAIMessage.value) {
      isPlaying.value = true
      await speak(lastAIMessage.value.content)
      isPlaying.value = false
    }
  }
}

// 切换对话历史显示状态
const toggleHistory = () => {
  showHistory.value = !showHistory.value
}

// 处理对话选择事件
const handleConversationSelected = (conversationId: string) => {
  console.log('切换到对话:', conversationId)
}

// 处理新建对话事件
const handleNewConversation = async () => {
  await chatStore.createNewConversation()
  showHistory.value = false
}

// 新建对话
const createNewConversation = async () => {
  await chatStore.createNewConversation()
  showHistory.value = true
}
</script>

<style scoped>
/* 工具栏按钮样式 */
.btn-toolbar {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border: 1px solid rgba(229, 231, 235, 0.7);
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s, background-color 0.2s, border-color 0.2s, box-shadow 0.2s, transform 0.1s;
}

.btn-toolbar:hover,
.btn-toolbar:focus-visible {
  border-color: #3b82f6;
  color: #3b82f6;
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.1);
  outline: none;
}

.btn-toolbar:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.btn-toolbar.active {
  border-color: #3b82f6;
  background: #3b82f6;
  color: white;
}

.btn-toolbar.btn-primary {
  border-color: #10b981;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

/* 模式切换 Tab */
.mode-tab {
  display: inline-flex;
  align-items: center;
  padding: 0.4rem 0.9rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  background: transparent;
  cursor: pointer;
  transition: color 0.2s, background-color 0.2s;
}

.mode-tab:hover,
.mode-tab:focus-visible {
  color: #3b82f6;
  outline: none;
}

.mode-tab:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.mode-tab.active {
  background: #3b82f6;
  color: white;
}

.btn-toolbar.btn-primary:hover,
.btn-toolbar.btn-primary:focus-visible {
  border-color: #059669;
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-toolbar:active {
  transform: scale(0.98);
}

@media (prefers-reduced-motion: reduce) {
  .btn-toolbar,
  .btn-toolbar:active {
    transition: none;
    transform: none;
  }
}

/* 图标按钮样式 */
.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 0.375rem;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  transition: color 0.2s, background-color 0.2s;
}

.btn-icon:hover,
.btn-icon:focus-visible {
  background: #f3f4f6;
  color: #374151;
  outline: none;
}

.btn-icon:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* 响应式布局调整 */
@media (max-width: 1024px) {
  .flex.items-center.justify-between {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .flex.items-center.gap-3 {
    width: 100%;
    justify-content: flex-end;
  }
}

/* 古籍模式适配 */
:global(html.retro-mode) h1,
:global(html.retro-mode) h2,
:global(html.retro-mode) h3 {
  font-family: "KaiTi", "STKaiti", serif;
}
</style>

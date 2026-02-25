<template>
  <div class="pt-32 pb-20 px-4 md:px-8 bg-transparent">
    <div class="container mx-auto">
      <!-- 页面标题和工具栏 -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-3xl md:text-4xl font-bold text-primary">
            AI解读道德经
          </h1>
          <p class="text-xl text-dark mt-2">
            与AI对话，深入理解《道德经》的智慧
          </p>
        </div>
        
        <!-- 工具栏 -->
        <div class="flex items-center gap-3">
          <!-- 对话历史切换按钮 -->
          <button 
            class="btn-toolbar"
            :class="{ active: showHistory }"
            @click="toggleHistory"
            title="对话历史"
          >
            <i class="fas fa-history"></i>
            <span class="ml-2 hidden md:inline">对话历史</span>
          </button>
          
          <!-- 新建对话按钮 -->
          <button 
            class="btn-toolbar"
            @click="createNewConversation"
            title="新建对话"
          >
            <i class="fas fa-plus"></i>
            <span class="ml-2 hidden md:inline">新建对话</span>
          </button>
        </div>
      </div>
      
      <div class="flex flex-col lg:flex-row gap-6">
        <!-- 可折叠对话历史侧边栏 -->
        <div 
          class="lg:w-80 flex-shrink-0 transition-all duration-300"
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
                class="btn-icon"
                @click="toggleHistory"
                title="隐藏对话历史"
              >
                <i class="fas fa-times"></i>
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
          class="flex-1 transition-all duration-300"
          :class="{
            'lg:w-full': !showHistory,
            'lg:w-calc(100%-20rem)': showHistory
          }"
        >
          <!-- AI聊天组件 -->
          <AIChat />
          
          <!-- 章节选择组件 -->
          <ChapterSelector />
          
          <!-- 热门问题组件 -->
          <PopularQuestions />
        </div>
=======
  <div class="pt-32 pb-20 px-4 md:px-8">
    <div class="container mx-auto">
      <div class="max-w-4xl mx-auto">
        <!-- 页面标题 -->
        <h1 class="text-3xl md:text-4xl font-bold text-primary mb-6 text-center">
          AI解读道德经
        </h1>
        <p class="text-xl text-dark mb-10 text-center">
          与AI对话，深入理解《道德经》的智慧
        </p>
        
        <!-- AI聊天组件 -->
        <AIChat />
        
        <!-- 章节选择组件 -->
        <ChapterSelector />
        
        <!-- 热门问题组件 -->
        <PopularQuestions />
>>>>>>> 60f179f9e010426d11f0ac47af89f6d355761052
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
<<<<<<< HEAD
import { ref } from 'vue'
import AIChat from '@/components/chat/AIChat.vue'
import ChapterSelector from '@/components/chat/ChapterSelector.vue'
import PopularQuestions from '@/components/chat/PopularQuestions.vue'
import ConversationHistory from '@/components/chat/ConversationHistory.vue'
import { useChatStore } from '@/stores/chat'

const chatStore = useChatStore()
const showHistory = ref(false)

// 切换对话历史显示状态
const toggleHistory = () => {
  showHistory.value = !showHistory.value
}

// 处理对话选择事件
const handleConversationSelected = (conversationId: string) => {
  console.log('切换到对话:', conversationId)
  // 聊天组件会自动更新，因为共享同一个store
}

// 处理新建对话事件
const handleNewConversation = async () => {
  await chatStore.createNewConversation()
  // 自动隐藏历史侧边栏，让用户专注于新对话
  showHistory.value = false
}

// 新建对话
const createNewConversation = async () => {
  await chatStore.createNewConversation()
  // 显示历史侧边栏，让用户看到新对话已创建
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
  transition: all 0.2s;
}

.btn-toolbar:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.1);
}

.btn-toolbar.active {
  border-color: #3b82f6;
  background: #3b82f6;
  color: white;
}

.btn-toolbar:active {
  transform: scale(0.98);
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
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #f3f4f6;
  color: #374151;
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

=======
import AIChat from '@/components/chat/AIChat.vue'
import ChapterSelector from '@/components/chat/ChapterSelector.vue'
import PopularQuestions from '@/components/chat/PopularQuestions.vue'
</script>

<style scoped>
>>>>>>> 60f179f9e010426d11f0ac47af89f6d355761052
/* 古籍模式适配 */
:global(html.retro-mode) h1,
:global(html.retro-mode) h2,
:global(html.retro-mode) h3 {
  font-family: "KaiTi", "STKaiti", serif;
}
</style>
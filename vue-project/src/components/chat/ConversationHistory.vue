<!-- 对话历史管理组件 -->
<template>
  <div class="conversation-history">
    <!-- 搜索和筛选区域 -->
    <div class="search-section">
      <div class="search-input">
        <i class="fas fa-search"></i>
        <input 
          v-model="searchKeyword" 
          type="text" 
          placeholder="搜索对话内容..."
          @input="handleSearch"
        />
      </div>
      
      <div class="filter-section">
        <select v-model="selectedPersona" @change="handleFilterChange">
          <option value="">所有AI人格</option>
          <option value="scholar">现代学者</option>
          <option value="hermit">道家隐士</option>
          <option value="therapist">心理疗愈</option>
        </select>
        
        <select v-model="dateRange" @change="handleFilterChange">
          <option value="all">全部时间</option>
          <option value="today">今天</option>
          <option value="week">本周</option>
          <option value="month">本月</option>
        </select>
      </div>
    </div>

    <!-- 对话列表 -->
    <div class="conversation-list">
      <div 
        v-for="conversation in filteredConversations" 
        :key="conversation.id"
        class="conversation-item"
        :class="{ active: chatStore.currentConversation?.id === conversation.id }"
        @click="selectConversation(conversation.id)"
      >
        <div class="conversation-header">
          <h4 class="conversation-title">{{ conversation.title }}</h4>
          <div class="conversation-meta">
            <span class="persona-badge" :class="getPersonaClass(conversation.persona)">
              {{ getPersonaName(conversation.persona) }}
            </span>
            <span class="time">{{ formatTime(conversation.updatedAt) }}</span>
          </div>
        </div>
        
        <div class="conversation-preview">
          <p class="preview-text">{{ getPreviewText(conversation) }}</p>
          <span class="message-count">{{ conversation.messages.length }} 条消息</span>
        </div>
        
        <div class="conversation-actions">
          <button 
            class="btn-icon" 
            @click.stop="exportConversation(conversation.id)"
            title="导出对话"
          >
            <i class="fas fa-download"></i>
          </button>
          <button 
            class="btn-icon danger" 
            @click.stop="deleteConversation(conversation.id)"
            title="删除对话"
          >
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-if="filteredConversations.length === 0" class="empty-state">
        <i class="fas fa-comments"></i>
        <p>暂无对话记录</p>
        <button class="btn-primary" @click="createNewConversation">
          开始新对话
        </button>
      </div>
    </div>

    <!-- 新建对话按钮 -->
    <div class="new-conversation-section">
      <button class="btn-primary new-conversation-btn" @click="createNewConversation">
        <i class="fas fa-plus"></i>
        新建对话
      </button>
    </div>

    <!-- 导出模态框 -->
    <div v-if="showExportModal" class="modal-overlay" @click="closeExportModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>导出对话</h3>
          <button class="close-btn" @click="closeExportModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="format-options">
            <label>
              <input type="radio" v-model="exportFormat" value="md">
              <span>Markdown (.md)</span>
            </label>
            <label>
              <input type="radio" v-model="exportFormat" value="txt">
              <span>纯文本 (.txt)</span>
            </label>
            <label>
              <input type="radio" v-model="exportFormat" value="json">
              <span>JSON (.json)</span>
            </label>
          </div>
          
          <div class="export-preview">
            <textarea 
              v-model="exportContent" 
              readonly 
              rows="8"
              placeholder="导出内容预览..."
            ></textarea>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeExportModal">取消</button>
          <button class="btn-primary" @click="downloadExport">下载</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useChatStore } from '@/stores/chat'
import type { Conversation } from '@/services/conversationService'

// 组件属性
interface Props {
  visible?: boolean
}

withDefaults(defineProps<Props>(), {
  visible: true
})

// 事件定义
const emit = defineEmits<{
  conversationSelected: [conversationId: string]
  newConversation: []
}>()

// 状态管理
const chatStore = useChatStore()
const searchKeyword = ref('')
const selectedPersona = ref('')
const dateRange = ref('all')
const showExportModal = ref(false)
const exportFormat = ref<'md' | 'txt' | 'json'>('md')
const exportContent = ref('')
const currentExportId = ref('')

// 计算属性
const filteredConversations = computed(() => {
  let conversations = chatStore.conversations
  
  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    conversations = conversations.filter(conv => 
      conv.title.toLowerCase().includes(keyword) ||
      conv.messages.some(msg => 
        msg.content.toLowerCase().includes(keyword)
      )
    )
  }
  
  // AI人格筛选
  if (selectedPersona.value) {
    conversations = conversations.filter(conv => 
      conv.persona === selectedPersona.value
    )
  }
  
  // 时间范围筛选
  if (dateRange.value !== 'all') {
    const now = new Date()
    const startDate = new Date()
    
    switch (dateRange.value) {
      case 'today':
        startDate.setHours(0, 0, 0, 0)
        break
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
    }
    
    conversations = conversations.filter(conv => 
      new Date(conv.updatedAt) >= startDate
    )
  }
  
  return conversations.sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )
})

// 方法
const getPersonaName = (persona: string): string => {
  const personas = {
    scholar: '现代学者',
    hermit: '道家隐士',
    therapist: '心理疗愈'
  }
  return personas[persona as keyof typeof personas] || persona
}

const getPersonaClass = (persona: string): string => {
  return `persona-${persona}`
}

const formatTime = (date: Date): string => {
  const now = new Date()
  const targetDate = new Date(date)
  const diffMs = now.getTime() - targetDate.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 60) {
    return `${diffMins}分钟前`
  } else if (diffHours < 24) {
    return `${diffHours}小时前`
  } else if (diffDays < 7) {
    return `${diffDays}天前`
  } else {
    return targetDate.toLocaleDateString()
  }
}

const getPreviewText = (conversation: Conversation): string => {
  const lastMessage = conversation.messages[conversation.messages.length - 1]
  if (!lastMessage) return '暂无消息'
  
  const content = lastMessage.content.replace(/[#*`>]/g, '').trim()
  return content.length > 50 ? content.substring(0, 50) + '...' : content
}

const selectConversation = async (conversationId: string) => {
  await chatStore.switchConversation(conversationId)
  emit('conversationSelected', conversationId)
}

const createNewConversation = async () => {
  await chatStore.createNewConversation()
  emit('newConversation')
}

const handleSearch = () => {
  // 防抖搜索，实际项目中可以添加防抖逻辑
}

const handleFilterChange = () => {
  // 筛选条件变化处理
}

const exportConversation = async (conversationId: string) => {
  try {
    currentExportId.value = conversationId
    exportContent.value = await chatStore.exportHistory(conversationId, exportFormat.value)
    showExportModal.value = true
  } catch (error) {
    console.error('导出失败:', error)
  }
}

const deleteConversation = async (conversationId: string) => {
  if (confirm('确定要删除这个对话吗？此操作不可恢复。')) {
    try {
      await chatStore.removeConversation(conversationId)
    } catch (error) {
      console.error('删除失败:', error)
    }
  }
}

const downloadExport = () => {
  if (!exportContent.value) return
  
  const blob = new Blob([exportContent.value], { 
    type: getMimeType(exportFormat.value) 
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  
  const conversation = chatStore.conversations.find(c => c.id === currentExportId.value)
  const fileName = conversation ? `${conversation.title}.${exportFormat.value}` : `conversation.${exportFormat.value}`
  
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  closeExportModal()
}

const getMimeType = (format: string): string => {
  const mimeTypes = {
    md: 'text/markdown',
    txt: 'text/plain',
    json: 'application/json'
  }
  return mimeTypes[format as keyof typeof mimeTypes] || 'text/plain'
}

const closeExportModal = () => {
  showExportModal.value = false
  exportContent.value = ''
  currentExportId.value = ''
}

// 监听导出格式变化
watch(exportFormat, async (newFormat) => {
  if (currentExportId.value && showExportModal.value) {
    try {
      exportContent.value = await chatStore.exportHistory(currentExportId.value, newFormat)
    } catch (error) {
      console.error('重新导出失败:', error)
    }
  }
})

// 生命周期
onMounted(async () => {
  await chatStore.loadAllConversations()
  chatStore.initializeWelcomeMessage()
})
</script>

<style scoped>
.conversation-history {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
}

.search-section {
  padding: 1rem;
  background: white;
  border-bottom: 1px solid #e9ecef;
}

.search-input {
  position: relative;
  margin-bottom: 0.75rem;
}

.search-input i {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
}

.search-input input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.filter-section {
  display: flex;
  gap: 0.5rem;
}

.filter-section select {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.conversation-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.conversation-item {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.conversation-item:hover {
  border-color: #007bff;
  box-shadow: 0 2px 4px rgba(0, 123, 255, 0.1);
}

.conversation-item.active {
  border-color: #007bff;
  background: #f8f9ff;
}

.conversation-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.conversation-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #212529;
  flex: 1;
}

.conversation-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.persona-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.persona-scholar {
  background: #e3f2fd;
  color: #1976d2;
}

.persona-hermit {
  background: #f3e5f5;
  color: #7b1fa2;
}

.persona-therapist {
  background: #e8f5e8;
  color: #388e3c;
}

.time {
  font-size: 0.75rem;
  color: #6c757d;
}

.conversation-preview {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 0.5rem;
}

.preview-text {
  margin: 0;
  font-size: 0.875rem;
  color: #495057;
  flex: 1;
  line-height: 1.4;
}

.message-count {
  font-size: 0.75rem;
  color: #6c757d;
  white-space: nowrap;
  margin-left: 0.5rem;
}

.conversation-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.btn-icon {
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #f8f9fa;
  color: #495057;
}

.btn-icon.danger:hover {
  background: #f8d7da;
  color: #dc3545;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #6c757d;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.new-conversation-section {
  padding: 1rem;
  border-top: 1px solid #e9ecef;
  background: white;
}

.new-conversation-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 0.5rem;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #6c757d;
  cursor: pointer;
}

.modal-body {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
}

.format-options {
  margin-bottom: 1rem;
}

.format-options label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
}

.export-preview textarea {
  width: 100%;
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  padding: 0.75rem;
  font-family: monospace;
  font-size: 0.875rem;
  resize: vertical;
}

.modal-footer {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  padding: 1rem;
  border-top: 1px solid #e9ecef;
}

.btn-primary, .btn-secondary {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}
</style>
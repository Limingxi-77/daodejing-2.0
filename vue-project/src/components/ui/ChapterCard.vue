<!-- 章节卡片组件 - Vue版本 -->
<template>
  <div class="chapter-card" @click="handleClick">
    <div class="flex items-center mb-3">
      <span class="chapter-number">{{ chapterNumber }}</span>
      <h3 class="chapter-title">{{ title }}</h3>
    </div>
    <div class="chapter-content">
      {{ content }}
    </div>
    <div class="chapter-actions" v-if="showActions">
      <button 
        class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        @click.stop="handleAction"
      >
        {{ actionText }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// 组件属性定义
interface Props {
  chapterNumber?: number
  title?: string
  content?: string
  showActions?: boolean
  actionText?: string
}

// 默认属性值
const { 
  chapterNumber = 1, 
  title = '论道', 
  content = '道可道，非常道。名可名，非常名。无名天地之始，有名万物之母。',
  showActions = true,
  actionText = '深入解读'
} = defineProps<Props>()

// 事件定义
const emit = defineEmits<{
  click: [event: MouseEvent]
  action: [event: MouseEvent]
}>()

// 处理卡片点击
const handleClick = (event: MouseEvent) => {
  emit('click', event)
}

// 处理按钮点击
const handleAction = (event: MouseEvent) => {
  emit('action', event)
}
</script>

<style scoped>
/* 章节卡片组件样式 */
.chapter-card {
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
  border-left: 4px solid #007bff;
  cursor: pointer;
}

.chapter-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.chapter-number {
  display: inline-block;
  background-color: #007bff;
  color: white;
  width: 2rem;
  height: 2rem;
  line-height: 2rem;
  text-align: center;
  border-radius: 50%;
  margin-right: 0.75rem;
  font-weight: bold;
  font-size: 0.875rem;
}

.chapter-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #007bff;
  margin-bottom: 0.5rem;
  margin: 0;
}

.chapter-content {
  color: #495057;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.chapter-actions {
  display: flex;
  justify-content: flex-end;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chapter-card {
    padding: 1rem;
  }
  
  .chapter-number {
    width: 1.75rem;
    height: 1.75rem;
    line-height: 1.75rem;
    margin-right: 0.5rem;
  }
  
  .chapter-title {
    font-size: 1rem;
  }
}
</style>
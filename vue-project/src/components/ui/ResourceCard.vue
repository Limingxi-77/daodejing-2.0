<!-- 资源卡片组件 - Vue版本 -->
<template>
  <div class="resource-card">
    <div class="resource-image">
      <i :class="iconClass"></i>
    </div>
    <div class="resource-content">
      <h3 class="resource-title">{{ title }}</h3>
      <p class="resource-description">
        {{ description }}
      </p>
      <div class="resource-meta">
        <span class="text-secondary">{{ type }}</span>
        <span class="text-secondary">{{ size }}</span>
      </div>
      <div class="resource-actions">
        <button 
          class="resource-btn"
          @click="handleDownload"
        >
          <i class="fas fa-download"></i>
          下载
        </button>
        <button 
          class="resource-btn secondary"
          @click="handlePreview"
        >
          <i class="fas fa-eye"></i>
          预览
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// 组件属性定义
interface Props {
  title?: string
  description?: string
  type?: string
  size?: string
  icon?: string
}

// 默认属性值
const props = withDefaults(defineProps<Props>(), {
  title: '道德经全本注解',
  description: '包含《道德经》全文、注释、翻译和解读，是学习道德经的必备参考资料。',
  type: 'PDF文档',
  size: '2.3MB',
  icon: 'fas fa-book-open'
})

// 计算图标类名
const iconClass = computed(() => props.icon)

// 事件定义
const emit = defineEmits<{
  download: []
  preview: []
}>()

// 处理下载
const handleDownload = () => {
  emit('download')
}

// 处理预览
const handlePreview = () => {
  emit('preview')
}
</script>

<style scoped>
/* 资源卡片组件样式 */
.resource-card {
  display: flex;
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.resource-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.resource-image {
  width: 4rem;
  height: 4rem;
  background-color: #007bff;
  color: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1.5rem;
  flex-shrink: 0;
}

.resource-image i {
  font-size: 1.5rem;
}

.resource-content {
  flex: 1;
}

.resource-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #212529;
  margin-bottom: 0.5rem;
  margin: 0;
}

.resource-description {
  color: #6c757d;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.resource-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.resource-actions {
  display: flex;
  gap: 0.75rem;
}

.resource-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #007bff;
  background-color: #007bff;
  color: white;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.resource-btn:hover {
  background-color: #0056b3;
  border-color: #0056b3;
}

.resource-btn.secondary {
  background-color: transparent;
  color: #007bff;
}

.resource-btn.secondary:hover {
  background-color: #007bff;
  color: white;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .resource-card {
    padding: 1rem;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .resource-image {
    margin-right: 0;
    margin-bottom: 1rem;
  }
  
  .resource-actions {
    justify-content: center;
  }
}
</style>
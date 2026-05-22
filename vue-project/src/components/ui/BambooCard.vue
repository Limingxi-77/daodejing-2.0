<!-- 竹简卡片组件 - Vue版本 -->
<template>
  <div class="bamboo-card">
    <div class="bamboo-card-header">
      <div class="bamboo-card-icon">
        <i :class="iconClass"></i>
      </div>
      <h3 class="bamboo-card-title">{{ title }}</h3>
    </div>
    <div class="bamboo-card-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// 组件属性定义
interface Props {
  title?: string
  icon?: string
}

// 默认属性值
const props = withDefaults(defineProps<Props>(), {
  title: '道德经章节',
  icon: 'fas fa-book'
})

// 计算图标类名
const iconClass = computed(() => props.icon)
</script>

<style scoped>
/* 竹简卡片组件样式 */
.bamboo-card {
  background-color: #f8f9fa;
  border-radius: 4px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid #e9ecef;
}

.bamboo-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 10px;
  background: linear-gradient(90deg, #6c757d 0%, #f8f9fa 2%, #f8f9fa 98%, #6c757d 100%);
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

.bamboo-card::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 10px;
  background: linear-gradient(90deg, #6c757d 0%, #f8f9fa 2%, #f8f9fa 98%, #6c757d 100%);
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}

.bamboo-card-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.bamboo-card-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background-color: #007bff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
}

.bamboo-card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #007bff;
  margin: 0;
}

.bamboo-card-content {
  color: #212529;
  line-height: 1.6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .bamboo-card {
    padding: 1rem;
    margin-bottom: 1rem;
  }
  
  .bamboo-card-icon {
    width: 2.5rem;
    height: 2.5rem;
    margin-right: 0.75rem;
  }
  
  .bamboo-card-title {
    font-size: 1.125rem;
  }
}
</style>
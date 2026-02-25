<!-- 学习路径组件 - Vue版本 -->
<template>
  <div class="learning-path">
    <div 
      v-for="(step, index) in steps" 
      :key="index"
      class="path-step"
      :class="{ 'active': currentStep === index }"
    >
      <div class="step-number">{{ step.number }}</div>
      <div class="step-content">
        <h4 class="step-title">{{ step.title }}</h4>
        <p class="step-description">{{ step.description }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 学习步骤类型定义
interface LearningStep {
  number: number
  title: string
  description: string
}

// 组件属性定义
interface Props {
  steps?: LearningStep[]
  currentStep?: number
}

// 默认学习步骤数据
const defaultSteps: LearningStep[] = [
  {
    number: 1,
    title: '了解道德经的基本概念',
    description: '首先学习《道德经》的基本概念，包括"道"、"德"、"无为"等核心思想，为后续学习打下基础。'
  },
  {
    number: 2,
    title: '逐章阅读与理解',
    description: '按照章节顺序，逐章阅读《道德经》原文，并结合AI解读功能深入理解每一章的含义。'
  },
  {
    number: 3,
    title: '实践与应用',
    description: '将《道德经》的智慧应用到日常生活中，通过实践加深理解，形成自己的感悟。'
  }
]

// 默认属性值
const { 
  steps = defaultSteps, 
  currentStep = -1 
} = defineProps<Props>()
</script>

<style scoped>
/* 学习路径组件样式 */
.learning-path {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.path-step {
  display: flex;
  align-items: flex-start;
  padding: 1.5rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #6c757d;
  transition: all 0.3s ease;
  opacity: 0.7;
}

.path-step.active {
  opacity: 1;
  border-left-color: #007bff;
  box-shadow: 0 2px 10px rgba(0, 123, 255, 0.1);
}

.path-step:hover {
  opacity: 1;
  transform: translateX(5px);
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background-color: #6c757d;
  color: white;
  border-radius: 50%;
  font-weight: bold;
  font-size: 1rem;
  margin-right: 1rem;
  flex-shrink: 0;
}

.path-step.active .step-number {
  background-color: #007bff;
}

.step-content {
  flex: 1;
}

.step-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #212529;
  margin-bottom: 0.5rem;
  margin: 0;
}

.step-description {
  color: #6c757d;
  line-height: 1.5;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .path-step {
    padding: 1rem;
    flex-direction: column;
    align-items: flex-start;
  }
  
  .step-number {
    margin-right: 0;
    margin-bottom: 0.75rem;
  }
  
  .step-title {
    font-size: 1rem;
  }
}
</style>
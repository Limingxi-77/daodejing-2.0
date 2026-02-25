// UI组件库导出文件

export { default as BambooCard } from './BambooCard.vue'
export { default as ChapterCard } from './ChapterCard.vue'
export { default as LearningPath } from './LearningPath.vue'
export { default as CommunityPost } from './CommunityPost.vue'
export { default as ResourceCard } from './ResourceCard.vue'

// 组件类型定义
export interface LearningStep {
  number: number
  title: string
  description: string
}

// 默认学习步骤数据
export const defaultLearningSteps = [
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
<template>
  <div class="pt-24 pb-20 px-4 md:px-8 bg-gray-50 min-h-screen">
    <div class="container mx-auto max-w-6xl">
      <!-- 页面标题 -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-primary mb-4">道德经学习路径</h1>
        <p class="text-xl text-dark max-w-3xl mx-auto">
          根据您的学习目标和兴趣，选择适合的学习路径，系统性地掌握《道德经》的智慧
        </p>
      </div>

      <!-- 学习路径选择 -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold text-primary mb-6">选择您的学习路径</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- 初学者路径 -->
          <div class="bg-white rounded-lg shadow-md p-6 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div class="flex items-center mb-4">
              <div class="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3">
                <i class="fas fa-seedling text-xl"></i>
              </div>
              <h3 class="text-xl font-bold text-dark">初学者路径</h3>
            </div>
            <p class="text-dark mb-4 h-12">
              适合刚接触《道德经》的学习者，从基础概念开始，循序渐进地理解老子思想的核心
            </p>
            <div class="mb-4">
              <div class="flex justify-between text-sm text-gray-600 mb-1">
                <span>学习进度</span>
                <span>{{ beginnerProgress }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-green-500 h-2 rounded-full transition-all duration-500" :style="{ width: beginnerProgress + '%' }"></div>
              </div>
            </div>
            <ul class="text-sm text-gray-600 mb-6 space-y-2">
              <li class="flex items-center"><i class="fas fa-check text-green-500 mr-2"></i>18个核心章节</li>
              <li class="flex items-center"><i class="fas fa-check text-green-500 mr-2"></i>基础概念讲解</li>
              <li class="flex items-center"><i class="fas fa-check text-green-500 mr-2"></i>现代生活应用</li>
            </ul>
            <button class="w-full py-2 rounded-md border border-primary text-primary hover:bg-primary hover:text-white transition-colors" @click="selectPath('beginner')">
              {{ beginnerProgress > 0 ? '继续学习' : '开始学习' }}
            </button>
          </div>

          <!-- 进阶者路径 -->
          <div class="bg-white rounded-lg shadow-md p-6 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div class="flex items-center mb-4">
              <div class="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mr-3">
                <i class="fas fa-mountain text-xl"></i>
              </div>
              <h3 class="text-xl font-bold text-dark">进阶者路径</h3>
            </div>
            <p class="text-dark mb-4 h-12">
              适合有一定基础的学习者，深入探讨《道德经》的哲学思想和内在逻辑
            </p>
            <div class="mb-4">
              <div class="flex justify-between text-sm text-gray-600 mb-1">
                <span>学习进度</span>
                <span>{{ intermediateProgress }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-orange-500 h-2 rounded-full transition-all duration-500" :style="{ width: intermediateProgress + '%' }"></div>
              </div>
            </div>
            <ul class="text-sm text-gray-600 mb-6 space-y-2">
              <li class="flex items-center"><i class="fas fa-check text-green-500 mr-2"></i>27个重点章节</li>
              <li class="flex items-center"><i class="fas fa-check text-green-500 mr-2"></i>哲学思想探讨</li>
              <li class="flex items-center"><i class="fas fa-check text-green-500 mr-2"></i>与其他哲学比较</li>
            </ul>
            <button class="w-full py-2 rounded-md border border-primary text-primary hover:bg-primary hover:text-white transition-colors" @click="selectPath('intermediate')">
              {{ intermediateProgress > 0 ? '继续学习' : '开始学习' }}
            </button>
          </div>

          <!-- 研究者路径 -->
          <div class="bg-white rounded-lg shadow-md p-6 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div class="flex items-center mb-4">
              <div class="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mr-3">
                <i class="fas fa-graduation-cap text-xl"></i>
              </div>
              <h3 class="text-xl font-bold text-dark">研究者路径</h3>
            </div>
            <p class="text-dark mb-4 h-12">
              适合深度研究者，全面解析《道德经》的文本、历史背景和学术争议
            </p>
            <div class="mb-4">
              <div class="flex justify-between text-sm text-gray-600 mb-1">
                <span>学习进度</span>
                <span>{{ advancedProgress }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-red-500 h-2 rounded-full transition-all duration-500" :style="{ width: advancedProgress + '%' }"></div>
              </div>
            </div>
            <ul class="text-sm text-gray-600 mb-6 space-y-2">
              <li class="flex items-center"><i class="fas fa-check text-green-500 mr-2"></i>36章全面解析</li>
              <li class="flex items-center"><i class="fas fa-check text-green-500 mr-2"></i>历史版本对比</li>
              <li class="flex items-center"><i class="fas fa-check text-green-500 mr-2"></i>学术研究前沿</li>
            </ul>
            <button class="w-full py-2 rounded-md border border-primary text-primary hover:bg-primary hover:text-white transition-colors" @click="selectPath('advanced')">
              {{ advancedProgress > 0 ? '继续学习' : '开始学习' }}
            </button>
          </div>
        </div>
      </section>

      <!-- 亲子绘本专区 (New Featured Section) -->
      <section class="mb-12 animate-slide-up" style="animation-delay: 0.1s;">
        <h2 class="text-2xl font-bold text-primary mb-6 flex items-center">
          <i class="fas fa-child mr-2 text-blue-500"></i> 亲子启蒙 & 趣味阅读
        </h2>
        <div 
          @click="$router.push('/picture-book')"
          class="relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 group border-2 border-dashed border-blue-200"
        >
          <!-- 装饰背景 -->
          <div class="absolute top-0 right-0 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
          <div class="absolute bottom-0 left-0 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
          
          <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div class="flex-1 text-center md:text-left">
              <span class="inline-block px-3 py-1 bg-blue-100 text-blue-600 text-xs font-bold rounded-full mb-4">寓教于乐</span>
              <h3 class="text-3xl font-bold text-dark mb-4 group-hover:text-blue-600 transition-colors">小小道童 · 互动绘本馆</h3>
              <p class="text-gray-600 text-lg mb-6 max-w-2xl">
                专为儿童设计的沉浸式阅读体验。将深奥的《道德经》哲理转化为生动有趣的寓言故事，配合 AI 朗读与自动翻页，让智慧的种子在孩子心中萌芽。
              </p>
              <div class="flex flex-wrap gap-4 justify-center md:justify-start">
                <span class="flex items-center text-sm text-gray-500 bg-white px-3 py-1.5 rounded-lg shadow-sm">
                  <i class="fas fa-book-reader text-blue-400 mr-2"></i> 经典寓言改编
                </span>
                <span class="flex items-center text-sm text-gray-500 bg-white px-3 py-1.5 rounded-lg shadow-sm">
                  <i class="fas fa-volume-up text-purple-400 mr-2"></i> 智能语音伴读
                </span>
                <span class="flex items-center text-sm text-gray-500 bg-white px-3 py-1.5 rounded-lg shadow-sm">
                  <i class="fas fa-magic text-yellow-400 mr-2"></i> 沉浸式翻页
                </span>
              </div>
            </div>
            
            <div class="flex-shrink-0 transform transition-transform duration-500 group-hover:scale-105 group-hover:rotate-2">
              <div class="w-48 h-64 bg-white rounded-lg shadow-xl border-4 border-white rotate-3 overflow-hidden relative">
                <div class="absolute inset-0 bg-blue-100 flex items-center justify-center">
                  <i class="fas fa-book-open text-6xl text-blue-300"></i>
                </div>
                <!-- 模拟书本封面 -->
                <div class="absolute inset-0 bg-[url('https://s.coze.cn/image/H5ri4Ya3YII/')] bg-cover bg-center opacity-80"></div>
                <div class="absolute bottom-4 left-0 w-full text-center bg-white/90 py-2">
                   <span class="font-bold text-primary font-serif">牙齿与舌头</span>
                </div>
              </div>
            </div>
          </div>
          
          <button class="absolute bottom-8 right-8 bg-blue-500 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-blue-600 transition-colors group-hover:scale-110 hidden md:flex items-center">
            开始阅读 <i class="fas fa-arrow-right ml-2"></i>
          </button>
        </div>
      </section>

      <!-- 知识图谱 (新增) -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold text-primary mb-6">核心概念图谱</h2>
        <div class="bg-white rounded-lg shadow-md p-1">
          <KnowledgeGraph />
        </div>
      </section>

      <!-- 当前学习路径详情 -->
      <section v-if="currentPath" id="pathDetails" class="mb-12 scroll-mt-24">
        <h2 class="text-2xl font-bold text-primary mb-6">当前学习路径</h2>
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h3 class="text-xl font-bold text-dark mb-2">{{ currentPath.name }}</h3>
              <p class="text-gray-600">{{ currentPath.description }}</p>
            </div>
            <div class="mt-4 md:mt-0 flex items-center">
              <div class="relative mr-4">
                <svg width="60" height="60" class="transform -rotate-90">
                  <circle class="text-gray-200" stroke="currentColor" stroke-width="4" fill="transparent" :r="ringRadius" :cx="ringCenter" :cy="ringCenter"></circle>
                  <circle :style="ringStyle" class="text-primary transition-all duration-1000 ease-out" stroke="currentColor" stroke-width="4" fill="transparent" :r="ringRadius" :cx="ringCenter" :cy="ringCenter"></circle>
                </svg>
                <div class="absolute inset-0 flex items-center justify-center">
                  <span class="text-sm font-bold text-primary">{{ currentPathProgress }}%</span>
                </div>
              </div>
              <div>
                <p class="text-sm text-gray-600">已完成</p>
                <p class="text-lg font-bold text-dark">{{ currentPathCompleted }} / {{ currentPathTotal }} 课</p>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <div 
              v-for="(lesson, idx) in currentPath.lessons" 
              :key="lesson.id" 
              :class="['flex flex-col md:flex-row md:items-center md:justify-between p-4 rounded-lg border transition-all duration-300', 
                lesson.completed ? 'bg-green-50 border-green-100' : 
                lesson.current ? 'bg-orange-50 border-orange-100 shadow-sm transform scale-[1.01]' : 'bg-white border-gray-100 opacity-70']"
            >
              <div class="flex items-center mb-3 md:mb-0">
                <div :class="['w-10 h-10 rounded-full flex items-center justify-center mr-4 flex-shrink-0', 
                  lesson.completed ? 'bg-green-100 text-green-600' : 
                  lesson.current ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400']">
                  <i v-if="lesson.completed" class="fas fa-check"></i>
                  <span v-else>{{ idx + 1 }}</span>
                </div>
                <div>
                  <h4 class="font-medium text-dark">{{ lesson.title }}</h4>
                  <div class="flex items-center mt-1 text-xs">
                    <span :class="['px-2 py-0.5 rounded-full mr-2', getDifficultyClass(lesson.difficulty)]">
                      {{ getDifficultyText(lesson.difficulty) }}
                    </span>
                    <span class="text-gray-500"><i class="far fa-clock mr-1"></i>{{ lesson.duration }}</span>
                  </div>
                </div>
              </div>
              <div class="md:ml-4">
                <button 
                  v-if="lesson.completed"
                  @click="openQuiz(lesson, true)"
                  class="px-4 py-1.5 rounded-md border border-gray-300 text-gray-600 text-sm hover:bg-gray-50 transition-colors w-full md:w-auto"
                >
                  复习
                </button>
                <button 
                  v-else-if="lesson.current"
                  @click="openQuiz(lesson, false)"
                  class="px-4 py-1.5 rounded-md bg-primary text-white text-sm hover:bg-opacity-90 transition-colors shadow-md w-full md:w-auto"
                >
                  继续学习
                </button>
                <button 
                  v-else
                  disabled
                  class="px-4 py-1.5 rounded-md border border-gray-200 text-gray-400 text-sm cursor-not-allowed w-full md:w-auto bg-gray-50"
                >
                  <i class="fas fa-lock mr-1"></i>未解锁
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 学习成就 -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold text-primary mb-6">学习成就</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div v-for="achievement in achievements" :key="achievement.id" class="text-center group">
            <div :class="['w-20 h-20 mx-auto mb-3 rounded-full flex items-center justify-center transition-all duration-500 transform group-hover:scale-110', 
              achievement.unlocked ? achievement.bgClass : 'bg-gray-100']">
              <i :class="['text-3xl transition-colors duration-300', achievement.icon, achievement.unlocked ? achievement.textClass : 'text-gray-300']"></i>
            </div>
            <h4 :class="['font-bold mb-1', achievement.unlocked ? 'text-dark' : 'text-gray-400']">{{ achievement.title }}</h4>
            <p class="text-sm text-gray-500">{{ achievement.desc }}</p>
          </div>
        </div>
      </section>

      <!-- 学习建议 -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold text-primary mb-6">学习建议</h2>
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 class="text-lg font-bold text-dark mb-4 border-b border-gray-100 pb-2">学习方法</h3>
              <ul class="space-y-4">
                <li class="flex items-start">
                  <div class="w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center mr-3 flex-shrink-0">
                    <i class="fas fa-lightbulb"></i>
                  </div>
                  <div>
                    <h4 class="font-medium text-dark">每日一读</h4>
                    <p class="text-sm text-gray-600">每天花15-30分钟阅读一章，持之以恒</p>
                  </div>
                </li>
                <li class="flex items-start">
                  <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3 flex-shrink-0">
                    <i class="fas fa-pencil-alt"></i>
                  </div>
                  <div>
                    <h4 class="font-medium text-dark">记录感悟</h4>
                    <p class="text-sm text-gray-600">写下自己的理解和感悟，加深记忆</p>
                  </div>
                </li>
                <li class="flex items-start">
                  <div class="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3 flex-shrink-0">
                    <i class="fas fa-comments"></i>
                  </div>
                  <div>
                    <h4 class="font-medium text-dark">交流讨论</h4>
                    <p class="text-sm text-gray-600">与他人分享见解，多角度理解</p>
                  </div>
                </li>
              </ul>
            </div>
            <div>
              <h3 class="text-lg font-bold text-dark mb-4 border-b border-gray-100 pb-2">推荐资源</h3>
              <ul class="space-y-4">
                <li class="flex items-start">
                  <div class="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center mr-3 flex-shrink-0">
                    <i class="fas fa-book"></i>
                  </div>
                  <div>
                    <h4 class="font-medium text-dark">《道德经》注解</h4>
                    <p class="text-sm text-gray-600">阅读多种注解版本，对比理解</p>
                  </div>
                </li>
                <li class="flex items-start">
                  <div class="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mr-3 flex-shrink-0">
                    <i class="fas fa-video"></i>
                  </div>
                  <div>
                    <h4 class="font-medium text-dark">视频讲解</h4>
                    <p class="text-sm text-gray-600">观看专家讲解视频，加深理解</p>
                  </div>
                </li>
                <li class="flex items-start">
                  <div class="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mr-3 flex-shrink-0">
                    <i class="fas fa-users"></i>
                  </div>
                  <div>
                    <h4 class="font-medium text-dark">学习小组</h4>
                    <p class="text-sm text-gray-600">加入学习小组，共同进步</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- 题目模态框 -->
    <QuizModal 
      v-if="showQuiz" 
      :title="quizLesson?.title || ''"
      :question="quizQuestion"
      :isReview="isReviewMode"
      @close="closeQuiz"
      @complete="completeLesson"
    />

    <!-- 随机奇遇模态框 -->
    <RandomEventModal
      v-if="showEventModal"
      :type="eventData.type"
      :description="eventData.description"
      :xp="eventData.xp"
      @close="showEventModal = false"
    />

    <!-- 境界升级弹窗 -->
    <div v-if="showUpgradeModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div class="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center transform animate-bounce-in relative overflow-hidden border-2 border-accent">
        <!-- 光效背景 -->
        <div class="absolute inset-0 bg-gradient-to-br from-yellow-100/50 to-transparent pointer-events-none"></div>
        
        <div class="w-24 h-24 mx-auto bg-primary text-white rounded-full flex items-center justify-center text-4xl mb-4 shadow-lg relative z-10 animate-pulse">
          <i :class="currentRealm.icon"></i>
        </div>
        
        <h2 class="text-2xl font-bold text-primary mb-2 relative z-10">境界突破！</h2>
        <p class="text-dark mb-6 relative z-10">
          恭喜道友，修为已达 <span class="text-accent font-bold text-xl">{{ currentRealm.name }}</span> 之境！
        </p>
        <p class="text-sm text-gray-500 mb-6 italic relative z-10">"{{ currentRealm.desc }}"</p>
        
        <button 
          @click="cultivationStore.closeUpgradeModal()"
          class="px-8 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors shadow-md relative z-10"
        >
          善哉
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import QuizModal from '@/components/learning/QuizModal.vue'
import RandomEventModal from '@/components/learning/RandomEventModal.vue'
import KnowledgeGraph from '@/components/graph/KnowledgeGraph.vue'
import { useCultivationStore } from '@/stores/cultivation'
import { storeToRefs } from 'pinia'

// 类型定义
type PathKey = 'beginner' | 'intermediate' | 'advanced'
type Difficulty = 'easy' | 'medium' | 'hard'

interface Lesson {
  id: number
  title: string
  difficulty: Difficulty
  duration: string
  completed: boolean
  current: boolean
}

interface PathData {
  name: string
  description: string
  lessons: Lesson[]
}

interface LearningPaths {
  [key: string]: PathData
}

// 状态
const currentPathKey = ref<PathKey | null>(null)
const showQuiz = ref(false)
const quizLesson = ref<Lesson | null>(null)
const isReviewMode = ref(false)

// 随机奇遇状态
const showEventModal = ref(false)
const eventData = ref({
  type: 'epiphany' as 'epiphany' | 'guest' | 'relic',
  description: '',
  xp: 0
})

const cultivationStore = useCultivationStore()
const { addExp } = cultivationStore
const { showUpgradeModal, currentRealm } = storeToRefs(cultivationStore)

// 初始数据（实际应用中可能从后端获取）
const initialPaths: LearningPaths = {
  beginner: {
    name: '初学者路径',
    description: '适合刚接触《道德经》的学习者，从基础概念开始，循序渐进地理解老子思想的核心',
    lessons: [
      { id: 1, title: '第一章：道可道', difficulty: 'easy', duration: '15分钟', completed: false, current: true },
      { id: 2, title: '第二章：天下皆知', difficulty: 'easy', duration: '15分钟', completed: false, current: false },
      { id: 3, title: '第三章：不尚贤', difficulty: 'easy', duration: '15分钟', completed: false, current: false },
      { id: 4, title: '第四章：道冲而用之', difficulty: 'easy', duration: '15分钟', completed: false, current: false },
      { id: 5, title: '第五章：天地不仁', difficulty: 'easy', duration: '15分钟', completed: false, current: false },
      { id: 6, title: '第六章：谷神不死', difficulty: 'medium', duration: '20分钟', completed: false, current: false },
      { id: 7, title: '第七章：天长地久', difficulty: 'medium', duration: '20分钟', completed: false, current: false },
      { id: 8, title: '第八章：上善若水', difficulty: 'medium', duration: '20分钟', completed: false, current: false },
      { id: 9, title: '第九章：持而盈之', difficulty: 'medium', duration: '20分钟', completed: false, current: false },
      { id: 10, title: '第十章：载营魄', difficulty: 'hard', duration: '25分钟', completed: false, current: false },
      { id: 11, title: '第十一章：三十辐', difficulty: 'hard', duration: '25分钟', completed: false, current: false },
      { id: 12, title: '第十二章：五色令人目盲', difficulty: 'hard', duration: '25分钟', completed: false, current: false },
      { id: 13, title: '第十三章：宠辱若惊', difficulty: 'medium', duration: '20分钟', completed: false, current: false },
      { id: 14, title: '第十四章：视之不见', difficulty: 'medium', duration: '20分钟', completed: false, current: false },
      { id: 15, title: '第十五章：古之善为士者', difficulty: 'hard', duration: '25分钟', completed: false, current: false },
      { id: 16, title: '第十六章：致虚极', difficulty: 'hard', duration: '25分钟', completed: false, current: false },
      { id: 17, title: '第十七章：太上', difficulty: 'medium', duration: '20分钟', completed: false, current: false },
      { id: 18, title: '第十八章：大道废', difficulty: 'easy', duration: '15分钟', completed: false, current: false }
    ]
  },
  intermediate: {
    name: '进阶者路径',
    description: '适合有一定基础的学习者，深入探讨《道德经》的哲学思想和内在逻辑',
    lessons: [
      { id: 19, title: '第十九章：绝圣弃智', difficulty: 'medium', duration: '30分钟', completed: false, current: true },
      { id: 20, title: '第二十章：绝学无忧', difficulty: 'medium', duration: '30分钟', completed: false, current: false },
      { id: 21, title: '第二十一章：孔德之容', difficulty: 'hard', duration: '35分钟', completed: false, current: false },
      { id: 22, title: '第二十二章：曲则全', difficulty: 'easy', duration: '25分钟', completed: false, current: false },
      { id: 23, title: '第二十三章：希言自然', difficulty: 'medium', duration: '30分钟', completed: false, current: false },
      { id: 24, title: '第二十四章：企者不立', difficulty: 'easy', duration: '25分钟', completed: false, current: false },
      { id: 25, title: '第二十五章：有物混成', difficulty: 'hard', duration: '40分钟', completed: false, current: false },
      { id: 26, title: '第二十六章：重为轻根', difficulty: 'medium', duration: '30分钟', completed: false, current: false },
      { id: 27, title: '第二十七章：善行无辙迹', difficulty: 'medium', duration: '30分钟', completed: false, current: false },
      { id: 28, title: '第二十八章：知其雄', difficulty: 'hard', duration: '35分钟', completed: false, current: false },
      { id: 29, title: '第二十九章：将欲取天下', difficulty: 'medium', duration: '30分钟', completed: false, current: false },
      { id: 30, title: '第三十章：以道佐人主', difficulty: 'medium', duration: '30分钟', completed: false, current: false },
      { id: 31, title: '第三十一章：夫佳兵者', difficulty: 'medium', duration: '30分钟', completed: false, current: false },
      { id: 32, title: '第三十二章：道常无名', difficulty: 'hard', duration: '35分钟', completed: false, current: false },
      { id: 33, title: '第三十三章：知人者智', difficulty: 'easy', duration: '25分钟', completed: false, current: false },
      { id: 34, title: '第三十四章：大道泛兮', difficulty: 'medium', duration: '30分钟', completed: false, current: false },
      { id: 35, title: '第三十五章：执大象', difficulty: 'medium', duration: '30分钟', completed: false, current: false },
      { id: 36, title: '第三十六章：将欲翕之', difficulty: 'hard', duration: '35分钟', completed: false, current: false },
      { id: 37, title: '第三十七章：道常无为', difficulty: 'medium', duration: '30分钟', completed: false, current: false },
      { id: 38, title: '第三十八章：上德不德', difficulty: 'hard', duration: '40分钟', completed: false, current: false },
      { id: 39, title: '第三十九章：昔之得一者', difficulty: 'hard', duration: '40分钟', completed: false, current: false },
      { id: 40, title: '第四十章：反者道之动', difficulty: 'medium', duration: '30分钟', completed: false, current: false },
      { id: 41, title: '第四十一章：上士闻道', difficulty: 'medium', duration: '30分钟', completed: false, current: false },
      { id: 42, title: '第四十二章：道生一', difficulty: 'hard', duration: '40分钟', completed: false, current: false },
      { id: 43, title: '第四十三章：天下之至柔', difficulty: 'medium', duration: '30分钟', completed: false, current: false },
      { id: 44, title: '第四十四章：名与身孰亲', difficulty: 'easy', duration: '25分钟', completed: false, current: false },
      { id: 45, title: '第四十五章：大成若缺', difficulty: 'medium', duration: '30分钟', completed: false, current: false }
    ]
  },
  advanced: {
    name: '研究者路径',
    description: '适合深度研究者，全面解析《道德经》的文本、历史背景和学术争议',
    lessons: [
      { id: 46, title: '第四十六章：天下有道', difficulty: 'medium', duration: '45分钟', completed: false, current: true },
      { id: 47, title: '第四十七章：不出户', difficulty: 'medium', duration: '45分钟', completed: false, current: false },
      { id: 48, title: '第四十八章：为学日益', difficulty: 'hard', duration: '50分钟', completed: false, current: false },
      { id: 49, title: '第四十九章：圣人无常心', difficulty: 'medium', duration: '45分钟', completed: false, current: false },
      { id: 50, title: '第五十章：出生入死', difficulty: 'hard', duration: '50分钟', completed: false, current: false },
      { id: 51, title: '第五十一章：道生之', difficulty: 'hard', duration: '50分钟', completed: false, current: false },
      { id: 52, title: '第五十二章：天下有始', difficulty: 'medium', duration: '45分钟', completed: false, current: false },
      { id: 53, title: '第五十三章：使我介然有知', difficulty: 'medium', duration: '45分钟', completed: false, current: false },
      { id: 54, title: '第五十四章：善建者不拔', difficulty: 'medium', duration: '45分钟', completed: false, current: false },
      { id: 55, title: '第五十五章：含德之厚', difficulty: 'hard', duration: '50分钟', completed: false, current: false },
      { id: 56, title: '第五十六章：知者不言', difficulty: 'medium', duration: '45分钟', completed: false, current: false },
      { id: 57, title: '第五十七章：以正治国', difficulty: 'medium', duration: '45分钟', completed: false, current: false },
      { id: 58, title: '第五十八章：其政闷闷', difficulty: 'medium', duration: '45分钟', completed: false, current: false },
      { id: 59, title: '第五十九章：治人事天', difficulty: 'medium', duration: '45分钟', completed: false, current: false },
      { id: 60, title: '第六十章：治大国', difficulty: 'easy', duration: '40分钟', completed: false, current: false },
      { id: 61, title: '第六十一章：大国者下流', difficulty: 'medium', duration: '45分钟', completed: false, current: false },
      { id: 62, title: '第六十二章：道者万物之奥', difficulty: 'hard', duration: '50分钟', completed: false, current: false },
      { id: 63, title: '第六十三章：为无为', difficulty: 'medium', duration: '45分钟', completed: false, current: false },
      { id: 64, title: '第六十四章：其安易持', difficulty: 'medium', duration: '45分钟', completed: false, current: false },
      { id: 65, title: '第六十五章：古之善为道者', difficulty: 'medium', duration: '45分钟', completed: false, current: false },
      { id: 66, title: '第六十六章：江海所以能为百谷王者', difficulty: 'easy', duration: '40分钟', completed: false, current: false },
      { id: 67, title: '第六十七章：天下皆谓我道大', difficulty: 'hard', duration: '50分钟', completed: false, current: false },
      { id: 68, title: '第六十八章：善为士者', difficulty: 'medium', duration: '45分钟', completed: false, current: false },
      { id: 69, title: '第六十九章：用兵有言', difficulty: 'medium', duration: '45分钟', completed: false, current: false },
      { id: 70, title: '第七十章：吾言甚易知', difficulty: 'medium', duration: '45分钟', completed: false, current: false },
      { id: 71, title: '第七十一章：知不知', difficulty: 'hard', duration: '50分钟', completed: false, current: false },
      { id: 72, title: '第七十二章：民不畏威', difficulty: 'medium', duration: '45分钟', completed: false, current: false },
      { id: 73, title: '第七十三章：勇于敢', difficulty: 'medium', duration: '45分钟', completed: false, current: false },
      { id: 74, title: '第七十四章：民不畏死', difficulty: 'hard', duration: '50分钟', completed: false, current: false },
      { id: 75, title: '第七十五章：民之饥', difficulty: 'medium', duration: '45分钟', completed: false, current: false },
      { id: 76, title: '第七十六章：人之生也柔弱', difficulty: 'easy', duration: '40分钟', completed: false, current: false },
      { id: 77, title: '第七十七章：天之道', difficulty: 'medium', duration: '45分钟', completed: false, current: false },
      { id: 78, title: '第七十八章：天下莫柔弱于水', difficulty: 'easy', duration: '40分钟', completed: false, current: false },
      { id: 79, title: '第七十九章：和大怨', difficulty: 'medium', duration: '45分钟', completed: false, current: false },
      { id: 80, title: '第八十章：小国寡民', difficulty: 'medium', duration: '45分钟', completed: false, current: false },
      { id: 81, title: '第八十一章：信言不美', difficulty: 'hard', duration: '50分钟', completed: false, current: false }
    ]
  }
}

// 题目数据
const lessonQuestions: Record<number, any> = {
  1: {
    question: '"道可道，非常道" 是什么意思？',
    options: [
      { id: 'A', text: '道是可以说出来的' },
      { id: 'B', text: '道是无法完全用语言表达的永恒真理' },
      { id: 'C', text: '道是一种特殊的道路' },
      { id: 'D', text: '道是常识' }
    ],
    correctAnswer: 'B',
    explanation: '老子认为"道"是宇宙的本源，超越了语言的描述范围。一旦用语言说出来，就不是那个永恒不变的"道"了。'
  },
  2: {
    question: '"天下皆知美之为美，斯恶已" 强调了什么概念？',
    options: [
      { id: 'A', text: '美丑是绝对的' },
      { id: 'B', text: '对立统一与相互依存' },
      { id: 'C', text: '大家都喜欢美' },
      { id: 'D', text: '恶是美的反面' }
    ],
    correctAnswer: 'B',
    explanation: '老子强调美与丑、善与恶都是相对存在的，没有恶就没有美，它们是相互依存、相互转化的。'
  },
  3: {
    question: '"不尚贤，使民不争" 提倡什么样的治理方式？',
    options: [
      { id: 'A', text: '不推崇贤能，减少争斗' },
      { id: 'B', text: '打压贤能之人' },
      { id: 'C', text: '奖励争斗' },
      { id: 'D', text: '选拔贤能' }
    ],
    correctAnswer: 'A',
    explanation: '老子认为过度推崇贤能会导致人们为了名利而争斗，不如顺其自然，让百姓安居乐业。'
  },
  // 为了简化代码，这里只展示部分题目，实际项目中应包含所有题目
  // ... 其他题目数据按需添加
}

// 响应式数据
const paths = ref<LearningPaths>(initialPaths)

// 计算属性
const beginnerProgress = computed(() => calculateProgress('beginner'))
const intermediateProgress = computed(() => calculateProgress('intermediate'))
const advancedProgress = computed(() => calculateProgress('advanced'))

const currentPath = computed(() => currentPathKey.value ? paths.value[currentPathKey.value] : null)
const currentPathTotal = computed(() => currentPath.value?.lessons.length || 0)
const currentPathCompleted = computed(() => currentPath.value?.lessons.filter(l => l.completed).length || 0)
const currentPathProgress = computed(() => currentPathTotal.value ? Math.round((currentPathCompleted.value / currentPathTotal.value) * 100) : 0)

const quizQuestion = computed(() => {
  if (!quizLesson.value) return null
  // 如果没有对应题目，返回默认题目（防止报错）
  return lessonQuestions[quizLesson.value.id] || {
    question: `关于 ${quizLesson.value.title} 的核心思想是？`,
    options: [
      { id: 'A', text: '顺应自然' },
      { id: 'B', text: '人定胜天' },
      { id: 'C', text: '积极进取' },
      { id: 'D', text: '放弃一切' }
    ],
    correctAnswer: 'A',
    explanation: '《道德经》的核心思想之一就是"道法自然"，强调顺应自然规律。'
  }
})

// 进度环样式
const ringRadius = 26
const ringCenter = 30
const circumference = 2 * Math.PI * ringRadius
const ringStyle = computed(() => ({
  strokeDasharray: `${circumference} ${circumference}`,
  strokeDashoffset: `${circumference - (currentPathProgress.value / 100) * circumference}`
}))

// 成就数据
const achievements = computed(() => {
  // 计算总完成课程数
  let totalCompleted = 0
  Object.values(paths.value).forEach(path => {
    totalCompleted += path.lessons.filter(l => l.completed).length
  })

  return [
    { 
      id: 'beginner', 
      title: '初学者', 
      desc: '完成1章学习', 
      icon: 'fas fa-trophy', 
      unlocked: totalCompleted >= 1,
      bgClass: 'bg-yellow-100',
      textClass: 'text-yellow-600'
    },
    { 
      id: 'thinker', 
      title: '思考者', 
      desc: '完成10章学习', 
      icon: 'fas fa-medal', 
      unlocked: totalCompleted >= 10,
      bgClass: 'bg-blue-100',
      textClass: 'text-blue-500'
    },
    { 
      id: 'sage', 
      title: '智者', 
      desc: '完成40章学习', 
      icon: 'fas fa-crown', 
      unlocked: totalCompleted >= 40,
      bgClass: 'bg-purple-100',
      textClass: 'text-purple-500'
    },
    { 
      id: 'master', 
      title: '大师', 
      desc: '完成81章学习', 
      icon: 'fas fa-star', 
      unlocked: totalCompleted >= 81,
      bgClass: 'bg-red-100',
      textClass: 'text-red-500'
    }
  ]
})

// 方法
const calculateProgress = (key: string) => {
  const path = paths.value[key]
  const total = path.lessons.length
  const completed = path.lessons.filter(l => l.completed).length
  return total ? Math.round((completed / total) * 100) : 0
}

const selectPath = (key: PathKey) => {
  currentPathKey.value = key
  nextTick(() => {
    const el = document.getElementById('pathDetails')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  })
}

const getDifficultyClass = (diff: Difficulty) => {
  switch (diff) {
    case 'easy': return 'bg-green-100 text-green-700'
    case 'medium': return 'bg-orange-100 text-orange-700'
    case 'hard': return 'bg-red-100 text-red-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

const getDifficultyText = (diff: Difficulty) => {
  switch (diff) {
    case 'easy': return '初级'
    case 'medium': return '中级'
    case 'hard': return '高级'
    default: return '未知'
  }
}

const openQuiz = (lesson: Lesson, isReview: boolean) => {
  quizLesson.value = lesson
  isReviewMode.value = isReview
  showQuiz.value = true
}

const closeQuiz = () => {
  showQuiz.value = false
  quizLesson.value = null
}

const completeLesson = () => {
  if (!quizLesson.value || !currentPath.value || isReviewMode.value) {
    closeQuiz()
    return
  }

  // 标记当前课程为完成
  const lessonIndex = currentPath.value.lessons.findIndex(l => l.id === quizLesson.value!.id)
  if (lessonIndex !== -1) {
    currentPath.value.lessons[lessonIndex].completed = true
    currentPath.value.lessons[lessonIndex].current = false
    
    // 解锁下一课
    if (lessonIndex + 1 < currentPath.value.lessons.length) {
      currentPath.value.lessons[lessonIndex + 1].current = true
    }
    
    // 增加经验值
    addExp(50) // 每完成一课增加 50 XP
    
    // 触发随机奇遇 (30% 概率)
    if (Math.random() < 0.3) {
      triggerRandomEvent()
    }
    
    // 保存进度
    saveProgress()
  }
  
  closeQuiz()
}

const triggerRandomEvent = () => {
  const events = [
    { type: 'epiphany', desc: '忽觉心中豁然开朗，对道法自然有了更深的领悟。', xp: 30 },
    { type: 'guest', desc: '偶遇一位游方道人，相谈甚欢，获赠修行心得。', xp: 50 },
    { type: 'relic', desc: '在古籍夹层中发现一张残破的丹方，记载着养生秘诀。', xp: 40 }
  ]
  
  const randomEvent = events[Math.floor(Math.random() * events.length)]
  eventData.value = {
    type: randomEvent.type as any,
    description: randomEvent.desc,
    xp: randomEvent.xp
  }
  
  // 延迟显示，以免和升级弹窗冲突
  setTimeout(() => {
    showEventModal.value = true
    addExp(randomEvent.xp, '随机奇遇')
  }, 1000)
}

// 持久化
const saveProgress = () => {
  localStorage.setItem('learningPaths', JSON.stringify(paths.value))
}

const loadProgress = () => {
  const saved = localStorage.getItem('learningPaths')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      // 合并保存的数据和初始数据结构（防止数据结构变化导致的问题）
      Object.keys(initialPaths).forEach(key => {
        if (parsed[key]) {
          paths.value[key] = parsed[key]
        }
      })
    } catch (e) {
      console.error('Failed to load learning progress', e)
    }
  }
}

onMounted(() => {
  loadProgress()
})
</script>

<style scoped>
/* 禅模式适配 */
:global(html.zen-mode) .bg-green-100,
:global(html.zen-mode) .bg-orange-100,
:global(html.zen-mode) .bg-red-100,
:global(html.zen-mode) .bg-yellow-100,
:global(html.zen-mode) .bg-blue-100,
:global(html.zen-mode) .bg-purple-100 {
  background-color: #3f3f46 !important;
  color: #d4b483 !important;
}

:global(html.zen-mode) .text-green-600,
:global(html.zen-mode) .text-orange-600,
:global(html.zen-mode) .text-red-600,
:global(html.zen-mode) .text-yellow-600,
:global(html.zen-mode) .text-blue-600,
:global(html.zen-mode) .text-purple-600 {
  color: #d4b483 !important;
}

/* 古籍模式适配 */
:global(html.retro-mode) .bg-white {
  background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNjY2MiLz4KPC9zdmc+');
  border: 1px solid #8d6e63;
}

:global(html.retro-mode.zen-mode) .bg-white {
  background-image: none;
  border-color: #d4b483;
}

:global(html.retro-mode) h1,
:global(html.retro-mode) h2,
:global(html.retro-mode) h3 {
  font-family: "KaiTi", "STKaiti", serif;
  letter-spacing: 0.1em;
}

/* 进度环动画 */
circle {
  transition: stroke-dashoffset 1s ease-in-out;
}

/* 弹窗动画 */
@keyframes bounceIn {
  0% { transform: scale(0.3); opacity: 0; }
  50% { transform: scale(1.05); opacity: 1; }
  70% { transform: scale(0.9); }
  100% { transform: scale(1); }
}

.animate-bounce-in {
  animation: bounceIn 0.6s cubic-bezier(0.215, 0.610, 0.355, 1.000);
}
</style>

<template>
  <div class="min-h-screen pt-4 pb-20 px-4 md:px-8 bg-gray-50">
    <div class="container mx-auto max-w-6xl">
      <div v-if="loading" class="flex items-center justify-center py-20">
        <i class="fas fa-spinner fa-spin text-4xl text-primary"></i>
      </div>
      
      <template v-else-if="course">
        <button @click="$router.back()" class="mb-6 text-gray-600 hover:text-primary transition-colors">
          <i class="fas fa-arrow-left mr-2"></i>返回课程列表
        </button>
        
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2">
            <div class="bg-white rounded-xl shadow-lg overflow-hidden">
              <VideoPlayer
                v-if="currentChapter"
                :video-url="currentChapter.videoUrl"
                :poster-url="course.coverUrl"
                @progress="handleVideoProgress"
                @ended="handleVideoEnded"
              />
              
              <div v-else class="aspect-video bg-gray-900 flex items-center justify-center">
                <div class="text-center text-white">
                  <i class="fas fa-lock text-4xl mb-4"></i>
                  <p>请选择章节开始学习</p>
                </div>
              </div>
              
              <div class="p-6">
                <div class="flex items-center justify-between mb-4">
                  <h1 class="text-2xl font-bold text-dark">{{ course.title }}</h1>
                  <div class="flex items-center gap-2">
                    <span class="text-yellow-500"><i class="fas fa-star"></i></span>
                    <span class="font-semibold">{{ course.rating }}</span>
                  </div>
                </div>
                
                <p class="text-gray-600 mb-6">{{ course.description }}</p>
                
                <div class="flex flex-wrap gap-4 text-sm text-gray-500">
                  <span><i class="fas fa-clock mr-1"></i>{{ course.totalDuration }}</span>
                  <span><i class="fas fa-book mr-1"></i>{{ course.chapters.length }} 章节</span>
                  <span><i class="fas fa-user-friends mr-1"></i>{{ course.studentsCount }} 人在学</span>
                  <span><i class="fas fa-signal mr-1"></i>{{ difficultyText }}</span>
                </div>
              </div>
            </div>
            
            <div class="bg-white rounded-xl shadow-lg p-6 mt-6">
              <h2 class="text-xl font-bold text-dark mb-4">课程介绍</h2>
              <div class="prose prose-sm max-w-none text-gray-600" v-html="course.introduction"></div>
            </div>
            
            <div class="bg-white rounded-xl shadow-lg p-6 mt-6">
              <h2 class="text-xl font-bold text-dark mb-4">学习笔记</h2>
              <textarea
                v-model="currentNote"
                class="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                rows="4"
                placeholder="记录您的学习心得..."
              ></textarea>
              <div class="flex justify-end mt-3">
                <button
                  @click="saveNote"
                  class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
                >
                  <i class="fas fa-save mr-2"></i>保存笔记
                </button>
              </div>
            </div>
          </div>
          
          <div class="lg:col-span-1">
            <div class="bg-white rounded-xl shadow-lg sticky top-24">
              <div class="p-4 border-b border-gray-100">
                <h3 class="font-bold text-dark">课程章节</h3>
                <div class="mt-2 flex items-center gap-2 text-sm text-gray-500">
                  <span>进度</span>
                  <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-primary transition-all duration-300"
                      :style="{ width: progressPercent + '%' }"
                    ></div>
                  </div>
                  <span>{{ progressPercent }}%</span>
                </div>
              </div>
              
              <div class="max-h-[500px] overflow-y-auto">
                <div
                  v-for="(chapter, index) in course.chapters"
                  :key="chapter.id"
                  :class="[
                    'chapter-item p-4 border-b border-gray-50 cursor-pointer transition-colors',
                    { 'bg-primary/5': currentChapterIndex === index },
                    { 'opacity-50 cursor-not-allowed': isChapterLocked(index) }
                  ]"
                  @click="selectChapter(index)"
                >
                  <div class="flex items-start gap-3">
                    <div
                      :class="[
                        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
                        isChapterCompleted(index)
                          ? 'bg-green-500 text-white'
                          : currentChapterIndex === index
                          ? 'bg-primary text-white'
                          : 'bg-gray-200 text-gray-600'
                      ]"
                    >
                      <i v-if="isChapterCompleted(index)" class="fas fa-check"></i>
                      <span v-else>{{ index + 1 }}</span>
                    </div>
                    
                    <div class="flex-1 min-w-0">
                      <h4 class="font-medium text-dark truncate">{{ chapter.title }}</h4>
                      <div class="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <span><i class="fas fa-clock mr-1"></i>{{ chapter.duration }}</span>
                        <span v-if="isChapterLocked(index)">
                          <i class="fas fa-lock mr-1"></i>需完成上一章
                        </span>
                      </div>
                    </div>
                    
                    <i v-if="isChapterLocked(index)" class="fas fa-lock text-gray-400"></i>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-if="!canAccess" class="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mt-4">
              <div class="flex items-center gap-2 text-yellow-700 mb-2">
                <i class="fas fa-crown"></i>
                <span class="font-bold">宗师会员专属</span>
              </div>
              <p class="text-sm text-yellow-600 mb-3">
                升级为宗师会员，解锁全部课程内容
              </p>
              <button
                @click="showUpgradeModal = true"
                class="w-full py-2 bg-yellow-500 text-white rounded-lg font-bold hover:bg-yellow-600 transition-colors"
              >
                立即升级
              </button>
            </div>
          </div>
        </div>
      </template>
      
      <div v-else class="text-center py-20">
        <i class="fas fa-exclamation-circle text-4xl text-gray-300 mb-4"></i>
        <p class="text-gray-500">课程不存在或已被删除</p>
      </div>
    </div>
    
    <div
      v-if="showUpgradeModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="showUpgradeModal = false"
    >
      <div class="bg-white rounded-2xl p-8 max-w-md w-full">
        <h3 class="text-2xl font-bold text-dark mb-4">升级为宗师会员</h3>
        <p class="text-gray-600 mb-6">
          解锁全部道商课程，享受无限AI对话、专属人格等特权
        </p>
        <div class="bg-yellow-50 rounded-lg p-4 mb-6">
          <div class="text-3xl font-bold text-yellow-600">¥49<span class="text-base font-normal text-gray-500">/月</span></div>
        </div>
        <div class="flex gap-3">
          <button
            @click="showUpgradeModal = false"
            class="flex-1 py-3 border border-gray-300 rounded-lg font-bold hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            @click="handleUpgrade"
            class="flex-1 py-3 bg-yellow-500 text-white rounded-lg font-bold hover:bg-yellow-600 transition-colors"
          >
            立即升级
          </button>
        </div>
      </div>
    </div>
    
    <div
      v-if="showCompletionModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-2xl p-8 max-w-md w-full text-center">
        <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-trophy text-4xl text-yellow-500"></i>
        </div>
        <h3 class="text-2xl font-bold text-dark mb-2">恭喜完成课程！</h3>
        <p class="text-gray-600 mb-6">
          您已完成「{{ course?.title }}」的全部学习内容
        </p>
        <button
          @click="showCompletionModal = false"
          class="px-8 py-3 bg-primary text-white rounded-lg font-bold hover:bg-opacity-90 transition-colors"
        >
          返回课程列表
        </button>
      </div>
    </div>
    
    <div
      v-if="notification.show"
      :class="[
        'fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 text-white transition-all duration-300',
        notification.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
      ]"
    >
      {{ notification.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import VideoPlayer from '@/components/learning/VideoPlayer.vue'

interface Chapter {
  id: string
  title: string
  videoUrl: string
  duration: string
  description?: string
}

interface Course {
  id: string
  title: string
  description: string
  introduction: string
  coverUrl: string
  icon: string
  totalDuration: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  rating: number
  studentsCount: number
  chapters: Chapter[]
  tierRequired: 'free' | 'pro' | 'master'
}

const route = useRoute()
const authStore = useAuthStore()
const { user, isLoggedIn } = storeToRefs(authStore)

const loading = ref(true)
const course = ref<Course | null>(null)
const currentChapterIndex = ref(0)
const completedChapters = ref<string[]>([])
const currentNote = ref('')
const showUpgradeModal = ref(false)
const showCompletionModal = ref(false)

const notification = ref({
  show: false,
  message: '',
  type: 'success'
})

const currentChapter = computed(() => {
  if (!course.value || currentChapterIndex.value < 0) return null
  return course.value.chapters[currentChapterIndex.value]
})

const canAccess = computed(() => {
  if (!course.value) return false
  if (course.value.tierRequired === 'free') return true
  if (!isLoggedIn.value) return false
  return user.value?.subscription.tier === 'master'
})

const difficultyText = computed(() => {
  const texts = {
    beginner: '入门级',
    intermediate: '进阶级',
    advanced: '高级'
  }
  return course.value ? texts[course.value.difficulty] : ''
})

const progressPercent = computed(() => {
  if (!course.value || course.value.chapters.length === 0) return 0
  return Math.round((completedChapters.value.length / course.value.chapters.length) * 100)
})

const isChapterLocked = (index: number): boolean => {
  if (index === 0) return false
  return !isChapterCompleted(index - 1)
}

const isChapterCompleted = (index: number): boolean => {
  if (!course.value) return false
  const chapter = course.value.chapters[index]
  return completedChapters.value.includes(chapter.id)
}

const selectChapter = (index: number) => {
  if (isChapterLocked(index)) {
    showNotification('请先完成上一章节', 'info')
    return
  }
  
  if (!canAccess.value) {
    showUpgradeModal.value = true
    return
  }
  
  currentChapterIndex.value = index
  loadNoteForChapter()
}

const handleVideoProgress = (currentTime: number, duration: number) => {
  if (!currentChapter.value) return
  
  const progressKey = `course_${course.value?.id}_chapter_${currentChapter.value.id}`
  localStorage.setItem(progressKey, JSON.stringify({ currentTime, duration }))
}

const handleVideoEnded = () => {
  if (!currentChapter.value || !course.value) return
  
  if (!completedChapters.value.includes(currentChapter.value.id)) {
    completedChapters.value.push(currentChapter.value.id)
    saveProgress()
    
    if (completedChapters.value.length === course.value.chapters.length) {
      showCompletionModal.value = true
    } else if (currentChapterIndex.value < course.value.chapters.length - 1) {
      currentChapterIndex.value++
      showNotification('已解锁下一章节', 'success')
    }
  }
}

const saveProgress = () => {
  if (!course.value) return
  const key = `course_${course.value.id}_progress`
  localStorage.setItem(key, JSON.stringify(completedChapters.value))
}

const loadProgress = () => {
  if (!course.value) return
  const key = `course_${course.value.id}_progress`
  const saved = localStorage.getItem(key)
  if (saved) {
    completedChapters.value = JSON.parse(saved)
  }
}

const saveNote = () => {
  if (!currentChapter.value || !course.value) return
  
  const key = `course_${course.value.id}_chapter_${currentChapter.value.id}_note`
  localStorage.setItem(key, currentNote.value)
  showNotification('笔记已保存', 'success')
}

const loadNoteForChapter = () => {
  if (!currentChapter.value || !course.value) return
  
  const key = `course_${course.value.id}_chapter_${currentChapter.value.id}_note`
  currentNote.value = localStorage.getItem(key) || ''
}

const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
  notification.value = { show: true, message, type }
  setTimeout(() => {
    notification.value.show = false
  }, 3000)
}

const handleUpgrade = () => {
  if (!isLoggedIn.value) {
    authStore.openAuthModal()
    return
  }
  authStore.showPricingModal = true
  showUpgradeModal.value = false
}

const loadCourse = async () => {
  loading.value = true
  
  const courseId = route.params.id as string
  
  const courses: Record<string, Course> = {
    '1': {
      id: '1',
      title: '无为而治的领导力',
      description: '解析《道德经》中的管理哲学，如何通过"不妄为"激发团队的最大潜能，建立自组织团队。',
      introduction: `
        <p>本课程深入解读《道德经》中"无为而治"的核心思想，帮助现代管理者理解如何在管理中运用道家智慧。</p>
        <h3>课程大纲</h3>
        <ul>
          <li>第一章：什么是"无为而治"</li>
          <li>第二章：无为与放任的区别</li>
          <li>第三章：如何建立自组织团队</li>
          <li>第四章：案例分析与实践</li>
        </ul>
        <h3>适合人群</h3>
        <p>企业中高层管理者、创业者、团队负责人</p>
      `,
      coverUrl: 'https://s.coze.cn/image/H5ri4Ya3YII/',
      icon: 'fas fa-water',
      totalDuration: '12课时',
      difficulty: 'intermediate',
      rating: 4.9,
      studentsCount: 1205,
      tierRequired: 'master',
      chapters: [
        { id: '1-1', title: '导论：道家管理哲学概述', videoUrl: '', duration: '45分钟' },
        { id: '1-2', title: '"无为"的真义：不是不作为', videoUrl: '', duration: '50分钟' },
        { id: '1-3', title: '顺势而为：识别组织发展的自然规律', videoUrl: '', duration: '55分钟' },
        { id: '1-4', title: '减法管理：如何做到"为无为"', videoUrl: '', duration: '60分钟' },
        { id: '1-5', title: '自组织团队的建设与维护', videoUrl: '', duration: '65分钟' },
        { id: '1-6', title: '案例：道家智慧在现代企业的应用', videoUrl: '', duration: '70分钟' }
      ]
    },
    '2': {
      id: '2',
      title: '以正治国的危机公关',
      description: '"以正治国，以奇用兵"。学习如何在企业面临重大危机时，运用道家智慧化险为夷。',
      introduction: `
        <p>本课程结合《道德经》智慧，教授企业危机公关的核心策略。</p>
        <h3>课程大纲</h3>
        <ul>
          <li>危机的本质与道家视角</li>
          <li>"以正治国"的公关原则</li>
          <li>"以奇用兵"的危机应对策略</li>
        </ul>
      `,
      coverUrl: 'https://s.coze.cn/image/H5ri4Ya3YII/',
      icon: 'fas fa-shield-alt',
      totalDuration: '8课时',
      difficulty: 'advanced',
      rating: 4.8,
      studentsCount: 850,
      tierRequired: 'master',
      chapters: [
        { id: '2-1', title: '危机的本质：道家视角解读', videoUrl: '', duration: '40分钟' },
        { id: '2-2', title: '"以正治国"：建立公信力', videoUrl: '', duration: '45分钟' },
        { id: '2-3', title: '"以奇用兵"：灵活应对策略', videoUrl: '', duration: '50分钟' },
        { id: '2-4', title: '实战演练：危机公关案例分析', videoUrl: '', duration: '55分钟' }
      ]
    },
    '3': {
      id: '3',
      title: '知人者智的识人用人',
      description: '深度解读"知人者智，自知者明"。构建基于人性本源的人才选拔与培养体系。',
      introduction: `<p>本课程深入探讨《道德经》中关于识人用人的智慧。</p>`,
      coverUrl: 'https://s.coze.cn/image/H5ri4Ya3YII/',
      icon: 'fas fa-users-cog',
      totalDuration: '10课时',
      difficulty: 'intermediate',
      rating: 4.9,
      studentsCount: 932,
      tierRequired: 'master',
      chapters: [
        { id: '3-1', title: '知人者智：识人的艺术', videoUrl: '', duration: '45分钟' },
        { id: '3-2', title: '自知者明：自我认知的重要性', videoUrl: '', duration: '50分钟' },
        { id: '3-3', title: '用人之道：道家的人才观', videoUrl: '', duration: '55分钟' },
        { id: '3-4', title: '实践：构建识人用人体系', videoUrl: '', duration: '60分钟' }
      ]
    },
    '4': {
      id: '4',
      title: '长生久视的企业战略',
      description: '探索企业基业长青的秘密。如何避免"强梁者不得其死"，实现可持续发展。',
      introduction: `<p>本课程探讨企业可持续发展的道家智慧。</p>`,
      coverUrl: 'https://s.coze.cn/image/H5ri4Ya3YII/',
      icon: 'fas fa-tree',
      totalDuration: '15课时',
      difficulty: 'advanced',
      rating: 4.7,
      studentsCount: 640,
      tierRequired: 'master',
      chapters: [
        { id: '4-1', title: '企业长寿的秘密', videoUrl: '', duration: '50分钟' },
        { id: '4-2', title: '避免"强梁者不得其死"', videoUrl: '', duration: '55分钟' },
        { id: '4-3', title: '可持续发展战略', videoUrl: '', duration: '60分钟' }
      ]
    },
    '5': {
      id: '5',
      title: '柔弱胜刚强的谈判术',
      description: '商业谈判不是你死我活的战争。学习如何运用"柔德"化解冲突，达成共赢。',
      introduction: `<p>本课程教授基于道家智慧的谈判技巧。</p>`,
      coverUrl: 'https://s.coze.cn/image/H5ri4Ya3YII/',
      icon: 'fas fa-handshake',
      totalDuration: '6课时',
      difficulty: 'beginner',
      rating: 4.9,
      studentsCount: 1500,
      tierRequired: 'master',
      chapters: [
        { id: '5-1', title: '柔弱胜刚强的哲学基础', videoUrl: '', duration: '40分钟' },
        { id: '5-2', title: '以柔克刚的谈判技巧', videoUrl: '', duration: '45分钟' },
        { id: '5-3', title: '实战演练：谈判场景模拟', videoUrl: '', duration: '50分钟' }
      ]
    },
    '6': {
      id: '6',
      title: '致虚守静的决策心法',
      description: '在信息爆炸的时代，管理者如何保持内心的宁静，做出最准确的直觉判断。',
      introduction: `<p>本课程帮助管理者培养决策智慧。</p>`,
      coverUrl: 'https://s.coze.cn/image/H5ri4Ya3YII/',
      icon: 'fas fa-brain',
      totalDuration: '9课时',
      difficulty: 'intermediate',
      rating: 4.8,
      studentsCount: 780,
      tierRequired: 'master',
      chapters: [
        { id: '6-1', title: '致虚守静：决策的心理基础', videoUrl: '', duration: '45分钟' },
        { id: '6-2', title: '直觉决策：道家智慧的应用', videoUrl: '', duration: '50分钟' },
        { id: '6-3', title: '实践：复杂决策案例分析', videoUrl: '', duration: '55分钟' }
      ]
    }
  }
  
  await new Promise(resolve => setTimeout(resolve, 500))
  
  course.value = courses[courseId] || null
  
  if (course.value) {
    loadProgress()
    loadNoteForChapter()
  }
  
  loading.value = false
}

watch(() => route.params.id, () => {
  if (route.params.id) {
    loadCourse()
  }
})

onMounted(() => {
  loadCourse()
})
</script>

<style scoped>
.chapter-item:hover:not(.cursor-not-allowed) {
  background-color: rgba(212, 180, 131, 0.1);
}

.prose h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.prose ul {
  list-style-type: disc;
  padding-left: 1.5rem;
}

.prose li {
  margin-bottom: 0.25rem;
}

:global(html.zen-mode) .bg-white {
  background-color: #2c2c2e;
  border-color: #3f3f46;
}

:global(html.zen-mode) .text-dark {
  color: #d4b483;
}

:global(html.zen-mode) .text-gray-600,
:global(html.zen-mode) .text-gray-500 {
  color: #9ca3af;
}

:global(html.zen-mode) .bg-gray-50 {
  background-color: #1c1c1e;
}
</style>

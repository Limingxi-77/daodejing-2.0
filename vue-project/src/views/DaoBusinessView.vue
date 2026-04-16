<template>
  <div class="min-h-screen pt-4 pb-20 px-4 md:px-8">
    <div class="container mx-auto max-w-6xl">
      <!-- Header -->
      <div class="text-center mb-12 animate-fade-in">
        <h1 class="text-4xl font-bold text-primary mb-4 font-serif">道商 · 企业家修练</h1>
        <p class="text-lg text-gray-600 italic">
          "治大国，若烹小鲜" —— 东方智慧的现代管理实践
        </p>
        <div class="mt-4 inline-block bg-yellow-100 text-yellow-800 px-4 py-1 rounded-full text-sm font-bold border border-yellow-200">
          <i class="fas fa-crown mr-2"></i> 宗师会员专属
        </div>
      </div>

      <!-- Course Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div 
          v-for="course in courses" 
          :key="course.id"
          class="bg-white rounded-xl shadow-lg overflow-hidden border border-secondary/20 hover:shadow-2xl transition-all duration-300 group flex flex-col"
        >
          <!-- Course Cover -->
          <div class="h-48 bg-primary/90 relative overflow-hidden">
            <div class="absolute inset-0 opacity-30 mix-blend-overlay">
              <img src="https://s.coze.cn/image/H5ri4Ya3YII/" alt="texture" class="w-full h-full object-cover" />
            </div>
            <div class="absolute inset-0 flex items-center justify-center">
              <i :class="course.icon" class="text-6xl text-white/90 drop-shadow-lg transform group-hover:scale-110 transition-transform duration-500"></i>
            </div>
            <div class="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold">
              {{ course.duration }}
            </div>
          </div>

          <!-- Course Content -->
          <div class="p-6 flex-1 flex flex-col">
            <h3 class="text-xl font-bold text-dark mb-2 group-hover:text-primary transition-colors">{{ course.title }}</h3>
            <p class="text-gray-500 text-sm mb-4 line-clamp-2">{{ course.desc }}</p>
            
            <div class="mt-auto">
              <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span><i class="fas fa-user-friends mr-1"></i> {{ course.students }} 人在学</span>
                <span><i class="fas fa-star text-yellow-400 mr-1"></i> {{ course.rating }}</span>
              </div>
              
              <button 
                @click="startLearning(course)"
                class="w-full py-3 rounded-lg font-bold transition-colors flex items-center justify-center"
                :class="canAccess ? 'bg-primary text-white hover:bg-primary/90' : 'bg-gray-100 text-gray-400 cursor-not-allowed'"
              >
                <span v-if="canAccess"><i class="fas fa-play-circle mr-2"></i> 开始学习</span>
                <span v-else><i class="fas fa-lock mr-2"></i> 升级解锁</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Locked Overlay (if needed globally, but here we handle per button) -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

const authStore = useAuthStore()
const { user, isLoggedIn } = storeToRefs(authStore)

const canAccess = computed(() => {
  if (!isLoggedIn.value) return false
  return user.value?.subscription.tier === 'master'
})

const startLearning = (course: any) => {
  if (!isLoggedIn.value) {
    authStore.openAuthModal()
    return
  }
  
  if (!canAccess.value) {
    if (confirm('“道商”课程仅限宗师会员学习，是否立即升级？')) {
      authStore.showPricingModal = true
    }
    return
  }
  
  alert(`开始学习课程：${course.title}\n（课程内容模块开发中...）`)
}

const courses = [
  {
    id: 1,
    title: '无为而治的领导力',
    desc: '解析《道德经》中的管理哲学，如何通过“不妄为”激发团队的最大潜能，建立自组织团队。',
    duration: '12 课时',
    students: 1205,
    rating: 4.9,
    icon: 'fas fa-water'
  },
  {
    id: 2,
    title: '以正治国的危机公关',
    desc: '“以正治国，以奇用兵”。学习如何在企业面临重大危机时，运用道家智慧化险为夷。',
    duration: '8 课时',
    students: 850,
    rating: 4.8,
    icon: 'fas fa-shield-alt'
  },
  {
    id: 3,
    title: '知人者智的识人用人',
    desc: '深度解读“知人者智，自知者明”。构建基于人性本源的人才选拔与培养体系。',
    duration: '10 课时',
    students: 932,
    rating: 4.9,
    icon: 'fas fa-users-cog'
  },
  {
    id: 4,
    title: '长生久视的企业战略',
    desc: '探索企业基业长青的秘密。如何避免“强梁者不得其死”，实现可持续发展。',
    duration: '15 课时',
    students: 640,
    rating: 4.7,
    icon: 'fas fa-tree'
  },
  {
    id: 5,
    title: '柔弱胜刚强的谈判术',
    desc: '商业谈判不是你死我活的战争。学习如何运用“柔德”化解冲突，达成共赢。',
    duration: '6 课时',
    students: 1500,
    rating: 4.9,
    icon: 'fas fa-handshake'
  },
  {
    id: 6,
    title: '致虚守静的决策心法',
    desc: '在信息爆炸的时代，管理者如何保持内心的宁静，做出最准确的直觉判断。',
    duration: '9 课时',
    students: 780,
    rating: 4.8,
    icon: 'fas fa-brain'
  }
]
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.8s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Zen Mode Support */
:global(html.zen-mode) .bg-white {
  background-color: #2c2c2e;
  border-color: #3f3f46;
}

:global(html.zen-mode) .text-primary {
  color: #d4b483;
}

:global(html.zen-mode) .text-dark {
  color: #d1d5db;
}

:global(html.zen-mode) .text-gray-600,
:global(html.zen-mode) .text-gray-500 {
  color: #9ca3af;
}

:global(html.zen-mode) .bg-gray-100 {
  background-color: #3f3f46;
  color: #6b7280;
}

:global(html.zen-mode) .bg-yellow-100 {
  background-color: rgba(234, 179, 8, 0.1);
  border-color: rgba(234, 179, 8, 0.2);
  color: #fbbf24;
}
</style>

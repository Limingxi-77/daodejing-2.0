<template>
  <div class="min-h-screen">
    <!-- Hero 区域 -->
    <section class="pt-24 pb-20 px-4 md:px-8 relative overflow-hidden">
      <!-- 背景装饰 -->
      <div class="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none">
        <img src="https://s.coze.cn/image/H5ri4Ya3YII/" alt="太极图" class="w-full h-full object-cover" />
      </div>
      <div class="absolute bottom-0 left-0 w-1/3 h-full opacity-10 pointer-events-none">
        <img src="https://s.coze.cn/image/DLT84Yi4R1A/" alt="竹简" class="w-full h-full object-cover" />
      </div>

      <div class="container mx-auto">
        <div class="max-w-5xl mx-auto text-center scroll-reveal">
          <div class="mb-12">
            <h1 class="text-[clamp(2.5rem,6vw,4rem)] font-bold text-primary leading-tight mb-6">
              以AI智慧<br/>探索老子思想的现代价值
            </h1>
            <p class="text-xl text-dark/80 mb-8 max-w-2xl mx-auto">
              智能解读 · 个性化学习 · 内容共创<br/>
              开启与《道德经》的深度对话之旅
            </p>
            <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
              <router-link 
                :to="{ name: 'AIInterpretation' }"
                class="px-10 py-4 btn-primary rounded-lg text-lg font-bold shadow-lg hover:-translate-y-1 transition-transform"
              >
                开始探索
              </router-link>
              <router-link 
                :to="{ name: 'About' }"
                class="px-10 py-4 btn-secondary rounded-lg text-lg font-bold hover:-translate-y-1 transition-transform"
              >
                了解更多
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 每日一签 (Gamification) -->
    <section class="py-12 bg-primary/5">
      <div class="container mx-auto px-4 md:px-8">
        <div class="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
          <div class="md:w-1/3 bg-primary p-8 flex flex-col justify-center items-center text-white relative overflow-hidden">
            <div class="absolute inset-0 opacity-10">
              <img src="https://s.coze.cn/image/H5ri4Ya3YII/" alt="bg" class="w-full h-full object-cover" />
            </div>
            
            <!-- 签筒动画 -->
            <div v-if="isShaking" class="absolute inset-0 flex items-center justify-center z-20 pointer-events-none bg-primary/90 backdrop-blur-sm">
              <div class="relative w-32 h-64">
                <!-- 签筒 -->
                <div class="absolute bottom-0 w-full h-48 bg-gradient-to-r from-yellow-700 to-yellow-600 rounded-b-3xl border-4 border-yellow-800 shadow-2xl animate-shake-vertical origin-bottom z-10">
                  <div class="absolute top-4 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full border-2 border-yellow-500/30 flex items-center justify-center">
                    <span class="text-2xl font-serif text-yellow-200 font-bold">道</span>
                  </div>
                </div>
                <!-- 签子 -->
                <div class="absolute top-10 left-1/2 transform -translate-x-1/2 w-4 h-48 bg-yellow-100 rounded-t-lg border border-yellow-300 shadow-md animate-bounce-stick origin-bottom z-0" style="animation-delay: 0.1s"></div>
                <div class="absolute top-14 left-1/3 transform -translate-x-1/2 w-4 h-44 bg-yellow-100 rounded-t-lg border border-yellow-300 shadow-md animate-bounce-stick origin-bottom z-0" style="animation-delay: 0.3s; animation-duration: 0.7s"></div>
                <div class="absolute top-8 left-2/3 transform -translate-x-1/2 w-4 h-46 bg-yellow-100 rounded-t-lg border border-yellow-300 shadow-md animate-bounce-stick origin-bottom z-0" style="animation-delay: 0s; animation-duration: 0.5s"></div>
              </div>
            </div>

            <!-- XP 动画 -->
            <transition name="fade-up">
              <div v-if="showXpAnimation" class="absolute top-10 right-10 text-yellow-300 font-bold text-2xl z-50 pointer-events-none drop-shadow-md">
                +50 功德
              </div>
            </transition>

            <h3 class="text-2xl font-bold mb-4 relative z-10">每日一签</h3>
            <p class="text-center mb-6 text-white/80 relative z-10">
              诚心祈愿，汲取今日智慧<br/>
              道法自然，指引前行方向
            </p>
            <div class="flex flex-col gap-2 relative z-30">
              <button 
                @click="drawFortune" 
                :disabled="hasDrawn || isShaking"
                class="px-6 py-2 bg-white text-primary rounded-full font-bold hover:bg-gray-100 transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed relative z-10"
                :class="{'animate-shake': isShaking}"
              >
                {{ hasDrawn ? '今日已签' : (isShaking ? '求签中...' : '抽取灵签') }}
              </button>
              
              <button 
                v-if="hasDrawn"
                @click="resetFortune" 
                class="text-xs text-white/50 hover:text-white underline relative z-10"
              >
                [测试用] 重置抽签
              </button>
            </div>
            
            <button 
              @click="showMoodRescue = true"
              class="mt-6 text-white/90 hover:text-white underline text-sm relative z-10 flex items-center"
            >
              <i class="fas fa-heart-broken mr-2"></i> 心情烦躁？打开情绪急救包
            </button>
          </div>
          <div class="md:w-2/3 p-8 flex flex-col justify-center min-h-[300px]">
            <transition name="fade" mode="out-in">
              <div v-if="!currentFortune" class="text-center text-gray-400" key="empty">
                <i class="fas fa-yin-yang text-6xl mb-4 opacity-20 animate-spin-slow"></i>
                <p>点击左侧按钮，开启今日道家智慧</p>
              </div>
              <div v-else class="text-center flex flex-col items-center justify-center h-full" key="content">
                <div class="mb-2 text-sm text-primary font-bold tracking-widest uppercase w-full">今日运势 · {{ currentFortune.type }}</div>
                
                <!-- 垂直文本容器 -->
                <div class="vertical-text my-4 retro-card transition-all duration-500">
                  <h4 class="text-2xl font-bold text-dark font-serif tracking-widest leading-loose">"{{ currentFortune.quote }}"</h4>
                  <p class="text-gray-600 italic mt-4">—— {{ currentFortune.source }}</p>
                </div>

                <div class="w-16 h-1 bg-accent mx-auto mb-4 rounded-full opacity-50"></div>
                
                <div class="grid grid-cols-2 gap-4 text-left bg-gray-50 p-4 rounded-lg w-full">
                  <div>
                    <span class="text-green-600 font-bold mr-2"><i class="fas fa-check-circle"></i> 宜</span>
                    <span class="text-gray-700 text-sm">{{ currentFortune.goodFor }}</span>
                  </div>
                  <div>
                    <span class="text-red-500 font-bold mr-2"><i class="fas fa-times-circle"></i> 忌</span>
                    <span class="text-gray-700 text-sm">{{ currentFortune.badFor }}</span>
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </section>

    <!-- 平台特色功能 -->
    <section class="py-16 bg-white/50">
      <div class="container mx-auto px-4 md:px-8">
        <div class="text-center mb-12 scroll-reveal">
          <h2 class="text-3xl font-bold text-primary mb-4">平台特色功能</h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            结合AI技术与传统文化，为您提供全方位的道德经学习体验
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- AI智能解读 -->
          <div class="bg-white rounded-xl shadow-md p-8 hover:-translate-y-2 transition-transform duration-300 border border-secondary/10">
            <div class="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-6 mx-auto">
              <i class="fas fa-robot text-3xl"></i>
            </div>
            <h3 class="text-xl font-bold text-dark mb-3 text-center">AI智能解读</h3>
            <p class="text-gray-600 text-center leading-relaxed">
              基于大语言模型的智能解读，深度解析道德经每一章的哲学内涵，支持多轮对话与答疑。
            </p>
          </div>

          <!-- 个性化学习路径 -->
          <div class="bg-white rounded-xl shadow-md p-8 hover:-translate-y-2 transition-transform duration-300 border border-secondary/10">
            <div class="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-6 mx-auto">
              <i class="fas fa-route text-3xl"></i>
            </div>
            <h3 class="text-xl font-bold text-dark mb-3 text-center">个性化学习路径</h3>
            <p class="text-gray-600 text-center leading-relaxed">
              从初学者到研究者，根据您的学习目标和进度，定制专属的道德经循序渐进学习路线。
            </p>
          </div>

          <!-- 互动社区 -->
          <div class="bg-white rounded-xl shadow-md p-8 hover:-translate-y-2 transition-transform duration-300 border border-secondary/10">
            <div class="w-16 h-16 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-6 mx-auto">
              <i class="fas fa-users text-3xl"></i>
            </div>
            <h3 class="text-xl font-bold text-dark mb-3 text-center">互动社区</h3>
            <p class="text-gray-600 text-center leading-relaxed">
              与志同道合的学习者交流心得，分享感悟，共同探讨道德经在现代生活中的应用智慧。
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- 学习统计 -->
    <section class="py-16 bg-white">
      <div class="container mx-auto px-4 md:px-8">
        <div class="bg-primary/5 rounded-2xl p-10 border border-primary/10">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div class="text-center">
              <div class="text-4xl font-bold text-primary mb-2">5,000+</div>
              <div class="text-gray-600 font-medium">活跃用户</div>
            </div>
            <div class="text-center">
              <div class="text-4xl font-bold text-primary mb-2">10,000+</div>
              <div class="text-gray-600 font-medium">解读内容</div>
            </div>
            <div class="text-center">
              <div class="text-4xl font-bold text-primary mb-2">81</div>
              <div class="text-gray-600 font-medium">完整章节</div>
            </div>
            <div class="text-center">
              <div class="text-4xl font-bold text-primary mb-2">24/7</div>
              <div class="text-gray-600 font-medium">AI服务</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 最新动态 -->
    <section class="py-16 mb-12">
      <div class="container mx-auto px-4 md:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-primary mb-4">最新动态</h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            了解平台最新功能和社区活动
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-primary hover:shadow-lg transition-shadow">
            <div class="flex justify-between items-start mb-2">
              <h3 class="text-xl font-bold text-dark">新增章节解读</h3>
              <span class="text-sm text-gray-400">2024-01-27</span>
            </div>
            <p class="text-gray-600 mb-4">
              道德经第25章"有物混成"的AI深度解读已上线，包含哲学分析和现代应用案例。
            </p>
            <a href="#" class="text-primary hover:underline text-sm font-medium">阅读详情 →</a>
          </div>

          <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-accent hover:shadow-lg transition-shadow">
            <div class="flex justify-between items-start mb-2">
              <h3 class="text-xl font-bold text-dark">社区活动预告</h3>
              <span class="text-sm text-gray-400">2024-02-01</span>
            </div>
            <p class="text-gray-600 mb-4">
              本周六晚8点将举办线上道德经读书会，主题为“无为而治在职场中的应用”，欢迎参与。
            </p>
            <a href="#" class="text-primary hover:underline text-sm font-medium">报名参加 →</a>
          </div>
        </div>
      </div>
    </section>
  </div>
  
  <MoodRescueModal v-if="showMoodRescue" @close="showMoodRescue = false" />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCultivationStore } from '../stores/cultivation'
import MoodRescueModal from '@/components/learning/MoodRescueModal.vue'

const cultivationStore = useCultivationStore()

interface Fortune {
  type: string
  quote: string
  source: string
  goodFor: string
  badFor: string
}

const hasDrawn = ref(false)
const currentFortune = ref<Fortune | null>(null)

const fortunes: Fortune[] = [
  { type: '上上签', quote: '上善若水。水善利万物而不争，处众人之所恶，故几于道。', source: '第八章', goodFor: '谦虚、包容、顺势而为', badFor: '争强好胜、刚愎自用' },
  { type: '中吉签', quote: '知人者智，自知者明。胜人者有力，自胜者强。', source: '第三十三章', goodFor: '反省、自律、学习新知', badFor: '盲目攀比、外求于人' },
  { type: '上吉签', quote: '致虚极，守静笃。万物并作，吾以观复。', source: '第十六章', goodFor: '冥想、静心、观察局势', badFor: '急躁冒进、妄动干戈' },
  { type: '中平签', quote: '治大国，若烹小鲜。', source: '第六十章', goodFor: '稳健、细致、不折腾', badFor: '朝令夕改、大动干戈' },
  { type: '上吉签', quote: '人法地，地法天，天法道，道法自然。', source: '第二十五章', goodFor: '顺应规律、亲近自然', badFor: '违背常理、逆天而行' },
  { type: '吉签', quote: '祸兮福之所倚，福兮祸之所伏。', source: '第五十八章', goodFor: '居安思危、转危为机', badFor: '得意忘形、悲观绝望' },
]

const showXpAnimation = ref(false)
const showMoodRescue = ref(false)

const isShaking = ref(false)

const triggerHaptic = (pattern: number | number[] = 50) => {
  if (navigator.vibrate) {
    navigator.vibrate(pattern)
  }
}

const drawFortune = () => {
  if (hasDrawn.value || isShaking.value) return
  
  // Start shaking
  isShaking.value = true
  triggerHaptic([50, 50, 50, 50, 50]) // Vibrate pattern
  
  // 模拟抽签动画效果
  setTimeout(() => {
    isShaking.value = false
    const randomIndex = Math.floor(Math.random() * fortunes.length)
    currentFortune.value = fortunes[randomIndex]
    hasDrawn.value = true
    
    // Success haptic
    triggerHaptic(100)
    
    localStorage.setItem('dailyFortuneDate', new Date().toDateString())
    localStorage.setItem('dailyFortuneIndex', randomIndex.toString())
    
    // 增加功德（经验值）
    cultivationStore.addExp(50, '每日一签')
    showXpAnimation.value = true
    setTimeout(() => showXpAnimation.value = false, 2000)
  }, 1500) // Longer duration for effect
}

const resetFortune = () => {
  localStorage.removeItem('dailyFortuneDate')
  localStorage.removeItem('dailyFortuneIndex')
  hasDrawn.value = false
  currentFortune.value = null
}

onMounted(() => {
  // 检查今日是否已抽签
  const savedDate = localStorage.getItem('dailyFortuneDate')
  const savedIndex = localStorage.getItem('dailyFortuneIndex')
  
  if (savedDate === new Date().toDateString() && savedIndex) {
    hasDrawn.value = true
    currentFortune.value = fortunes[parseInt(savedIndex)]
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed')
      }
    })
  })
  
  const elements = document.querySelectorAll('.scroll-reveal')
  elements.forEach(el => observer.observe(el))
})
</script>

<style scoped>
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
}

.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.5s ease;
}

.fade-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-up-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

.animate-shake {
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
}
@keyframes shake-vertical {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-8deg) translateY(2px) translateX(-2px); }
  50% { transform: rotate(0deg) translateY(4px); }
  75% { transform: rotate(8deg) translateY(2px) translateX(2px); }
}

@keyframes bounce-stick {
  0% { transform: translate(-50%, 0) rotate(0deg); }
  25% { transform: translate(-50%, -20px) rotate(-5deg); }
  50% { transform: translate(-50%, 0) rotate(0deg); }
  75% { transform: translate(-50%, -10px) rotate(3deg); }
  100% { transform: translate(-50%, 0) rotate(0deg); }
}

.animate-shake-vertical {
  animation: shake-vertical 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) infinite;
}

.animate-bounce-stick {
  animation: bounce-stick 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
}
</style>

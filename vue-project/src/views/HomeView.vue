<template>
  <div class="min-h-screen home-quiet">
    <!-- Hero 区域 -->
    <section class="pt-24 pb-20 px-4 md:px-8 relative overflow-hidden">
      <!-- 背景装饰 -->
      <div class="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none">
        <img src="https://s.coze.cn/image/H5ri4Ya3YII/" alt="太极图" class="w-full h-full object-cover" loading="lazy" decoding="async" fetchpriority="low" />
      </div>
      <div class="absolute bottom-0 left-0 w-1/3 h-full opacity-10 pointer-events-none">
        <img src="https://s.coze.cn/image/DLT84Yi4R1A/" alt="竹简" class="w-full h-full object-cover" loading="lazy" decoding="async" fetchpriority="low" />
      </div>

      <div class="container mx-auto">
        <div class="max-w-5xl mx-auto text-center scroll-reveal">
          <div class="mb-12">
            <h1 class="text-[clamp(2.5rem,6vw,4rem)] font-bold text-primary leading-tight mb-6">
              从一章开始<br/>读懂《道德经》
            </h1>
            <p class="text-xl text-dark/80 mb-8 max-w-2xl mx-auto">
              原文、注释、讲解、笔记与学习路径放在同一处。<br/>
              少一点口号，多一点能继续读下去的秩序。
            </p>
            <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
              <router-link 
                :to="{ name: 'LearningPath' }"
                class="px-10 py-4 btn-primary rounded-lg text-lg font-bold shadow-lg hover:-translate-y-1 transition-transform"
              >
                进入学习路径
              </router-link>
              <router-link 
                :to="{ name: 'AIInterpretation' }"
                class="px-10 py-4 btn-secondary rounded-lg text-lg font-bold hover:-translate-y-1 transition-transform"
              >
                查看章节解读
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 每日摘句 -->
    <section class="py-12 bg-primary/5">
      <div class="container mx-auto px-4 md:px-8">
        <div class="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
          <div class="md:w-1/3 bg-primary p-8 flex flex-col justify-center items-center text-white relative overflow-hidden">
            <div class="absolute inset-0 opacity-10">
              <img src="https://s.coze.cn/image/H5ri4Ya3YII/" alt="bg" class="w-full h-full object-cover" loading="lazy" decoding="async" fetchpriority="low" />
            </div>
            
            <!-- XP 动画 -->
            <transition name="fade-up">
              <div v-if="showXpAnimation" class="absolute top-10 right-10 text-yellow-300 font-bold text-2xl z-50 pointer-events-none drop-shadow-md">
                +50 经验
              </div>
            </transition>

            <!-- 修行状态 -->
            <div class="relative z-10 w-full mb-4 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <i :class="cultivationStore.currentRealm.icon" class="text-lg"></i>
                  <span class="font-bold">{{ cultivationStore.currentRealm.name }}</span>
                </div>
                <div class="text-sm">
                  <span class="text-yellow-300 font-bold">{{ cultivationStore.exp }}</span>
                  <span class="text-white/60"> XP</span>
                </div>
              </div>
              <!-- Progress Bar -->
              <div class="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full transition-all duration-700"
                  :style="{ width: cultivationStore.progress + '%' }"
                ></div>
              </div>
              <div class="flex justify-between mt-1 text-xs text-white/50">
                <span>{{ cultivationStore.currentRealm.name }}</span>
                <span v-if="cultivationStore.nextRealm">
                  {{ cultivationStore.nextRealm.name }} ({{ cultivationStore.nextRealm.minExp }} XP)
                </span>
                <span v-else>已达最高境界</span>
              </div>
            </div>

            <h3 class="text-2xl font-bold mb-4 relative z-10">今日道签</h3>
            <p class="text-center mb-6 text-white/80 relative z-10">
              基于《道德经》原文,由 AI 为你生成今日提点与行动建议。<br/>
              一段话、一个动作,给今天一个清晰的入口。
            </p>
            <button
              @click="drawFortune"
              :disabled="hasDrawn || isShaking || isLoading"
              class="px-6 py-2 bg-white text-primary rounded-full font-bold hover:bg-gray-100 transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed relative z-10"
              :class="{'animate-shake': isShaking}"
              data-testid="dao-sign-draw"
            >
              {{ hasDrawn ? '今日已读' : (isShaking || isLoading ? '抽取中...' : '抽取道签') }}
            </button>

            <button
              v-if="hasDrawn"
              @click="rerollFortune"
              :disabled="!canReroll || isShaking || isLoading"
              class="mt-3 px-4 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-full text-sm border border-white/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative z-10"
              :title="canReroll ? '消耗 30 经验值重新抽取' : '今日经验值不足 30,明日再来'"
              data-testid="dao-sign-reroll"
            >
              <i class="fas fa-dice mr-1"></i> 再抽一签 (-30 XP)
            </button>
            <p v-if="rerollError" class="mt-2 text-xs text-red-200 relative z-10" data-testid="dao-sign-reroll-error">{{ rerollError }}</p>

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
              <div v-else class="text-center flex flex-col items-center justify-center h-full" key="content" data-testid="dao-sign-card">
                <div class="mb-2 text-sm text-primary font-bold tracking-widest uppercase w-full">
                  {{ currentFortune.fromAI ? '今日道签 · AI 解读' : '今日摘句 · ' + currentFortune.type }}
                </div>

                <!-- 垂直文本容器 -->
                <div class="vertical-text my-4 retro-card transition-all duration-500">
                  <h4 class="text-2xl font-bold text-dark font-serif tracking-widest leading-loose">"{{ currentFortune.quote }}"</h4>
                  <p class="text-gray-600 italic mt-4">—— {{ currentFortune.source }}</p>
                </div>

                <div class="w-16 h-1 bg-accent mx-auto mb-4 rounded-full opacity-50"></div>

                <!-- AI 提点 + 行动建议 (仅当来自 AI 道签时) -->
                <div v-if="currentFortune.fromAI && (currentFortune.insight || currentFortune.action)" class="grid grid-cols-1 md:grid-cols-2 gap-3 w-full mb-3">
                  <div v-if="currentFortune.insight" class="bg-primary/5 border border-primary/15 rounded-lg p-3 text-left" data-testid="dao-sign-insight">
                    <div class="text-xs font-bold text-primary mb-1"><i class="fas fa-lightbulb mr-1"></i>今日提点</div>
                    <p class="text-gray-700 text-sm leading-relaxed">{{ currentFortune.insight }}</p>
                  </div>
                  <div v-if="currentFortune.action" class="bg-accent/5 border border-accent/20 rounded-lg p-3 text-left" data-testid="dao-sign-action">
                    <div class="text-xs font-bold text-accent mb-1"><i class="fas fa-shoe-prints mr-1"></i>今日行动</div>
                    <p class="text-gray-700 text-sm leading-relaxed">{{ currentFortune.action }}</p>
                  </div>
                </div>

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

    <!-- 我的修行账单(仅已登录可见) -->
    <section v-if="authStore.isLoggedIn" class="py-8 bg-secondary/5">
      <div class="container mx-auto px-4 md:px-8 max-w-5xl">
        <ValueReportCard
          :data="valueReport"
          :loading="valueReportLoading"
          @refresh="reloadValueReport"
        />
      </div>
    </section>

    <!-- 常用入口 -->
    <section class="py-16 bg-white/50">
      <div class="container mx-auto px-4 md:px-8">
        <div class="text-center mb-12 scroll-reveal">
          <h2 class="text-3xl font-bold text-primary mb-4">常用入口</h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            把阅读、练习、记录和讨论拆成清楚的入口，减少页面跳转中的干扰。
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- 章节解读 -->
          <div class="bg-white rounded-xl shadow-md p-8 hover:-translate-y-2 transition-transform duration-300 border border-secondary/10">
            <div class="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-6 mx-auto">
              <i class="fas fa-robot text-3xl"></i>
            </div>
            <h3 class="text-xl font-bold text-dark mb-3 text-center">章节解读</h3>
            <p class="text-gray-600 text-center leading-relaxed">
              按章查看原文、注释与讲解，遇到难句时再进入问答，阅读节奏更稳定。
            </p>
          </div>

          <!-- 学习路径 -->
          <div class="bg-white rounded-xl shadow-md p-8 hover:-translate-y-2 transition-transform duration-300 border border-secondary/10">
            <div class="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-6 mx-auto">
              <i class="fas fa-route text-3xl"></i>
            </div>
            <h3 class="text-xl font-bold text-dark mb-3 text-center">学习路径</h3>
            <p class="text-gray-600 text-center leading-relaxed">
              初学、进阶、研究三条路径保留真实进度，完成一章后后台也能看到同步记录。
            </p>
          </div>

          <!-- 互动社区 -->
          <div class="bg-white rounded-xl shadow-md p-8 hover:-translate-y-2 transition-transform duration-300 border border-secondary/10">
            <div class="w-16 h-16 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-6 mx-auto">
              <i class="fas fa-users text-3xl"></i>
            </div>
            <h3 class="text-xl font-bold text-dark mb-3 text-center">读书讨论</h3>
            <p class="text-gray-600 text-center leading-relaxed">
              把章节理解、学习笔记和问题放到社区里讨论，保留人的判断和阅读痕迹。
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
              <div class="text-4xl font-bold text-primary mb-2">81</div>
              <div class="text-gray-600 font-medium">原文章节</div>
            </div>
            <div class="text-center">
              <div class="text-4xl font-bold text-primary mb-2">3</div>
              <div class="text-gray-600 font-medium">学习路径</div>
            </div>
            <div class="text-center">
              <div class="text-4xl font-bold text-primary mb-2">4</div>
              <div class="text-gray-600 font-medium">阅读模块</div>
            </div>
            <div class="text-center">
              <div class="text-4xl font-bold text-primary mb-2">1</div>
              <div class="text-gray-600 font-medium">后台同步</div>
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
            最近整理的章节内容与读书活动
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-primary hover:shadow-lg transition-shadow">
            <div class="flex justify-between items-start mb-2">
              <h3 class="text-xl font-bold text-dark">新增章节解读</h3>
              <span class="text-sm text-gray-400">2024-01-27</span>
            </div>
            <p class="text-gray-600 mb-4">
              道德经第25章"有物混成"已整理为原文、注释、讲解三段式阅读内容。
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
import { ref, computed, onMounted } from 'vue'
import { useCultivationStore } from '../stores/cultivation'
import { useAuthStore } from '@/stores/auth'
import { fetchTodayDivination, type DivinationResponse } from '@/services/divinationService'
import { fetchValueReport, clearValueReportCache, type ValueReport } from '@/services/valueReportService'
import MoodRescueModal from '@/components/learning/MoodRescueModal.vue'
import ValueReportCard from '@/components/profile/ValueReportCard.vue'

const cultivationStore = useCultivationStore()
const authStore = useAuthStore()

const valueReport = ref<ValueReport | null>(null)
const valueReportLoading = ref(false)

async function loadValueReport(force = false) {
  if (!authStore.isLoggedIn) {
    valueReport.value = null
    return
  }
  const userId = authStore.user?.id || 'anonymous'
  valueReportLoading.value = true
  try {
    valueReport.value = await fetchValueReport(userId, { force })
  } catch {
    valueReport.value = null
  } finally {
    valueReportLoading.value = false
  }
}

function reloadValueReport() {
  if (!authStore.isLoggedIn) return
  clearValueReportCache(authStore.user?.id || 'anonymous')
  loadValueReport(true)
}

interface Fortune {
  type: string
  quote: string
  source: string
  goodFor: string
  badFor: string
  insight?: string
  action?: string
  chapter?: number
  fromAI?: boolean
}

const hasDrawn = ref(false)
const currentFortune = ref<Fortune | null>(null)
const isLoading = ref(false)
const rerollError = ref('')

const REROLL_COST = 30
const canReroll = computed(() => cultivationStore.exp >= REROLL_COST)

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

function mapDivinationToFortune(d: DivinationResponse): Fortune {
  return {
    type: '今日道签',
    quote: d.content,
    source: `第${d.chapter}章`,
    goodFor: d.action || '顺势而为',
    badFor: '执着、强求',
    insight: d.insight,
    action: d.action,
    chapter: d.chapter,
    fromAI: true
  }
}

function fallbackToLocalFortune() {
  const randomIndex = Math.floor(Math.random() * fortunes.length)
  currentFortune.value = fortunes[randomIndex]
  hasDrawn.value = true
  localStorage.setItem('dailyFortuneDate', new Date().toDateString())
  localStorage.setItem('dailyFortuneIndex', randomIndex.toString())
}

const drawFortune = async () => {
  if (hasDrawn.value || isShaking.value || isLoading.value) return

  if (!authStore.isLoggedIn) {
    authStore.openAuthModal('login')
    return
  }

  isShaking.value = true
  isLoading.value = true
  triggerHaptic([50, 50, 50, 50, 50])

  let aiResult: DivinationResponse | null = null
  try {
    aiResult = await fetchTodayDivination(authStore.user?.id || 'anonymous', { reroll: false })
  } catch (err) {
    console.warn('道签 AI 调用失败，回落到本地:', err)
  }

  setTimeout(() => {
    isShaking.value = false
    isLoading.value = false
    if (aiResult) {
      currentFortune.value = mapDivinationToFortune(aiResult)
      hasDrawn.value = true
      localStorage.setItem('dailyFortuneDate', new Date().toDateString())
    } else {
      fallbackToLocalFortune()
    }

    triggerHaptic(100)
    cultivationStore.addExp(50, '每日一签')
    showXpAnimation.value = true
    setTimeout(() => showXpAnimation.value = false, 2000)
  }, 1500)
}

const rerollFortune = async () => {
  if (isLoading.value || isShaking.value) return
  rerollError.value = ''
  if (!authStore.isLoggedIn) {
    authStore.openAuthModal('login')
    return
  }
  if (!canReroll.value) {
    rerollError.value = '今日经验不足 30,明日再来'
    return
  }

  isShaking.value = true
  isLoading.value = true
  triggerHaptic([50, 50, 50])

  let aiResult: DivinationResponse | null = null
  try {
    aiResult = await fetchTodayDivination(authStore.user?.id || 'anonymous', { reroll: true })
  } catch (err) {
    rerollError.value = err instanceof Error ? err.message : '再抽失败,请稍后再试'
  }

  setTimeout(() => {
    isShaking.value = false
    isLoading.value = false
    if (aiResult) {
      currentFortune.value = mapDivinationToFortune(aiResult)
      cultivationStore.addExp(-REROLL_COST, '再抽一签')
      triggerHaptic(100)
    }
  }, 1200)
}

onMounted(() => {
  const savedDate = localStorage.getItem('dailyFortuneDate')
  const savedIndex = localStorage.getItem('dailyFortuneIndex')

  // 已登录用户:优先取 AI 缓存
  if (authStore.isLoggedIn) {
    fetchTodayDivination(authStore.user?.id || 'anonymous', { reroll: false })
      .then(cached => {
        // 仅当今天有缓存时(同日多次访问) 才直接展示;否则保持空状态等用户主动抽签
        const today = new Date().toDateString()
        if (savedDate === today) {
          currentFortune.value = mapDivinationToFortune(cached)
          hasDrawn.value = true
        }
      })
      .catch(() => {
        // 缓存读取失败 → 回落到本地索引
        if (savedDate === new Date().toDateString() && savedIndex) {
          hasDrawn.value = true
          currentFortune.value = fortunes[parseInt(savedIndex)]
        }
      })
  } else if (savedDate === new Date().toDateString() && savedIndex) {
    hasDrawn.value = true
    currentFortune.value = fortunes[parseInt(savedIndex)]
  }

  loadValueReport(false)

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
.home-quiet {
  background:
    linear-gradient(180deg, rgba(252, 252, 248, 0.96), rgba(249, 245, 235, 0.82)),
    repeating-linear-gradient(90deg, rgba(107, 72, 38, 0.035) 0 1px, transparent 1px 32px);
}

.home-quiet :deep(.shadow-xl),
.home-quiet :deep(.shadow-2xl),
.home-quiet :deep(.shadow-lg),
.home-quiet :deep(.shadow-md) {
  box-shadow: 0 12px 32px rgba(51, 51, 51, 0.08);
}

.home-quiet :deep(.rounded-2xl),
.home-quiet :deep(.rounded-xl) {
  border-radius: 8px;
}

.home-quiet :deep(.btn-primary),
.home-quiet :deep(.btn-secondary) {
  box-shadow: none;
  transform: none;
}

.home-quiet :deep(.bg-white) {
  border: 1px solid rgba(166, 124, 82, 0.18);
}

.home-quiet :deep(.bg-gradient-to-br) {
  background-image: none;
}

.home-quiet :deep(.hover\:-translate-y-1:hover),
.home-quiet :deep(.hover\:-translate-y-2:hover) {
  transform: translateY(-2px);
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
</style>

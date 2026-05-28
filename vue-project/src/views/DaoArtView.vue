<template>
  <div class="min-h-screen pt-4 pb-20 px-4 md:px-8">
    <div class="container mx-auto max-w-6xl">
      <!-- Header -->
      <div class="text-center mb-12 animate-fade-in">
        <h1 class="text-4xl font-bold text-primary mb-4 font-serif">道境 · 数字艺术画廊</h1>
        <p class="text-lg text-gray-600 italic">
          "大象无形" —— AI 绘出的道家意境
        </p>
      </div>

      <!-- Generator Section -->
      <div class="bg-white rounded-2xl shadow-xl p-8 mb-12 border border-secondary/20 relative overflow-hidden animate-slide-up">
        <!-- Background Decor -->
        <div class="absolute top-0 right-0 w-64 h-64 opacity-5 pointer-events-none">
          <i class="fas fa-paint-brush text-9xl"></i>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 class="text-2xl font-bold text-primary mb-4 font-serif">创作您的道境画作</h2>
            <p class="text-gray-600 mb-6">
              选择一句经文，让 AI 为您生成独一无二的水墨意境图。
            </p>
            
            <div class="space-y-4">
              <!-- Quote Mode Tabs -->
              <div class="flex rounded-lg overflow-hidden border-2 border-secondary/30">
                <button
                  @click="quoteMode = 'select'"
                  class="flex-1 py-2 text-sm font-bold transition-all"
                  :class="quoteMode === 'select' ? 'bg-primary text-white' : 'bg-light/50 text-gray-500 hover:bg-gray-100'"
                >
                  <i class="fas fa-list mr-1"></i> 选择经文
                </button>
                <button
                  @click="quoteMode = 'custom'"
                  class="flex-1 py-2 text-sm font-bold transition-all"
                  :class="quoteMode === 'custom' ? 'bg-primary text-white' : 'bg-light/50 text-gray-500 hover:bg-gray-100'"
                >
                  <i class="fas fa-pen mr-1"></i> 自由输入
                </button>
              </div>

              <!-- Select Mode -->
              <div v-if="quoteMode === 'select'" class="relative">
                <select
                  v-model="selectedQuote"
                  class="w-full px-4 py-3 rounded-lg border-2 border-secondary/30 focus:border-primary focus:outline-none appearance-none bg-light/50"
                >
                  <option value="" disabled selected>请选择灵感经文...</option>
                  <option v-for="quote in quotes" :key="quote.id" :value="quote.text">
                    {{ quote.chapter }} · {{ quote.text }}
                  </option>
                </select>
                <div class="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
                  <i class="fas fa-chevron-down"></i>
                </div>
              </div>

              <!-- Custom Input Mode -->
              <div v-else>
                <textarea
                  v-model="customQuote"
                  placeholder="输入您想表达的意境，如：明月松间照，清泉石上流..."
                  maxlength="200"
                  rows="3"
                  class="w-full px-4 py-3 rounded-lg border-2 border-secondary/30 focus:border-primary focus:outline-none bg-light/50 resize-none"
                ></textarea>
                <p class="text-xs text-gray-400 text-right mt-1">{{ customQuote.length }}/200</p>
              </div>

              <div class="grid grid-cols-4 gap-2">
                <button
                  v-for="style in styles"
                  :key="style.id"
                  @click="selectedStyle = style.id"
                  class="py-2 rounded-lg border transition-all text-xs font-bold flex flex-col items-center justify-center gap-1"
                  :class="selectedStyle === style.id ? 'border-primary bg-primary text-white shadow-md' : 'border-gray-200 text-gray-500 hover:border-primary/50'"
                >
                  <i :class="style.icon"></i>
                  {{ style.name }}
                </button>
              </div>

              <button
                @click="generateArt"
                :disabled="!activeQuote || isGenerating"
                class="w-full py-4 bg-primary text-white text-lg font-bold rounded-full shadow-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1 flex items-center justify-center"
              >
                <span v-if="isGenerating">
                  <i class="fas fa-spinner fa-spin mr-2"></i> 正在泼墨挥毫... {{ elapsedTime }}s
                </span>
                <span v-else>
                  <i class="fas fa-magic mr-2"></i> 生成画作
                </span>
              </button>
            </div>
          </div>

          <!-- Preview Area -->
          <div class="h-80 md:h-96 bg-gray-100 rounded-xl overflow-hidden relative flex items-center justify-center border-2 border-dashed border-gray-300">
            <div v-if="artError" class="text-center text-red-500 px-6">
              <i class="fas fa-exclamation-triangle text-4xl mb-4 opacity-70"></i>
              <p class="font-bold mb-2">生成失败</p>
              <p class="text-sm text-gray-500">{{ artError }}</p>
              <button @click="artError = ''" class="mt-3 text-sm text-primary underline">关闭</button>
            </div>
            <div v-else-if="!generatedImage" class="text-center text-gray-400">
              <i class="fas fa-image text-6xl mb-4 opacity-50"></i>
              <p>画作将在此处显现</p>
            </div>
            <img 
              v-else 
              :src="generatedImage" 
              alt="Generated Art" 
              class="w-full h-full object-cover animate-fade-in"
            />
            
            <!-- Actions Overlay -->
            <div v-if="generatedImage" class="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
              <button @click="downloadImage" class="p-3 bg-white rounded-full text-primary hover:bg-gray-100" title="下载高清图">
                <i class="fas fa-download"></i>
              </button>
              <button @click="nftComingSoon" class="p-3 bg-white rounded-full text-primary hover:bg-gray-100" title="铸造为 NFT (即将推出)">
                <i class="fas fa-cube"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Gallery Carousel -->
      <h2 class="text-2xl font-bold text-primary mb-6 font-serif pl-4 border-l-4 border-accent">社区佳作</h2>
      <div
        class="relative group/carousel overflow-hidden"
        @mouseenter="pauseAutoScroll"
        @mouseleave="resumeAutoScroll"
      >
        <!-- Prev Button -->
        <button
          @click="slideTo(currentIndex - 1)"
          class="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 shadow-lg rounded-full flex items-center justify-center text-primary opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-primary hover:text-white"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        <!-- Next Button -->
        <button
          @click="slideTo(currentIndex + 1)"
          class="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 shadow-lg rounded-full flex items-center justify-center text-primary opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-primary hover:text-white"
        >
          <i class="fas fa-chevron-right"></i>
        </button>

        <!-- Track -->
        <div
          class="flex gap-4 py-2 px-1"
          :class="noTransition ? '' : 'transition-transform duration-500 ease-out'"
          :style="{ transform: `translateX(${translateX}px)` }"
          @transitionend="onTransitionEnd"
        >
          <div
            v-for="(art, i) in displayItems"
            :key="i"
            class="relative flex-shrink-0 w-56 md:w-64 rounded-xl overflow-hidden shadow-md cursor-pointer group/item"
          >
            <img :src="art.url" :alt="art.title" class="w-full h-52 md:h-60 object-cover transform group-hover/item:scale-110 transition-transform duration-700" loading="lazy" decoding="async" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity flex flex-col justify-end p-4">
              <p class="text-white font-bold text-sm">{{ art.title }}</p>
              <p class="text-white/70 text-xs">by {{ art.author }}</p>
            </div>
          </div>
        </div>

        <!-- Dots -->
        <div class="flex justify-center gap-2 mt-4">
          <button
            v-for="(_, i) in gallery"
            :key="i"
            @click="slideTo(i + cloneCount)"
            class="w-2 h-2 rounded-full transition-all"
            :class="realIndex === i ? 'bg-primary w-6' : 'bg-gray-300 hover:bg-gray-400'"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { generateArt as callGenerateArt } from '@/services/artService'

const isGenerating = ref(false)
const quoteMode = ref<'select' | 'custom'>('select')
const selectedQuote = ref('')
const customQuote = ref('')
const selectedStyle = ref('ink')
const generatedImage = ref('')
const artError = ref('')
const elapsedTime = ref(0)

const activeQuote = computed(() => {
  return quoteMode.value === 'custom' ? customQuote.value.trim() : selectedQuote.value
})
let elapsedTimer: ReturnType<typeof setInterval> | null = null

const quotes = [
  { id: 1, chapter: '第一章', text: '道可道，非常道' },
  { id: 2, chapter: '第二章', text: '有无相生，难易相成' },
  { id: 3, chapter: '第八章', text: '上善若水' },
  { id: 4, chapter: '第九章', text: '功遂身退，天之道也' },
  { id: 5, chapter: '第十一章', text: '三十辐共一毂，当其无，有车之用' },
  { id: 6, chapter: '第十二章', text: '五色令人目盲' },
  { id: 7, chapter: '第十五章', text: '微妙玄通，深不可识' },
  { id: 8, chapter: '第十六章', text: '致虚极，守静笃' },
  { id: 9, chapter: '第十九章', text: '见素抱朴，少私寡欲' },
  { id: 10, chapter: '第二十二章', text: '曲则全，枉则直' },
  { id: 11, chapter: '第二十五章', text: '人法地，地法天，天法道，道法自然' },
  { id: 12, chapter: '第三十三章', text: '知人者智，自知者明' },
  { id: 13, chapter: '第四十一章', text: '大音希声，大象无形' },
  { id: 14, chapter: '第四十二章', text: '道生一，一生二，二生三，三生万物' },
  { id: 15, chapter: '第五十六章', text: '知者不言，言者不知' },
  { id: 16, chapter: '第五十八章', text: '祸兮福之所倚，福兮祸之所伏' },
  { id: 17, chapter: '第六十三章', text: '天下难事必作于易，天下大事必作于细' },
  { id: 18, chapter: '第六十四章', text: '千里之行，始于足下' },
  { id: 19, chapter: '第七十六章', text: '人之生也柔弱，其死也坚强' },
  { id: 20, chapter: '第七十八章', text: '天下莫柔弱于水，而攻坚强者莫之能胜' },
  { id: 21, chapter: '第八十一章', text: '信言不美，美言不信' }
]

const styles = [
  { id: 'ink', name: '传统水墨', icon: 'fas fa-pen-nib' },
  { id: 'ink_splash', name: '泼墨写意', icon: 'fas fa-tint' },
  { id: 'landscape', name: '山水意境', icon: 'fas fa-mountain' },
  { id: 'zen', name: '禅意极简', icon: 'fas fa-spa' },
  { id: 'fantasy', name: '仙侠奇幻', icon: 'fas fa-dragon' },
  { id: 'cyber', name: '赛博修仙', icon: 'fas fa-vr-cardboard' },
  { id: 'abstract', name: '抽象写意', icon: 'fas fa-shapes' }
]

const gallery = [
  { id: 1, title: '道可道，非常道', author: 'DaoMaster_01', url: '/uploads/art/5e758b75-b1da-4a8b-b001-f7766710063e.png' },
  { id: 2, title: '上善若水', author: 'WaterFlow', url: '/uploads/art/31b8a368-7559-4302-9acc-b4cc995e0e9f.png' },
  { id: 3, title: '道生万物', author: 'YinYang', url: '/uploads/art/244a6ba9-0765-4d50-bc1a-27f0d862f694.png' },
  { id: 4, title: '五色令人目盲', author: 'ZenMind', url: '/uploads/art/c1b78b48-c297-47d7-85fe-3521d70e5b7d.png' },
  { id: 5, title: '道法自然', author: 'NatureDao', url: '/uploads/art/c9dda7ee-f87b-4c30-97b2-2cd5c5d461c9.png' },
  { id: 6, title: '大音希声', author: 'SilentSong', url: '/uploads/art/4c2ef622-5a73-4fd1-abb2-2846a569c045.png' },
  { id: 7, title: '致虚守静', author: 'WuWeiSage', url: '/uploads/art/7f31c3b5-9434-49d4-83ee-4d8f97da7ed3.png' },
  { id: 8, title: '天地不仁', author: 'HeavenDao', url: '/uploads/art/c664401f-fef0-41eb-b8f4-348cda173c00.png' }
]

// Carousel state
const cardWidth = 272 // w-64 (256px) + gap-4 (16px)
const cloneCount = 3
const currentIndex = ref(cloneCount)
const noTransition = ref(false)
let autoScrollTimer: ReturnType<typeof setInterval> | null = null

// Clone head + tail for seamless infinite loop
const displayItems = computed(() => {
  const tail = gallery.slice(0, cloneCount)
  const head = gallery.slice(-cloneCount)
  return [...head, ...gallery, ...tail]
})

const translateX = computed(() => {
  return -(currentIndex.value * cardWidth)
})

const realIndex = computed(() => {
  const len = gallery.length
  return ((currentIndex.value - cloneCount) % len + len) % len
})

const slideTo = (index: number) => {
  noTransition.value = false
  currentIndex.value = index
}

const onTransitionEnd = () => {
  const len = gallery.length
  if (currentIndex.value >= len + cloneCount) {
    noTransition.value = true
    currentIndex.value = currentIndex.value - len
  } else if (currentIndex.value < cloneCount) {
    noTransition.value = true
    currentIndex.value = currentIndex.value + len
  }
}

const startAutoScroll = () => {
  autoScrollTimer = setInterval(() => slideTo(currentIndex.value + 1), 3500)
}

const pauseAutoScroll = () => {
  if (autoScrollTimer) { clearInterval(autoScrollTimer); autoScrollTimer = null }
}

const resumeAutoScroll = () => {
  pauseAutoScroll()
  startAutoScroll()
}

const generateArt = async () => {
  if (!activeQuote.value || isGenerating.value) return

  isGenerating.value = true
  artError.value = ''
  generatedImage.value = ''
  elapsedTime.value = 0

  elapsedTimer = setInterval(() => { elapsedTime.value++ }, 1000)

  try {
    const data = await callGenerateArt(activeQuote.value, selectedStyle.value)
    generatedImage.value = data.imageUrl
  } catch (err: any) {
    artError.value = err?.message || '生成失败，请稍后重试'
  } finally {
    isGenerating.value = false
    if (elapsedTimer) { clearInterval(elapsedTimer); elapsedTimer = null }
  }
}

const downloadImage = () => {
  if (!generatedImage.value) return
  const a = document.createElement('a')
  a.href = generatedImage.value
  a.download = `道境_${activeQuote.value || '画作'}.png`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

const nftComingSoon = () => {
  alert('NFT 铸造功能即将推出，敬请期待！')
}

onMounted(() => {
  startAutoScroll()
})

onUnmounted(() => {
  if (elapsedTimer) clearInterval(elapsedTimer)
  if (autoScrollTimer) clearInterval(autoScrollTimer)
})
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.8s ease-out forwards;
}

.animate-slide-up {
  animation: slideUp 0.6s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
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

:global(html.zen-mode) .bg-gray-100 {
  background-color: #3f3f46;
  border-color: #52525b;
}

:global(html.zen-mode) .text-gray-600 {
  color: #9ca3af;
}

:global(html.zen-mode) select {
  background-color: #1c1c1e;
  border-color: #3f3f46;
  color: #d4b483;
}
</style>

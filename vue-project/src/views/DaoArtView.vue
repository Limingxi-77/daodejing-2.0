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
              <div class="relative">
                <select 
                  v-model="selectedQuote" 
                  class="w-full px-4 py-3 rounded-lg border-2 border-secondary/30 focus:border-primary focus:outline-none appearance-none bg-light/50"
                >
                  <option value="" disabled selected>请选择灵感经文...</option>
                  <option v-for="quote in quotes" :key="quote.id" :value="quote.text">
                    {{ quote.chapter }} - {{ quote.text }}
                  </option>
                </select>
                <div class="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
                  <i class="fas fa-chevron-down"></i>
                </div>
              </div>

              <div class="flex space-x-4">
                <button 
                  v-for="style in styles" 
                  :key="style.id"
                  @click="selectedStyle = style.id"
                  class="flex-1 py-2 rounded-lg border transition-all text-sm font-bold flex flex-col items-center justify-center gap-1"
                  :class="selectedStyle === style.id ? 'border-primary bg-primary text-white shadow-md' : 'border-gray-200 text-gray-500 hover:border-primary/50'"
                >
                  <i :class="style.icon"></i>
                  {{ style.name }}
                </button>
              </div>

              <button 
                @click="generateArt"
                :disabled="!selectedQuote || isGenerating"
                class="w-full py-4 bg-primary text-white text-lg font-bold rounded-full shadow-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1 flex items-center justify-center"
              >
                <span v-if="isGenerating">
                  <i class="fas fa-spinner fa-spin mr-2"></i> 正在泼墨挥毫...
                </span>
                <span v-else>
                  <i class="fas fa-magic mr-2"></i> 生成画作
                </span>
              </button>
            </div>
          </div>

          <!-- Preview Area -->
          <div class="h-80 md:h-96 bg-gray-100 rounded-xl overflow-hidden relative flex items-center justify-center border-2 border-dashed border-gray-300">
            <div v-if="!generatedImage" class="text-center text-gray-400">
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
              <button class="p-3 bg-white rounded-full text-primary hover:bg-gray-100" title="下载高清图">
                <i class="fas fa-download"></i>
              </button>
              <button class="p-3 bg-white rounded-full text-primary hover:bg-gray-100" title="铸造为 NFT (即将推出)">
                <i class="fas fa-cube"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Gallery Grid -->
      <h2 class="text-2xl font-bold text-primary mb-6 font-serif pl-4 border-l-4 border-accent">社区佳作</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div 
          v-for="art in gallery" 
          :key="art.id"
          class="relative group rounded-lg overflow-hidden shadow-md cursor-pointer"
        >
          <img :src="art.url" :alt="art.title" class="w-full h-48 object-cover transform group-hover:scale-110 transition-transform duration-700" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
            <p class="text-white font-bold text-sm">{{ art.title }}</p>
            <p class="text-white/70 text-xs">by {{ art.author }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isGenerating = ref(false)
const selectedQuote = ref('')
const selectedStyle = ref('ink')
const generatedImage = ref('')

const quotes = [
  { id: 1, chapter: '第一章', text: '道可道，非常道' },
  { id: 2, chapter: '第八章', text: '上善若水' },
  { id: 3, chapter: '第十二章', text: '五色令人目盲' },
  { id: 4, chapter: '第二十五章', text: '人法地，地法天，天法道，道法自然' },
  { id: 5, chapter: '第四十二章', text: '道生一，一生二，二生三，三生万物' }
]

const styles = [
  { id: 'ink', name: '传统水墨', icon: 'fas fa-pen-nib' },
  { id: 'cyber', name: '赛博修仙', icon: 'fas fa-vr-cardboard' },
  { id: 'abstract', name: '抽象写意', icon: 'fas fa-shapes' }
]

const gallery = [
  { id: 1, title: '混沌初开', author: 'DaoMaster_01', url: 'https://s.coze.cn/image/H5ri4Ya3YII/' },
  { id: 2, title: '上善若水', author: 'WaterFlow', url: 'https://s.coze.cn/image/DLT84Yi4R1A/' },
  { id: 3, title: '万物负阴抱阳', author: 'YinYang', url: 'https://s.coze.cn/image/H5ri4Ya3YII/' },
  { id: 4, title: '致虚守静', author: 'ZenMind', url: 'https://s.coze.cn/image/DLT84Yi4R1A/' }
]

const generateArt = () => {
  isGenerating.value = true
  
  // Simulate generation delay
  setTimeout(() => {
    // Mock result (cycling through gallery images for demo)
    const randomArt = gallery[Math.floor(Math.random() * gallery.length)]
    generatedImage.value = randomArt.url
    isGenerating.value = false
  }, 2500)
}
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

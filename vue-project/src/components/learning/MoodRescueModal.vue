<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" @click.self="$emit('close')">
    <div class="bg-white rounded-xl shadow-2xl max-w-lg w-full relative overflow-hidden transform transition-all animate-fade-in border-2 border-primary/20">
      
      <!-- Close Button -->
      <button @click="$emit('close')" class="absolute top-4 right-4 text-gray-400 hover:text-dark transition-colors">
        <i class="fas fa-times text-xl"></i>
      </button>

      <div class="p-8">
        <h2 class="text-2xl font-bold text-center text-primary mb-2 font-serif">情绪急救包</h2>
        <p class="text-center text-gray-500 mb-8 italic">"致虚极，守静笃"</p>

        <div v-if="!selectedMood" class="grid grid-cols-2 gap-4">
          <button 
            v-for="mood in moods" 
            :key="mood.key"
            @click="selectMood(mood)"
            class="p-4 rounded-lg border border-gray-200 hover:border-accent hover:shadow-md transition-all group text-left"
            :class="mood.bgColor"
          >
            <div class="flex items-center mb-2">
              <span class="text-2xl mr-3">{{ mood.emoji }}</span>
              <h3 class="font-bold text-dark group-hover:text-primary transition-colors">{{ mood.name }}</h3>
            </div>
            <p class="text-xs text-gray-500">{{ mood.desc }}</p>
          </button>
        </div>

        <div v-else class="text-center animate-slide-up">
          <div class="mb-6">
            <span class="text-4xl block mb-2">{{ selectedMood.emoji }}</span>
            <h3 class="text-xl font-bold text-dark">化解{{ selectedMood.name }}</h3>
          </div>
          
          <div class="bg-light p-6 rounded-lg shadow-inner border border-secondary/20 mb-6 relative">
            <i class="fas fa-quote-left absolute top-2 left-2 text-secondary/20 text-2xl"></i>
            <p class="text-xl font-serif text-primary leading-relaxed mb-4 relative z-10">
              {{ selectedMood.quote }}
            </p>
            <p class="text-sm text-right text-secondary font-bold">—— {{ selectedMood.source }}</p>
            <i class="fas fa-quote-right absolute bottom-2 right-2 text-secondary/20 text-2xl"></i>
          </div>

          <p class="text-gray-600 mb-8 leading-relaxed text-sm">
            <span class="font-bold text-accent">【处方】</span> {{ selectedMood.prescription }}
          </p>

          <div class="flex space-x-4 justify-center">
            <button @click="selectedMood = null" class="px-6 py-2 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-50 transition-colors">
              返回
            </button>
            <button @click="$emit('close')" class="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors shadow-md">
              我心安处
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineEmits(['close'])

interface Mood {
  key: string
  name: string
  desc: string
  emoji: string
  bgColor: string
  quote: string
  source: string
  prescription: string
}

const moods: Mood[] = [
  { 
    key: 'anxiety', 
    name: '焦虑', 
    desc: '心神不宁，患得患失', 
    emoji: '😰', 
    bgColor: 'bg-blue-50',
    quote: '致虚极，守静笃。万物并作，吾以观复。',
    source: '第十六章',
    prescription: '世间万物纷纷芸芸，最终都要回归根源。回归根源叫做静，静叫做复归本性。试着深呼吸，观察念头的起落而不追随。'
  },
  { 
    key: 'anger', 
    name: '愤怒', 
    desc: '怒火中烧，意难平', 
    emoji: '😠', 
    bgColor: 'bg-red-50',
    quote: '上善若水。水善利万物而不争，处众人之所恶，故几于道。',
    source: '第八章',
    prescription: '像水一样，善于处下，不与人争。愤怒往往源于"争"，争理、争气、争利。退一步，海阔天空，这并非软弱，而是接近"道"的智慧。'
  },
  { 
    key: 'confusion', 
    name: '迷茫', 
    desc: '不知所措，失去方向', 
    emoji: '😶‍🌫️', 
    bgColor: 'bg-gray-50',
    quote: '人法地，地法天，天法道，道法自然。',
    source: '第二十五章',
    prescription: '不要试图强行寻找答案。一切都有其自然规律。当你放下执念，顺应自然，路自然会显现。'
  },
  { 
    key: 'impatience', 
    name: '急躁', 
    desc: '急于求成，欲速不达', 
    emoji: '😤', 
    bgColor: 'bg-yellow-50',
    quote: '合抱之木，生于毫末；九层之台，起于累土；千里之行，始于足下。',
    source: '第六十四章',
    prescription: '凡事都有过程，不可跨越。把注意力集中在脚下的这一步，而不是遥远的终点。欲速则不达，慢即是快。'
  }
]

const selectedMood = ref<Mood | null>(null)

const selectMood = (mood: Mood) => {
  selectedMood.value = mood
}
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-slide-up {
  animation: slideUp 0.3s ease-out forwards;
}

/* 禅模式适配 */
:global(html.zen-mode) .bg-white {
  background-color: #2c2c2e;
  color: #d4b483;
}

:global(html.zen-mode) .text-dark {
  color: #d4b483;
}

:global(html.zen-mode) .bg-light {
  background-color: rgba(255,255,255,0.05);
  border-color: rgba(255,255,255,0.1);
}

:global(html.zen-mode) .text-gray-600,
:global(html.zen-mode) .text-gray-500 {
  color: #9ca3af;
}

:global(html.zen-mode) .border-gray-200 {
  border-color: #3f3f46;
}

:global(html.zen-mode) .hover\:bg-gray-50:hover {
  background-color: #3f3f46;
}
</style>

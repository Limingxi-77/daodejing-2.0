<template>
  <div class="mb-8">
    <h2 class="text-2xl font-semibold text-primary mb-4">选择章节</h2>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <button 
        v-for="(chapter, index) in chapters" 
        :key="index"
        @click="sendChapterQuestion(chapter)"
        class="chapter-select"
        :disabled="isLoading"
      >
        {{ chapter }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useChatStore } from '@/stores/chat'

const chatStore = useChatStore()
const { chapters, isLoading } = storeToRefs(chatStore)
const { sendChapterQuestion } = chatStore
</script>

<style scoped>
/* 古籍模式适配 */
:global(html.retro-mode) h2 {
  font-family: "KaiTi", "STKaiti", serif;
}

:global(html.retro-mode) .chapter-select {
  font-family: "KaiTi", "STKaiti", serif;
  border-color: #8d6e63;
  background-color: #f7f1e3;
}

:global(html.retro-mode) .chapter-select:hover {
  background-color: #8d6e63;
  color: #fff;
}

:global(html.retro-mode.zen-mode) .chapter-select {
  background-color: #2c2c2e;
  border-color: #d4b483;
  color: #d1d5db;
}

:global(html.retro-mode.zen-mode) .chapter-select:hover {
  background-color: #d4b483;
  color: #1c1c1e;
}
</style>
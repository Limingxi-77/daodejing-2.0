<template>
  <div>
    <h2 class="text-2xl font-semibold text-primary mb-4">热门问题</h2>
    <div class="space-y-4">
      <div 
        v-for="(question, index) in popularQuestions" 
        :key="index"
        class="bg-light p-4 rounded-lg border-l-4 border-accent"
      >
        <h3 class="font-medium text-primary mb-2">{{ question.title }}</h3>
        <p class="text-dark">{{ question.preview }}</p>
        <button 
          @click="sendMessage(question.title)"
          class="mt-2 text-accent hover:underline"
          :disabled="isLoading"
        >
          查看完整解读 →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useChatStore } from '@/stores/chat'

const chatStore = useChatStore()
const { popularQuestions, isLoading } = storeToRefs(chatStore)
const { sendMessage } = chatStore
</script>

<style scoped>
/* 古籍模式适配 */
:global(html.retro-mode) h2,
:global(html.retro-mode) h3 {
  font-family: "KaiTi", "STKaiti", serif;
}

:global(html.retro-mode) .bg-light {
  background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNjY2MiLz4KPC9zdmc+');
  border: 1px solid #8d6e63;
  border-left-width: 4px;
}

:global(html.retro-mode.zen-mode) .bg-light {
  background-image: none;
  border-color: #d4b483;
}
</style>
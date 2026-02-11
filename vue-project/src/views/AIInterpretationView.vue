<template>
  <div class="pt-32 pb-20 px-4 md:px-8">
    <div class="container mx-auto">
      <div class="max-w-4xl mx-auto">
        <!-- 页面标题 -->
        <h1 class="text-3xl md:text-4xl font-bold text-primary mb-6 text-center">
          AI解读道德经
        </h1>
        <p class="text-xl text-dark mb-10 text-center">
          与AI对话，深入理解《道德经》的智慧
        </p>
        
        <!-- AI聊天组件 -->
        <AIChat />
        
        <!-- 章节选择组件 -->
        <ChapterSelector />
        
        <!-- 热门问题组件 -->
        <PopularQuestions />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AIChat from '@/components/chat/AIChat.vue'
import ChapterSelector from '@/components/chat/ChapterSelector.vue'
import PopularQuestions from '@/components/chat/PopularQuestions.vue'
</script>

<style scoped>
/* 古籍模式适配 */
:global(html.retro-mode) h1,
:global(html.retro-mode) h2,
:global(html.retro-mode) h3 {
  font-family: "KaiTi", "STKaiti", serif;
}
</style>
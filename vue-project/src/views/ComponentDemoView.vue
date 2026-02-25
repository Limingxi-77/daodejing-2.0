<!-- 组件演示页面 -->
<template>
  <div class="component-demo">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-center mb-8">组件库演示</h1>
      
      <!-- 竹简卡片组件演示 -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold mb-4">竹简卡片组件</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BambooCard title="道德经第一章" icon="fas fa-scroll">
            <p>道可道，非常道。名可名，非常名。无名天地之始，有名万物之母。</p>
            <p class="mt-2">这一章阐述了"道"的本质，指出真正的"道"是无法用言语完全描述的。</p>
          </BambooCard>
          
          <BambooCard title="学习要点" icon="fas fa-lightbulb">
            <p>学习道德经需要静心体会，结合生活实践才能真正理解其中的智慧。</p>
            <p class="mt-2">建议每天阅读一章，结合AI解读功能深入理解。</p>
          </BambooCard>
        </div>
      </section>
      
      <!-- 章节卡片组件演示 -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold mb-4">章节卡片组件</h2>
        <div class="grid grid-cols-1 gap-4">
          <ChapterCard 
            :chapter-number="1"
            title="论道"
            content="道可道，非常道。名可名，非常名。无名天地之始，有名万物之母。故常无欲，以观其妙；常有欲，以观其徼。"
            @click="handleChapterClick"
            @action="handleChapterAction"
          />
          
          <ChapterCard 
            :chapter-number="8"
            title="上善若水"
            content="上善若水。水善利万物而不争，处众人之所恶，故几于道。居善地，心善渊，与善仁，言善信，政善治，事善能，动善时。"
            :show-actions="false"
            @click="handleChapterClick"
          />
        </div>
      </section>
      
      <!-- 学习路径组件演示 -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold mb-4">学习路径组件</h2>
        <LearningPath :current-step="currentStep" />
        <div class="mt-4 flex gap-2">
          <button 
            class="px-4 py-2 bg-primary text-white rounded"
            @click="prevStep"
            :disabled="currentStep <= 0"
          >
            上一步
          </button>
          <button 
            class="px-4 py-2 bg-primary text-white rounded"
            @click="nextStep"
            :disabled="currentStep >= 2"
          >
            下一步
          </button>
        </div>
      </section>
      
      <!-- 社区帖子组件演示 -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold mb-4">社区帖子组件</h2>
        <div class="grid grid-cols-1 gap-4">
          <CommunityPost 
            author="李四"
            :date="new Date('2023-12-15 14:30')"
            content="今天学习了第二章，发现老子对事物的辩证关系理解得非常深刻。有无相生，难易相成，长短相形，高下相倾，音声相和，前后相随。"
            :likes="45"
            :comments="8"
            @like="handlePostLike"
            @comment="handlePostComment"
            @share="handlePostShare"
          />
          
          <CommunityPost 
            author="王五"
            :date="new Date('2023-12-10 09:15')"
            content="第三章讲不尚贤，使民不争。不贵难得之货，使民不为盗。不见可欲，使民心不乱。这种无为而治的思想在现代管理中也有很大启发。"
            :likes="28"
            :comments="15"
            :is-liked="true"
            @like="handlePostLike"
            @comment="handlePostComment"
            @share="handlePostShare"
          />
        </div>
      </section>
      
      <!-- 资源卡片组件演示 -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold mb-4">资源卡片组件</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ResourceCard 
            title="道德经全本注解"
            description="包含《道德经》全文、注释、翻译和解读，是学习道德经的必备参考资料。"
            type="PDF文档"
            size="2.3MB"
            icon="fas fa-book-open"
            @download="handleResourceDownload"
            @preview="handleResourcePreview"
          />
          
          <ResourceCard 
            title="道德经音频讲解"
            description="专业讲师录制的道德经音频讲解，适合在通勤或休息时学习。"
            type="MP3音频"
            size="15.7MB"
            icon="fas fa-headphones"
            @download="handleResourceDownload"
            @preview="handleResourcePreview"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BambooCard from '@/components/ui/BambooCard.vue'
import ChapterCard from '@/components/ui/ChapterCard.vue'
import LearningPath from '@/components/ui/LearningPath.vue'
import CommunityPost from '@/components/ui/CommunityPost.vue'
import ResourceCard from '@/components/ui/ResourceCard.vue'

// 学习路径当前步骤
const currentStep = ref(0)

// 处理章节点击
const handleChapterClick = (event: MouseEvent) => {
  console.log('章节卡片被点击', event)
}

// 处理章节操作
const handleChapterAction = (event: MouseEvent) => {
  console.log('章节操作按钮被点击', event)
}

// 上一步
const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

// 下一步
const nextStep = () => {
  if (currentStep.value < 2) {
    currentStep.value++
  }
}

// 处理帖子点赞
const handlePostLike = (liked: boolean) => {
  console.log('帖子点赞状态:', liked)
}

// 处理帖子评论
const handlePostComment = () => {
  console.log('点击了评论按钮')
}

// 处理帖子分享
const handlePostShare = () => {
  console.log('点击了分享按钮')
}

// 处理资源下载
const handleResourceDownload = () => {
  console.log('资源下载')
}

// 处理资源预览
const handleResourcePreview = () => {
  console.log('资源预览')
}
</script>

<style scoped>
.component-demo {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.container {
  max-width: 1200px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>
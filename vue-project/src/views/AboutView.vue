<template>
  <div class="pt-24 pb-20 px-4 md:px-8 min-h-screen bg-background">
    <!-- 页面标题 -->
    <section class="bg-primary text-white py-16 -mx-4 md:-mx-8 mb-12 rounded-b-3xl shadow-lg">
      <div class="container mx-auto text-center px-4">
        <h1 class="text-4xl md:text-5xl font-bold mb-4">关于我们</h1>
        <p class="text-xl max-w-3xl mx-auto text-white/90">
          致力于以AI技术传承和弘扬《道德经》智慧，让古老哲学在现代社会焕发新生
        </p>
      </div>
    </section>

    <div class="container mx-auto max-w-6xl">
      <!-- 使命与愿景 -->
      <section class="mb-20">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div class="bg-white p-8 rounded-lg shadow-sm border-t-4 border-primary">
            <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <i class="fas fa-bullseye text-3xl text-primary"></i>
            </div>
            <h2 class="text-3xl font-bold text-primary mb-6">我们的使命</h2>
            <p class="text-lg text-dark mb-6 leading-relaxed">
              我们致力于利用人工智能技术，让《道德经》这一中华哲学瑰宝在数字时代焕发新的生命力。通过智能解读、个性化学习和互动交流，帮助更多人理解和应用老子思想，提升个人修养和社会和谐。
            </p>
            <p class="text-lg text-dark leading-relaxed">
              我们相信，《道德经》中蕴含的智慧对于解决当代社会面临的挑战具有重要价值，我们的使命是搭建一座连接古代智慧与现代生活的桥梁。
            </p>
          </div>
          
          <div class="bg-white p-8 rounded-lg shadow-sm border-t-4 border-accent">
            <div class="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-6">
              <i class="fas fa-eye text-3xl text-accent"></i>
            </div>
            <h2 class="text-3xl font-bold text-primary mb-6">我们的愿景</h2>
            <p class="text-lg text-dark mb-6 leading-relaxed">
              成为全球领先的《道德经》数字化学习平台，让不同文化背景、不同知识水平的人都能便捷地接触、理解和应用《道德经》智慧。
            </p>
            <p class="text-lg text-dark leading-relaxed">
              我们希望通过技术创新和内容共创，构建一个充满活力的《道德经》学习社区，推动中华优秀传统文化的创造性转化和创新性发展。
            </p>
          </div>
        </div>
      </section>

      <!-- 平台数据 -->
      <section class="mb-20">
        <h2 class="text-3xl font-bold text-primary text-center mb-12">平台数据</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div class="bg-white p-8 rounded-lg shadow-sm text-center hover:-translate-y-2 transition-transform duration-300">
            <div class="text-4xl font-bold text-primary mb-2">10,000+</div>
            <div class="text-gray-600">注册用户</div>
          </div>
          <div class="bg-white p-8 rounded-lg shadow-sm text-center hover:-translate-y-2 transition-transform duration-300">
            <div class="text-4xl font-bold text-primary mb-2">50,000+</div>
            <div class="text-gray-600">AI 解读次数</div>
          </div>
          <div class="bg-white p-8 rounded-lg shadow-sm text-center hover:-translate-y-2 transition-transform duration-300">
            <div class="text-4xl font-bold text-primary mb-2">5,000+</div>
            <div class="text-gray-600">社区帖子</div>
          </div>
          <div class="bg-white p-8 rounded-lg shadow-sm text-center hover:-translate-y-2 transition-transform duration-300">
            <div class="text-4xl font-bold text-primary mb-2">1,000+</div>
            <div class="text-gray-600">资源收录</div>
          </div>
        </div>
      </section>

      <!-- 联系我们 -->
      <section class="bg-white rounded-lg shadow-lg overflow-hidden">
        <div class="grid grid-cols-1 md:grid-cols-2">
          <div class="p-12 bg-primary text-white">
            <h2 class="text-3xl font-bold mb-6">联系我们</h2>
            <p class="mb-8 text-white/80">
              如果您有任何问题、建议或合作意向，欢迎随时与我们联系。我们期待听到您的声音。
            </p>
            <ul class="space-y-6">
              <li class="flex items-center">
                <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-4">
                  <i class="fas fa-envelope"></i>
                </div>
                <span>contact@daodejing.ai</span>
              </li>
              <li class="flex items-center">
                <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-4">
                  <i class="fas fa-phone"></i>
                </div>
                <span>+86 123 4567 8900</span>
              </li>
              <li class="flex items-center">
                <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-4">
                  <i class="fas fa-map-marker-alt"></i>
                </div>
                <span>北京市朝阳区</span>
              </li>
            </ul>
          </div>
          <div class="p-12">
            <form @submit.prevent="submitForm">
              <div class="mb-6">
                <label class="block text-gray-700 font-medium mb-2">姓名</label>
                <input type="text" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary">
              </div>
              <div class="mb-6">
                <label class="block text-gray-700 font-medium mb-2">邮箱</label>
                <input type="email" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary">
              </div>
              <div class="mb-6">
                <label class="block text-gray-700 font-medium mb-2">留言内容</label>
                <textarea rows="4" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"></textarea>
              </div>
              <button class="w-full btn-primary py-3 rounded-lg text-lg font-medium">发送留言</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
const submitForm = () => {
  alert('感谢您的留言！我们会尽快回复。')
}
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

/* 禅模式适配 */
:global(html.zen-mode) .bg-white {
  background-color: #2c2c2e !important;
  color: #e5e7eb !important;
}

:global(html.zen-mode) .text-dark {
  color: #f3f4f6 !important;
}

:global(html.zen-mode) .text-gray-600 {
  color: #9ca3af !important;
}
</style>

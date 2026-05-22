<template>
  <footer class="bg-dark text-light py-12">
    <div class="container mx-auto px-4 md:px-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- 平台介绍 -->
        <div>
          <h3 class="text-xl font-bold mb-4">道德经AI解读者</h3>
          <p class="text-gray-300 mb-4">
            结合AI技术与传统文化，为您提供智能化的道德经学习体验
          </p>
          <div class="flex space-x-4">
            <a href="#" class="text-gray-300 hover:text-white transition-colors">
              <i class="fab fa-weixin text-xl"></i>
            </a>
            <a href="#" class="text-gray-300 hover:text-white transition-colors">
              <i class="fab fa-weibo text-xl"></i>
            </a>
            <a href="#" class="text-gray-300 hover:text-white transition-colors">
              <i class="fab fa-github text-xl"></i>
            </a>
          </div>
        </div>
        
        <!-- 快速链接 -->
        <div>
          <h3 class="text-xl font-bold mb-4">快速链接</h3>
          <ul class="space-y-2">
            <li v-for="route in quickLinks" :key="route.name">
              <router-link 
                :to="{ name: route.name }" 
                class="text-gray-300 hover:text-white transition-colors"
              >
                {{ route.title }}
              </router-link>
            </li>
          </ul>
        </div>
        
        <!-- 资源中心 -->
        <div>
          <h3 class="text-xl font-bold mb-4">资源中心</h3>
          <ul class="space-y-2">
            <li><a href="#" class="text-gray-300 hover:text-white transition-colors">资源库</a></li>
            <li><a href="#" class="text-gray-300 hover:text-white transition-colors">学习指南</a></li>
            <li><a href="#" class="text-gray-300 hover:text-white transition-colors">常见问题</a></li>
            <li><a href="#" class="text-gray-300 hover:text-white transition-colors">使用帮助</a></li>
          </ul>
        </div>
        
        <!-- 联系我们 -->
        <div>
          <h3 class="text-xl font-bold mb-4">联系我们</h3>
          <ul class="space-y-2">
            <li class="flex items-center">
              <i class="fas fa-envelope mr-2 text-gray-300"></i>
              <span class="text-gray-300">contact@daodejing.ai</span>
            </li>
            <li class="flex items-center">
              <i class="fas fa-phone mr-2 text-gray-300"></i>
              <span class="text-gray-300">400-123-4567</span>
            </li>
            <li class="flex items-center">
              <i class="fas fa-map-marker-alt mr-2 text-gray-300"></i>
              <span class="text-gray-300">北京市朝阳区</span>
            </li>
          </ul>
        </div>
      </div>
      
      <!-- 版权信息 -->
      <div class="border-t border-gray-700 mt-8 pt-8 text-center">
        <p class="text-gray-400">
          &copy; 2024 道德经AI解读者平台. 保留所有权利. 
          <a href="#" class="text-gray-400 hover:text-white transition-colors">隐私政策</a> | 
          <a href="#" class="text-gray-400 hover:text-white transition-colors">服务条款</a>
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const quickLinks = [
  { name: 'Home', title: '首页' },
  { name: 'AIInterpretation', title: 'AI解读' },
  { name: 'LearningPath', title: '学习路径' },
  { name: 'Community', title: '共创社区' }
]
</script>
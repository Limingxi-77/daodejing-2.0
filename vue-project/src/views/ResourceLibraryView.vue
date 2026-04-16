<template>
  <div class="pt-24 pb-20 px-4 md:px-8 min-h-screen bg-gray-50">
    <!-- Hero 搜索区 -->
    <section class="text-center mb-12">
      <div class="container mx-auto max-w-4xl">
        <h1 class="text-4xl md:text-5xl font-bold text-primary mb-6">
          <i class="fas fa-book-open mr-3"></i>道德经资源库
        </h1>
        <p class="text-xl text-dark mb-8">
          探索丰富的道德经学习资源，包括经典解读、现代分析、音频视频等多种形式
        </p>
        <div class="relative max-w-2xl mx-auto">
          <input 
            v-model="heroSearchQuery"
            @input="handleHeroSearch"
            @keyup.enter="handleSearch"
            type="text" 
            placeholder="搜索资源..." 
            class="w-full px-6 py-4 rounded-full border border-secondary shadow-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-lg"
          >
          <button 
            @click="handleSearch"
            class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-accent text-white px-6 py-2 rounded-full hover:bg-opacity-90 transition-colors"
          >
            <i class="fas fa-search"></i>
          </button>
        </div>
      </div>
    </section>

    <div class="container mx-auto max-w-7xl">
      <!-- 特色应用专区 (New Featured Section) -->
      <section class="mb-12 animate-slide-up">
        <h2 class="text-2xl font-bold text-primary mb-6 flex items-center">
          <i class="fas fa-fire mr-2 text-red-500"></i> 特色应用 & 工具
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- 道商卡片 -->
          <div 
            @click="$router.push('/dao-business')"
            class="group relative bg-gradient-to-r from-[#1c1c1e] to-[#2c2c2e] rounded-2xl p-1 overflow-hidden cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div class="absolute inset-0 bg-[url('https://s.coze.cn/image/H5ri4Ya3YII/')] opacity-20 bg-cover bg-center mix-blend-overlay transition-transform duration-700 group-hover:scale-110"></div>
            <div class="absolute top-0 right-0 bg-yellow-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10 shadow-md">宗师专属</div>
            
            <div class="relative h-full bg-black/20 backdrop-blur-sm rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
              <div class="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300">
                <i class="fas fa-briefcase text-3xl text-white"></i>
              </div>
              <div class="flex-1 text-center md:text-left">
                <h3 class="text-2xl font-bold text-yellow-100 mb-2 group-hover:text-white transition-colors">道商 · 企业家修练</h3>
                <p class="text-gray-300 mb-4 text-sm md:text-base">
                  专为管理者打造的 AI 互动课程。深度解析无为领导力、危机公关与决策心法，将道家智慧注入现代商业管理。
                </p>
                <div class="inline-flex items-center text-yellow-400 font-bold text-sm border border-yellow-400/30 px-4 py-2 rounded-full hover:bg-yellow-400/10 transition-colors">
                  <span>立即修练</span>
                  <i class="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
                </div>
              </div>
            </div>
          </div>

          <!-- 决策助手卡片 -->
          <div 
            @click="$router.push('/decision-helper')"
            class="group relative bg-white rounded-2xl p-1 overflow-hidden cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-indigo-100"
          >
            <div class="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10 shadow-md">热门工具</div>
            
            <div class="relative h-full bg-indigo-50/50 rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
              <div class="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300">
                <i class="fas fa-compass text-3xl text-white"></i>
              </div>
              <div class="flex-1 text-center md:text-left">
                <h3 class="text-2xl font-bold text-indigo-900 mb-2 group-hover:text-indigo-700 transition-colors">决策占卜辅助</h3>
                <p class="text-indigo-800/70 mb-4 text-sm md:text-base">
                  基于阴阳五行思想的智能 SWOT 分析。在人生或职场的十字路口，助您厘清局势，顺势而为，做出明智决策。
                </p>
                <div class="inline-flex items-center text-indigo-600 font-bold text-sm border border-indigo-200 px-4 py-2 rounded-full hover:bg-indigo-50 transition-colors bg-white shadow-sm">
                  <span>开始推演</span>
                  <i class="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div class="flex flex-col lg:flex-row gap-8">
        <!-- 侧边栏过滤器 -->
        <aside class="lg:w-1/4 h-fit">
          <div class="bg-white p-6 rounded-lg shadow-sm border border-secondary/20 sticky top-24">
            <h2 class="text-xl font-bold mb-6 text-primary border-b border-secondary/20 pb-2">筛选资源</h2>
            
            <!-- 侧边栏搜索框 -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">搜索资源</label>
              <input 
                v-model="sidebarSearchQuery"
                @input="handleSidebarSearch"
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" 
                placeholder="输入关键词..."
              >
            </div>

            <!-- 资源类型过滤 -->
            <div class="mb-6 border-b border-gray-100 pb-4">
              <h3 class="font-semibold mb-3 text-gray-800">资源类型</h3>
              <div class="space-y-2">
                <label v-for="type in resourceTypes" :key="type.value" class="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors">
                  <input type="checkbox" v-model="selectedTypes" :value="type.value" class="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary">
                  <span class="ml-2 text-gray-700">{{ type.label }}</span>
                </label>
              </div>
            </div>
            
            <!-- 时代过滤 -->
            <div class="mb-6 border-b border-gray-100 pb-4">
              <h3 class="font-semibold mb-3 text-gray-800">时代</h3>
              <div class="space-y-2">
                <label v-for="era in eras" :key="era" class="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors">
                  <input type="checkbox" v-model="selectedEras" :value="era" class="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary">
                  <span class="ml-2 text-gray-700">{{ era }}</span>
                </label>
              </div>
            </div>

            <!-- 评论者过滤 -->
            <div class="mb-6 border-b border-gray-100 pb-4">
              <h3 class="font-semibold mb-3 text-gray-800">评论者</h3>
              <div class="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                <label v-for="commentator in commentators" :key="commentator" class="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors">
                  <input type="checkbox" v-model="selectedCommentators" :value="commentator" class="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary">
                  <span class="ml-2 text-gray-700">{{ commentator }}</span>
                </label>
              </div>
            </div>

            <button 
              @click="applyFilters" 
              class="w-full mb-3 bg-primary text-white py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors"
            >
              应用筛选
            </button>
            <button 
              @click="resetFilters" 
              class="w-full py-2 text-sm text-gray-500 hover:text-primary border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
            >
              重置筛选
            </button>
          </div>
        </aside>

        <!-- 资源列表 -->
        <main class="lg:w-3/4">
          <div class="flex flex-col md:flex-row justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-dark mb-4 md:mb-0">
              道德经资源库 
              <span class="text-base font-normal text-gray-500 ml-2">共 {{ filteredResources.length }} 个资源</span>
            </h2>
            <div class="flex items-center space-x-4">
              <span class="text-gray-600">排序:</span>
              <select 
                v-model="sortCriteria"
                class="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
              >
                <option value="newest">最新发布</option>
                <option value="downloads">下载量</option>
                <option value="rating">评分</option>
              </select>
            </div>
          </div>

          <!-- 资源网格 -->
          <div v-if="paginatedResources.length > 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
            <div 
              v-for="resource in paginatedResources" 
              :key="resource.id"
              class="bg-white rounded-lg border border-secondary/20 hover:border-accent hover:shadow-lg transition-all duration-300 group cursor-pointer relative"
            >
              <div class="p-6">
                <!-- 徽章 -->
                <span :class="['absolute top-3 right-3 px-2 py-1 text-xs font-bold text-white rounded', getTypeColor(resource.type)]">
                  {{ getTypeName(resource.type) }}
                </span>

                <!-- 图标 -->
                <div :class="['w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-4 transition-colors', getIconClass(resource.type)]">
                  <i :class="getResourceIcon(resource.type)"></i>
                </div>
                
                <!-- 标题与描述 -->
                <h3 class="text-lg font-bold text-dark mb-2 group-hover:text-primary transition-colors line-clamp-1" :title="resource.title">{{ resource.title }}</h3>
                <p class="text-sm text-gray-600 mb-4 line-clamp-2 h-10" :title="resource.description">{{ resource.description }}</p>
                
                <!-- 元数据 -->
                <div class="border-t border-gray-100 pt-4 space-y-2">
                  <div class="flex justify-between text-xs text-gray-500">
                    <span><i class="fas fa-user mr-1"></i>{{ resource.commentator || resource.author }}</span>
                    <span><i class="fas fa-history mr-1"></i>{{ resource.era }}</span>
                  </div>
                  <div class="flex justify-between text-xs text-gray-500">
                    <span><i class="fas fa-star text-yellow-400 mr-1"></i>{{ resource.rating }}</span>
                    <span><i class="fas fa-download mr-1"></i>{{ resource.downloads.toLocaleString() }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 无数据提示 -->
          <div v-else class="text-center py-16 bg-white rounded-lg border border-dashed border-gray-300">
            <i class="fas fa-search text-4xl text-gray-300 mb-4"></i>
            <p class="text-lg text-gray-500">未找到相关资源</p>
            <button @click="resetFilters" class="mt-4 text-primary hover:underline">清除筛选条件</button>
          </div>

          <!-- 分页 -->
          <div v-if="totalPages > 1" class="flex justify-center mt-8 gap-2">
            <button 
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <i class="fas fa-chevron-left"></i>
            </button>
            
            <button 
              v-for="page in visiblePages" 
              :key="page"
              @click="currentPage = Number(page)"
              :class="['w-10 h-10 flex items-center justify-center rounded-lg border transition-colors', 
                currentPage === page ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-700 hover:bg-gray-50']"
            >
              {{ page }}
            </button>

            <button 
              @click="currentPage++"
              :disabled="currentPage === totalPages"
              class="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

// 接口定义
interface Resource {
  id: number
  title: string
  description: string
  type: string
  author: string
  commentator?: string
  era: string
  rating: number
  downloads: number
  date?: string // 用于"最新发布"排序
}

// 筛选状态
const heroSearchQuery = ref('')
const sidebarSearchQuery = ref('')
const searchQuery = ref('') // 实际用于过滤的关键词
const selectedTypes = ref<string[]>([])
const selectedEras = ref<string[]>([])
const selectedCommentators = ref<string[]>([])
const sortCriteria = ref('newest')

// 分页状态
const currentPage = ref(1)
const itemsPerPage = 9 // 每页显示9个

// 选项配置
const resourceTypes = [
  { label: 'PDF文档', value: 'pdf' },
  { label: '视频', value: 'video' },
  { label: '音频', value: 'audio' },
  { label: '图书', value: 'book' },
  { label: '链接', value: 'link' }
]

const eras = ['春秋战国', '魏晋南北朝', '唐宋', '明清', '现代']

const commentators = [
  '老子', '王弼', '河上公', '朱熹', '王阳明', '南怀瑾', '曾仕强', 
  '陈鼓应', '冯友兰', '高明', '傅佩荣', '徐梵澄', '王夫之', 
  '李零', '楼宇烈', '叶海烟', '王德有', '张松辉', '严复', 
  '钱穆', '林语堂', '胡适', '任继愈', '汤一介', '刘笑敢', '翟鸿燊', '张岱年'
]

// 模拟数据 (整合了HTML中的所有数据)
const allResources: Resource[] = [
  {
    id: 1,
    title: '道德经王弼注本',
    description: '魏晋玄学代表人物王弼的经典注本，不仅是研究老子思想的重要资料，也是魏晋玄学的奠基之作。',
    type: 'pdf',
    author: '王弼',
    commentator: '王弼',
    era: '魏晋南北朝',
    rating: 4.9,
    downloads: 12345,
    date: '2023-01-15'
  },
  {
    id: 2,
    title: '曾仕强详解道德经',
    description: '曾仕强教授通过通俗易懂的语言，结合现代生活实例，深入浅出地讲解道德经的智慧。',
    type: 'video',
    author: '曾仕强',
    commentator: '曾仕强',
    era: '现代',
    rating: 4.8,
    downloads: 8567,
    date: '2023-02-20'
  },
  {
    id: 3,
    title: '道德经诵读（配乐版）',
    description: '专业配音员朗读，配以古琴背景音乐，适合静心聆听和冥想。',
    type: 'audio',
    author: '未知',
    commentator: '佚名',
    era: '现代',
    rating: 4.7,
    downloads: 5234,
    date: '2023-03-10'
  },
  {
    id: 4,
    title: '老子通释',
    description: '全面解析老子思想体系，对比各版本差异，适合学术研究参考。',
    type: 'book',
    author: '陈鼓应',
    commentator: '陈鼓应',
    era: '现代',
    rating: 4.9,
    downloads: 3456,
    date: '2023-01-05'
  },
  {
    id: 5,
    title: '河上公章句',
    description: '汉代河上公所作注本，侧重于养生与治国，对后世道教影响深远。',
    type: 'pdf',
    author: '河上公',
    commentator: '河上公',
    era: '春秋战国',
    rating: 4.6,
    downloads: 2890,
    date: '2022-12-12'
  },
  {
    id: 6,
    title: '帛书老子校注',
    description: '基于马王堆汉墓出土的帛书《老子》进行的校勘和注释，还原更古老的面貌。',
    type: 'book',
    author: '高明',
    commentator: '高明',
    era: '现代',
    rating: 4.8,
    downloads: 1987,
    date: '2023-04-01'
  },
  {
    id: 7,
    title: '南怀瑾讲道德经',
    description: '南怀瑾先生对道德经的深入解读，结合人生智慧与实践应用。',
    type: 'video',
    author: '南怀瑾',
    commentator: '南怀瑾',
    era: '现代',
    rating: 4.9,
    downloads: 2456,
    date: '2023-03-15'
  },
  {
    id: 8,
    title: '朱熹《道德经集注》',
    description: '宋代朱熹对道德经的集注，融合儒家思想的深度解读。',
    type: 'book',
    author: '朱熹',
    commentator: '朱熹',
    era: '唐宋',
    rating: 4.6,
    downloads: 987,
    date: '2022-11-30'
  },
  {
    id: 9,
    title: '冯友兰《中国哲学史》中的道德经解读',
    description: '著名哲学家冯友兰对道德经在哲学史中的地位和影响的分析。',
    type: 'link',
    author: '冯友兰',
    commentator: '冯友兰',
    era: '现代',
    rating: 4.5,
    downloads: 1543,
    date: '2023-02-10'
  },
  {
    id: 10,
    title: '傅佩荣详解道德经',
    description: '台湾大学傅佩荣教授对道德经的详细讲解，结合中西哲学比较。',
    type: 'video',
    author: '傅佩荣',
    commentator: '傅佩荣',
    era: '现代',
    rating: 4.8,
    downloads: 2034,
    date: '2023-04-20'
  },
  {
    id: 11,
    title: '徐梵澄道德经心解',
    description: '现代学者徐梵澄对道德经的心灵层面解读，融合东西方思想。',
    type: 'audio',
    author: '徐梵澄',
    commentator: '徐梵澄',
    era: '现代',
    rating: 4.6,
    downloads: 1654,
    date: '2023-01-25'
  },
  {
    id: 12,
    title: '王夫之《老子衍》',
    description: '明末清初王夫之对道德经的阐释，结合时代背景的深刻分析。',
    type: 'book',
    author: '王夫之',
    commentator: '王夫之',
    era: '明清',
    rating: 4.5,
    downloads: 876,
    date: '2022-10-15'
  },
  {
    id: 13,
    title: '李零《道德经古本疏证》',
    description: '北京大学李零教授对道德经古本的考证和疏证，学术研究价值高。',
    type: 'pdf',
    author: '李零',
    commentator: '李零',
    era: '现代',
    rating: 4.7,
    downloads: 1456,
    date: '2023-05-05'
  },
  {
    id: 14,
    title: '楼宇烈教授讲道德经',
    description: '北京大学楼宇烈教授对道德经的深度解读，结合传统文化。',
    type: 'video',
    author: '楼宇烈',
    commentator: '楼宇烈',
    era: '现代',
    rating: 4.8,
    downloads: 1789,
    date: '2023-03-22'
  },
  {
    id: 15,
    title: '叶海烟道德经现代解读',
    description: '台湾学者叶海烟对道德经的现代化解读，结合当代思潮。',
    type: 'audio',
    author: '叶海烟',
    commentator: '叶海烟',
    era: '现代',
    rating: 4.6,
    downloads: 1234,
    date: '2023-02-05'
  },
  {
    id: 16,
    title: '王德有《道德经新译》',
    description: '中国社科院王德有研究员对道德经的新翻译和阐释。',
    type: 'book',
    author: '王德有',
    commentator: '王德有',
    era: '现代',
    rating: 4.5,
    downloads: 987,
    date: '2023-01-10'
  },
  {
    id: 17,
    title: '张松辉道德经研究专题',
    description: '湖南大学张松辉教授对道德经的研究专题，包含多篇学术论文。',
    type: 'link',
    author: '张松辉',
    commentator: '张松辉',
    era: '现代',
    rating: 4.7,
    downloads: 1345,
    date: '2023-04-15'
  },
  {
    id: 18,
    title: '严复《老子道德经评注》',
    description: '近代思想家严复对道德经的评注，结合西方哲学思想的独特解读。',
    type: 'pdf',
    author: '严复',
    commentator: '严复',
    era: '现代',
    rating: 4.6,
    downloads: 1234,
    date: '2022-12-05'
  },
  {
    id: 19,
    title: '钱穆道德经专题讲座',
    description: '国学大师钱穆对道德经的专题讲座，从历史角度深入分析。',
    type: 'video',
    author: '钱穆',
    commentator: '钱穆',
    era: '现代',
    rating: 4.8,
    downloads: 1567,
    date: '2023-03-01'
  },
  {
    id: 20,
    title: '林语堂道德经英文解读',
    description: '林语堂对道德经的英文解读音频，面向国际读者的独特视角。',
    type: 'audio',
    author: '林语堂',
    commentator: '林语堂',
    era: '现代',
    rating: 4.5,
    downloads: 1089,
    date: '2022-11-20'
  },
  {
    id: 21,
    title: '胡适《中国哲学史大纲》道德经部分',
    description: '胡适对道德经在中国哲学史中地位的经典论述。',
    type: 'book',
    author: '胡适',
    commentator: '胡适',
    era: '现代',
    rating: 4.4,
    downloads: 876,
    date: '2022-10-30'
  },
  {
    id: 22,
    title: '成玄英《道德经义疏》',
    description: '唐代道士成玄英对道德经的义疏，融合道教思想的深度阐释。',
    type: 'pdf',
    author: '成玄英',
    commentator: '成玄英',
    era: '唐宋',
    rating: 4.7,
    downloads: 1078,
    date: '2022-12-25'
  },
  {
    id: 23,
    title: '牟宗三道德经哲学讲座',
    description: '新儒家代表人物牟宗三对道德经哲学体系的深度分析。',
    type: 'video',
    author: '牟宗三',
    commentator: '牟宗三',
    era: '现代',
    rating: 4.8,
    downloads: 1432,
    date: '2023-02-15'
  },
  {
    id: 24,
    title: '道德经全文诵读（古音版）',
    description: '道德经全文古音诵读，还原春秋战国时期的语言韵律。',
    type: 'audio',
    author: '老子',
    commentator: '老子',
    era: '春秋战国',
    rating: 4.9,
    downloads: 3456,
    date: '2023-05-10'
  },
  {
    id: 25,
    title: '任继愈《老子新译》',
    description: '著名哲学家任继愈对道德经的新译和注释，学术价值极高。',
    type: 'book',
    author: '任继愈',
    commentator: '任继愈',
    era: '现代',
    rating: 4.6,
    downloads: 1567,
    date: '2023-01-20'
  },
  {
    id: 26,
    title: '马王堆帛书《老子》甲乙本',
    description: '1973年出土的马王堆帛书老子甲乙本，汉代抄本的重要发现。',
    type: 'pdf',
    author: '老子',
    commentator: '老子',
    era: '春秋战国',
    rating: 4.8,
    downloads: 2890,
    date: '2022-11-15'
  },
  {
    id: 27,
    title: '刘笑敢道德经文本研究',
    description: '香港中文大学刘笑敢教授对道德经文本的深度研究讲座。',
    type: 'video',
    author: '刘笑敢',
    commentator: '刘笑敢',
    era: '现代',
    rating: 4.7,
    downloads: 1456,
    date: '2023-03-25'
  },
  {
    id: 28,
    title: '翟鸿燊道德经智慧应用',
    description: '翟鸿燊教授将道德经智慧应用于现代生活和管理的音频课程。',
    type: 'audio',
    author: '翟鸿燊',
    commentator: '翟鸿燊',
    era: '现代',
    rating: 4.8,
    downloads: 2345,
    date: '2023-04-10'
  },
  {
    id: 29,
    title: '张岱年《中国哲学大纲》道德经部分',
    description: '张岱年先生对道德经在中国哲学体系中地位的经典论述。',
    type: 'book',
    author: '张岱年',
    commentator: '张岱年',
    era: '现代',
    rating: 4.6,
    downloads: 1234,
    date: '2022-10-20'
  },
  {
    id: 30,
    title: '道德经多语言译本数据库',
    description: '汇集道德经英、法、德、日等多语言译本的在线数据库。',
    type: 'link',
    author: '国际翻译',
    commentator: '国际翻译',
    era: '现代',
    rating: 4.9,
    downloads: 3456,
    date: '2023-05-15'
  },
  {
    id: 31,
    title: '道德经与中医养生智慧',
    description: '探讨道德经养生思想与中医理论的结合，提供健康生活指导。',
    type: 'pdf',
    author: '中医养生',
    commentator: '中医养生',
    era: '现代',
    rating: 4.7,
    downloads: 2123,
    date: '2023-04-05'
  },
  {
    id: 32,
    title: '道德经领导力智慧讲座',
    description: '从道德经角度探讨现代领导力，无为而治的管理智慧。',
    type: 'video',
    author: '领导力',
    commentator: '领导力',
    era: '现代',
    rating: 4.8,
    downloads: 1890,
    date: '2023-03-30'
  },
  {
    id: 33,
    title: '道德经家庭教育智慧',
    description: '将道德经智慧应用于现代家庭教育，培养孩子自然成长。',
    type: 'audio',
    author: '家庭教育',
    commentator: '家庭教育',
    era: '现代',
    rating: 4.6,
    downloads: 1567,
    date: '2023-02-25'
  },
  {
    id: 34,
    title: '道德经心理学解读',
    description: '从心理学角度解读道德经，探讨道家思想对心理健康的启示。',
    type: 'book',
    author: '心理学',
    commentator: '心理学',
    era: '现代',
    rating: 4.7,
    downloads: 1234,
    date: '2023-01-30'
  },
  {
    id: 35,
    title: '道德经在线学习社区',
    description: '道德经爱好者交流平台，分享学习心得和研究成果。',
    type: 'link',
    author: '学习社区',
    commentator: '学习社区',
    era: '现代',
    rating: 4.8,
    downloads: 2890,
    date: '2023-05-20'
  }
]

// 搜索处理
const handleHeroSearch = () => {
  searchQuery.value = heroSearchQuery.value
  currentPage.value = 1
}

const handleSidebarSearch = () => {
  searchQuery.value = sidebarSearchQuery.value
  currentPage.value = 1
}

const handleSearch = () => {
  searchQuery.value = heroSearchQuery.value
  currentPage.value = 1
}

const applyFilters = () => {
  // 筛选逻辑已通过计算属性自动应用，这里只需重置页码
  currentPage.value = 1
}

// 过滤逻辑
const filteredResources = computed(() => {
  let result = allResources.filter(item => {
    // 搜索过滤
    const query = searchQuery.value.toLowerCase()
    if (query && !item.title.toLowerCase().includes(query) && !item.description.toLowerCase().includes(query)) {
      return false
    }
    // 类型过滤
    if (selectedTypes.value.length > 0 && !selectedTypes.value.includes(item.type)) {
      return false
    }
    // 时代过滤
    if (selectedEras.value.length > 0 && !selectedEras.value.includes(item.era)) {
      return false
    }
    // 评论者过滤
    if (selectedCommentators.value.length > 0 && !selectedCommentators.value.includes(item.commentator || '')) {
      return false
    }
    return true
  })

  // 排序逻辑
  result = result.sort((a, b) => {
    switch (sortCriteria.value) {
      case 'downloads':
        return b.downloads - a.downloads
      case 'rating':
        return b.rating - a.rating
      case 'newest':
      default:
        // 假设 id 越大越新，或者使用 mock 的 date 字段
        return (new Date(b.date || '').getTime()) - (new Date(a.date || '').getTime())
    }
  })

  return result
})

// 分页逻辑
const totalPages = computed(() => Math.ceil(filteredResources.value.length / itemsPerPage))

const paginatedResources = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredResources.value.slice(start, end)
})

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const range = 2 // 当前页前后显示的页码数
  
  let start = Math.max(1, current - range)
  let end = Math.min(total, current + range)
  
  // 调整显示的页码范围，确保始终显示5个按钮（如果总页数足够）
  if (end - start + 1 < 5 && total >= 5) {
    if (current <= range + 1) {
      end = 5
    } else {
      start = total - 4
    }
  }
  
  const pages = []
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

// 监听筛选条件变化，重置页码
watch([selectedTypes, selectedEras, selectedCommentators, sortCriteria], () => {
  currentPage.value = 1
})

// 工具函数
const resetFilters = () => {
  heroSearchQuery.value = ''
  sidebarSearchQuery.value = ''
  searchQuery.value = ''
  selectedTypes.value = []
  selectedEras.value = []
  selectedCommentators.value = []
  sortCriteria.value = 'newest'
  currentPage.value = 1
}

const getTypeName = (type: string) => {
  const map: Record<string, string> = { pdf: 'PDF', video: '视频', audio: '音频', book: '图书', link: '链接' }
  return map[type] || type
}

const getTypeColor = (type: string) => {
  const map: Record<string, string> = {
    pdf: 'bg-primary',
    video: 'bg-accent',
    audio: 'bg-secondary',
    book: 'bg-[#8B4513]',
    link: 'bg-[#2E8B57]'
  }
  return map[type] || 'bg-gray-500'
}

const getIconClass = (type: string) => {
  const map: Record<string, string> = {
    pdf: 'bg-primary/10 text-primary',
    video: 'bg-accent/10 text-accent',
    audio: 'bg-secondary/10 text-secondary',
    book: 'bg-[#8B4513]/10 text-[#8B4513]',
    link: 'bg-[#2E8B57]/10 text-[#2E8B57]'
  }
  
  // 在禅模式下统一处理
  if (document.documentElement.classList.contains('zen-mode')) {
    return 'bg-secondary/10 text-primary'
  }
  
  return map[type] || 'bg-gray-100 text-gray-500'
}

const getResourceIcon = (type: string) => {
  const map: Record<string, string> = {
    pdf: 'fas fa-file-pdf',
    video: 'fas fa-play-circle',
    audio: 'fas fa-music',
    book: 'fas fa-book',
    link: 'fas fa-link'
  }
  return map[type] || 'fas fa-file'
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

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 2px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>

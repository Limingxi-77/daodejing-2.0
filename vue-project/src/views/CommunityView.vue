<template>
  <div class="pt-24 pb-12 px-4 md:px-8 min-h-screen bg-gray-50">
    <div class="container mx-auto max-w-5xl">
      <!-- 页面标题 -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-primary mb-4">道德经社区</h1>
        <p class="text-xl text-dark max-w-3xl mx-auto">
          与同道中人交流心得，分享感悟，共同探索《道德经》的智慧
        </p>
      </div>

      <!-- 社区统计 -->
      <section class="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12">
        <div class="bg-white rounded-lg shadow-md p-6 text-center">
          <div class="text-3xl font-bold text-primary mb-2">1,234</div>
          <div class="text-gray-600">社区成员</div>
        </div>
        <div class="bg-white rounded-lg shadow-md p-6 text-center">
          <div class="text-3xl font-bold text-primary mb-2">567</div>
          <div class="text-gray-600">讨论帖子</div>
        </div>
        <div class="bg-white rounded-lg shadow-md p-6 text-center">
          <div class="text-3xl font-bold text-primary mb-2">89</div>
          <div class="text-gray-600">今日活跃</div>
        </div>
      </section>

      <!-- 数字文创专区 (New Featured Section) -->
      <section class="mb-12 animate-slide-up">
        <div 
          @click="$router.push('/dao-art')"
          class="relative bg-gradient-to-r from-purple-900 via-indigo-900 to-black rounded-2xl p-8 overflow-hidden cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-300 group"
        >
          <!-- 背景图 -->
          <div class="absolute inset-0 bg-[url('https://s.coze.cn/image/DLT84Yi4R1A/')] bg-cover bg-center opacity-40 group-hover:opacity-50 transition-opacity duration-700"></div>
          <div class="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
          
          <div class="relative z-10 flex flex-col md:flex-row items-center justify-between">
            <div class="mb-6 md:mb-0 text-center md:text-left">
              <div class="inline-flex items-center px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold mb-4 backdrop-blur-sm">
                <i class="fas fa-sparkles mr-2"></i> AI 艺术共创
              </div>
              <h2 class="text-3xl font-bold text-white mb-2">道境 · 数字文创画廊</h2>
              <p class="text-gray-300 max-w-xl">
                以经文为魂，以 AI 为笔。选择您喜爱的经典名句，一键生成独一无二的水墨意境画作。
              </p>
            </div>
            
            <button class="bg-white text-purple-900 px-8 py-3 rounded-full font-bold shadow-lg hover:bg-purple-50 transition-colors transform group-hover:scale-105 flex items-center">
              <i class="fas fa-paint-brush mr-2"></i> 开始创作
            </button>
          </div>
        </div>
      </section>

      <!-- 创建帖子表单 -->
      <section class="bg-white rounded-lg p-6 mb-8 shadow-sm border border-secondary/20 relative">
        <h2 class="text-xl font-bold text-dark mb-4">分享您的想法</h2>
        <form @submit.prevent="publishPost">
          <div class="mb-4">
            <label for="postTitle" class="block text-sm font-medium text-dark mb-2">标题</label>
            <input 
              v-model="newPost.title"
              type="text" 
              id="postTitle" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" 
              placeholder="请输入帖子标题..."
            >
          </div>
          <div class="mb-4">
            <label for="postContent" class="block text-sm font-medium text-dark mb-2">内容</label>
            <textarea 
              v-model="newPost.content"
              id="postContent" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors min-h-[120px]" 
              placeholder="分享您对《道德经》的理解、感悟或问题..."
            ></textarea>
          </div>
          <div class="mb-4">
            <label for="postTags" class="block text-sm font-medium text-dark mb-2">标签</label>
            <input 
              v-model="newPost.tags"
              type="text" 
              id="postTags" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" 
              placeholder="添加标签，用空格分隔（如：第八章 上善若水 感悟）"
            >
          </div>
          <div class="flex justify-end relative">
            <button type="button" @click="saveDraft" class="px-4 py-2 border border-primary text-primary rounded-md hover:bg-primary/5 transition-colors mr-2">保存草稿</button>
            <button 
              type="button" 
              @click.stop="toggleDraftBox" 
              class="px-4 py-2 border border-primary text-primary rounded-md hover:bg-primary/5 transition-colors mr-2"
            >
              草稿箱
            </button>
            <button type="submit" class="px-6 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition-colors">发布帖子</button>
            
            <!-- 草稿箱下拉菜单 -->
            <div v-if="showDraftBox" class="absolute top-full right-0 w-[350px] bg-white border border-gray-200 rounded-lg shadow-xl z-50 mt-2">
              <h3 class="text-base font-semibold p-4 border-b border-gray-200 m-0">我的草稿</h3>
              <div class="max-h-[300px] overflow-y-auto py-2">
                <div v-if="drafts.length === 0" class="py-10 text-center text-gray-400 text-sm">暂无草稿</div>
                <div 
                  v-else 
                  v-for="draft in drafts" 
                  :key="draft.id" 
                  class="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                  @click="loadDraft(draft)"
                >
                  <div class="text-sm font-medium text-dark mb-1 truncate">{{ draft.title || '无标题' }}</div>
                  <div class="text-xs text-gray-400 flex justify-between items-center">
                    <span>{{ formatDate(draft.savedAt) }}</span>
                    <button @click.stop="deleteDraft(draft.id)" class="text-red-500 hover:bg-red-50 px-2 py-0.5 rounded transition-colors">删除</button>
                  </div>
                </div>
              </div>
              <div class="p-3 border-t border-gray-200 text-right">
                <button @click="clearAllDrafts" class="text-gray-500 hover:text-dark text-sm px-3 py-1.5 rounded hover:bg-gray-100 transition-colors">
                  <i class="far fa-trash-alt mr-1"></i> 清空草稿箱
                </button>
              </div>
            </div>
          </div>
        </form>
      </section>

      <!-- 搜索栏 -->
      <section class="mb-8">
        <div class="relative">
          <input 
            v-model="searchQuery"
            @keyup.enter="performSearch"
            type="text" 
            class="w-full pl-10 pr-24 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm transition-all" 
            placeholder="搜索帖子标题、内容或标签..."
          >
          <div class="absolute left-0 top-0 pl-3 flex items-center h-full text-gray-400">
            <i class="fas fa-search"></i>
          </div>
          <button 
            @click="performSearch"
            class="absolute right-0 top-0 h-full px-6 bg-primary text-white rounded-r-lg hover:bg-opacity-90 transition-colors font-medium"
          >
            搜索
          </button>
        </div>
      </section>

      <!-- 标签导航 -->
      <section class="mb-8">
        <div class="flex border-b border-gray-200 mb-6">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="currentTab = tab.id"
            :class="['px-4 py-3 font-medium transition-colors border-b-2', currentTab === tab.id ? 'text-primary border-primary' : 'text-gray-500 border-transparent hover:text-primary']"
          >
            {{ tab.name }}
          </button>
        </div>
      </section>

      <!-- 帖子列表 -->
      <section>
        <div class="space-y-6">
          <div v-if="filteredPosts.length === 0" class="text-center py-12 text-gray-500">
            <div v-if="currentTab === 'following'">
                <i class="fas fa-users text-6xl text-gray-300 mb-4"></i>
                <h3 class="text-xl font-medium text-dark mb-2">您还没有关注任何人</h3>
                <p class="text-gray-600 mb-6">关注其他用户，查看他们的最新动态</p>
                <button class="px-6 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition-colors">发现用户</button>
            </div>
            <div v-else-if="currentTab === 'favorites'">
                <i class="far fa-bookmark text-4xl text-gray-300 mb-4"></i>
                <p class="text-gray-500">您还没有收藏任何帖子</p>
            </div>
            <div v-else>
                <i class="fas fa-search mb-4 text-4xl text-gray-300"></i>
                <p>没有找到相关帖子</p>
            </div>
          </div>
          
          <article 
            v-for="post in filteredPosts" 
            :key="post.id"
            class="bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <div class="flex items-start mb-4">
              <img :src="post.avatar || `https://picsum.photos/id/${post.avatarId || 1}/40/40`" alt="用户头像" class="w-10 h-10 rounded-full object-cover mr-3">
              <div class="flex-1">
                <div class="flex items-center mb-1">
                  <h3 class="font-medium text-dark mr-2">{{ post.user }}</h3>
                  <button 
                    @click="toggleFollow(post.user)"
                    :class="['text-xs px-2 py-0.5 border rounded-full font-semibold transition-colors', isFollowed(post.user) ? 'bg-gray-200 border-gray-300 text-gray-600 hover:bg-gray-300' : 'bg-primary border-primary text-white hover:bg-opacity-90']"
                  >
                    {{ isFollowed(post.user) ? '已关注' : '+ 关注' }}
                  </button>
                  <span class="text-sm text-gray-500 ml-auto">{{ post.time }}</span>
                  <span v-if="post.isHot" class="ml-2 px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">热门</span>
                  <span v-if="post.isUnanswered" class="ml-2 px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded-full">待解答</span>
                </div>
                <h2 class="text-xl font-bold text-dark mb-2">{{ post.title }}</h2>
                <p class="text-gray-700 mb-4">{{ post.content }}</p>
                <div class="mb-4 flex flex-wrap gap-2">
                  <span 
                    v-for="(tag, index) in post.tags" 
                    :key="index"
                    class="px-3 py-1 bg-gray-100 text-primary text-sm rounded-full hover:bg-primary hover:text-white transition-colors cursor-pointer"
                  >
                    #{{ tag }}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-4">
                    <button 
                      @click="toggleLike(post.id)"
                      :class="['flex items-center transition-colors', isLiked(post.id) ? 'text-primary' : 'text-gray-500 hover:text-primary']"
                    >
                      <i :class="[isLiked(post.id) ? 'fas' : 'far', 'fa-thumbs-up mr-1']"></i>
                      <span>{{ post.likes }}</span>
                    </button>
                    <button class="flex items-center text-gray-500 hover:text-primary transition-colors">
                      <i class="far fa-comment mr-1"></i>
                      <span>{{ post.comments }}</span>
                    </button>
                    <button 
                      @click="toggleBookmark(post.id)"
                      :class="['flex items-center transition-colors', isBookmarked(post.id) ? 'text-yellow-500' : 'text-gray-500 hover:text-primary']"
                    >
                      <i :class="[isBookmarked(post.id) ? 'fas' : 'far', 'fa-bookmark mr-1']"></i>
                      <span>{{ isBookmarked(post.id) ? '已收藏' : '收藏' }}</span>
                    </button>
                  </div>
                  <div class="relative">
                    <button 
                      @click.stop="toggleShareMenu(post.id)"
                      class="flex items-center text-gray-500 hover:text-primary transition-colors"
                    >
                      <i class="fas fa-share mr-1"></i>
                      <span>分享</span>
                    </button>
                    
                    <!-- 分享下拉菜单 -->
                    <div v-if="activeShareMenu === post.id" class="absolute bottom-full right-0 w-40 bg-white rounded-lg shadow-xl py-2 z-10 mb-2">
                      <button @click="handleShare('wechat')" class="w-full text-left px-4 py-2 hover:bg-gray-50 text-dark flex items-center">
                        <i class="fab fa-weixin text-[#07C160] w-5 text-center mr-2"></i> 微信
                      </button>
                      <button @click="handleShare('moments')" class="w-full text-left px-4 py-2 hover:bg-gray-50 text-dark flex items-center">
                        <i class="fas fa-circle-notch text-[#42b983] w-5 text-center mr-2"></i> 朋友圈
                      </button>
                      <button @click="handleShare('qq')" class="w-full text-left px-4 py-2 hover:bg-gray-50 text-dark flex items-center">
                        <i class="fab fa-qq text-[#12B7F5] w-5 text-center mr-2"></i> QQ
                      </button>
                      <div class="h-px bg-gray-100 my-1"></div>
                      <button @click="handleShare('copy')" class="w-full text-left px-4 py-2 hover:bg-gray-50 text-dark flex items-center">
                        <i class="fas fa-link text-[#6366f1] w-5 text-center mr-2"></i> 复制链接
                      </button>
                      <button @click="handleShare('report')" class="w-full text-left px-4 py-2 hover:bg-gray-50 text-red-500 flex items-center">
                        <i class="fas fa-exclamation-circle text-red-500 w-5 text-center mr-2"></i> 举报
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      <!-- 加载更多按钮 -->
      <div v-if="hasMore" class="text-center mt-8">
        <button 
          @click="loadMore" 
          :disabled="loadingMore"
          class="px-6 py-2 border border-primary text-primary rounded-md hover:bg-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loadingMore"><i class="fas fa-spinner fa-spin mr-2"></i>加载中...</span>
          <span v-else>加载更多</span>
        </button>
      </div>
    </div>

    <!-- 通知 Toast -->
    <div 
      v-if="notification.show" 
      :class="['fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 text-white transition-all duration-300 transform', notification.type === 'success' ? 'bg-green-500' : 'bg-blue-500', notification.show ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0']"
    >
      {{ notification.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 接口定义
interface Post {
  id: string | number
  user: string
  avatarId?: number
  avatar?: string
  time: string
  title: string
  content: string
  tags: string[]
  likes: number
  comments: number
  isHot?: boolean
  isUnanswered?: boolean
}

interface Draft {
  id: string
  title: string
  content: string
  tags: string
  savedAt: string
}

// 状态
const currentTab = ref('latest')
const searchQuery = ref('')
const activeShareMenu = ref<string | number | null>(null)
const showDraftBox = ref(false)
const loadingMore = ref(false)
const hasMore = ref(true)

// 通知状态
const notification = ref({
  show: false,
  message: '',
  type: 'success'
})

// 标签页配置
const tabs = [
  { id: 'latest', name: '最新发布' },
  { id: 'popular', name: '热门讨论' },
  { id: 'following', name: '关注的人' },
  { id: 'favorites', name: '我的收藏' },
  { id: 'unanswered', name: '待解答' }
]

// 新帖子表单数据
const newPost = ref({
  title: '',
  content: '',
  tags: ''
})

// 模拟数据
const allPosts = ref<Post[]>([
  {
    id: '1',
    user: '张明',
    avatarId: 1,
    time: '2小时前',
    title: '对"上善若水"的现代理解',
    content: '最近在研读《道德经》第八章"上善若水"，深有感触。老子以水喻道，认为水的特性最接近于"道"的本质。在现代社会中，我们如何理解和实践这种"上善若水"的智慧呢？',
    tags: ['第八章', '上善若水', '现代应用'],
    likes: 23,
    comments: 15
  },
  {
    id: '2',
    user: '李静',
    avatarId: 2,
    time: '5小时前',
    title: '《道德经》与心理健康的联系',
    content: '作为一名心理咨询师，我发现《道德经》中的许多理念与现代心理健康理论不谋而合。"无为而治"对应着正念中的"不评判"，"知足常乐"与积极心理学中的"感恩练习"相似。大家如何看待这种古代智慧与现代科学的契合？',
    tags: ['心理健康', '无为', '现代应用'],
    likes: 45,
    comments: 28
  },
  {
    id: '3',
    user: '王强',
    avatarId: 3,
    time: '1天前',
    title: '关于"道可道，非常道"的多种解释',
    content: '《道德经》开篇"道可道，非常道；名可名，非常名"有多种解释。有人认为这是说真正的"道"无法用语言表达，有人认为这是在强调语言的局限性。我整理了历代学者的不同解读，想听听大家的看法。',
    tags: ['第一章', '道可道', '学术讨论'],
    likes: 67,
    comments: 42
  },
  {
    id: '4',
    user: '赵敏',
    avatarId: 4,
    time: '3天前',
    title: '如何将"无为而治"应用到现代企业管理中？',
    content: '作为一个创业者，我一直思考如何将《道德经》中的"无为而治"理念应用到企业管理中。不是放任不管，而是创造一个让员工自发成长的环境。大家有什么实践经验可以分享吗？',
    tags: ['无为而治', '企业管理', '实践应用'],
    likes: 156,
    comments: 89,
    isHot: true
  },
  {
    id: '5',
    user: '陈涛',
    avatarId: 5,
    time: '5天前',
    title: '《道德经》与环保理念的不谋而合',
    content: '《道德经》中"人法地，地法天，天法道，道法自然"的思想，与现代环保理念高度契合。老子强调顺应自然，减少人为干预，这与当代生态保护理念不谋而合。我们应该如何从《道德经》中汲取环保智慧？',
    tags: ['环保', '道法自然', '生态保护'],
    likes: 128,
    comments: 76,
    isHot: true
  },
  {
    id: '6',
    user: '刘洋',
    avatarId: 6,
    time: '1天前',
    title: '如何理解"知者不言，言者不知"？',
    content: '《道德经》第五十六章说"知者不言，言者不知"，这是否意味着真正的智者不应该表达自己的见解？这与我们鼓励知识分享的现代价值观是否矛盾？',
    tags: ['第五十六章', '知者不言', '疑问'],
    likes: 12,
    comments: 3,
    isUnanswered: true
  }
])

// 用户交互状态（本地存储）
const bookmarks = ref<string[]>([])
const likes = ref<string[]>([])
const followedUsers = ref<string[]>([])
const drafts = ref<Draft[]>([])

// 计算属性：过滤后的帖子
const filteredPosts = computed(() => {
  let posts = [...allPosts.value]

  // 1. Tab 筛选
  if (currentTab.value === 'popular') {
    posts = posts.filter(p => p.isHot || p.likes > 50)
    posts.sort((a, b) => b.likes - a.likes)
  } else if (currentTab.value === 'following') {
    posts = posts.filter(p => followedUsers.value.includes(p.user))
  } else if (currentTab.value === 'favorites') {
    posts = posts.filter(p => bookmarks.value.includes(String(p.id)))
  } else if (currentTab.value === 'unanswered') {
    posts = posts.filter(p => p.isUnanswered || p.comments === 0)
  }

  // 2. 搜索筛选
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    posts = posts.filter(p => 
      p.title.toLowerCase().includes(query) || 
      p.content.toLowerCase().includes(query) || 
      p.tags.some(t => t.toLowerCase().includes(query)) ||
      p.user.toLowerCase().includes(query)
    )
  }

  return posts
})

// 方法
const showNotification = (msg: string, type: 'success' | 'info' = 'success') => {
  notification.value = { show: true, message: msg, type }
  setTimeout(() => {
    notification.value.show = false
  }, 3000)
}

// 格式化日期
const formatDate = (isoString: string) => {
  const date = new Date(isoString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 交互逻辑：点赞
const isLiked = (id: string | number) => likes.value.includes(String(id))
const toggleLike = (id: string | number) => {
  const strId = String(id)
  const index = likes.value.indexOf(strId)
  const post = allPosts.value.find(p => String(p.id) === strId)
  
  if (index > -1) {
    likes.value.splice(index, 1)
    if (post) post.likes--
    showNotification('已取消点赞', 'info')
  } else {
    likes.value.push(strId)
    if (post) post.likes++
    showNotification('点赞成功')
  }
  localStorage.setItem('communityLikes', JSON.stringify(likes.value))
}

// 交互逻辑：收藏
const isBookmarked = (id: string | number) => bookmarks.value.includes(String(id))
const toggleBookmark = (id: string | number) => {
  const strId = String(id)
  const index = bookmarks.value.indexOf(strId)
  
  if (index > -1) {
    bookmarks.value.splice(index, 1)
    showNotification('已取消收藏', 'info')
  } else {
    bookmarks.value.push(strId)
    showNotification('收藏成功')
  }
  localStorage.setItem('communityBookmarks', JSON.stringify(bookmarks.value))
}

// 交互逻辑：关注
const isFollowed = (user: string) => followedUsers.value.includes(user)
const toggleFollow = (user: string) => {
  const index = followedUsers.value.indexOf(user)
  
  if (index > -1) {
    followedUsers.value.splice(index, 1)
    showNotification(`已取消关注 ${user}`, 'info')
  } else {
    followedUsers.value.push(user)
    showNotification(`已关注 ${user}`)
  }
  localStorage.setItem('communityFollowedUsers', JSON.stringify(followedUsers.value))
}

// 交互逻辑：分享
const toggleShareMenu = (id: string | number) => {
  activeShareMenu.value = activeShareMenu.value === id ? null : id
}
const handleShare = (type: string) => {
  activeShareMenu.value = null
  if (type === 'copy') {
    navigator.clipboard.writeText(window.location.href)
    showNotification('链接已复制到剪贴板')
  } else if (type === 'report') {
    if (confirm('确定要举报此内容吗？')) {
      showNotification('举报已提交，管理员将进行审核')
    }
  } else {
    showNotification(`正在唤起${type === 'wechat' ? '微信' : type === 'qq' ? 'QQ' : '分享'}...`, 'info')
  }
}

// 草稿箱逻辑
const toggleDraftBox = () => {
  showDraftBox.value = !showDraftBox.value
}
const saveDraft = () => {
  if (!newPost.value.title && !newPost.value.content) {
    showNotification('请输入内容后再保存', 'info')
    return
  }
  
  const draft: Draft = {
    id: Date.now().toString(),
    title: newPost.value.title,
    content: newPost.value.content,
    tags: newPost.value.tags,
    savedAt: new Date().toISOString()
  }
  
  drafts.value.unshift(draft)
  localStorage.setItem('communityDrafts', JSON.stringify(drafts.value))
  showNotification('草稿保存成功')
}
const loadDraft = (draft: Draft) => {
  newPost.value = {
    title: draft.title,
    content: draft.content,
    tags: draft.tags
  }
  showDraftBox.value = false
  showNotification('已加载草稿', 'info')
}
const deleteDraft = (id: string) => {
  drafts.value = drafts.value.filter(d => d.id !== id)
  localStorage.setItem('communityDrafts', JSON.stringify(drafts.value))
}
const clearAllDrafts = () => {
  if (confirm('确定要清空所有草稿吗？')) {
    drafts.value = []
    localStorage.removeItem('communityDrafts')
    showNotification('草稿箱已清空')
  }
}

// 发布帖子
const publishPost = () => {
  if (!newPost.value.title.trim() || !newPost.value.content.trim()) {
    showNotification('请填写完整的标题和内容', 'info')
    return
  }
  
  showNotification('发布中...', 'info')
  
  setTimeout(() => {
    const post: Post = {
      id: Date.now().toString(),
      user: '我',
      avatarId: Math.floor(Math.random() * 20),
      time: '刚刚',
      title: newPost.value.title,
      content: newPost.value.content,
      tags: newPost.value.tags.split(/\s+/).filter(t => t),
      likes: 0,
      comments: 0
    }
    
    allPosts.value.unshift(post)
    newPost.value = { title: '', content: '', tags: '' }
    showNotification('发布成功')
  }, 1000)
}

// 搜索
const performSearch = () => {
  // 搜索逻辑已在 computed 中实现
  if (filteredPosts.value.length === 0) {
    showNotification('未找到相关内容', 'info')
  }
}

// 加载更多
const loadMore = () => {
  loadingMore.value = true
  setTimeout(() => {
    // 模拟加载更多数据
    const moreData = [
      {
        id: Date.now() + '1',
        user: '周伟',
        avatarId: 10,
        time: '6小时前',
        title: '《道德经》中的养生智慧',
        content: '老子提倡"致虚极，守静笃"，这对现代人的养生有何启示？我认为保持内心的平静是身体健康的基础，大家怎么看？',
        tags: ['养生', '致虚极', '身心健康'],
        likes: 34,
        comments: 12
      },
      {
        id: Date.now() + '2',
        user: '吴丽',
        avatarId: 11,
        time: '8小时前',
        title: '如何做到"宠辱不惊"？',
        content: '在职场中经常会遇到被表扬或批评的情况，如何修炼才能真正做到"宠辱不惊"？《道德经》第十三章给了我们很好的指引。',
        tags: ['第十三章', '职场心态', '修身'],
        likes: 56,
        comments: 23
      }
    ]
    allPosts.value.push(...moreData)
    loadingMore.value = false
    // 简单逻辑：加载一次后就没有更多了
    // hasMore.value = false 
  }, 1000)
}

// 全局点击事件处理
const handleGlobalClick = (e: any) => {
  if (!e.target.closest('.share-container') && activeShareMenu.value !== null) {
    activeShareMenu.value = null
  }
  if (!e.target.closest('section.relative') && showDraftBox.value) {
    showDraftBox.value = false
  }
}

// 生命周期钩子
onMounted(() => {
  // 加载本地存储数据
  try {
    likes.value = JSON.parse(localStorage.getItem('communityLikes') || '[]')
    bookmarks.value = JSON.parse(localStorage.getItem('communityBookmarks') || '[]')
    followedUsers.value = JSON.parse(localStorage.getItem('communityFollowedUsers') || '[]')
    drafts.value = JSON.parse(localStorage.getItem('communityDrafts') || '[]')
  } catch (e) {
    console.error('Failed to load local storage data', e)
  }

  // 点击外部关闭分享菜单和草稿箱
  document.addEventListener('click', handleGlobalClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleGlobalClick)
})
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

/* 隐藏滚动条 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: #f1f1f1;
}
::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>

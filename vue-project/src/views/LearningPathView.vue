<template>
  <div class="pt-24 pb-20 px-4 md:px-8 bg-gray-50 min-h-screen">
    <div class="container mx-auto max-w-6xl">
      <!-- 页面标题 -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-primary mb-4">道德经学习路径</h1>
        <p class="text-xl text-dark max-w-3xl mx-auto">
          根据您的学习目标和兴趣，选择适合的学习路径，系统性地掌握《道德经》的智慧
        </p>
      </div>

      <!-- 学习统计概览 -->
      <section class="mb-8 bg-white rounded-lg shadow-md p-6">
        <h2 class="text-2xl font-bold text-primary mb-6">学习统计概览</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div class="text-center">
            <div class="w-16 h-16 mx-auto mb-3 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <i class="fas fa-clock text-2xl"></i>
            </div>
            <h3 class="font-bold text-lg">{{ Math.round(learningStats.totalStudyTime / 60) }}</h3>
            <p class="text-sm text-gray-600">学习小时</p>
          </div>
          <div class="text-center">
            <div class="w-16 h-16 mx-auto mb-3 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
              <i class="fas fa-book text-2xl"></i>
            </div>
            <h3 class="font-bold text-lg">{{ learningStats.completedLessons }}</h3>
            <p class="text-sm text-gray-600">完成课程</p>
          </div>
          <div class="text-center">
            <div class="w-16 h-16 mx-auto mb-3 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
              <i class="fas fa-fire text-2xl"></i>
            </div>
            <h3 class="font-bold text-lg">{{ learningStats.currentStreak }}</h3>
            <p class="text-sm text-gray-600">连续学习</p>
          </div>
          <div class="text-center">
            <div class="w-16 h-16 mx-auto mb-3 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
              <i class="fas fa-star text-2xl"></i>
            </div>
            <h3 class="font-bold text-lg">{{ learningStats.averageQuizScore }}%</h3>
            <p class="text-sm text-gray-600">平均分数</p>
          </div>
        </div>
      </section>

      <!-- 学习路径选择 -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold text-primary mb-6">选择您的学习路径</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- 初学者路径 -->
          <div class="bg-white rounded-lg shadow-md p-6 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div class="flex items-center mb-4">
              <div class="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3">
                <i class="fas fa-seedling text-xl"></i>
              </div>
              <h3 class="text-xl font-bold text-dark">初学者路径</h3>
            </div>
            <p class="text-dark mb-4 h-12">
              适合刚接触《道德经》的学习者，从基础概念开始，循序渐进地理解老子思想的核心
            </p>
            <div class="mb-4">
              <div class="flex justify-between text-sm text-gray-600 mb-1">
                <span>学习进度</span>
                <span>{{ beginnerProgress }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-green-500 h-2 rounded-full transition-all duration-500" :style="{ width: beginnerProgress + '%' }"></div>
              </div>
            </div>
            <ul class="text-sm text-gray-600 mb-6 space-y-2">
              <li class="flex items-center"><i class="fas fa-check text-green-500 mr-2"></i>18个核心章节</li>
              <li class="flex items-center"><i class="fas fa-check text-green-500 mr-2"></i>基础概念讲解</li>
              <li class="flex items-center"><i class="fas fa-check text-green-500 mr-2"></i>现代生活应用</li>
            </ul>
            <button class="w-full py-2 rounded-md border border-primary text-primary hover:bg-primary hover:text-white transition-colors" @click="selectPath('beginner')">
              {{ beginnerProgress > 0 ? '继续学习' : '开始学习' }}
            </button>
          </div>

          <!-- 进阶者路径 -->
          <div class="bg-white rounded-lg shadow-md p-6 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div class="flex items-center mb-4">
              <div class="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mr-3">
                <i class="fas fa-mountain text-xl"></i>
              </div>
              <h3 class="text-xl font-bold text-dark">进阶者路径</h3>
            </div>
            <p class="text-dark mb-4 h-12">
              适合有一定基础的学习者，深入探讨《道德经》的哲学思想和内在逻辑
            </p>
            <div class="mb-4">
              <div class="flex justify-between text-sm text-gray-600 mb-1">
                <span>学习进度</span>
                <span>{{ intermediateProgress }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-orange-500 h-2 rounded-full transition-all duration-500" :style="{ width: intermediateProgress + '%' }"></div>
              </div>
            </div>
            <ul class="text-sm text-gray-600 mb-6 space-y-2">
              <li class="flex items-center"><i class="fas fa-check text-green-500 mr-2"></i>27个重点章节</li>
              <li class="flex items-center"><i class="fas fa-check text-green-500 mr-2"></i>哲学思想探讨</li>
              <li class="flex items-center"><i class="fas fa-check text-green-500 mr-2"></i>与其他哲学比较</li>
            </ul>
            <button class="w-full py-2 rounded-md border border-primary text-primary hover:bg-primary hover:text-white transition-colors" @click="selectPath('intermediate')">
              {{ intermediateProgress > 0 ? '继续学习' : '开始学习' }}
            </button>
          </div>

          <!-- 研究者路径 -->
          <div class="bg-white rounded-lg shadow-md p-6 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div class="flex items-center mb-4">
              <div class="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mr-3">
                <i class="fas fa-graduation-cap text-xl"></i>
              </div>
              <h3 class="text-xl font-bold text-dark">研究者路径</h3>
            </div>
            <p class="text-dark mb-4 h-12">
              适合深度研究者，全面解析《道德经》的文本、历史背景和学术争议
            </p>
            <div class="mb-4">
              <div class="flex justify-between text-sm text-gray-600 mb-1">
                <span>学习进度</span>
                <span>{{ advancedProgress }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-red-500 h-2 rounded-full transition-all duration-500" :style="{ width: advancedProgress + '%' }"></div>
              </div>
            </div>
            <ul class="text-sm text-gray-600 mb-6 space-y-2">
              <li class="flex items-center"><i class="fas fa-check text-green-500 mr-2"></i>36章全面解析</li>
              <li class="flex items-center"><i class="fas fa-check text-green-500 mr-2"></i>历史版本对比</li>
              <li class="flex items-center"><i class="fas fa-check text-green-500 mr-2"></i>学术研究前沿</li>
            </ul>
            <button class="w-full py-2 rounded-md border border-primary text-primary hover:bg-primary hover:text-white transition-colors" @click="selectPath('advanced')">
              {{ advancedProgress > 0 ? '继续学习' : '开始学习' }}
            </button>
          </div>
        </div>
      </section>

      <!-- 亲子绘本专区 -->
      <section class="mb-12 animate-slide-up" style="animation-delay: 0.1s;">
        <h2 class="text-2xl font-bold text-primary mb-6 flex items-center">
          <i class="fas fa-child mr-2 text-blue-500"></i> 亲子启蒙 & 趣味阅读
        </h2>
        <div 
          @click="$router.push('/picture-book')"
          class="relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 group border-2 border-dashed border-blue-200"
        >
          <!-- 装饰背景 -->
          <div class="absolute top-0 right-0 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
          <div class="absolute bottom-0 left-0 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
          
          <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div class="flex-1 text-center md:text-left">
              <span class="inline-block px-3 py-1 bg-blue-100 text-blue-600 text-xs font-bold rounded-full mb-4">寓教于乐</span>
              <h3 class="text-3xl font-bold text-dark mb-4 group-hover:text-blue-600 transition-colors">小小道童 · 互动绘本馆</h3>
              <p class="text-gray-600 text-lg mb-6 max-w-2xl">
                专为儿童设计的沉浸式阅读体验。将深奥的《道德经》哲理转化为生动有趣的寓言故事，配合 AI 朗读与自动翻页，让智慧的种子在孩子心中萌芽。
              </p>
              <div class="flex flex-wrap gap-4 justify-center md:justify-start">
                <span class="flex items-center text-sm text-gray-500 bg-white px-3 py-1.5 rounded-lg shadow-sm">
                  <i class="fas fa-book-reader text-blue-400 mr-2"></i> 经典寓言改编
                </span>
                <span class="flex items-center text-sm text-gray-500 bg-white px-3 py-1.5 rounded-lg shadow-sm">
                  <i class="fas fa-volume-up text-purple-400 mr-2"></i> 智能语音伴读
                </span>
                <span class="flex items-center text-sm text-gray-500 bg-white px-3 py-1.5 rounded-lg shadow-sm">
                  <i class="fas fa-magic text-yellow-400 mr-2"></i> 沉浸式翻页
                </span>
              </div>
            </div>
            
            <div class="flex-shrink-0 transform transition-transform duration-500 group-hover:scale-105 group-hover:rotate-2">
              <div class="w-48 h-64 bg-white rounded-lg shadow-xl border-4 border-white rotate-3 overflow-hidden relative">
                <div class="absolute inset-0 bg-blue-100 flex items-center justify-center">
                  <i class="fas fa-book-open text-6xl text-blue-300"></i>
                </div>
                <!-- 模拟书本封面 -->
                <div class="absolute inset-0 bg-[url('https://s.coze.cn/image/H5ri4Ya3YII/')] bg-cover bg-center opacity-80"></div>
                <div class="absolute bottom-4 left-0 w-full text-center bg-white/90 py-2">
                   <span class="font-bold text-primary font-serif">牙齿与舌头</span>
                </div>
              </div>
            </div>
          </div>
          
          <button class="absolute bottom-8 right-8 bg-blue-500 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-blue-600 transition-colors group-hover:scale-110 hidden md:flex items-center">
            开始阅读 <i class="fas fa-arrow-right ml-2"></i>
          </button>
        </div>
      </section>

      <!-- 知识图谱 -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold text-primary mb-6">核心概念图谱</h2>
        <div class="bg-white rounded-lg shadow-md p-1">
          <KnowledgeGraph />
        </div>
      </section>

      <!-- 当前学习路径详情 -->
      <section v-if="currentPath" id="pathDetails" class="mb-12 scroll-mt-24">
        <h2 class="text-2xl font-bold text-primary mb-6">当前学习路径</h2>
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h3 class="text-xl font-bold text-dark mb-2">{{ currentPath.name }}</h3>
              <p class="text-gray-600">{{ currentPath.description }}</p>
            </div>
            <div class="mt-4 md:mt-0 flex items-center">
              <div class="relative mr-4">
                <svg width="60" height="60" class="transform -rotate-90">
                  <circle class="text-gray-200" stroke="currentColor" stroke-width="4" fill="transparent" :r="ringRadius" :cx="ringCenter" :cy="ringCenter"></circle>
                  <circle :style="ringStyle" class="text-primary transition-all duration-1000 ease-out" stroke="currentColor" stroke-width="4" fill="transparent" :r="ringRadius" :cx="ringCenter" :cy="ringCenter"></circle>
                </svg>
                <div class="absolute inset-0 flex items-center justify-center">
                  <span class="text-sm font-bold text-primary">{{ currentPathProgress }}%</span>
                </div>
              </div>
              <div>
                <p class="text-sm text-gray-600">已完成</p>
                <p class="text-lg font-bold text-dark">{{ currentPathCompleted }} / {{ currentPathTotal }} 课</p>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <div 
              v-for="(lesson, idx) in currentPath.lessons" 
              :key="lesson.id" 
              :class="['flex flex-col md:flex-row md:items-center md:justify-between p-4 rounded-lg border transition-all duration-300', 
                lesson.completed ? 'bg-green-50 border-green-100' : 
                lesson.current ? 'bg-orange-50 border-orange-100 shadow-sm transform scale-[1.01]' : 'bg-white border-gray-100 opacity-70']"
            >
              <div class="flex items-center mb-3 md:mb-0">
                <div :class="['w-10 h-10 rounded-full flex items-center justify-center mr-4 flex-shrink-0', 
                  lesson.completed ? 'bg-green-100 text-green-600' : 
                  lesson.current ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400']">
                  <i v-if="lesson.completed" class="fas fa-check"></i>
                  <span v-else>{{ idx + 1 }}</span>
                </div>
                <div>
                  <h4 class="font-medium text-dark">{{ lesson.title }}</h4>
                  <div class="flex items-center mt-1 text-xs">
                    <span :class="['px-2 py-0.5 rounded-full mr-2', getDifficultyClass(lesson.difficulty)]">
                      {{ getDifficultyText(lesson.difficulty) }}
                    </span>
                    <span class="text-gray-500"><i class="far fa-clock mr-1"></i>{{ lesson.duration }}</span>
                  </div>
                </div>
              </div>
              <div class="md:ml-4">
                <button 
                  v-if="lesson.completed"
                  @click="openLessonDetail(lesson)"
                  class="px-4 py-1.5 rounded-md border border-gray-300 text-gray-600 text-sm hover:bg-gray-50 transition-colors w-full md:w-auto"
                >
                  查看详情
                </button>
                <button 
                  v-else-if="lesson.current"
                  @click="openLessonDetail(lesson)"
                  class="px-4 py-1.5 rounded-md bg-primary text-white text-sm hover:bg-opacity-90 transition-colors shadow-md w-full md:w-auto"
                >
                  开始学习
                </button>
                <button 
                  v-else
                  disabled
                  class="px-4 py-1.5 rounded-md border border-gray-200 text-gray-400 text-sm cursor-not-allowed w-full md:w-auto bg-gray-50"
                >
                  <i class="fas fa-lock mr-1"></i>未解锁
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 学习笔记区域 -->
      <section v-if="currentLesson" class="mb-12">
        <h2 class="text-2xl font-bold text-primary mb-6">学习笔记</h2>
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="mb-6">
            <h3 class="text-lg font-bold text-dark mb-4">{{ currentLesson.title }}</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 class="font-medium text-dark mb-2">原文</h4>
                <div class="bg-gray-50 p-4 rounded-lg text-sm leading-relaxed">
                  {{ currentLesson.originalText }}
                </div>
              </div>
              <div>
                <h4 class="font-medium text-dark mb-2">注释</h4>
                <div class="bg-blue-50 p-4 rounded-lg text-sm leading-relaxed">
                  {{ currentLesson.annotation }}
                </div>
              </div>
            </div>
            <div class="mt-4">
              <h4 class="font-medium text-dark mb-2">讲解</h4>
              <div class="bg-green-50 p-4 rounded-lg text-sm leading-relaxed">
                {{ currentLesson.explanation }}
              </div>
            </div>
          </div>

          <!-- 笔记编辑器 -->
          <div class="border-t pt-6">
            <h4 class="font-medium text-dark mb-4">记录学习笔记</h4>
            <textarea 
              v-model="newNoteContent"
              class="w-full p-3 border rounded-lg mb-3"
              rows="4"
              placeholder="记录您的感悟和理解..."
            ></textarea>
            <div class="flex justify-between items-center">
              <div class="flex gap-2">
                <input 
                  v-model="newNoteTags"
                  type="text"
                  class="px-3 py-1 border rounded text-sm"
                  placeholder="添加标签（用逗号分隔）"
                >
                <label class="flex items-center text-sm text-gray-600">
                  <input v-model="newNoteIsPublic" type="checkbox" class="mr-2">
                  公开分享
                </label>
              </div>
              <button 
                @click="saveNote"
                class="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
                :disabled="!newNoteContent.trim()"
              >
                保存笔记
              </button>
            </div>
          </div>

          <!-- 已有笔记列表 -->
          <div v-if="lessonNotes.length > 0" class="mt-6">
            <h4 class="font-medium text-dark mb-4">已有笔记</h4>
            <div class="space-y-4">
              <div 
                v-for="note in lessonNotes" 
                :key="note.id"
                class="bg-gray-50 p-4 rounded-lg border"
              >
                <div class="flex justify-between items-start mb-2">
                  <span class="text-sm text-gray-500">{{ formatDate(note.createdAt) }}</span>
                  <div class="flex gap-2">
                    <button 
                      @click="editNote(note)"
                      class="text-blue-500 hover:text-blue-700 text-sm"
                    >
                      编辑
                    </button>
                    <button 
                      @click="deleteNote(note.id)"
                      class="text-red-500 hover:text-red-700 text-sm"
                    >
                      删除
                    </button>
                  </div>
                </div>
                <p class="text-dark">{{ note.content }}</p>
                <div v-if="note.tags.length > 0" class="mt-2 flex gap-1">
                  <span 
                    v-for="tag in note.tags" 
                    :key="tag"
                    class="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 学习成就 -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold text-primary mb-6">学习成就</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div v-for="achievement in achievements" :key="achievement.id" class="text-center group">
            <div :class="['w-20 h-20 mx-auto mb-3 rounded-full flex items-center justify-center transition-all duration-500 transform group-hover:scale-110', 
              achievement.unlocked ? achievement.bgClass : 'bg-gray-100']">
              <i :class="['text-3xl transition-colors duration-300', achievement.icon, achievement.unlocked ? achievement.textClass : 'text-gray-300']"></i>
            </div>
            <h4 :class="['font-bold mb-1', achievement.unlocked ? 'text-dark' : 'text-gray-400']">{{ achievement.title }}</h4>
            <p class="text-sm text-gray-500">{{ achievement.desc }}</p>
          </div>
        </div>
      </section>

      <!-- 学习建议 -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold text-primary mb-6">学习建议</h2>
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 class="text-lg font-bold text-dark mb-4 border-b border-gray-100 pb-2">学习方法</h3>
              <ul class="space-y-4">
                <li class="flex items-start">
                  <div class="w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center mr-3 flex-shrink-0">
                    <i class="fas fa-lightbulb"></i>
                  </div>
                  <div>
                    <h4 class="font-medium text-dark">每日一读</h4>
                    <p class="text-sm text-gray-600">每天花15-30分钟阅读一章，持之以恒</p>
                  </div>
                </li>
                <li class="flex items-start">
                  <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3 flex-shrink-0">
                    <i class="fas fa-pencil-alt"></i>
                  </div>
                  <div>
                    <h4 class="font-medium text-dark">记录感悟</h4>
                    <p class="text-sm text-gray-600">写下自己的理解和感悟，加深记忆</p>
                  </div>
                </li>
                <li class="flex items-start">
                  <div class="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3 flex-shrink-0">
                    <i class="fas fa-comments"></i>
                  </div>
                  <div>
                    <h4 class="font-medium text-dark">交流讨论</h4>
                    <p class="text-sm text-gray-600">与他人分享见解，多角度理解</p>
                  </div>
                </li>
              </ul>
            </div>
            <div>
              <h3 class="text-lg font-bold text-dark mb-4 border-b border-gray-100 pb-2">推荐资源</h3>
              <ul class="space-y-4">
                <li class="flex items-start">
                  <div class="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center mr-3 flex-shrink-0">
                    <i class="fas fa-book"></i>
                  </div>
                  <div>
                    <h4 class="font-medium text-dark">《道德经》注解</h4>
                    <p class="text-sm text-gray-600">阅读多种注解版本，对比理解</p>
                  </div>
                </li>
                <li class="flex items-start">
                  <div class="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mr-3 flex-shrink-0">
                    <i class="fas fa-video"></i>
                  </div>
                  <div>
                    <h4 class="font-medium text-dark">视频讲解</h4>
                    <p class="text-sm text-gray-600">观看专家讲解视频，加深理解</p>
                  </div>
                </li>
                <li class="flex items-start">
                  <div class="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mr-3 flex-shrink-0">
                    <i class="fas fa-users"></i>
                  </div>
                  <div>
                    <h4 class="font-medium text-dark">学习小组</h4>
                    <p class="text-sm text-gray-600">加入学习小组，共同进步</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- 题目模态框 -->
    <QuizModal 
      v-if="showQuiz" 
      :title="quizLesson?.title || ''"
      :question="quizQuestion"
      :isReview="isReviewMode"
      @close="closeQuiz"
      @complete="completeLesson"
    />

    <!-- 随机奇遇模态框 -->
    <RandomEventModal
      v-if="showEventModal"
      :type="eventData.type"
      :description="eventData.description"
      :xp="eventData.xp"
      @close="showEventModal = false"
    />

    <!-- 境界升级弹窗 -->
    <div v-if="showUpgradeModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div class="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center transform animate-bounce-in relative overflow-hidden border-2 border-accent">
        <!-- 光效背景 -->
        <div class="absolute inset-0 bg-gradient-to-br from-yellow-100/50 to-transparent pointer-events-none"></div>
        
        <div class="w-24 h-24 mx-auto bg-primary text-white rounded-full flex items-center justify-center text-4xl mb-4 shadow-lg relative z-10 animate-pulse">
          <i :class="currentRealm.icon"></i>
        </div>
        
        <h2 class="text-2xl font-bold text-primary mb-2 relative z-10">境界突破！</h2>
        <p class="text-dark mb-6 relative z-10">
          恭喜道友，修为已达 <span class="text-accent font-bold text-xl">{{ currentRealm.name }}</span> 之境！
        </p>
        <p class="text-sm text-gray-500 mb-6 italic relative z-10">"{{ currentRealm.desc }}"</p>
        
        <button 
          @click="cultivationStore.closeUpgradeModal()"
          class="px-8 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors shadow-md relative z-10"
        >
          善哉
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import QuizModal from '@/components/learning/QuizModal.vue'
import RandomEventModal from '@/components/learning/RandomEventModal.vue'
import KnowledgeGraph from '@/components/graph/KnowledgeGraph.vue'
import { useCultivationStore } from '@/stores/cultivation'
import { storeToRefs } from 'pinia'
import { LearningPathService, type Lesson, type LearningPath } from '@/services/learningPathService'
import { NoteService, type LearningNote } from '@/services/noteService'
import { LearningAnalyticsService, type LearningStats } from '@/services/learningAnalyticsService'

// 类型定义
type PathKey = 'beginner' | 'intermediate' | 'advanced'
type Difficulty = 'easy' | 'medium' | 'hard'

// 状态
const currentPathKey = ref<PathKey | null>(null)
const currentLesson = ref<Lesson | null>(null)
const showQuiz = ref(false)
const quizLesson = ref<Lesson | null>(null)
const isReviewMode = ref(false)

// 笔记相关状态
const newNoteContent = ref('')
const newNoteTags = ref('')
const newNoteIsPublic = ref(false)
const lessonNotes = ref<LearningNote[]>([])

// 学习统计
const learningStats = ref<LearningStats>({
  userId: 'current-user',
  totalStudyTime: 0,
  completedLessons: 0,
  totalQuizzes: 0,
  averageQuizScore: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastStudyDate: '',
  favoriteChapter: '',
  learningGoals: []
})

// 随机奇遇状态
const showEventModal = ref(false)
const eventData = ref({
  type: 'epiphany' as 'epiphany' | 'guest' | 'relic',
  description: '',
  xp: 0
})

const cultivationStore = useCultivationStore()
const { addExp } = cultivationStore
const { showUpgradeModal, currentRealm } = storeToRefs(cultivationStore)

// 学习路径数据
const learningPaths = ref<LearningPath[]>(LearningPathService.getAllPaths())

// 计算属性
const beginnerProgress = computed(() => {
  const path = learningPaths.value.find(p => p.id === 'beginner')
  return path ? path.progress : 0
})

const intermediateProgress = computed(() => {
  const path = learningPaths.value.find(p => p.id === 'intermediate')
  return path ? path.progress : 0
})

const advancedProgress = computed(() => {
  const path = learningPaths.value.find(p => p.id === 'advanced')
  return path ? path.progress : 0
})

const currentPath = computed(() => {
  if (!currentPathKey.value) return null
  return learningPaths.value.find(p => p.id === currentPathKey.value)
})

const currentPathTotal = computed(() => currentPath.value?.totalLessons || 0)
const currentPathCompleted = computed(() => currentPath.value?.completedLessons || 0)
const currentPathProgress = computed(() => currentPathTotal.value ? Math.round((currentPathCompleted.value / currentPathTotal.value) * 100) : 0)

const quizQuestion = computed(() => {
  if (!quizLesson.value) return null
  
  // 使用课程中的测验题目
  const lesson = quizLesson.value
  if (lesson.quiz && lesson.quiz.length > 0) {
    return lesson.quiz[0] // 使用第一道题目
  }
  
  // 如果没有题目，返回默认题目
  return {
    id: 'default',
    question: `关于 ${lesson.title} 的核心思想是？`,
    options: [
      { id: 'a', text: '顺应自然' },
      { id: 'b', text: '人定胜天' },
      { id: 'c', text: '积极进取' },
      { id: 'd', text: '放弃一切' }
    ],
    correctAnswer: 'a',
    explanation: '《道德经》的核心思想之一就是"道法自然"，强调顺应自然规律。'
  }
})

// 进度环样式
const ringRadius = 26
const ringCenter = 30
const circumference = 2 * Math.PI * ringRadius
const ringStyle = computed(() => ({
  strokeDasharray: `${circumference} ${circumference}`,
  strokeDashoffset: `${circumference - (currentPathProgress.value / 100) * circumference}`
}))

// 成就数据
const achievements = computed(() => {
  const totalCompleted = learningStats.value.completedLessons
  
  return [
    { 
      id: 'beginner', 
      title: '初学者', 
      desc: '完成1章学习', 
      icon: 'fas fa-trophy', 
      unlocked: totalCompleted >= 1,
      bgClass: 'bg-yellow-100',
      textClass: 'text-yellow-600'
    },
    { 
      id: 'thinker', 
      title: '思考者', 
      desc: '完成10章学习', 
      icon: 'fas fa-medal', 
      unlocked: totalCompleted >= 10,
      bgClass: 'bg-blue-100',
      textClass: 'text-blue-500'
    },
    { 
      id: 'sage', 
      title: '智者', 
      desc: '完成40章学习', 
      icon: 'fas fa-crown', 
      unlocked: totalCompleted >= 40,
      bgClass: 'bg-purple-100',
      textClass: 'text-purple-500'
    },
    { 
      id: 'master', 
      title: '大师', 
      desc: '完成81章学习', 
      icon: 'fas fa-star', 
      unlocked: totalCompleted >= 81,
      bgClass: 'bg-red-100',
      textClass: 'text-red-500'
    }
  ]
})

// 方法
const selectPath = (key: PathKey) => {
  currentPathKey.value = key
  currentLesson.value = null
  nextTick(() => {
    const el = document.getElementById('pathDetails')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  })
}

const getDifficultyClass = (diff: Difficulty) => {
  switch (diff) {
    case 'easy': return 'bg-green-100 text-green-700'
    case 'medium': return 'bg-orange-100 text-orange-700'
    case 'hard': return 'bg-red-100 text-red-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

const getDifficultyText = (diff: Difficulty) => {
  switch (diff) {
    case 'easy': return '初级'
    case 'medium': return '中级'
    case 'hard': return '高级'
    default: return '未知'
  }
}

const openLessonDetail = (lesson: Lesson) => {
  currentLesson.value = lesson
  loadLessonNotes(lesson.id)
  
  // 记录学习会话
  LearningAnalyticsService.recordStudySession('current-user', lesson.id, 15, false)
  
  // 更新学习统计
  updateLearningStats()
}

const openQuiz = (lesson: Lesson, isReview: boolean) => {
  quizLesson.value = lesson
  isReviewMode.value = isReview
  showQuiz.value = true
}

const closeQuiz = () => {
  showQuiz.value = false
  quizLesson.value = null
}

const completeLesson = (quizScore?: number) => {
  if (!quizLesson.value || !currentPath.value || isReviewMode.value) {
    closeQuiz()
    return
  }

  // 标记课程完成
  LearningPathService.markLessonComplete('current-user', quizLesson.value.id)
  
  // 记录学习会话（包含测验分数）
  LearningAnalyticsService.recordStudySession('current-user', quizLesson.value.id, 20, true, quizScore)
  
  // 更新学习统计
  updateLearningStats()
  
  // 增加经验值
  const exp = quizScore && quizScore >= 80 ? 60 : 30
  addExp(exp)
  
  // 触发随机奇遇 (30% 概率)
  if (Math.random() < 0.3) {
    triggerRandomEvent()
  }
  
  closeQuiz()
}

const triggerRandomEvent = () => {
  const events = [
    { type: 'epiphany', desc: '忽觉心中豁然开朗，对道法自然有了更深的领悟。', xp: 30 },
    { type: 'guest', desc: '偶遇一位游方道人，相谈甚欢，获赠修行心得。', xp: 50 },
    { type: 'relic', desc: '在古籍夹层中发现一张残破的丹方，记载着养生秘诀。', xp: 40 }
  ]
  
  const randomEvent = events[Math.floor(Math.random() * events.length)]
  eventData.value = {
    type: randomEvent.type as any,
    description: randomEvent.desc,
    xp: randomEvent.xp
  }
  
  // 延迟显示，以免和升级弹窗冲突
  setTimeout(() => {
    showEventModal.value = true
    addExp(randomEvent.xp, '随机奇遇')
  }, 1000)
}

// 笔记相关方法
const loadLessonNotes = (lessonId: number) => {
  lessonNotes.value = NoteService.getNotesByLesson('current-user', lessonId)
}

const saveNote = () => {
  if (!currentLesson.value || !newNoteContent.value.trim()) return
  
  const tags = newNoteTags.value.split(',').map(tag => tag.trim()).filter(tag => tag)
  
  NoteService.createNote(
    'current-user',
    currentLesson.value.id,
    `关于${currentLesson.value.title}的笔记`,
    newNoteContent.value,
    tags,
    newNoteIsPublic.value
  )
  
  // 清空输入
  newNoteContent.value = ''
  newNoteTags.value = ''
  newNoteIsPublic.value = false
  
  // 重新加载笔记
  loadLessonNotes(currentLesson.value.id)
}

const editNote = (note: LearningNote) => {
  newNoteContent.value = note.content
  newNoteTags.value = note.tags.join(', ')
  newNoteIsPublic.value = note.isPublic
  
  // 删除原笔记
  NoteService.deleteNote('current-user', note.id)
}

const deleteNote = (noteId: string) => {
  if (confirm('确定要删除这条笔记吗？')) {
    NoteService.deleteNote('current-user', noteId)
    loadLessonNotes(currentLesson.value!.id)
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

// 更新学习统计
const updateLearningStats = () => {
  learningStats.value = LearningAnalyticsService.getUserStats('current-user')
}

onMounted(() => {
  // 加载学习统计
  updateLearningStats()
  
  // 如果有保存的路径选择，恢复它
  const savedPath = localStorage.getItem('currentLearningPath')
  if (savedPath && ['beginner', 'intermediate', 'advanced'].includes(savedPath)) {
    currentPathKey.value = savedPath as PathKey
  }
})
</script>

<style scoped>
/* 禅模式适配 */
:global(html.zen-mode) .bg-green-100,
:global(html.zen-mode) .bg-orange-100,
:global(html.zen-mode) .bg-red-100,
:global(html.zen-mode) .bg-yellow-100,
:global(html.zen-mode) .bg-blue-100,
:global(html.zen-mode) .bg-purple-100 {
  background-color: #3f3f46 !important;
  color: #d4b483 !important;
}

:global(html.zen-mode) .text-green-600,
:global(html.zen-mode) .text-orange-600,
:global(html.zen-mode) .text-red-600,
:global(html.zen-mode) .text-yellow-600,
:global(html.zen-mode) .text-blue-600,
:global(html.zen-mode) .text-purple-600 {
  color: #d4b483 !important;
}
</style>
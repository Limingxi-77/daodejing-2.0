<template>
  <div class="tts-container">
    <!-- 头部 -->
    <header class="tts-header">
      <h1>道德经语音合成器</h1>
      <p class="subtitle">DeepSeek × CosyVoice 智能语音合成</p>
    </header>

    <!-- 主容器 -->
    <main class="tts-main">
      <!-- 左侧：控制面板 -->
      <aside class="tts-control-panel">
        <!-- 模式选择 -->
        <section class="tts-panel-section">
          <h3>合成模式</h3>
          <div class="tts-mode-tabs">
            <button 
              v-for="mode in modes" 
              :key="mode.id"
              @click="currentMode = mode.id"
              :class="['tts-mode-btn', { active: currentMode === mode.id }]"
            >
              {{ mode.name }}
            </button>
          </div>
        </section>

        <!-- 章节选择 -->
        <section class="tts-panel-section" v-if="currentMode !== 'custom'">
          <h3>选择章节</h3>
          <select v-model="selectedChapter" class="tts-select-box">
            <option value="">请选择章节...</option>
            <option v-for="chapter in chapters" :key="chapter.id" :value="chapter.id">
              {{ chapter.title }}
            </option>
          </select>
          <button @click="randomChapter" class="tts-btn-secondary">随机选择</button>
        </section>

        <!-- 解读风格 -->
        <section class="tts-panel-section" v-if="currentMode === 'interpret'">
          <h3>解读风格</h3>
          <select v-model="interpretStyle" class="tts-select-box">
            <option value="simple">通俗易懂</option>
            <option value="detailed">详细解读</option>
            <option value="profound">深度哲学</option>
          </select>
        </section>

        <!-- 自定义内容 -->
        <section class="tts-panel-section" v-if="currentMode === 'custom'">
          <h3>自定义内容</h3>
          <textarea 
            v-model="customText" 
            class="tts-text-input" 
            placeholder="请输入您想要合成语音的内容..."
          ></textarea>
          <div class="tts-char-count">
            <span>{{ customText.length }}</span> / 5000 字
          </div>
        </section>

        <!-- 语音配置 -->
        <section class="tts-panel-section">
          <h3>语音配置</h3>
          
          <div class="tts-config-item">
            <label>选择音色</label>
            <select v-model="voiceConfig.voice" class="tts-select-box">
              <option v-for="voice in voiceOptions" :key="voice.id" :value="voice.id">
                {{ voice.name }} - {{ voice.description }}
              </option>
            </select>
          </div>

          <div class="tts-config-item">
            <label>语速</label>
            <select v-model="voiceConfig.speed" class="tts-select-box">
              <option v-for="speed in speedOptions" :key="speed.value" :value="speed.value">
                {{ speed.name }} - {{ speed.description }}
              </option>
            </select>
          </div>

          <div class="tts-config-item">
            <label>情感</label>
            <select v-model="voiceConfig.emotion" class="tts-select-box">
              <option v-for="emotion in emotionOptions" :key="emotion.id" :value="emotion.id">
                {{ emotion.name }} - {{ emotion.description }}
              </option>
            </select>
          </div>

          <div class="tts-config-item">
            <label>音量</label>
            <input 
              type="range" 
              v-model.number="voiceConfig.volume" 
              min="0" 
              max="100" 
              class="tts-slider"
            >
            <span class="tts-volume-value">{{ voiceConfig.volume }}%</span>
          </div>
        </section>

        <!-- 操作按钮 -->
        <section class="tts-panel-section tts-actions">
          <button 
            @click="generateSpeech" 
            :disabled="isGenerating"
            class="tts-btn-primary"
          >
            <span class="tts-btn-icon">🎵</span>
            {{ isGenerating ? '生成中...' : '生成语音' }}
          </button>
          <button 
            v-if="isGenerating"
            @click="stopGeneration"
            class="tts-btn-danger"
          >
            <span class="tts-btn-icon">⏹</span>
            停止生成
          </button>
        </section>
      </aside>

      <!-- 右侧：内容展示区 -->
      <section class="tts-content-area">
        <!-- 文本显示区 -->
        <div class="tts-card">
          <div class="tts-card-header">
            <h3>文本内容</h3>
            <div class="tts-header-actions">
              <button @click="editText" class="tts-btn-icon-only" title="编辑">✏️</button>
              <button @click="copyText" class="tts-btn-icon-only" title="复制">📋</button>
            </div>
          </div>
          <div class="tts-card-body">
            <textarea 
              v-model="displayText" 
              class="tts-content-textarea" 
              :readonly="!isEditing"
            ></textarea>
          </div>
        </div>

        <!-- 音频播放器 -->
        <div class="tts-card">
          <div class="tts-card-header">
            <h3>语音播放</h3>
            <span :class="['tts-status-badge', audioStatus]">{{ statusText }}</span>
          </div>
          <div class="tts-card-body">
            <!-- 音频可视化 -->
            <div class="tts-audio-visualizer">
              <canvas ref="visualizerCanvas"></canvas>
            </div>
            
            <!-- 播放控制 -->
            <div class="tts-player-controls">
              <button 
                @click="togglePlay" 
                :disabled="!audioUrl"
                class="tts-control-btn"
              >
                <span v-if="!isPlaying">▶️</span>
                <span v-else>⏸️</span>
              </button>
              <button 
                @click="stopPlay" 
                :disabled="!audioUrl"
                class="tts-control-btn"
              >
                <span>⏹️</span>
              </button>
              
              <div class="tts-progress-container">
                <span>{{ formatTime(currentTime) }}</span>
                <div class="tts-progress-bar">
                  <div 
                    class="tts-progress-fill" 
                    :style="{ width: progressPercent + '%' }"
                  ></div>
                  <input 
                    type="range" 
                    v-model.number="currentTime"
                    :max="duration"
                    @input="seekAudio"
                    class="tts-progress-slider"
                  >
                </div>
                <span>{{ formatTime(duration) }}</span>
              </div>
            </div>

            <!-- 下载按钮 -->
            <button 
              @click="downloadAudio" 
              :disabled="!audioBlob"
              class="tts-btn-secondary"
            >
              <span class="tts-btn-icon">💾</span>
              下载音频
            </button>
          </div>
        </div>

        <!-- 生成历史 -->
        <div class="tts-card">
          <div class="tts-card-header">
            <h3>生成历史</h3>
            <button @click="clearHistory" class="tts-btn-text">清空历史</button>
          </div>
          <div class="tts-card-body">
            <ul class="tts-history-list">
              <li 
                v-for="(item, index) in history" 
                :key="index"
                class="tts-history-item"
              >
                <div class="tts-history-info">
                  <div class="tts-history-title">{{ item.title }}</div>
                  <div class="tts-history-meta">{{ item.time }}</div>
                </div>
                <div class="tts-history-actions">
                  <button @click="playHistory(item)" class="tts-history-btn">▶️</button>
                  <button @click="downloadHistory(item)" class="tts-history-btn">💾</button>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </main>

    <!-- 加载遮罩 -->
    <div v-if="isGenerating" class="tts-loading-overlay">
      <div class="tts-loading-content">
        <div class="tts-spinner"></div>
        <p>{{ loadingText }}</p>
        <div class="tts-progress-container">
          <div class="tts-progress-bar-fill" :style="{ width: generationProgress + '%' }"></div>
        </div>
      </div>
    </div>

    <!-- 提示消息 -->
    <div v-if="toastMessage" class="tts-toast">
      {{ toastMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useTTS } from '@/composables/useTTS'
import { DeepSeekService, defaultDeepSeekConfig } from '@/services/deepseekService'

// 模式选项
const modes = [
  { id: 'original', name: '原文朗读' },
  { id: 'interpret', name: 'AI解读' },
  { id: 'meditation', name: '冥想引导' },
  { id: 'custom', name: '自定义内容' }
]

// 章节数据（简化版）
const chapters = ref([
  { id: 1, title: '第一章：道可道，非常道', content: '道可道，非常道；名可名，非常名。' },
  { id: 2, title: '第二章：天下皆知美之为美', content: '天下皆知美之为美，斯恶已；皆知善之为善，斯不善已。' },
  { id: 3, title: '第三章：不尚贤', content: '不尚贤，使民不争；不贵难得之货，使民不为盗。' }
])

// 状态
const currentMode = ref('original')
const selectedChapter = ref('')
const interpretStyle = ref('simple')
const customText = ref('')
const displayText = ref('')
const isEditing = ref(false)
const isGenerating = ref(false)
const loadingText = ref('正在生成...')
const generationProgress = ref(0)
const toastMessage = ref('')

// 语音配置
const voiceConfig = ref({
  voice: 'longxiaochun',
  speed: 1.0,
  emotion: 'neutral',
  volume: 80
})

// TTS 服务
const { 
  voiceOptions, 
  emotionOptions, 
  speedOptions,
  isPlaying,
  speak,
  stop 
} = useTTS({
  defaultVoice: voiceConfig.value.voice,
  defaultSpeed: voiceConfig.value.speed,
  defaultEmotion: voiceConfig.value.emotion
})

// DeepSeek 服务
const deepseekService = new DeepSeekService(defaultDeepSeekConfig)

// 音频相关
const audioUrl = ref('')
const audioBlob = ref<Blob | null>(null)
const currentTime = ref(0)
const duration = ref(0)
const audioStatus = ref('waiting')
const visualizerCanvas = ref<HTMLCanvasElement | null>(null)

// 历史记录
const history = ref<Array<{title: string, time: string, blob: Blob}>>([])

// 计算属性
const progressPercent = computed(() => {
  if (duration.value === 0) return 0
  return (currentTime.value / duration.value) * 100
})

const statusText = computed(() => {
  const map: Record<string, string> = {
    waiting: '等待生成',
    generating: '生成中...',
    ready: '准备就绪',
    playing: '播放中'
  }
  return map[audioStatus.value] || '等待生成'
})

// 方法
const randomChapter = () => {
  const randomIndex = Math.floor(Math.random() * chapters.value.length)
  selectedChapter.value = chapters.value[randomIndex].id.toString()
}

const generateSpeech = async () => {
  if (!displayText.value.trim()) {
    showToast('请先生成或输入文本内容')
    return
  }

  isGenerating.value = true
  audioStatus.value = 'generating'
  loadingText.value = '正在加载语音...'

  try {
    // 加载预生成的语音文件 video.mp3
    const response = await fetch('/video.mp3')
    if (!response.ok) {
      throw new Error('语音文件加载失败')
    }

    const blob = await response.blob()
    audioBlob.value = blob
    audioUrl.value = URL.createObjectURL(blob)
    audioStatus.value = 'ready'

    // 添加到历史
    history.value.unshift({
      title: `道德经解读语音 ${new Date().toLocaleString()}`,
      time: new Date().toLocaleString(),
      blob: blob
    })

    showToast('语音加载成功！开始播放...')

    // 自动播放音频
    await playAudio()
  } catch (error) {
    console.error('加载失败:', error)
    showToast('语音加载失败，请检查文件是否存在')
  } finally {
    isGenerating.value = false
  }
}

// 播放音频的独立方法
const playAudio = async () => {
  if (!audioUrl.value) return

  try {
    const audio = new Audio(audioUrl.value)

    // 监听音频事件
    audio.addEventListener('loadedmetadata', () => {
      duration.value = audio.duration
    })

    audio.addEventListener('timeupdate', () => {
      currentTime.value = audio.currentTime
    })

    audio.addEventListener('ended', () => {
      isPlaying.value = false
      audioStatus.value = 'ready'
      currentTime.value = 0
    })

    audio.addEventListener('play', () => {
      isPlaying.value = true
      audioStatus.value = 'playing'
    })

    audio.addEventListener('pause', () => {
      isPlaying.value = false
      audioStatus.value = 'ready'
    })

    // 设置音量
    audio.volume = voiceConfig.value.volume / 100

    // 开始播放
    await audio.play()

    // 保存音频实例以便控制
    ;(window as any).currentAudio = audio
  } catch (error) {
    console.error('播放失败:', error)
    showToast('音频播放失败')
  }
}

const stopGeneration = () => {
  isGenerating.value = false
  stop()
}

const togglePlay = () => {
  const audio = (window as any).currentAudio
  if (!audio) {
    // 如果没有音频实例，创建并播放
    playAudio()
    return
  }

  if (isPlaying.value) {
    audio.pause()
  } else {
    audio.play()
  }
}

const stopPlay = () => {
  const audio = (window as any).currentAudio
  if (audio) {
    audio.pause()
    audio.currentTime = 0
  }
  isPlaying.value = false
  audioStatus.value = 'ready'
  currentTime.value = 0
}

const seekAudio = () => {
  const audio = (window as any).currentAudio
  if (audio) {
    audio.currentTime = currentTime.value
  }
}

const downloadAudio = () => {
  if (!audioBlob.value) return
  
  const url = URL.createObjectURL(audioBlob.value)
  const a = document.createElement('a')
  a.href = url
  a.download = `道德经语音_${new Date().getTime()}.mp3`
  a.click()
  URL.revokeObjectURL(url)
}

const editText = () => {
  isEditing.value = !isEditing.value
}

const copyText = () => {
  navigator.clipboard.writeText(displayText.value)
  showToast('文本已复制')
}

const clearHistory = () => {
  history.value = []
  showToast('历史记录已清空')
}

const playHistory = (item: any) => {
  const url = URL.createObjectURL(item.blob)
  const audio = new Audio(url)
  audio.play()
}

const downloadHistory = (item: any) => {
  const url = URL.createObjectURL(item.blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `道德经语音_${new Date().getTime()}.mp3`
  a.click()
  URL.revokeObjectURL(url)
}

const showToast = (message: string) => {
  toastMessage.value = message
  setTimeout(() => {
    toastMessage.value = ''
  }, 3000)
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 监听模式变化，更新文本
watch([currentMode, selectedChapter, interpretStyle], async () => {
  if (currentMode.value === 'custom') {
    displayText.value = customText.value
    return
  }

  if (!selectedChapter.value) {
    displayText.value = ''
    return
  }

  const chapter = chapters.value.find(c => c.id.toString() === selectedChapter.value)
  if (!chapter) return

  if (currentMode.value === 'original') {
    displayText.value = chapter.content
  } else if (currentMode.value === 'interpret') {
    // 调用 DeepSeek 生成解读
    try {
      loadingText.value = '正在生成解读...'
      isGenerating.value = true
      const interpretation = await deepseekService.generateInterpretation(
        parseInt(selectedChapter.value), 
        interpretStyle.value as any
      )
      displayText.value = interpretation
    } catch (error) {
      console.error('生成解读失败:', error)
      displayText.value = '生成解读失败，请重试'
    } finally {
      isGenerating.value = false
    }
  } else if (currentMode.value === 'meditation') {
    // 生成冥想引导
    try {
      loadingText.value = '正在生成冥想引导...'
      isGenerating.value = true
      const meditation = await deepseekService.generateMeditationGuide(
        parseInt(selectedChapter.value)
      )
      displayText.value = meditation
    } catch (error) {
      console.error('生成冥想引导失败:', error)
      displayText.value = '生成冥想引导失败，请重试'
    } finally {
      isGenerating.value = false
    }
  }
})

// 监听自定义文本变化
watch(customText, (newVal) => {
  if (currentMode.value === 'custom') {
    displayText.value = newVal
  }
})

onMounted(() => {
  // 初始化可视化画布
  if (visualizerCanvas.value) {
    const canvas = visualizerCanvas.value
    const ctx = canvas.getContext('2d')
    if (ctx) {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
  }
})
</script>

<style scoped>
/* ============================================
   道德经语音合成器 - 样式表
   ============================================ */

.tts-container {
  min-height: 100vh;
  background: #f5f5f0;
}

/* 头部样式 */
.tts-header {
  background: linear-gradient(135deg, #2c5f2d 0%, #4a7c4b 100%);
  color: white;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tts-header h1 {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  letter-spacing: 2px;
}

.subtitle {
  font-size: 0.9rem;
  opacity: 0.9;
}

/* 主容器 */
.tts-main {
  display: flex;
  max-width: 1400px;
  margin: 2rem auto;
  padding: 0 1rem;
  gap: 2rem;
}

/* 控制面板 */
.tts-control-panel {
  width: 320px;
  flex-shrink: 0;
}

.tts-panel-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tts-panel-section h3 {
  font-size: 1rem;
  color: #2c5f2d;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #97bc62;
}

/* 模式标签 */
.tts-mode-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tts-mode-btn {
  flex: 1;
  min-width: 70px;
  padding: 0.6rem 0.8rem;
  border: 2px solid #e0e0d5;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.3s ease;
}

.tts-mode-btn:hover {
  border-color: #4a7c4b;
  color: #2c5f2d;
}

.tts-mode-btn.active {
  background: #2c5f2d;
  border-color: #2c5f2d;
  color: white;
}

/* 表单元素 */
.tts-select-box {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0d5;
  border-radius: 8px;
  font-size: 0.9rem;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 0.5rem;
}

.tts-select-box:focus {
  outline: none;
  border-color: #2c5f2d;
}

.tts-text-input {
  width: 100%;
  min-height: 120px;
  padding: 0.75rem;
  border: 2px solid #e0e0d5;
  border-radius: 8px;
  font-size: 0.9rem;
  resize: vertical;
  font-family: inherit;
  transition: all 0.3s ease;
}

.tts-text-input:focus {
  outline: none;
  border-color: #2c5f2d;
}

.tts-char-count {
  text-align: right;
  font-size: 0.8rem;
  color: #999;
  margin-top: 0.5rem;
}

.tts-config-item {
  margin-bottom: 1rem;
}

.tts-config-item label {
  display: block;
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.4rem;
}

.tts-slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #e0e0d5;
  outline: none;
  -webkit-appearance: none;
}

.tts-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #2c5f2d;
  cursor: pointer;
}

.tts-volume-value {
  margin-left: 0.5rem;
  font-size: 0.85rem;
  color: #666;
}

/* 按钮样式 */
.tts-btn-primary,
.tts-btn-secondary,
.tts-btn-danger {
  width: 100%;
  padding: 0.9rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.tts-btn-primary {
  background: #2c5f2d;
  color: white;
}

.tts-btn-primary:hover:not(:disabled) {
  background: #4a7c4b;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.tts-btn-secondary {
  background: #97bc62;
  color: #1a3a1b;
}

.tts-btn-secondary:hover:not(:disabled) {
  background: #85a854;
}

.tts-btn-danger {
  background: #dc3545;
  color: white;
  margin-top: 0.5rem;
}

.tts-btn-danger:hover:not(:disabled) {
  background: #c82333;
}

.tts-btn-icon {
  font-size: 1.1rem;
}

.tts-btn-icon-only {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.3rem;
  opacity: 0.6;
  transition: all 0.3s ease;
}

.tts-btn-icon-only:hover {
  opacity: 1;
}

.tts-btn-text {
  background: none;
  border: none;
  color: #2c5f2d;
  cursor: pointer;
  font-size: 0.85rem;
  text-decoration: underline;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 内容区域 */
.tts-content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.tts-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.tts-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: linear-gradient(to right, #f8f9f5, #ffffff);
  border-bottom: 1px solid #e0e0d5;
}

.tts-card-header h3 {
  font-size: 1.1rem;
  color: #2c5f2d;
}

.tts-header-actions {
  display: flex;
  gap: 0.5rem;
}

.tts-card-body {
  padding: 1.5rem;
}

.tts-content-textarea {
  width: 100%;
  min-height: 200px;
  padding: 1rem;
  border: 1px solid #e0e0d5;
  border-radius: 8px;
  font-size: 1rem;
  line-height: 1.8;
  resize: vertical;
  font-family: 'Noto Serif SC', 'SimSun', serif;
  background: #fafaf8;
}

.tts-content-textarea:focus {
  outline: none;
  border-color: #4a7c4b;
}

/* 音频播放器 */
.tts-audio-visualizer {
  height: 120px;
  background: linear-gradient(to bottom, #f0f4ec, #e8ede3);
  border-radius: 8px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.tts-audio-visualizer canvas {
  width: 100%;
  height: 100%;
}

.tts-player-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.tts-control-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: #2c5f2d;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.tts-control-btn:hover:not(:disabled) {
  background: #4a7c4b;
  transform: scale(1.05);
}

.tts-control-btn:disabled {
  background: #999;
  cursor: not-allowed;
}

.tts-progress-container {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.tts-progress-bar {
  flex: 1;
  height: 6px;
  background: #e0e0d5;
  border-radius: 3px;
  position: relative;
  cursor: pointer;
}

.tts-progress-fill {
  height: 100%;
  background: #2c5f2d;
  border-radius: 3px;
  transition: width 0.1s linear;
}

.tts-progress-slider {
  position: absolute;
  top: -7px;
  left: 0;
  width: 100%;
  height: 20px;
  opacity: 0;
  cursor: pointer;
}

.tts-status-badge {
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  background: #e0e0d5;
  color: #666;
}

.tts-status-badge.generating {
  background: #fff3cd;
  color: #856404;
}

.tts-status-badge.ready {
  background: #d4edda;
  color: #155724;
}

.tts-status-badge.playing {
  background: #cce5ff;
  color: #004085;
}

/* 历史记录 */
.tts-history-list {
  list-style: none;
  max-height: 300px;
  overflow-y: auto;
}

.tts-history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-bottom: 1px solid #e0e0d5;
  transition: all 0.3s ease;
}

.tts-history-item:hover {
  background: #f8f9f5;
}

.tts-history-item:last-child {
  border-bottom: none;
}

.tts-history-info {
  flex: 1;
}

.tts-history-title {
  font-weight: 500;
  color: #333;
  font-size: 0.9rem;
}

.tts-history-meta {
  font-size: 0.75rem;
  color: #999;
  margin-top: 0.2rem;
}

.tts-history-actions {
  display: flex;
  gap: 0.5rem;
}

.tts-history-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.3rem;
  opacity: 0.6;
  transition: all 0.3s ease;
}

.tts-history-btn:hover {
  opacity: 1;
}

/* 加载遮罩 */
.tts-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.tts-loading-content {
  background: white;
  padding: 2.5rem;
  border-radius: 12px;
  text-align: center;
  min-width: 300px;
}

.tts-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e0e0d5;
  border-top-color: #2c5f2d;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1.5rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.tts-loading-content .tts-progress-container {
  width: 100%;
  height: 6px;
  background: #e0e0d5;
  border-radius: 3px;
  overflow: hidden;
  margin-top: 1rem;
}

.tts-progress-bar-fill {
  height: 100%;
  background: #2c5f2d;
  transition: width 0.3s ease;
}

/* 提示消息 */
.tts-toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: #1a3a1b;
  color: white;
  padding: 1rem 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  z-index: 1001;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .tts-main {
    flex-direction: column;
  }

  .tts-control-panel {
    width: 100%;
  }

  .tts-mode-tabs {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .tts-header h1 {
    font-size: 1.5rem;
  }

  .tts-player-controls {
    flex-wrap: wrap;
  }

  .tts-progress-container {
    width: 100%;
    order: 3;
  }

  .tts-mode-tabs {
    grid-template-columns: 1fr;
  }
}
</style>

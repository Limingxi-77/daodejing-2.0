<template>
  <div class="video-player-wrapper">
    <div class="video-container">
      <video
        ref="videoRef"
        class="video-element"
        :poster="posterUrl"
        @timeupdate="handleTimeUpdate"
        @ended="handleVideoEnded"
        @loadedmetadata="handleMetadataLoaded"
      >
        <source v-if="videoUrl" :src="videoUrl" type="video/mp4">
        您的浏览器不支持视频播放
      </video>
      
      <div v-if="!isPlaying" class="play-overlay" @click="togglePlay">
        <div class="play-button">
          <i class="fas fa-play"></i>
        </div>
      </div>
      
      <div class="controls-bar" :class="{ visible: showControls }">
        <div class="progress-bar" @click="seekVideo" ref="progressBarRef">
          <div class="progress-buffered" :style="{ width: bufferedPercent + '%' }"></div>
          <div class="progress-played" :style="{ width: progressPercent + '%' }"></div>
          <div class="progress-handle" :style="{ left: progressPercent + '%' }"></div>
        </div>
        
        <div class="controls-buttons">
          <div class="left-controls">
            <button @click="togglePlay" class="control-btn">
              <i :class="isPlaying ? 'fas fa-pause' : 'fas fa-play'"></i>
            </button>
            
            <button @click="skipBackward" class="control-btn">
              <i class="fas fa-backward"></i>
            </button>
            
            <button @click="skipForward" class="control-btn">
              <i class="fas fa-forward"></i>
            </button>
            
            <div class="volume-control">
              <button @click="toggleMute" class="control-btn">
                <i :class="isMuted ? 'fas fa-volume-mute' : 'fas fa-volume-up'"></i>
              </button>
              <input 
                type="range" 
                min="0" 
                max="100" 
                :value="isMuted ? 0 : volume * 100"
                @input="handleVolumeChange"
                class="volume-slider"
              >
            </div>
            
            <span class="time-display">
              {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
            </span>
          </div>
          
          <div class="right-controls">
            <button @click="changeSpeed" class="control-btn speed-btn">
              {{ playbackRate }}x
            </button>
            
            <button @click="toggleFullscreen" class="control-btn">
              <i :class="isFullscreen ? 'fas fa-compress' : 'fas fa-expand'"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="loading" class="loading-overlay">
      <i class="fas fa-spinner fa-spin"></i>
      <span>加载中...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

interface Props {
  videoUrl?: string
  posterUrl?: string
  autoPlay?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  videoUrl: '',
  posterUrl: '',
  autoPlay: false
})

const emit = defineEmits<{
  progress: [currentTime: number, duration: number]
  ended: []
  loaded: [duration: number]
}>()

const videoRef = ref<HTMLVideoElement | null>(null)
const progressBarRef = ref<HTMLDivElement | null>(null)

const isPlaying = ref(false)
const isMuted = ref(false)
const isFullscreen = ref(false)
const showControls = ref(true)
const loading = ref(true)
const currentTime = ref(0)
const duration = ref(0)
const bufferedPercent = ref(0)
const volume = ref(1)
const playbackRate = ref(1)

const progressPercent = computed(() => {
  if (duration.value === 0) return 0
  return (currentTime.value / duration.value) * 100
})

const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2]
let speedIndex = 2
let controlsTimeout: number | null = null

const togglePlay = () => {
  if (!videoRef.value) return
  
  if (isPlaying.value) {
    videoRef.value.pause()
  } else {
    videoRef.value.play()
  }
  isPlaying.value = !isPlaying.value
}

const handleTimeUpdate = () => {
  if (!videoRef.value) return
  currentTime.value = videoRef.value.currentTime
  
  if (videoRef.value.buffered.length > 0) {
    bufferedPercent.value = (videoRef.value.buffered.end(videoRef.value.buffered.length - 1) / duration.value) * 100
  }
  
  emit('progress', currentTime.value, duration.value)
}

const handleVideoEnded = () => {
  isPlaying.value = false
  emit('ended')
}

const handleMetadataLoaded = () => {
  if (!videoRef.value) return
  duration.value = videoRef.value.duration
  loading.value = false
  emit('loaded', duration.value)
  
  if (props.autoPlay) {
    videoRef.value.play()
    isPlaying.value = true
  }
}

const seekVideo = (event: MouseEvent) => {
  if (!videoRef.value || !progressBarRef.value) return
  
  const rect = progressBarRef.value.getBoundingClientRect()
  const percent = (event.clientX - rect.left) / rect.width
  videoRef.value.currentTime = percent * duration.value
}

const skipForward = () => {
  if (!videoRef.value) return
  videoRef.value.currentTime = Math.min(currentTime.value + 10, duration.value)
}

const skipBackward = () => {
  if (!videoRef.value) return
  videoRef.value.currentTime = Math.max(currentTime.value - 10, 0)
}

const toggleMute = () => {
  if (!videoRef.value) return
  isMuted.value = !isMuted.value
  videoRef.value.muted = isMuted.value
}

const handleVolumeChange = (event: Event) => {
  if (!videoRef.value) return
  const target = event.target as HTMLInputElement
  volume.value = parseInt(target.value) / 100
  videoRef.value.volume = volume.value
  isMuted.value = volume.value === 0
}

const changeSpeed = () => {
  if (!videoRef.value) return
  speedIndex = (speedIndex + 1) % speedOptions.length
  playbackRate.value = speedOptions[speedIndex]
  videoRef.value.playbackRate = playbackRate.value
}

const toggleFullscreen = async () => {
  const container = videoRef.value?.parentElement
  if (!container) return
  
  try {
    if (!document.fullscreenElement) {
      await container.requestFullscreen()
      isFullscreen.value = true
    } else {
      await document.exitFullscreen()
      isFullscreen.value = false
    }
  } catch (error) {
    console.error('Fullscreen error:', error)
  }
}

const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || !isFinite(seconds)) return '00:00'
  
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  const hours = Math.floor(mins / 60)
  
  if (hours > 0) {
    return `${hours}:${String(mins % 60).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

const showControlsTemporarily = () => {
  showControls.value = true
  if (controlsTimeout) {
    clearTimeout(controlsTimeout)
  }
  controlsTimeout = window.setTimeout(() => {
    if (isPlaying.value) {
      showControls.value = false
    }
  }, 3000)
}

const handleMouseMove = () => {
  showControlsTemporarily()
}

const handleKeyDown = (event: KeyboardEvent) => {
  switch (event.key) {
    case ' ':
    case 'k':
      event.preventDefault()
      togglePlay()
      break
    case 'ArrowLeft':
      skipBackward()
      break
    case 'ArrowRight':
      skipForward()
      break
    case 'm':
      toggleMute()
      break
    case 'f':
      toggleFullscreen()
      break
  }
}

watch(() => props.videoUrl, () => {
  if (videoRef.value) {
    loading.value = true
    videoRef.value.load()
  }
})

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
  if (videoRef.value?.parentElement) {
    videoRef.value.parentElement.addEventListener('mousemove', handleMouseMove)
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
  if (controlsTimeout) {
    clearTimeout(controlsTimeout)
  }
})
</script>

<style scoped>
.video-player-wrapper {
  position: relative;
  width: 100%;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
}

.video-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
}

.video-element {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #000;
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: background 0.3s;
}

.play-overlay:hover {
  background: rgba(0, 0, 0, 0.4);
}

.play-button {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s, background 0.3s;
}

.play-button i {
  font-size: 32px;
  color: #1a1a1a;
  margin-left: 4px;
}

.play-overlay:hover .play-button {
  transform: scale(1.1);
  background: #fff;
}

.controls-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  padding: 16px 12px 12px;
  opacity: 0;
  transition: opacity 0.3s;
}

.controls-bar.visible {
  opacity: 1;
}

.progress-bar {
  position: relative;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  cursor: pointer;
  margin-bottom: 12px;
}

.progress-bar:hover {
  height: 6px;
}

.progress-buffered {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 2px;
}

.progress-played {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: #d4b483;
  border-radius: 2px;
}

.progress-handle {
  position: absolute;
  top: 50%;
  width: 12px;
  height: 12px;
  background: #d4b483;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: opacity 0.2s;
}

.progress-bar:hover .progress-handle {
  opacity: 1;
}

.controls-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left-controls,
.right-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-btn {
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background 0.2s;
  font-size: 14px;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 4px;
}

.volume-slider {
  width: 60px;
  height: 4px;
  -webkit-appearance: none;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  cursor: pointer;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  background: #fff;
  border-radius: 50%;
  cursor: pointer;
}

.time-display {
  color: #fff;
  font-size: 13px;
  margin-left: 8px;
}

.speed-btn {
  min-width: 45px;
  font-weight: 600;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  gap: 12px;
}

.loading-overlay i {
  font-size: 32px;
}

@media (max-width: 640px) {
  .volume-slider {
    display: none;
  }
  
  .time-display {
    font-size: 12px;
  }
  
  .play-button {
    width: 60px;
    height: 60px;
  }
  
  .play-button i {
    font-size: 24px;
  }
}
</style>

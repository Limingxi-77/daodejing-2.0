// ============================================
// TTS (Text-to-Speech) 组合式函数
// 封装语音合成逻辑，提供简洁的 API
// ============================================

import { ref, computed } from 'vue'
import { CosyVoiceService, TTSOptions } from '@/services/cosyvoiceService'

export interface UseTTSOptions {
  defaultVoice?: string
  defaultSpeed?: number
  defaultEmotion?: string
}

export function useTTS(options: UseTTSOptions = {}) {
  // 服务实例
  const cosyvoiceService = new CosyVoiceService({
    API_KEY: '',
    DEFAULT_VOICE: options.defaultVoice || 'longxiaochun',
    DEFAULT_SPEED: options.defaultSpeed || 1.0,
    DEFAULT_EMOTION: options.defaultEmotion || 'neutral'
  })

  // 状态
  const isPlaying = ref(false)
  const isLoading = ref(false)
  const currentAudio = ref<HTMLAudioElement | null>(null)
  const currentUtterance = ref<SpeechSynthesisUtterance | null>(null)
  const currentText = ref('')
  const error = ref<string | null>(null)

  // 配置选项
  const voiceOptions = computed(() => cosyvoiceService.getVoiceOptions())
  const emotionOptions = computed(() => cosyvoiceService.getEmotionOptions())
  const speedOptions = computed(() => cosyvoiceService.getSpeedOptions())

  // 当前配置
  const currentVoice = ref(options.defaultVoice || 'longxiaochun')
  const currentSpeed = ref(options.defaultSpeed || 1.0)
  const currentEmotion = ref(options.defaultEmotion || 'neutral')

  /**
   * 使用浏览器原生 TTS 播放（兜底方案，状态由 useTTS 直接管理）
   */
  const playBrowserTTS = (text: string, opts: { voice?: string; speed?: number }): void => {
    if (!('speechSynthesis' in window)) {
      error.value = '浏览器不支持语音合成'
      isPlaying.value = false
      return
    }

    // 取消之前的任何播放
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = opts.speed || currentSpeed.value
    utterance.volume = 1.0
    utterance.pitch = 1.0

    const voices = window.speechSynthesis.getVoices()
    const zhVoice = voices.find(v => v.lang.includes('zh'))
    if (zhVoice) {
      utterance.voice = zhVoice
    }

    utterance.onstart = () => {
      isPlaying.value = true
    }
    utterance.onend = () => {
      isPlaying.value = false
      currentUtterance.value = null
    }
    utterance.onerror = () => {
      isPlaying.value = false
      currentUtterance.value = null
    }

    currentUtterance.value = utterance
    // 立即标记播放中，避免 onstart 触发前 UI 状态不同步
    isPlaying.value = true
    window.speechSynthesis.speak(utterance)
  }

  /**
   * 播放文本语音
   * @param text - 要播放的文本
   * @param customOptions - 自定义选项
   */
  const speak = async (text: string, customOptions?: Partial<TTSOptions>): Promise<void> => {
    if (!text.trim()) {
      error.value = '文本不能为空'
      return
    }

    // 停止当前播放
    stop()

    isLoading.value = true
    error.value = null
    currentText.value = text

    const ttsOptions: TTSOptions = {
      voice: customOptions?.voice || currentVoice.value,
      speed: customOptions?.speed || currentSpeed.value,
      emotion: customOptions?.emotion || currentEmotion.value,
      volume: customOptions?.volume || 1.0,
      pitch: customOptions?.pitch || 1.0
    }

    let result: string | Blob | null = null
    try {
      result = await cosyvoiceService.textToSpeech(text, ttsOptions)
    } catch (err) {
      console.warn('cosyvoice 不可用，降级浏览器 TTS:', err)
    }

    isLoading.value = false

    // 服务不可用 / 显式要求浏览器降级 → useTTS 自己用 speechSynthesis 播放
    if (!result) {
      playBrowserTTS(text, { voice: ttsOptions.voice, speed: ttsOptions.speed })
      return
    }

    // 正常 HTMLAudioElement 路径
    try {
      let audioUrl: string
      if (typeof result === 'string') {
        audioUrl = result
      } else {
        audioUrl = URL.createObjectURL(result)
      }

      const audio = new Audio(audioUrl)
      currentAudio.value = audio
      // 立即标记播放中，避免 onplay 之前 UI 显示错乱
      isPlaying.value = true

      audio.onplay = () => {
        isPlaying.value = true
      }

      audio.onended = () => {
        isPlaying.value = false
        cleanup()
      }

      audio.onerror = () => {
        isPlaying.value = false
        error.value = '音频播放失败'
        cleanup()
      }

      await audio.play()
    } catch (err) {
      console.error('音频播放失败:', err)
      error.value = err instanceof Error ? err.message : '音频播放失败'
      isPlaying.value = false
      cleanup()
    }
  }

  /**
   * 停止播放（HTMLAudio + 浏览器原生 TTS 都要停）
   */
  const stop = (): void => {
    // 停浏览器原生 TTS
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel()
      } catch (e) {
        console.warn('speechSynthesis.cancel() 失败:', e)
      }
    }
    currentUtterance.value = null

    // 停 HTMLAudio
    if (currentAudio.value) {
      currentAudio.value.pause()
      currentAudio.value.currentTime = 0
      cleanup()
    }
    isPlaying.value = false
  }

  /**
   * 暂停播放
   */
  const pause = (): void => {
    if (currentAudio.value && isPlaying.value) {
      currentAudio.value.pause()
      isPlaying.value = false
    }
  }

  /**
   * 继续播放
   */
  const resume = async (): Promise<void> => {
    if (currentAudio.value && !isPlaying.value) {
      try {
        await currentAudio.value.play()
        isPlaying.value = true
      } catch (err) {
        console.error('继续播放失败:', err)
      }
    }
  }

  /**
   * 清理资源
   */
  const cleanup = (): void => {
    if (currentAudio.value) {
      // 释放对象 URL
      const src = currentAudio.value.src
      if (src.startsWith('blob:')) {
        URL.revokeObjectURL(src)
      }
      currentAudio.value = null
    }
  }

  /**
   * 设置音色
   * @param voiceId - 音色 ID
   */
  const setVoice = (voiceId: string): void => {
    currentVoice.value = voiceId
  }

  /**
   * 设置语速
   * @param speed - 语速值
   */
  const setSpeed = (speed: number): void => {
    currentSpeed.value = speed
  }

  /**
   * 设置情感
   * @param emotionId - 情感 ID
   */
  const setEmotion = (emotionId: string): void => {
    currentEmotion.value = emotionId
  }

  /**
   * 切换播放状态（兼容旧版 API）
   * @param text - 要播放的文本
   * @param persona - 人格类型（影响音色选择）
   */
  const toggle = async (text: string, persona?: string): Promise<void> => {
    if (isPlaying.value) {
      stop()
    } else {
      // 根据人格选择音色
      let voice = currentVoice.value
      if (persona === 'sage') {
        voice = 'longxiaocheng' // 沉稳男声
      } else if (persona === 'healer') {
        voice = 'longjing' // 知性女声
      } else {
        voice = 'longxiaochun' // 温柔女声
      }
      
      await speak(text, { voice })
    }
  }

  // 兼容旧版 API 的别名
  const isSpeaking = isPlaying

  return {
    // 状态
    isPlaying,
    isSpeaking, // 兼容旧版
    isLoading,
    error,
    currentText,

    // 选项
    voiceOptions,
    emotionOptions,
    speedOptions,

    // 当前配置
    currentVoice,
    currentSpeed,
    currentEmotion,

    // 方法
    speak,
    stop,
    pause,
    resume,
    toggle, // 兼容旧版
    setVoice,
    setSpeed,
    setEmotion
  }
}

export default useTTS

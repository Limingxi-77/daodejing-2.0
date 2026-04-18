// ============================================
// CosyVoice API 服务 - 语音合成模块 (TypeScript 版本)
// ============================================

export interface VoiceOption {
  id: string
  name: string
  description: string
  gender: 'male' | 'female'
}

export interface EmotionOption {
  id: string
  name: string
  description: string
}

export interface SpeedOption {
  value: number
  name: string
  description: string
}

export interface CosyVoiceConfig {
  API_KEY: string
  DEFAULT_VOICE?: string
  DEFAULT_SPEED?: number
  DEFAULT_EMOTION?: string
}

export interface TTSOptions {
  voice?: string
  speed?: number
  emotion?: string
  volume?: number
  pitch?: number
}

export class CosyVoiceService {
  private apiKey: string
  private baseUrl: string = 'https://dashscope.aliyuncs.com/api/v1'
  private defaultVoice: string
  private defaultSpeed: number
  private defaultEmotion: string

  // 可用的音色列表
  readonly voiceOptions: VoiceOption[] = [
    { id: 'longxiaochun', name: '龙小春', description: '温柔女声', gender: 'female' },
    { id: 'longxiaocheng', name: '龙小诚', description: '沉稳男声', gender: 'male' },
    { id: 'longxiaobai', name: '龙小白', description: '清纯女声', gender: 'female' },
    { id: 'longshuo', name: '龙硕', description: '磁性男声', gender: 'male' },
    { id: 'longjing', name: '龙晶', description: '知性女声', gender: 'female' },
    { id: 'longxiaoxia', name: '龙小夏', description: '活泼女声', gender: 'female' },
    { id: 'longxiaochun_v2', name: '龙小春v2', description: '温柔女声v2', gender: 'female' },
    { id: 'longxiaocheng_v2', name: '龙小诚v2', description: '沉稳男声v2', gender: 'male' }
  ]

  // 情感选项
  readonly emotionOptions: EmotionOption[] = [
    { id: 'neutral', name: '平静', description: '平和自然' },
    { id: 'happy', name: '愉悦', description: '轻松愉快' },
    { id: 'sad', name: '忧伤', description: '略带忧伤' },
    { id: 'serious', name: '严肃', description: '庄重严肃' },
    { id: 'gentle', name: '温柔', description: '柔和温暖' }
  ]

  // 语速选项
  readonly speedOptions: SpeedOption[] = [
    { value: 0.8, name: '慢速', description: '舒缓缓慢' },
    { value: 1.0, name: '正常', description: '标准语速' },
    { value: 1.2, name: '稍快', description: '略微加快' },
    { value: 1.5, name: '快速', description: '较快速度' }
  ]

  constructor(config: CosyVoiceConfig) {
    this.apiKey = config.API_KEY
    this.defaultVoice = config.DEFAULT_VOICE || 'longxiaochun'
    this.defaultSpeed = config.DEFAULT_SPEED || 1.0
    this.defaultEmotion = config.DEFAULT_EMOTION || 'neutral'
  }

  /**
   * 获取可用音色列表
   * @returns 音色选项列表
   */
  getVoiceOptions(): VoiceOption[] {
    return this.voiceOptions
  }

  /**
   * 获取情感选项列表
   * @returns 情感选项列表
   */
  getEmotionOptions(): EmotionOption[] {
    return this.emotionOptions
  }

  /**
   * 获取语速选项列表
   * @returns 语速选项列表
   */
  getSpeedOptions(): SpeedOption[] {
    return this.speedOptions
  }

  /**
   * 将文本转换为语音
   * @param text - 要转换的文本
   * @param options - 语音配置选项
   * @returns 音频 URL 或 Blob
   */
  async textToSpeech(text: string, options: TTSOptions = {}): Promise<string | Blob> {
    // 文本预处理
    const processedText = this.preprocessText(text)

    // 检查文本长度
    const MAX_TEXT_LENGTH = 5000
    if (processedText.length > MAX_TEXT_LENGTH) {
      throw new Error(`文本长度超过限制（最大 ${MAX_TEXT_LENGTH} 字）`)
    }

    // 检查 API 密钥是否已配置
    if (!this.apiKey || this.apiKey === 'your-cosyvoice-api-key-here') {
      console.warn('DashScope API 密钥未配置，使用浏览器内置 TTS')
      return await this.useBrowserTTS(processedText, options)
    }

    const voiceConfig = {
      voice: options.voice || this.defaultVoice,
      speed: options.speed || this.defaultSpeed,
      emotion: options.emotion || this.defaultEmotion,
      volume: options.volume || 1.0,
      pitch: options.pitch || 1.0
    }

    try {
      // 使用 Vite 代理调用 DashScope API
      const response = await fetch('/dashscope-api/api/v1/services/aigc/multimodal-generation/generation', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'cosyvoice-v1',
          input: {
            text: processedText
          },
          parameters: {
            voice: voiceConfig.voice,
            speed_ratio: voiceConfig.speed,
            volume_ratio: voiceConfig.volume
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`语音合成错误: ${errorData.error || response.statusText}`)
      }

      // 处理响应
      const contentType = response.headers.get('content-type') || ''

      if (contentType.includes('application/json')) {
        const data = await response.json()
        if (data.output && data.output.audio) {
          // 返回音频 URL
          return data.output.audio
        }
        throw new Error('无效的音频数据')
      } else {
        // 返回音频 Blob
        return await response.blob()
      }
    } catch (error) {
      console.error('DashScope API 调用失败:', error)
      // 降级到浏览器 TTS
      console.log('降级到浏览器内置语音合成')
      return await this.useBrowserTTS(processedText, options)
    }
  }

  /**
   * 使用浏览器内置 TTS（降级方案）
   * @param text - 要朗读的文本
   * @param options - 语音选项
   * @returns 音频 Blob
   */
  private async useBrowserTTS(text: string, options: TTSOptions = {}): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!window.speechSynthesis) {
        reject(new Error('浏览器不支持语音合成'))
        return
      }

      const utterance = new SpeechSynthesisUtterance(text)

      // 设置语速
      utterance.rate = options.speed || this.defaultSpeed

      // 设置音量
      utterance.volume = options.volume || 1.0

      // 设置音调
      utterance.pitch = options.pitch || 1.0

      // 选择语音
      const voices = window.speechSynthesis.getVoices()
      const zhVoice = voices.find(v => v.lang.includes('zh'))
      if (zhVoice) {
        utterance.voice = zhVoice
      }

      // 朗读完成后的处理
      utterance.onend = () => {
        resolve(new Blob(['browser-tts'], { type: 'text/plain' }))
      }

      utterance.onerror = (event) => {
        reject(new Error(`语音合成错误: ${event.error}`))
      }

      // 开始朗读
      window.speechSynthesis.speak(utterance)
    })
  }

  /**
   * 文本预处理
   * @param text - 原始文本
   * @returns 处理后的文本
   */
  private preprocessText(text: string): string {
    return text
      .replace(/\s+/g, ' ')      // 合并多个空白字符
      .replace(/[【\[\(].*?[】\]\)]/g, '') // 移除标注性文字
      .trim()
  }

  /**
   * 将长文本分段
   * @param text - 长文本
   * @param chunkSize - 每段最大长度
   * @returns 文本段数组
   */
  splitTextIntoChunks(text: string, chunkSize: number = 500): string[] {
    const chunks: string[] = []
    let remaining = text

    while (remaining.length > 0) {
      if (remaining.length <= chunkSize) {
        chunks.push(remaining)
        break
      }

      // 寻找合适的分割点（句号、问号、感叹号）
      let splitIndex = chunkSize
      const punctuation = '。！？.!?'

      for (let i = chunkSize; i > chunkSize * 0.5; i--) {
        if (punctuation.includes(remaining[i])) {
          splitIndex = i + 1
          break
        }
      }

      chunks.push(remaining.substring(0, splitIndex))
      remaining = remaining.substring(splitIndex).trim()
    }

    return chunks
  }
}

// 默认配置
export const defaultCosyVoiceConfig: CosyVoiceConfig = {
  API_KEY: import.meta.env.VITE_COSYVOICE_API_KEY || 'your-cosyvoice-api-key-here',
  DEFAULT_VOICE: 'longxiaochun',
  DEFAULT_SPEED: 1.0,
  DEFAULT_EMOTION: 'neutral'
}

// 创建默认实例
export const cosyvoiceService = new CosyVoiceService(defaultCosyVoiceConfig)

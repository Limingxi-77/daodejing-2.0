// ============================================
// MiMo TTS V2.5 服务 - 语音合成模块 (TypeScript 版本)
// ============================================

import { apiClient } from './api'

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
  taskId?: string
}

export class CosyVoiceService {
  private defaultVoice: string
  private defaultSpeed: number
  private defaultEmotion: string

  // MiMo V2.5 预置音色（完整列表）
  // 中文音色用中文 ID，英文音色用英文 ID
  readonly voiceOptions: VoiceOption[] = [
    { id: 'mimo_default', name: 'MiMo 默认', description: '平台默认音色', gender: 'female' },
    { id: '冰糖', name: '冰糖', description: '温柔女声 · 中文', gender: 'female' },
    { id: '茉莉', name: '茉莉', description: '清新女声 · 中文', gender: 'female' },
    { id: '苏打', name: '苏打', description: '活力男声 · 中文', gender: 'male' },
    { id: '白桦', name: '白桦', description: '沉稳男声 · 中文', gender: 'male' },
    { id: 'Mia', name: '米娅', description: '优雅女声 · 英文', gender: 'female' },
    { id: 'Chloe', name: '克洛伊', description: '知性女声 · 英文', gender: 'female' },
    { id: 'Milo', name: '米洛', description: '阳光男声 · 英文', gender: 'male' },
    { id: 'Dean', name: '院长', description: '沉稳男声 · 英文', gender: 'male' }
  ]

  // 风格选项（MiMo 支持的风格标签）
  readonly emotionOptions: EmotionOption[] = [
    { id: 'neutral', name: '平静', description: '平和自然' },
    { id: '温柔', name: '温柔', description: '柔和温暖' },
    { id: '磁性', name: '磁性', description: '低沉有质感' },
    { id: '活泼', name: '活泼', description: '轻快上扬' },
    { id: '严肃', name: '严肃', description: '庄重沉稳' },
    { id: '慵懒', name: '慵懒', description: '随意放松' },
    { id: '深沉', name: '深沉', description: '厚重有力量' },
    { id: '甜美', name: '甜美', description: '甜美女声' },
    { id: '清亮', name: '清亮', description: '清澈明亮' },
    { id: '开心', name: '开心', description: '愉悦欢快' },
    { id: '悲伤', name: '悲伤', description: '低沉忧伤' },
    { id: '平静', name: '平静', description: '波澜不惊' }
  ]

  // 语速选项
  readonly speedOptions: SpeedOption[] = [
    { value: 0.6, name: '极慢', description: '非常缓慢' },
    { value: 0.8, name: '慢速', description: '舒缓缓慢' },
    { value: 1.0, name: '正常', description: '标准语速' },
    { value: 1.2, name: '稍快', description: '略微加快' },
    { value: 1.5, name: '快速', description: '较快速度' },
    { value: 2.0, name: '极快', description: '非常快速' }
  ]

  constructor(config: CosyVoiceConfig) {
    this.defaultVoice = config.DEFAULT_VOICE || 'mimo_default'
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

    const voiceConfig = {
      voice: options.voice || this.defaultVoice,
      speed: options.speed || this.defaultSpeed,
      emotion: options.emotion || this.defaultEmotion,
      volume: options.volume || 1.0,
      pitch: options.pitch || 1.0
    }

    try {
      const data = await apiClient<{ success: boolean; mode?: string; audioUrl?: string; message?: string }>('/tts/synthesize', {
        method: 'POST',
        body: {
          text: processedText,
          voice: voiceConfig.voice,
          speed: voiceConfig.speed,
          emotion: voiceConfig.emotion,
          volume: voiceConfig.volume,
          pitch: voiceConfig.pitch,
          taskId: options.taskId
        }
      })

      if (data.mode === 'browser-fallback') {
        throw new Error('BROWSER_FALLBACK_REQUESTED')
      }
      if (data.audioUrl) {
        return data.audioUrl
      }
      throw new Error('无效的音频数据')
    } catch (error) {
      console.error('TTS 后端代理调用失败，交由上层降级:', error)
      throw error
    }
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
  API_KEY: '',
  DEFAULT_VOICE: 'mimo_default',
  DEFAULT_SPEED: 1.0,
  DEFAULT_EMOTION: 'neutral'
}

// 创建默认实例
export const cosyvoiceService = new CosyVoiceService(defaultCosyVoiceConfig)

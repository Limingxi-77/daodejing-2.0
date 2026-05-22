import { apiClient } from '@/services/api'

export interface DeepSeekConfig {
  API_KEY: string
  BASE_URL: string
  MODEL: string
  MAX_TOKENS: number
  TEMPERATURE: number
}

export class DeepSeekService {
  private model: string
  private maxTokens: number
  private temperature: number

  constructor(config: DeepSeekConfig) {
    this.model = config.MODEL
    this.maxTokens = config.MAX_TOKENS
    this.temperature = config.TEMPERATURE
  }

  async generateText(prompt: string): Promise<string> {
    try {
      const response = await apiClient<{ success: boolean; content: string }>('/ai/chat', {
        method: 'POST',
        body: {
          provider: 'deepseek',
          model: this.model,
          messages: [
            {
              role: 'system',
              content: '你是一位精通《道德经》的道家学者，善于用通俗易懂的语言解释深奥的哲学思想。'
            },
            { role: 'user', content: prompt }
          ],
          max_tokens: this.maxTokens,
          temperature: this.temperature
        }
      })

      return response.content
    } catch (error) {
      console.warn('后端 DeepSeek 代理不可用，返回模拟数据:', error)
      return this.getMockResponse(prompt)
    }
  }

  async generateTextStream(prompt: string, onChunk: (chunk: string) => void): Promise<void> {
    const text = await this.generateText(prompt)
    for (const chunk of text.split('')) {
      await new Promise(resolve => setTimeout(resolve, 30))
      onChunk(chunk)
    }
  }

  async generateInterpretation(chapter: number, style: 'scholar' | 'modern' | 'practical' = 'scholar'): Promise<string> {
    const styleMap = {
      scholar: '请用学术、严谨但通俗的方式解读',
      modern: '请结合现代生活和心理体验解读',
      practical: '请给出可实践的生活建议'
    }

    return this.generateText(`${styleMap[style] || styleMap.scholar}《道德经》第${chapter}章，要求包含核心思想、现代意义和实践启发。`)
  }

  async generateMeditationGuide(chapter: number): Promise<string> {
    return this.generateText(`请基于《道德经》第${chapter}章生成一段 3-5 分钟的中文冥想引导词，语气舒缓、安定、适合朗读。`)
  }

  private getMockResponse(prompt: string): string {
    if (prompt.includes('解读')) {
      return '【演示模式】这一章体现了道家顺势而为、少私寡欲的智慧。它提醒我们在复杂生活中减少过度控制，保持清明、柔和与节制。'
    }
    if (prompt.includes('冥想')) {
      return '【演示模式】请慢慢坐稳，轻轻闭上眼睛。吸气时感受身体安住当下，呼气时放下紧张。像水一样柔和，像山一样安静，让念头自然来去。'
    }
    return '【演示模式】道可道，非常道。真正的智慧往往不在强求中出现，而在安静、观察和顺应中自然显现。'
  }
}

export const defaultDeepSeekConfig: DeepSeekConfig = {
  API_KEY: '',
  BASE_URL: '',
  MODEL: 'deepseek-v4-flash',
  MAX_TOKENS: 2048,
  TEMPERATURE: 0.7
}

export const deepseekService = new DeepSeekService(defaultDeepSeekConfig)


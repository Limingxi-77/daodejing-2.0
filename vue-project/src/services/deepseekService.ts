// ============================================
// DeepSeek API 服务 - 文本生成模块 (TypeScript 版本)
// ============================================

export interface DeepSeekConfig {
  API_KEY: string
  BASE_URL: string
  MODEL: string
  MAX_TOKENS: number
  TEMPERATURE: number
}

export class DeepSeekService {
  private apiKey: string
  private baseUrl: string
  private model: string
  private maxTokens: number
  private temperature: number

  constructor(config: DeepSeekConfig) {
    this.apiKey = config.API_KEY
    this.baseUrl = config.BASE_URL
    this.model = config.MODEL
    this.maxTokens = config.MAX_TOKENS
    this.temperature = config.TEMPERATURE
  }

  /**
   * 调用 DeepSeek API 生成文本
   * @param prompt - 提示词
   * @returns 生成的文本
   */
  async generateText(prompt: string): Promise<string> {
    // 检查 API 密钥是否已配置
    if (!this.apiKey || this.apiKey === 'your-deepseek-api-key-here') {
      console.warn('DeepSeek API 密钥未配置，返回模拟数据')
      return this.getMockResponse(prompt)
    }

    try {
      const apiUrl = this.baseUrl.endsWith('/v1')
        ? `${this.baseUrl}/chat/completions`
        : `${this.baseUrl}/v1/chat/completions`

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: '你是一位精通《道德经》的道家学者，善于用通俗易懂的语言解释深奥的哲学思想。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: this.maxTokens,
          temperature: this.temperature
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`DeepSeek API 错误: ${errorData.error?.message || response.statusText}`)
      }

      const data = await response.json()
      return data.choices[0]?.message?.content || ''
    } catch (error) {
      console.error('DeepSeek API 调用失败:', error)
      throw error
    }
  }

  /**
   * 流式生成文本
   * @param prompt - 提示词
   * @param onChunk - 回调函数，接收每个文本块
   */
  async generateTextStream(prompt: string, onChunk: (chunk: string) => void): Promise<void> {
    if (!this.apiKey || this.apiKey === 'your-deepseek-api-key-here') {
      console.warn('DeepSeek API 密钥未配置，返回模拟数据')
      const mockText = this.getMockResponse(prompt)
      const chunks = mockText.split('')
      for (let i = 0; i < chunks.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 30))
        onChunk(chunks[i])
      }
      return
    }

    try {
      const apiUrl = this.baseUrl.endsWith('/v1')
        ? `${this.baseUrl}/chat/completions`
        : `${this.baseUrl}/v1/chat/completions`

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: '你是一位精通《道德经》的道家学者，善于用通俗易懂的语言解释深奥的哲学思想。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: this.maxTokens,
          temperature: this.temperature,
          stream: true
        })
      })

      if (!response.ok) {
        throw new Error(`DeepSeek API 错误: ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('无法获取响应流')
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') return

            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices[0]?.delta?.content
              if (content) {
                onChunk(content)
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
    } catch (error) {
      console.error('流式生成失败:', error)
      throw error
    }
  }

  /**
   * 获取模拟响应（用于演示）
   * @param prompt - 提示词
   * @returns 模拟的响应文本
   */
  private getMockResponse(prompt: string): string {
    if (prompt.includes('解读')) {
      return '【模拟数据】这一章讲述了道家"无为而治"的核心思想。老子认为，最好的治理是不刻意干预，让事物按照自然规律发展。就像水一样，不争不抢，却能滋润万物。在现代社会中，这启示我们要学会顺势而为，不要过度强求，保持内心的平静与和谐。'
    } else if (prompt.includes('冥想')) {
      return '【模拟数据】请找一个安静舒适的地方坐下，轻轻闭上眼睛。深呼吸三次，让身心慢慢放松下来。想象自己置身于一片宁静的山水之间，耳边只有潺潺的流水声。随着每一次呼吸，感受身体的每一个部位都在放松。让心灵回归平静，如同明镜一般，映照万物而不留痕迹...'
    } else {
      return '【模拟数据】道可道，非常道。真正的智慧在于认识到自己的无知，保持谦逊的态度。生活中，我们常常被欲望所困扰，忘记了内心真正的需求。学会放下，学会知足，才能找到真正的快乐。就像老子所说："知足者富"，懂得满足的人，才是最富有的人。'
    }
  }
}

// 默认配置
export const defaultDeepSeekConfig: DeepSeekConfig = {
  API_KEY: import.meta.env.VITE_DEEPSEEK_API_KEY || 'your-deepseek-api-key-here',
  BASE_URL: import.meta.env.VITE_DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
  MODEL: 'deepseek-chat',
  MAX_TOKENS: 2048,
  TEMPERATURE: 0.7
}

// 创建默认实例
export const deepseekService = new DeepSeekService(defaultDeepSeekConfig)

export interface ChatMessage {
  id: string
  content: string
  type: 'user' | 'ai'
  timestamp: Date
}

export interface PopularQuestion {
  title: string
  preview: string
}

export interface AIResponse {
  answer: string
  error?: string
}
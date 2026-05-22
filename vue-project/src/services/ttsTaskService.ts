import { apiClient } from './api'

export interface TtsTask {
  id: string
  text: string
  voice: string
  speed: number
  volume: number
  status: string
  audioUrl: string
  errorMessage: string
  createdAt: string
}

export async function createTtsTask(payload: { text: string; voice: string; speed: number; volume: number }) {
  return apiClient<{ success: boolean; task: TtsTask }>('/tts/tasks', {
    method: 'POST',
    body: payload
  })
}

export async function fetchTtsTasks() {
  return apiClient<{ success: boolean; data: TtsTask[] }>('/tts/tasks')
}

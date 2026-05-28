import { apiClient } from './api'

export interface ArtGenerateResponse {
  success: boolean
  imageUrl: string
  mode?: string
  message?: string
}

export async function generateArt (quote: string, style: string): Promise<ArtGenerateResponse> {
  return apiClient<ArtGenerateResponse>('/art/generate', {
    method: 'POST',
    body: { quote, style }
  })
}

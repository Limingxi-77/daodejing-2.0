import { apiClient } from '@/services/api'

export interface CouncilPersonaResult {
  personaId: string
  personaName: string
  icon: string
  content?: string
  status?: string
  tokens?: number
  error?: string
}

export interface CouncilResponse {
  success: boolean
  provider: string
  model: string
  personas: CouncilPersonaResult[]
  totalTokens: number
  estimatedCost: number
  mode: string
  rounds?: Array<{ round: number; personas: CouncilPersonaResult[] }>
  status?: string
}

export type CouncilMode = 'parallel' | 'debate'

export async function askCouncil(
  question: string,
  options: { provider?: string; model?: string; mode?: CouncilMode } = {}
): Promise<CouncilResponse> {
  return apiClient<CouncilResponse>('/ai/council', {
    method: 'POST',
    body: {
      question,
      provider: options.provider,
      model: options.model,
      mode: options.mode || 'parallel'
    }
  })
}

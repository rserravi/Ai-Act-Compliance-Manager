import type { RiskLevel } from '../../../domain/models'
import { api } from '../../../services/api'

export type RiskEvaluationRequest = {
  answers: Record<string, unknown>
}

export type RiskEvaluationResponse = {
  classification: RiskLevel
  justification: string
  obligations: string[]
}

export class RiskEvaluationService {
  #loading = false
  #error: Error | null = null

  get loading(): boolean {
    return this.#loading
  }

  get error(): Error | null {
    return this.#error
  }

  async evaluate(request: RiskEvaluationRequest): Promise<RiskEvaluationResponse> {
    this.#loading = true
    this.#error = null
    try {
      return await api<RiskEvaluationResponse>('/risk-evaluations', {
        method: 'POST',
        body: JSON.stringify(request)
      })
    } catch (error) {
      const normalized = error instanceof Error ? error : new Error('Unknown error')
      this.#error = normalized
      throw normalized
    } finally {
      this.#loading = false
    }
  }
}

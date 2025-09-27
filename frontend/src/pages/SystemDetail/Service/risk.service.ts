import { api, tryApi } from '../../../services/api'

export interface RiskAssessmentRow {
  id: string
  createdAt: string
  classification: string
  justification: string
}

const mock: RiskAssessmentRow[] = [
  { id: 'r1', createdAt: '2025-09-01T10:00:00Z', classification: 'alto', justification: 'Mock: crédito/empleo' }
]

export async function listRiskAssessments(systemId: string): Promise<RiskAssessmentRow[]> {
  return tryApi(
    async () => await api<RiskAssessmentRow[]>(`/systems/${systemId}/risk`),
    async () => mock
  )
}

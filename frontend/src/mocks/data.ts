import type { AISystem } from '../domain/models'

export const systems: AISystem[] = [
  { id: '1', name: 'Motor RRHH', role: 'user', businessUnit: 'People & Culture', risk: 'alto', docStatus: 'vigente', lastAssessment: '2025-09-01' },
  { id: '2', name: 'Chat Soporte', role: 'provider', businessUnit: 'Customer Care', risk: 'limitado', docStatus: 'na', lastAssessment: '2025-08-12' },
  { id: '3', name: 'Scoring Crédito', role: 'provider', businessUnit: 'Risk & Compliance', risk: 'alto', docStatus: 'borrador', lastAssessment: '2025-09-10' },
  { id: '4', name: 'Monitorización Fraude', role: 'provider', businessUnit: 'Risk & Compliance', risk: 'alto', docStatus: 'obsoleta', lastAssessment: '2025-08-28' },
  { id: '5', name: 'Asistente Ventas', role: 'distributor', businessUnit: 'Commercial', risk: 'limitado', docStatus: 'vigente', lastAssessment: '2025-09-05' }
]

import { systems } from '../../../mocks/data'
import type { Incident, IncidentSeverity, IncidentStatus } from '../../../domain/models'

interface IncidentInput extends Pick<Incident, 'systemId' | 'severity' | 'status' | 'title' | 'description'> {}

export interface IncidentRow {
  id: string
  system: string
  severity: IncidentSeverity
  status: IncidentStatus
  date: string
  title: string
}

const mockIncidents: Incident[] = [
  {
    id: 'inc-1000',
    systemId: '1',
    severity: 'media',
    status: 'en_revision',
    title: 'Validación incorrecta',
    description: 'El modelo marcó como alto riesgo a candidatos válidos.',
    createdAt: '2025-08-02T10:30:00Z'
  }
]

function toRow(incident: Incident): IncidentRow {
  const systemName = systems.find(s => s.id === incident.systemId)?.name ?? incident.systemId
  return {
    id: incident.id,
    system: systemName,
    severity: incident.severity,
    status: incident.status,
    date: incident.createdAt,
    title: incident.title
  }
}

export async function listIncidents(): Promise<IncidentRow[]> {
  await new Promise(resolve => setTimeout(resolve, 80))
  return mockIncidents.map(toRow)
}

export async function reportIncident(input: IncidentInput): Promise<Incident> {
  await new Promise(resolve => setTimeout(resolve, 120))
  const timestamp = new Date().toISOString()
  const incident: Incident = {
    ...input,
    id: `inc-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: timestamp,
    updatedAt: timestamp
  }
  mockIncidents.unshift(incident)
  return incident
}

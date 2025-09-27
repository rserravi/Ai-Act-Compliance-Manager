import { useMemo } from 'react'
import { systems } from '../../mocks/data'
import type { DocStatus } from '../../domain/models'

type ComplianceEntry = {
  businessUnit: string
  totals: Record<DocStatus, number>
  total: number
}

type TimelineEvent = {
  id: string
  date: string
  type: 'riskAssessment' | 'incidentClosed' | 'documentUpdated' | 'taskCreated'
  systemId?: string
  metadata?: Record<string, string>
}

type PendingAction = {
  id: string
  titleKey: string
  systemId: string
  systemName: string
  due: string
  owner: string
  status: 'todo' | 'in_review' | 'approved'
  priority: 'high' | 'medium' | 'low'
}

const DOC_ORDER: DocStatus[] = ['vigente', 'borrador', 'obsoleta', 'na']

function normalizeBusinessUnit(raw?: string) {
  return raw && raw.trim().length > 0 ? raw : 'Otros'
}

function isDueToday(iso: string) {
  const due = new Date(iso)
  const today = new Date()
  return due.getFullYear() === today.getFullYear() &&
    due.getMonth() === today.getMonth() &&
    due.getDate() === today.getDate()
}

export function useDashboardViewModel() {
  const complianceByBusinessUnit = useMemo<ComplianceEntry[]>(() => {
    const map = new Map<string, ComplianceEntry>()
    systems.forEach(sys => {
      const unit = normalizeBusinessUnit(sys.businessUnit)
      if (!map.has(unit)) {
        map.set(unit, {
          businessUnit: unit,
          totals: { vigente: 0, borrador: 0, obsoleta: 0, na: 0 },
          total: 0
        })
      }
      const entry = map.get(unit)!
      const status = (sys.docStatus ?? 'na') as DocStatus | 'na'
      entry.totals[status] = (entry.totals[status] ?? 0) + 1
      entry.total += 1
    })
    return Array.from(map.values()).sort((a, b) => b.total - a.total)
  }, [])

  const timeline = useMemo<TimelineEvent[]>(() => ([
    {
      id: 'evt-1',
      date: '2025-09-15T10:30:00Z',
      type: 'riskAssessment',
      systemId: '3',
      metadata: { system: 'Scoring Crédito', classification: 'alto' }
    },
    {
      id: 'evt-2',
      date: '2025-09-14T16:10:00Z',
      type: 'incidentClosed',
      systemId: '1',
      metadata: { system: 'Motor RRHH', incident: 'INC-234', owner: 'Laura P.' }
    },
    {
      id: 'evt-3',
      date: '2025-09-13T09:05:00Z',
      type: 'documentUpdated',
      systemId: '4',
      metadata: { system: 'Monitorización Fraude', document: 'DoC v2' }
    },
    {
      id: 'evt-4',
      date: '2025-09-12T14:45:00Z',
      type: 'taskCreated',
      systemId: '5',
      metadata: { system: 'Asistente Ventas', task: 'Actualizar dataset de entrenamiento' }
    }
  ]), [])

  const pendingActions = useMemo<PendingAction[]>(() => ([
    {
      id: 'act-1',
      titleKey: 'dashboard.actions.items.reviewRisk',
      systemId: '3',
      systemName: 'Scoring Crédito',
      due: '2025-09-18',
      owner: 'María G.',
      status: 'in_review',
      priority: 'high'
    },
    {
      id: 'act-2',
      titleKey: 'dashboard.actions.items.updateDossier',
      systemId: '4',
      systemName: 'Monitorización Fraude',
      due: '2025-09-19',
      owner: 'Carlos M.',
      status: 'todo',
      priority: 'medium'
    },
    {
      id: 'act-3',
      titleKey: 'dashboard.actions.items.scheduleAudit',
      systemId: '1',
      systemName: 'Motor RRHH',
      due: '2025-09-18',
      owner: 'Ana L.',
      status: 'todo',
      priority: 'high'
    },
    {
      id: 'act-4',
      titleKey: 'dashboard.actions.items.validateIncident',
      systemId: '2',
      systemName: 'Chat Soporte',
      due: '2025-09-22',
      owner: 'Jordi S.',
      status: 'in_review',
      priority: 'low'
    }
  ]), [])

  const tasksToday = useMemo(() => pendingActions.filter(action => isDueToday(action.due)).length, [pendingActions])

  const kpis = useMemo(() => {
    const total = systems.length
    const alto = systems.filter(s => s.risk === 'alto').length
    const docVigente = systems.filter(s => s.docStatus === 'vigente').length
    return {
      totalSystems: total,
      highRisk: alto,
      docVigentePct: total ? Math.round((docVigente / total) * 100) : 0,
      tasksToday
    }
  }, [tasksToday])

  return {
    kpis,
    complianceByBusinessUnit,
    timeline,
    pendingActions,
    docStatusOrder: DOC_ORDER
  }
}

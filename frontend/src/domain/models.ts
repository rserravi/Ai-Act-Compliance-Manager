// === Domain Models (shared) ===

export type UUID = string

export type RiskLevel = 'inaceptable' | 'alto' | 'limitado' | 'minimo'
export type RoleType = 'provider' | 'importer' | 'distributor' | 'user'
export type DocStatus = 'vigente' | 'obsoleta' | 'borrador' | 'na'
export type IncidentSeverity = 'alta' | 'media' | 'baja'
export type IncidentStatus = 'abierto' | 'en_revision' | 'cerrado'

export type DeliverableType =
  | 'technical_documentation'
  | 'declaration_of_conformity'
  | 'quality_management_system'
  | 'post_market_monitoring_plan'
  | 'instructions_for_use'
  | 'logs'
  | 'other'

export type DeliverableStatus = 'Abierto' | 'Comenzado' | 'En Revisión' | 'Terminado'

export interface Contact {
  id: UUID
  name: string
  role: string
  email: string
  phone: string
  notification: string
}

export interface Organization {
  id: UUID
  name: string
  bu?: string[]
}

export interface AISystem {
  id: UUID
  name: string
  role: RoleType
  purpose?: string
  owner?: string
  businessUnit?: string
  deployments?: string[]
  team?: Contact[]
  risk?: RiskLevel
  docStatus?: DocStatus
  lastAssessment?: string // ISO date
  tags?: string[]
  initialRiskAssessment?: {
    classification: RiskLevel
    justification: string
    answers: RiskAnswer[]
  }
}

export interface RiskAnswer {
  key: string
  value: any
}

export interface RiskAssessment {
  id: UUID
  systemId: UUID
  createdAt: string
  answers: RiskAnswer[]
  classification: RiskLevel | 'inaceptable' | 'sin_clasificar'
  justification: string
  version: number
}

export interface Evidence {
  id: UUID
  systemId: UUID
  type: 'test' | 'dataset' | 'security' | 'audit' | 'other'
  title: string
  createdAt: string
  hash?: string
  source?: string // URL or ref (e.g., Git commit)
}

export interface DocumentRef {
  id: UUID
  systemId: UUID
  name: string // The user-facing name of the deliverable
  type: DeliverableType
  version: number
  status: DeliverableStatus
  updatedAt: string
  link?: string
}

export interface Incident {
  id: UUID
  systemId: UUID
  severity: IncidentSeverity
  status: IncidentStatus
  title: string
  description?: string
  createdAt: string
  updatedAt?: string
  owner?: string
}

export interface Task {
  id: UUID
  systemId?: UUID
  title: string
  due?: string
  assignee?: string
  status: 'todo' | 'in_review' | 'approved'
}

export interface WorkflowRun {
  id: UUID
  systemId: UUID
  name: string
  startedAt: string
  state: 'running' | 'completed' | 'failed'
}

export interface Approval {
  id: UUID
  systemId: UUID
  approver: string
  approvedAt?: string
  state: 'pending' | 'approved' | 'rejected'
}

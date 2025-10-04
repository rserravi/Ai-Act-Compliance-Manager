import type {
  AISystem,
  DeliverableType,
  DocumentRef,
  RiskAnswer,
  RiskLevel,
} from '../../../domain/models'
import { systems } from '../../../mocks/data'
import { api, tryApi } from '../../../services/api'
import type { ProjectFilter } from '../Model'

type ProjectApi = {
  id: string
  name: string
  role: AISystem['role']
  risk?: string | null
  documentation_status?: string | null
  purpose?: string | null
  owner?: string | null
  business_units?: string[] | null
  deployments?: string[] | null
  team?: string[] | null
  initial_risk_assessment?: {
    classification: string
    justification: string
    answers?: Array<{ key: string; value: unknown }>
  } | null
}

type DeliverableApi = {
  id: string
  project_id: string
  name: string
  type?: string | null
  version?: number | null
  status?: string | null
  link?: string | null
  updated_at?: string | null
}

export type CreateProjectRequest = {
  name: string
  role: AISystem['role']
  purpose: string
  owner: string
  businessUnit?: string
  documentationStatus?: string
  deployments: string[]
  risk?: RiskLevel
  riskAssessment?: {
    classification: RiskLevel
    justification: string
    answers: RiskAnswer[]
  }
}

type CreateProjectPayload = {
  name: string
  role: AISystem['role']
  purpose: string
  owner: string
  business_units?: string[]
  documentation_status?: string
  deployments: string[]
  risk?: string
  initial_risk_assessment?: {
    classification: string
    justification: string
    answers: RiskAnswer[]
  }
}

type CreateProjectResponse = ProjectApi

const RISK_MAP_TO_DOMAIN: Record<string, RiskLevel> = {
  high: 'alto',
  medium: 'limitado',
  low: 'minimo',
  unacceptable: 'inaceptable',
}

const DOC_STATUS_MAP_TO_DOMAIN: Record<string, AISystem['docStatus']> = {
  in_progress: 'borrador',
  not_started: 'borrador',
  completed: 'vigente',
  obsolete: 'obsoleta',
}

const DEFAULT_DELIVERABLE_STATUS: DocumentRef['status'] = 'Abierto'

function mapRiskToDomain(value: string | null | undefined): RiskLevel | undefined {
  if (!value) return undefined
  return RISK_MAP_TO_DOMAIN[value] ?? (value as RiskLevel)
}

function mapDocStatusToDomain(
  value: string | null | undefined,
): AISystem['docStatus'] | undefined {
  if (!value) return undefined
  return DOC_STATUS_MAP_TO_DOMAIN[value] ?? (value as AISystem['docStatus'])
}

function mapProjectFromApi(data: ProjectApi): AISystem {
  const businessUnit = Array.isArray(data.business_units) ? data.business_units[0] : undefined
  return {
    id: data.id,
    name: data.name,
    role: data.role,
    purpose: data.purpose ?? undefined,
    owner: data.owner ?? undefined,
    businessUnit,
    deployments: data.deployments ?? [],
    team: undefined,
    risk: mapRiskToDomain(data.risk ?? undefined),
    docStatus: mapDocStatusToDomain(data.documentation_status ?? undefined),
    lastAssessment: undefined,
    tags: undefined,
    initialRiskAssessment: data.initial_risk_assessment
      ? {
          classification: mapRiskToDomain(data.initial_risk_assessment.classification) ??
            (data.initial_risk_assessment.classification as RiskLevel),
          justification: data.initial_risk_assessment.justification,
          answers: (data.initial_risk_assessment.answers ?? []).map((answer) => ({
            key: answer.key,
            value: answer.value,
          })),
        }
      : undefined,
  }
}

function mapSystemToProjectApi(system: AISystem): ProjectApi {
  return {
    id: system.id,
    name: system.name,
    role: system.role,
    risk: system.risk,
    documentation_status: system.docStatus,
    purpose: system.purpose ?? null,
    owner: system.owner ?? null,
    business_units: system.businessUnit ? [system.businessUnit] : null,
    deployments: system.deployments ?? null,
    team: Array.isArray(system.team) ? system.team.map((member) => member.email) : null,
    initial_risk_assessment: system.initialRiskAssessment
      ? {
          classification: system.initialRiskAssessment.classification,
          justification: system.initialRiskAssessment.justification,
          answers: system.initialRiskAssessment.answers.map((answer) => ({ ...answer })),
        }
      : null,
  }
}

function mapDeliverableFromApi(data: DeliverableApi): DocumentRef {
  const version = typeof data.version === 'number' ? data.version : 0
  const type = (data.type as DeliverableType | undefined) ?? 'other'
  const status = (data.status as DocumentRef['status'] | undefined) ?? DEFAULT_DELIVERABLE_STATUS
  return {
    id: data.id,
    systemId: data.project_id,
    name: data.name,
    type,
    version,
    status,
    updatedAt: data.updated_at ?? new Date().toISOString(),
    link: data.link ?? undefined,
  }
}

function mapFilterToQuery(filter: ProjectFilter): string {
  const params = new URLSearchParams()
  if (filter.role) params.set('role', filter.role)
  if (filter.risk) params.set('risk', filter.risk)
  if (filter.doc) params.set('doc', filter.doc)
  if (filter.q) params.set('q', filter.q)
  const query = params.toString()
  return query ? `?${query}` : ''
}

function buildCreatePayload(request: CreateProjectRequest): CreateProjectPayload {
  const payload: CreateProjectPayload = {
    name: request.name.trim(),
    role: request.role,
    purpose: request.purpose.trim(),
    owner: request.owner.trim(),
    deployments: [...request.deployments],
  }

  if (request.businessUnit) {
    payload.business_units = [request.businessUnit]
  }
  if (request.documentationStatus) {
    payload.documentation_status = request.documentationStatus
  }
  if (request.risk) {
    payload.risk = request.risk
  }
  if (request.riskAssessment) {
    payload.initial_risk_assessment = {
      classification: request.riskAssessment.classification,
      justification: request.riskAssessment.justification,
      answers: request.riskAssessment.answers.map((answer) => ({ ...answer })),
    }
  }

  return payload
}

export async function fetchProjects(filter: ProjectFilter = {}): Promise<AISystem[]> {
  const query = mapFilterToQuery(filter)
  const projects = await tryApi(
    async () => await api<ProjectApi[]>(`/projects${query}`),
    async () => systems.map(mapSystemToProjectApi),
  )
  return projects.map(mapProjectFromApi)
}

export async function fetchProjectDeliverables(projectId: string): Promise<DocumentRef[]> {
  const deliverables = await tryApi(
    async () => await api<DeliverableApi[]>(`/projects/${projectId}/deliverables`),
    async () => [],
  )
  return deliverables.map(mapDeliverableFromApi)
}

export async function createProject(
  request: CreateProjectRequest,
): Promise<{ projectId: string; project: AISystem }> {
  const payload = buildCreatePayload(request)
  const response = await api<CreateProjectResponse>('/projects', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  const project = mapProjectFromApi(response)
  return { projectId: project.id, project }
}

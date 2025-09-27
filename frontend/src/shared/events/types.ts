// === Event types ===
import type { UUID, AISystem, RiskAssessment, Incident, DocumentRef, Evidence } from '../../domain/models'

export type AppEvent =
  | { type: 'SYSTEM_CREATED', payload: { system: AISystem } }
  | { type: 'SYSTEM_UPDATED', payload: { system: AISystem } }
  | { type: 'RISK_ASSESSMENT_CREATED', payload: { assessment: RiskAssessment } }
  | { type: 'INCIDENT_REPORTED', payload: { incident: Incident } }
  | { type: 'DOCUMENT_UPDATED', payload: { document: DocumentRef } }
  | { type: 'EVIDENCE_ADDED', payload: { evidence: Evidence } }
  | { type: 'TASKS_CHANGED', payload: { systemId?: UUID } }

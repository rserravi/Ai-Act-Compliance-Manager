import type { ProjectStore } from '../../state/project-store';
import type { DocumentRef } from '../../domain/models';

export type EvidenceSummary = {
  total: number;
  byStatus: Record<string, number>;
};

export function getAuditDocuments(store: ProjectStore, projectId: string | null): DocumentRef[] {
  if (!projectId) return [];
  return store.getDocumentsByProjectId(projectId);
}

export function summarizeEvidences(documents: DocumentRef[]): EvidenceSummary {
  const summary: EvidenceSummary = { total: documents.length, byStatus: {} };
  documents.forEach((doc) => {
    summary.byStatus[doc.status] = (summary.byStatus[doc.status] ?? 0) + 1;
  });
  return summary;
}

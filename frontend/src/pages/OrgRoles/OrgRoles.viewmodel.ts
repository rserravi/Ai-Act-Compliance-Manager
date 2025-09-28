import type { Contact } from '../../domain/models';
import type { ProjectStore } from '../../state/project-store';

export function getProjectContacts(store: ProjectStore, projectId: string | null): Contact[] {
  if (!projectId) return [];
  const project = store.getProjectById(projectId);
  return project?.team ?? [];
}

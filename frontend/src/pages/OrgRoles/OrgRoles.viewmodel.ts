import type { ProjectTeamMember } from '../../domain/models';
import type { ProjectStore } from '../../state/project-store';

export function getProjectContacts(store: ProjectStore, projectId: string | null): ProjectTeamMember[] {
  if (!projectId) return [];
  const project = store.getProjectById(projectId);
  return project?.team ?? [];
}

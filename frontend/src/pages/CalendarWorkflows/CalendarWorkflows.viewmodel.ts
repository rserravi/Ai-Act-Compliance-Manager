import type { ProjectStore } from '../../state/project-store';
import type { Task } from '../../domain/models';

export function getTasksForProject(store: ProjectStore, projectId: string | null): Task[] {
  if (!projectId) return [];
  return store.getTasksByProjectId(projectId);
}

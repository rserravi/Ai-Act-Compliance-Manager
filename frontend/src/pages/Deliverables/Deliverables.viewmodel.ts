import type { DocumentRef, Task } from '../../domain/models';
import type { ProjectStore } from '../../state/project-store';
import {
  assignProjectDeliverable,
  createProjectTask,
  fetchProjectDeliverables
} from '../Projects/Service/projects.service';

export class DeliverablesViewModel {
  constructor(private readonly store: ProjectStore) {}

  getProject(projectId: string | null) {
    if (!projectId) return null;
    return this.store.getProjectById(projectId) ?? null;
  }

  getDocuments(projectId: string | null): DocumentRef[] {
    if (!projectId) return [];
    return this.store.getDocumentsByProjectId(projectId);
  }

  async refreshDocuments(projectId: string): Promise<DocumentRef[]> {
    const documents = await fetchProjectDeliverables(projectId);
    this.store.setDocumentsForProject(projectId, documents);
    return documents;
  }

  uploadNewVersion(docId: string, currentVersion: number) {
    const nextVersion = currentVersion + 1;
    this.store.updateDocument(docId, nextVersion, 'En Revisión');
  }

  async assignDeliverable(
    projectId: string,
    document: DocumentRef,
    assignee: string,
    dueDate: string,
    options: { createTask: boolean }
  ): Promise<void> {
    await assignProjectDeliverable(projectId, document.id, { assignee, dueDate });
    this.store.updateDeliverableAssignment(document.id, { assignee, dueDate });

    if (options.createTask) {
      const task: Task = {
        id: this.#generateId('task'),
        systemId: projectId,
        title: `Preparar entregable: ${document.name}`,
        assignee,
        due: dueDate,
        status: 'todo'
      };
      const createdTask = await createProjectTask(projectId, task);
      this.store.upsertTask(createdTask);
    }

    try {
      await this.refreshDocuments(projectId);
    } finally {
      this.store.updateDeliverableAssignment(document.id, { assignee, dueDate });
    }
  }

  #generateId(prefix: string): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return `${prefix}-${crypto.randomUUID()}`;
    }
    return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

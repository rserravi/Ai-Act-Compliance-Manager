import { useParams } from 'react-router-dom'
import { useProjectContext } from '../../shared/project-context'
import { useMemo, useState } from 'react'
import { DocumentRef, Task } from '../../domain/models'

export function useDeliverablesViewModel() {
  const { id: projectId } = useParams<{ id: string }>()
  const { getDocumentsByProjectId, updateDocument, getProjectById, createTask } = useProjectContext()

  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState<DocumentRef | null>(null)

  const project = useMemo(() => {
    if (!projectId) return undefined
    return getProjectById(projectId)
  }, [projectId, getProjectById])

  const documents = useMemo(() => {
    if (!projectId) return []
    return getDocumentsByProjectId(projectId)
  }, [projectId, getDocumentsByProjectId])

  const handleUpload = (docId: string, currentVersion: number) => {
    const newVersion = currentVersion + 1
    updateDocument(docId, newVersion, 'En Revisión')
  }

  const openAssignModal = (doc: DocumentRef) => {
    setSelectedDoc(doc)
    setAssignModalOpen(true)
  }

  const closeAssignModal = () => {
    setSelectedDoc(null)
    setAssignModalOpen(false)
  }

  const handleAssign = (assignee: string, dueDate: string) => {
    if (!selectedDoc || !projectId) return

    const taskInput: Omit<Task, 'id'> = {
      systemId: projectId,
      title: `Preparar entregable: ${selectedDoc.name}`,
      assignee: assignee,
      due: dueDate,
      status: 'todo'
    }
    createTask(taskInput)
    closeAssignModal()
  }

  return {
    documents,
    project,
    assignModalOpen,
    selectedDoc,
    handleUpload,
    openAssignModal,
    closeAssignModal,
    handleAssign
  }
}
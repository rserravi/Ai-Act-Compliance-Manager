import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useProjectContext } from '../../shared/project-context'

export function useCalendarWorkflowsViewModel() {
  const { id: projectId } = useParams<{ id: string }>()
  const { getTasksByProjectId } = useProjectContext()

  const tasks = useMemo(() => {
    if (!projectId) return []
    return getTasksByProjectId(projectId)
  }, [projectId, getTasksByProjectId])

  return {
    tasks
  }
}
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { projectStore } from '../../state/project-store'
import { useObservableValue } from '../../shared/hooks/useObservable'

export function useCalendarWorkflowsViewModel() {
  const { id: projectId } = useParams<{ id: string }>()
  const tasksState = useObservableValue(projectStore.tasks)

  const tasks = useMemo(() => {
    if (!projectId) return []
    return tasksState.filter(task => task.systemId === projectId)
  }, [projectId, tasksState])

  return {
    tasks
  }
}
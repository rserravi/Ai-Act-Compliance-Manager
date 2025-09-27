import { useEffect, useState } from 'react'
import { listIncidents, type IncidentRow } from './Service/incidents.service'
import { eventBus } from '../../shared/events/bus'
import type { AppEvent } from '../../shared/events/types'

export function useIncidentsViewModel() {
  const [items, setItems] = useState<IncidentRow[]>([])
  async function load() {
    setItems(await listIncidents())
  }
  useEffect(() => { load() }, [])
  useEffect(() => {
    const unsub = eventBus.subscribe((evt: AppEvent) => {
      if (evt.type === 'INCIDENT_REPORTED') load()
    })
    return () => {
      unsub()
    }
  }, [])

  return { items }

}

import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getSystemById } from './Service/system.service'
import { listRiskAssessments, RiskAssessmentRow } from './Service/risk.service'
import type { AISystem } from '../../domain/models'
import { eventBus } from '../../shared/events/bus'
import type { AppEvent } from '../../shared/events/types'

export function useSystemDetailViewModel() {
  const { id } = useParams()
  const [sys, setSys] = useState<AISystem | null>(null)
  const [tab, setTab] = useState(0)
  const [assessments, setAssessments] = useState<RiskAssessmentRow[]>([])
  const [loading, setLoading] = useState(true)

  async function loadAll() {
    if (!id) return
    setLoading(true)
    const [s, ra] = await Promise.all([getSystemById(id), listRiskAssessments(id)])
    setSys(s)
    setAssessments(ra)
    setLoading(false)
  }

  useEffect(() => { loadAll() }, [id])

  useEffect(() => {
    const unsub = eventBus.subscribe((evt: AppEvent) => {
      if (evt.type === 'RISK_ASSESSMENT_CREATED' && evt.payload.assessment.systemId === id) {
        loadAll()
      }
      if (evt.type === 'SYSTEM_UPDATED' && evt.payload.system.id === id) {
        loadAll()
      }
    })
    return () => {
      unsub()
    }
  }, [id])

  return { sys, tab, setTab, assessments, loading, reload: loadAll }
}

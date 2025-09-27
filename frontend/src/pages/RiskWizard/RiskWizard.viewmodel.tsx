import { useState } from 'react'

export function useRiskWizardViewModel() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})

  function next() { setStep(s => Math.min(s + 1, 6)) }
  function back() { setStep(s => Math.max(s - 1, 0)) }
  function set(key: string, value: any) { setAnswers(a => ({ ...a, [key]: value })) }

  const result = step === 6 ? { classification: 'alto', justification: 'Coincide con Anexo III: empleo/credit scoring' } : null

  return { step, next, back, set, answers, result }
}

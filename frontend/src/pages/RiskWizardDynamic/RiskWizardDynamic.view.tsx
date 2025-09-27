import React, { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Paper,
  RadioGroup,
  FormControlLabel,
  Radio,
  MenuItem,
  Select,
  Checkbox,
  ListItemText,
  IconButton,
  Popover,
  Link as MuiLink,
  List,
  TextField,
  ListItemIcon,
  ListItem
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import wizardData from '../../configs/risk-wizard.json'
import type { RiskLevel } from '../../domain/models'
import InfoIcon from '@mui/icons-material/InfoOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'

const STORAGE_KEY = 'risk-wizard-progress'

// Helper to identify the 'None' option in a generic way
const isNoneOption = (option: string) => option.toLowerCase().includes('ninguno') || option.toLowerCase().includes('no se utiliza') || option.toLowerCase().includes('no aplica')

type HelpContent = {
  text: string
  links: Array<{ title: string; url: string }>
}

type Question = {
  id: string
  text: string
  type: 'boolean' | 'select' | 'multiselect' | 'text'
  options?: string[]
  conditional?: {
    on: any
    question: Question
  }
}

type StepConfig = {
  id: string
  title: string
  help?: HelpContent
  questions?: Question[]
  rules?: any[]
  default?: any
}

type Rule = {
  if?: Record<string, any>
  classification: RiskLevel
  justification: string
  translationKey?: string
}

export type RuleResult = Rule & { translationKey: string }

function sanitizeOptionKey(option: string) {
  return option.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
}

function resolveRuleKey(rule: Rule): string {
  if (rule.translationKey) return rule.translationKey
  if (!rule.if) return 'default'
  const entries = Object.entries(rule.if)
  if (entries.length === 0) return 'default'
  const [key, value] = entries[0]
  if (key === 'harm_level' && (value === 'Alto' || value === 'alto' || value === 'High')) {
    return 'harm_level_high'
  }
  return key
}

export default function RiskWizardDynamic({ onFinish, isEmbedded }: { onFinish?: (result: RuleResult) => void, isEmbedded?: boolean }) {
  const steps = wizardData.wizard.steps as StepConfig[]
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [result, setResult] = useState<RuleResult | null>(null)
  const [helpAnchorEl, setHelpAnchorEl] = useState<HTMLButtonElement | null>(null)
  const { t, i18n } = useTranslation()

  const current = steps[step]

  useEffect(() => {
    if (isEmbedded) return
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      setStep(parsed.step || 0)
      setAnswers(parsed.answers || {})
      if (parsed.result) {
        const key = resolveRuleKey(parsed.result)
        setResult({ ...parsed.result, translationKey: key })
      }
    }
  }, [isEmbedded])

  useEffect(() => {
    if (isEmbedded) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, answers, result }))
  }, [step, answers, result, isEmbedded])

  function handleChange(id: string, value: any) {
    setAnswers(a => ({ ...a, [id]: value }))
  }

  function handleMultiselectChange(id: string, value: string[]) {
    const noneOption = current.questions?.find(q => q.id === id)?.options?.find(isNoneOption)
    const lastSelected = value[value.length - 1]

    if (noneOption && lastSelected === noneOption) {
      setAnswers(a => ({ ...a, [id]: [noneOption] }))
      return
    }

    const filteredValue = noneOption ? value.filter(v => v !== noneOption) : value
    setAnswers(a => ({ ...a, [id]: filteredValue }))
  }

  function computeResult(): RuleResult {
    const resultStep = steps.find(s => s.id === 'result')!
    if (resultStep.rules) {
      for (const rule of resultStep.rules as Rule[]) {
        const key = Object.keys(rule.if ?? {})[0]
        const expected = rule.if ? rule.if[key] : undefined
        const answer = answers[key]

        if (expected === 'not_empty') {
          const noneOption = steps.flatMap(s => s.questions).find(q => q?.id === key)?.options?.find(isNoneOption)
          if (Array.isArray(answer) && answer.length > 0 && (noneOption ? !answer.includes(noneOption) : true) ) {
            const translationKey = resolveRuleKey(rule)
            return { ...rule, translationKey }
          }
        } else if (Array.isArray(expected)) {
          if (Array.isArray(answer) && expected.some(v => answer.includes(v))) {
            const translationKey = resolveRuleKey(rule)
            return { ...rule, translationKey }
          }
        } else if (answer === expected) {
          const translationKey = resolveRuleKey(rule)
          return { ...rule, translationKey }
        }
      }
    }
    const translationKey = resolveRuleKey(resultStep.default as Rule)
    return { ...(resultStep.default as Rule), translationKey }
  }

  function next() {
    if (step < steps.length - 2) { // -2 because result is the last step
      setStep(step + 1)
    } else {
      const finalResult = computeResult()
      setResult(finalResult)
      setStep(step + 1) // Go to result screen
    }
  }

  function back() {
    if (step > 0) setStep(step - 1)
  }

  const isStepValid = useMemo(() => {
    if (!current.questions) return true
    return current.questions.every(q => {
      const answer = answers[q.id]
      if (answer === undefined || answer === null) return false
      if (Array.isArray(answer) && answer.length === 0) return false
      if (q.conditional && answers[q.id] === q.conditional.on) {
        const conditionalAnswer = answers[q.conditional.question.id]
        return conditionalAnswer !== undefined && conditionalAnswer !== null && conditionalAnswer !== ''
      }
      return true
    })
  }, [answers, current])

  const stepLabels = useMemo(() =>
    steps.map((s) => t(`riskWizardDynamic.steps.${s.id}`, { defaultValue: s.title })),
    [steps, t, i18n.resolvedLanguage]
  )

  function translateQuestionText(question: Question) {
    return t(`riskWizardDynamic.questions.${question.id}.text`, { defaultValue: question.text })
  }

  function translateOption(questionId: string, option: string) {
    const key = sanitizeOptionKey(option)
    return t(`riskWizardDynamic.questions.${questionId}.options.${key}`, { defaultValue: option })
  }

  const renderQuestion = (question: Question) => {
    const questionText = translateQuestionText(question)
    return (
      <Box key={question.id} sx={{ my: 2, pl: question.id.includes('method') ? 2 : 0 }}>
        <Typography variant="subtitle1">{questionText}</Typography>
        {question.type === 'boolean' && (
          <RadioGroup
            row
            onChange={e => handleChange(question.id, e.target.value === 'true')}
            value={answers[question.id] ?? ''}
          >
            <FormControlLabel value={true} control={<Radio />} label={t('riskWizard.form.yes')} />
            <FormControlLabel value={false} control={<Radio />} label={t('riskWizard.form.no')} />
          </RadioGroup>
        )}
        {question.type === 'select' && (
          <Select
            value={answers[question.id] ?? ''}
            onChange={e => handleChange(question.id, e.target.value)}
            displayEmpty
            fullWidth
          >
            {(question.options ?? []).map((option) => (
              <MenuItem key={option} value={option}>
                {translateOption(question.id, option)}
              </MenuItem>
            ))}
          </Select>
        )}
        {question.type === 'multiselect' && (
          <Select
            multiple
            fullWidth
            value={answers[question.id] ?? []}
            onChange={e => handleMultiselectChange(question.id, e.target.value as string[])}
            renderValue={(selected) => {
              if (!Array.isArray(selected) || selected.length === 0) return <em>{t('riskWizard.form.selectPlaceholder')}</em>
              return selected.map((option) => translateOption(question.id, option)).join(', ')
            }}
            displayEmpty
          >
            {(question.options ?? []).map((option) => (
              <MenuItem key={option} value={option}>
                <Checkbox checked={(answers[question.id] ?? []).includes(option)} />
                <ListItemText primary={translateOption(question.id, option)} />
              </MenuItem>
            ))}
          </Select>
        )}
        {question.type === 'text' && (
          <TextField
            fullWidth
            value={answers[question.id] ?? ''}
            onChange={e => handleChange(question.id, e.target.value)}
          />
        )}
      </Box>
    )
  }

  const currentTitle = t(`riskWizardDynamic.steps.${current.id}`, { defaultValue: current.title })
  const helpOpen = Boolean(helpAnchorEl)

  const resultDetails = result ? t(`riskWizard.results.${result.classification}`, { returnObjects: true }) as { title: string, implications: string, next_steps: string[] } : null

  return (
    <Paper sx={{ p: 2, ...(isEmbedded && { boxShadow: 'none', border: '1px solid', borderColor: 'divider' }) }}>
      <Stepper activeStep={step} alternativeLabel>
        {stepLabels.map((label) => (
          <Step key={label}><StepLabel>{label}</StepLabel></Step>
        ))}
      </Stepper>
      <Box sx={{ my: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Typography variant="h6">{currentTitle}</Typography>
          {current.help && (
            <IconButton size="small" onClick={(e) => setHelpAnchorEl(e.currentTarget)}>
              <InfoIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        {current.questions && current.questions.map((question) => (
          <React.Fragment key={question.id}>
            {renderQuestion(question)}
            {question.conditional && answers[question.id] === question.conditional.on &&
              renderQuestion(question.conditional.question)
            }
          </React.Fragment>
        ))}

        {current.id === 'result' && result && resultDetails && (
          <Box>
            <Typography variant="h4" color="primary" gutterBottom>{resultDetails.title}</Typography>
            
            <Typography variant="h6" sx={{mt: 3}}>{t('riskWizard.result.justification')}</Typography>
            <Typography paragraph>{t(`riskWizardDynamic.rules.${result.translationKey}`, { defaultValue: result.justification })}</Typography>

            <Typography variant="h6" sx={{mt: 2}}>{t('riskWizard.result.implications')}</Typography>
            <Typography paragraph>{resultDetails.implications}</Typography>

            <Typography variant="h6" sx={{mt: 2}}>{t('riskWizard.result.nextSteps')}</Typography>
            <List>
              {resultDetails.next_steps.map((stepText, index) => (
                <ListItem key={index} disableGutters>
                  <ListItemIcon sx={{minWidth: 32}}><CheckCircleOutlineIcon color="success" fontSize="small" /></ListItemIcon>
                  <ListItemText primary={stepText} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Box>
      
      {current.id !== 'result' && (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button disabled={step === 0} onClick={back}>{t('common.back')}</Button>
          <Button variant="contained" onClick={next} disabled={!isStepValid}>
            {step === steps.length - 2 ? t('riskWizard.result.title') : t('common.next')}
          </Button>
        </Box>
      )}

      {current.id === 'result' && result && (
         <Box sx={{ display: 'flex', gap: 1 }}>
          <Button disabled={!onFinish} onClick={() => onFinish?.(result)} variant="contained">
            {t('common.finish')}
          </Button>
        </Box>
      )}

      <Popover
        open={helpOpen}
        anchorEl={helpAnchorEl}
        onClose={() => setHelpAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
      >
        {current.help && (
          <Box sx={{ p: 2, maxWidth: 400 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>{current.help.text}</Typography>
            <List dense>
              {current.help.links.map(link => (
                <ListItemText
                  key={link.url}
                  primary={<MuiLink href={link.url} target="_blank" rel="noopener noreferrer">{link.title}</MuiLink>}
                />
              ))}
            </List>
          </Box>
        )}
      </Popover>
    </Paper>
  )
}

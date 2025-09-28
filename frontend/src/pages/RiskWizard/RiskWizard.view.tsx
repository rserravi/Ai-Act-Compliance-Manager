import React from 'react'
import { Box, Button, Step, StepLabel, Stepper, Typography, RadioGroup, FormControlLabel, Radio, Paper } from '@mui/material'
import { useI18n } from '../../shared/i18n'
import { useRiskWizardViewModel } from './RiskWizard.viewmodel'

export default function RiskWizardView() {
  const { step, next, back, set, result } = useRiskWizardViewModel()
  const { t } = useI18n()
  const steps = React.useMemo(() => [
    t('riskWizard.steps.context'),
    t('riskWizard.steps.rights'),
    t('riskWizard.steps.biometric'),
    t('riskWizard.steps.damage'),
    t('riskWizard.steps.annexIII'),
    t('riskWizard.steps.transparency'),
    t('riskWizard.steps.result')
  ], [t])

  return (
    <Paper sx={{ p: 2 }}>
      <Stepper activeStep={step} alternativeLabel sx={{ mb: 2 }}>
        {steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
      </Stepper>

      {step < 6 && (
        <Box sx={{ my: 2 }}>
          <Typography variant="h6">{steps[step]}</Typography>
          <RadioGroup onChange={(e) => set('step'+step, e.target.value)}>
            <FormControlLabel value="si" control={<Radio />} label={t('riskWizard.form.yes')} />
            <FormControlLabel value="no" control={<Radio />} label={t('riskWizard.form.no')} />
          </RadioGroup>
        </Box>
      )}

      {step === 6 && (
        <Box sx={{ my: 2 }}>
          <Typography variant="h6">{t('riskWizard.result.title')}</Typography>
          <Typography>{t('riskWizard.result.classificationLabel')} <b>{result ? t(`riskLevels.${result.classification}`) : ''}</b></Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>{t('riskWizard.result.justification')}</Typography>
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button disabled={step===0} onClick={back}>{t('common.back')}</Button>
        <Button variant="contained" onClick={next}>{step===6 ? t('common.finish') : t('common.next')}</Button>
      </Box>
    </Paper>
  )
}

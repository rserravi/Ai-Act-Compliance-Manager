import { useI18n } from '../../shared/i18n'
import { AISystem, type Contact } from '../../domain/models'
import RiskWizardDynamic, { type RuleResult } from '../RiskWizardDynamic/RiskWizardDynamic.view'
import { useNavigate } from 'react-router-dom'
import { projectStore } from '../../state/project-store'
import React from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Autocomplete,
  Chip,
  Select
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'

const roleOptions: AISystem['role'][] = ['provider', 'importer', 'distributor', 'user']
const notificationOptions = ['email', 'sms', 'slack', 'whatsapp']
const raciActivities = ['Risk Assessment', 'Documentation', 'Audit', 'Data Governance']

type RaciRow = {
  activity: string
  responsible: string
  accountable: string
  consulted: string
  informed: string
}

export default function ProjectsWizardView() {
  const { t } = useI18n()
  const navigate = useNavigate()

  const [activeStep, setActiveStep] = React.useState(0)
  // Step 0
  const [name, setName] = React.useState('')
  const [role, setRole] = React.useState<AISystem['role']>('provider')
  const [businessUnits, setBusinessUnits] = React.useState<string[]>([])
  // Step 1
  const [team, setTeam] = React.useState<Contact[]>([])
  const [contactDialogOpen, setContactDialogOpen] = React.useState(false)
  const [currentContact, setCurrentContact] = React.useState<Partial<Contact> | null>(null)
  const [raciData, setRaciData] = React.useState<RaciRow[]>(
    raciActivities.map(activity => ({ activity, responsible: '', accountable: '', consulted: '', informed: '' }))
  )
  // Step 2
  const [risk, setRisk] = React.useState<AISystem['risk']>()
  // Step 3
  const [notes, setNotes] = React.useState('')

  const steps = [
    t('projects.wizard.steps.details'),
    t('projects.wizard.steps.team'),
    t('projects.wizard.steps.riskAssessment'),
    t('projects.wizard.steps.summary')
  ]

  function handleNext() {
    if (activeStep === steps.length - 1) {
      const project = projectStore.createProject({
        name,
        role,
        risk,
        team: team,
        businessUnit: businessUnits.join(', ')
      })
      // TODO: Save raciData somewhere
      navigate(`/projects/${project.id}/deliverables`, { replace: true })
      return
    }
    setActiveStep((prev) => prev + 1)
  }

  function handleBack() {
    setActiveStep((prev) => Math.max(prev - 1, 0))
  }

  function handleRiskFinish(result: RuleResult) {
    setRisk(result.classification)
    handleNext()
  }

  const handleSaveContact = () => {
    if (currentContact?.name) {
      setTeam(prev => [...prev, { ...currentContact, id: `contact-${Date.now()}` } as Contact])
      setContactDialogOpen(false)
      setCurrentContact(null)
    }
  }

  const handleDeleteContact = (id: string) => {
    setTeam(prev => prev.filter(c => c.id !== id))
  }

  const handleRaciChange = (activity: string, role: keyof Omit<RaciRow, 'activity'>, value: string) => {
    setRaciData(prev =>
      prev.map(row => (row.activity === activity ? { ...row, [role]: value } : row))
    )
  }

  const detailStepValid = name.trim().length > 0 && !!role
  const teamStepValid = true // Or add validation for team size
  const riskStepValid = !!risk
  const canAdvance = [detailStepValid, teamStepValid, riskStepValid, true][activeStep]

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', py: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 3 }}>{t('projects.wizard.title')}</Typography>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
            {steps.map(step => (
              <Step key={step}>
                <StepLabel>{step}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {activeStep === 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label={t('projects.wizard.fields.name')}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label={t('projects.wizard.fields.role')}
                  value={role}
                  onChange={(event) => setRole(event.target.value as AISystem['role'])}
                  fullWidth
                >
                  {roleOptions.map(option => (
                    <MenuItem key={option} value={option}>{t(`roles.${option}`)}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  multiple
                  freeSolo
                  options={[]}
                  value={businessUnits}
                  onChange={(event, newValue) => {
                    setBusinessUnits(newValue as string[])
                  }}
                  renderTags={(value: readonly string[], getTagProps) =>
                    value.map((option: string, index: number) => (
                      <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label={t('projects.wizard.fields.businessUnit')}
                      placeholder="Añadir unidad de negocio"
                    />
                  )}
                />
              </Grid>
            </Grid>
          )}

          {activeStep === 1 && (
            <Stack spacing={4}>
              <Box>
                <Typography variant="h6" gutterBottom>{t('projects.wizard.steps.team')}</Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('orgRoles.contacts.columns.name')}</TableCell>
                      <TableCell>{t('orgRoles.contacts.columns.role')}</TableCell>
                      <TableCell>{t('orgRoles.contacts.columns.email')}</TableCell>
                      <TableCell align="right">{t('projects.columns.actions')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {team.map(contact => (
                      <TableRow key={contact.id}>
                        <TableCell>{contact.name}</TableCell>
                        <TableCell>{contact.role}</TableCell>
                        <TableCell>{contact.email}</TableCell>
                        <TableCell align="right">
                          <IconButton size="small" onClick={() => handleDeleteContact(contact.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Button sx={{mt: 1}} variant="outlined" onClick={() => setContactDialogOpen(true)}>
                  {t('projects.wizard.addContact')}
                </Button>
              </Box>
              <Box>
                <Typography variant="h6" gutterBottom>{t('orgRoles.matrix.title')}</Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('orgRoles.matrix.columns.system')}</TableCell>
                      <TableCell>{t('orgRoles.matrix.columns.responsible')}</TableCell>
                      <TableCell>{t('orgRoles.matrix.columns.accountable')}</TableCell>
                      <TableCell>{t('orgRoles.matrix.columns.consulted')}</TableCell>
                      <TableCell>{t('orgRoles.matrix.columns.informed')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {raciData.map((row) => (
                      <TableRow key={row.activity}>
                        <TableCell>{row.activity}</TableCell>
                        {(['responsible', 'accountable', 'consulted', 'informed'] as const).map(role => (
                          <TableCell key={role}>
                            <Select
                              fullWidth
                              variant="standard"
                              value={row[role]}
                              onChange={(e) => handleRaciChange(row.activity, role, e.target.value)}
                              displayEmpty
                            >
                              <MenuItem value=""><em>None</em></MenuItem>
                              {team.map(contact => (
                                <MenuItem key={contact.id} value={contact.name}>{contact.name}</MenuItem>
                              ))}
                            </Select>
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Stack>
          )}

          {activeStep === 2 && (
            <RiskWizardDynamic isEmbedded onFinish={handleRiskFinish} />
          )}

          {activeStep === 3 && (
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>{t('projects.wizard.summary.title')}</Typography>
              <Stack spacing={1}>
                <Typography variant="body2"><strong>{t('projects.wizard.fields.name')}:</strong> {name}</Typography>
                <Typography variant="body2"><strong>{t('projects.wizard.fields.role')}:</strong> {t(`roles.${role}`)}</Typography>
                {businessUnits.length > 0 && <Typography variant="body2"><strong>{t('projects.wizard.fields.businessUnit')}:</strong> {businessUnits.join(', ')}</Typography>}
                <Typography variant="body2"><strong>{t('projects.wizard.fields.team')}:</strong> {team.map(c => c.name).join(', ') || t('common.notAvailable')}</Typography>
                <Typography variant="body2"><strong>{t('projects.wizard.fields.risk')}:</strong> {risk ? t(`riskLevels.${risk}`) : t('common.notAvailable')}</Typography>
                <Typography variant="body2"><strong>{t('projects.wizard.fields.notes')}:</strong></Typography>
                <TextField
                  label={t('projects.wizard.fields.notes')}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  fullWidth
                  multiline
                  minRows={3}
                  placeholder={t('projects.wizard.placeholders.notes')}
                />
              </Stack>
            </Box>
          )}

          {activeStep !== 2 && (
            <Stack direction="row" justifyContent="space-between" sx={{ mt: 4 }}>
              <Button disabled={activeStep === 0} onClick={handleBack}>{t('common.back')}</Button>
              <Button variant="contained" onClick={handleNext} disabled={!canAdvance}>
                {activeStep === steps.length - 1 ? t('projects.wizard.finish') : t('common.next')}
              </Button>
            </Stack>
          )}
        </CardContent>
      </Card>

      <Dialog open={contactDialogOpen} onClose={() => setContactDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('projects.wizard.addContact')}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label={t('projects.wizard.contact.name')}
              fullWidth
              onChange={(e) => setCurrentContact(c => ({ ...c, name: e.target.value }))}
            />
            <TextField
              label={t('projects.wizard.contact.role')}
              fullWidth
              onChange={(e) => setCurrentContact(c => ({ ...c, role: e.target.value }))}
            />
            <TextField
              label={t('projects.wizard.contact.email')}
              type="email"
              fullWidth
              onChange={(e) => setCurrentContact(c => ({ ...c, email: e.target.value }))}
            />
            <TextField
              label={t('projects.wizard.contact.phone')}
              fullWidth
              onChange={(e) => setCurrentContact(c => ({ ...c, phone: e.target.value }))}
            />
            <TextField
              select
              label={t('projects.wizard.contact.notification')}
              defaultValue="email"
              fullWidth
              onChange={(e) => setCurrentContact(c => ({ ...c, notification: e.target.value }))}
            >
              {notificationOptions.map(option => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContactDialogOpen(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleSaveContact}>{t('common.send')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
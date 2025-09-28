import React from 'react'
import { Box, Tabs, Tab, Typography, Paper, Stack, Chip, Divider, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Alert } from '@mui/material'
import { useSystemDetailViewModel } from './SystemDetail.viewmodel'
import type { IncidentSeverity, IncidentStatus } from '../../domain/models'
import { reportIncident } from '../Incidents/Service/incidents.service'
import { eventBus } from '../../shared/events/bus'
import { useI18n } from '../../shared/i18n'

function TabPanel({ index, value, children }: any) {
  return value === index ? <Box sx={{ py: 2 }}>{children}</Box> : null
}

export default function SystemDetailView() {
  const { sys, tab, setTab, assessments, loading } = useSystemDetailViewModel()
  const { t } = useI18n()
  const [open, setOpen] = React.useState(false)
  const [title, setTitle] = React.useState('')
  const [severity, setSeverity] = React.useState<IncidentSeverity>('media')
  const [description, setDescription] = React.useState('')
  const [sent, setSent] = React.useState<null | string>(null)

  if (loading) return <Typography>{t('systemDetail.loading')}</Typography>
  if (!sys) return <Typography>{t('systemDetail.notFound')}</Typography>

  async function submitIncident() {
    const status: IncidentStatus = 'abierto'
    const payload = { systemId: sys.id, severity, status, title, description }
    const created = await reportIncident(payload)
    eventBus.emit({ type: 'INCIDENT_REPORTED', payload: { incident: created } })
    setSent(created.id || 'ok')
    setOpen(false)
    setTitle('')
    setDescription('')
    setSeverity('media')
  }

  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ mb: 2, alignItems: 'center' }}>
        <Typography variant="h5">{sys.name}</Typography>
        <Chip label={t('systemDetail.chips.role', { role: sys.role ? t(`roles.${sys.role}`) : t('common.notAvailable') })} />
        <Chip label={t('systemDetail.chips.risk', { risk: sys.risk ? t(`riskLevels.${sys.risk}`) : t('common.notAvailable') })} />
        <Chip label={t('systemDetail.chips.doc', { doc: sys.docStatus ? t(`docStatus.${sys.docStatus}`) : t('common.notAvailable') })} />
        <Box sx={{ flexGrow: 1 }} />
        <Button variant="outlined" onClick={() => setOpen(true)}>{t('systemDetail.actions.reportIncident')}</Button>
      </Stack>

      {sent && <Alert severity="success" sx={{ mb: 2 }}>{t('systemDetail.alerts.incidentReported', { id: sent })}</Alert>}

      <Paper>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label={t('systemDetail.tabs.overview')} />
          <Tab label={t('systemDetail.tabs.risk')} />
          <Tab label={t('systemDetail.tabs.documentation')} />
          <Tab label={t('systemDetail.tabs.workflows')} />
          <Tab label={t('systemDetail.tabs.evidences')} />
          <Tab label={t('systemDetail.tabs.history')} />
        </Tabs>
        <Divider />
        <Box sx={{ p: 2 }}>
          <TabPanel index={0} value={tab}>
            <Typography>{t('systemDetail.content.overview')}</Typography>
          </TabPanel>
          <TabPanel index={1} value={tab}>
            <Typography variant="h6" sx={{ mb: 1 }}>{t('systemDetail.content.riskTitle')}</Typography>
            {assessments.length === 0 && <Typography variant="body2">{t('systemDetail.content.riskEmpty')}</Typography>}
            {assessments.map(a => (
              <Paper key={a.id} sx={{ p: 1, mb: 1 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Chip label={a.classification} />
                  <Typography variant="body2">{new Date(a.createdAt).toLocaleString()}</Typography>
                </Stack>
                <Typography variant="body2" sx={{ mt: 1 }}>{a.justification}</Typography>
              </Paper>
            ))}
          </TabPanel>
          <TabPanel index={2} value={tab}>
            <Typography>{t('systemDetail.content.documentation')}</Typography>
          </TabPanel>
          <TabPanel index={3} value={tab}>
            <Typography>{t('systemDetail.content.workflows')}</Typography>
          </TabPanel>
          <TabPanel index={4} value={tab}>
            <Typography>{t('systemDetail.content.evidences')}</Typography>
          </TabPanel>
          <TabPanel index={5} value={tab}>
            <Typography>{t('systemDetail.content.history')}</Typography>
          </TabPanel>
        </Box>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('systemDetail.dialog.title')}</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, pt: 2 }}>
          <TextField label={t('systemDetail.dialog.fields.title')} value={title} onChange={e => setTitle(e.target.value)} />
          <TextField select label={t('systemDetail.dialog.fields.severity')} value={severity} onChange={e => setSeverity(e.target.value as IncidentSeverity)}>
            <MenuItem value="alta">{t('incident.severity.alta')}</MenuItem>
            <MenuItem value="media">{t('incident.severity.media')}</MenuItem>
            <MenuItem value="baja">{t('incident.severity.baja')}</MenuItem>
          </TextField>
          <TextField multiline minRows={3} label={t('systemDetail.dialog.fields.description')} value={description} onChange={e => setDescription(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>{t('systemDetail.dialog.actions.cancel')}</Button>
          <Button variant="contained" onClick={submitIncident} disabled={!title}>{t('systemDetail.dialog.actions.submit')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

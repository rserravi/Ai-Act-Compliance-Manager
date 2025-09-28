import React, { useMemo } from 'react'
import { Grid, Card, CardContent, CardHeader, Typography, LinearProgress, Stack, Chip, Box, Divider, List, ListItem, ListItemText, Table, TableHead, TableRow, TableCell, TableBody, TableContainer } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useI18n } from '../../shared/i18n'
import { useDashboardViewModel } from './Dashboard.viewmodel'

type TimelineType = 'riskAssessment' | 'incidentClosed' | 'documentUpdated' | 'taskCreated'
type Priority = 'high' | 'medium' | 'low'
type Status = 'todo' | 'in_review' | 'approved'

export default function DashboardView() {
  const { kpis, complianceByBusinessUnit, timeline, pendingActions, docStatusOrder } = useDashboardViewModel()
  const { t, i18n } = useI18n()
  const theme = useTheme()

  const dateFormatter = useMemo(() => new Intl.DateTimeFormat(i18n.language, { dateStyle: 'short', timeStyle: 'short' }), [i18n.language])
  const dateFormatterShort = useMemo(() => new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium' }), [i18n.language])

  const docStatusColors: Record<string, string> = {
    vigente: theme.palette.success.main,
    borrador: theme.palette.warning.main,
    obsoleta: theme.palette.error.main,
    na: theme.palette.grey[500]
  }

  const timelineChipColor: Record<TimelineType, 'default' | 'primary' | 'success' | 'info' | 'warning'> = {
    riskAssessment: 'primary',
    incidentClosed: 'success',
    documentUpdated: 'info',
    taskCreated: 'warning'
  }

  const priorityColor: Record<Priority, 'error' | 'warning' | 'default'> = {
    high: 'error',
    medium: 'warning',
    low: 'default'
  }

  const statusColor: Record<Status, 'default' | 'info' | 'success'> = {
    todo: 'default',
    in_review: 'info',
    approved: 'success'
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant="overline">{t('dashboard.metrics.docValid')}</Typography>
            <Typography variant="h4">{kpis.docVigentePct}%</Typography>
            <LinearProgress variant="determinate" value={kpis.docVigentePct} sx={{ mt: 1 }} />
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant="overline">{t('dashboard.metrics.highRisk')}</Typography>
            <Typography variant="h4">{kpis.highRisk}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant="overline">{t('dashboard.metrics.totalSystems')}</Typography>
            <Typography variant="h4">{kpis.totalSystems}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant="overline">{t('dashboard.metrics.tasksToday')}</Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Chip label={t('dashboard.metrics.tasksPending', { count: kpis.tasksToday })} />
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%' }}>
          <CardHeader
            title={t('dashboard.compliance.title')}
            subheader={t('dashboard.compliance.subtitle')}
          />
          <CardContent>
            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
              {docStatusOrder.map(status => (
                <Chip
                  key={status}
                  label={t(`docStatus.${status}`)}
                  size="small"
                  sx={{ backgroundColor: docStatusColors[status], color: theme.palette.getContrastText(docStatusColors[status]) }}
                />
              ))}
            </Stack>
            {complianceByBusinessUnit.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                {t('dashboard.compliance.units.noData')}
              </Typography>
            )}
            <Stack spacing={2}>
              {complianceByBusinessUnit.map(entry => {
                const segments = docStatusOrder.map(status => {
                  const count = entry.totals[status] ?? 0
                  const percent = entry.total ? (count / entry.total) * 100 : 0
                  return { status, count, percent }
                }).filter(segment => segment.count > 0)

                return (
                  <Box key={entry.businessUnit}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle2">{entry.businessUnit}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t('dashboard.compliance.totalLabel', { count: entry.total })}
                      </Typography>
                    </Stack>
                    <Box sx={{ mt: 1, display: 'flex', height: 12, borderRadius: 1, overflow: 'hidden', bgcolor: theme.palette.divider }}>
                      {segments.length === 0 ? (
                        <Box sx={{ flex: 1, bgcolor: theme.palette.grey[300] }} />
                      ) : (
                        segments.map(segment => (
                          <Box
                            key={segment.status}
                            sx={{
                              width: `${segment.percent}%`,
                              bgcolor: docStatusColors[segment.status],
                              transition: 'width 0.3s ease'
                            }}
                          />
                        ))
                      )}
                    </Box>
                    <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                      {docStatusOrder.map(status => {
                        const count = entry.totals[status] ?? 0
                        if (!count) return null
                        return (
                          <Chip
                            key={status}
                            label={`${t(`docStatus.${status}`)} · ${count}`}
                            size="small"
                            sx={{ backgroundColor: docStatusColors[status], color: theme.palette.getContrastText(docStatusColors[status]) }}
                          />
                        )
                      })}
                    </Stack>
                  </Box>
                )
              })}
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%' }}>
          <CardHeader
            title={t('dashboard.timeline.title')}
            subheader={t('dashboard.timeline.subtitle')}
          />
          <CardContent sx={{ pt: 0 }}>
            {timeline.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                {t('dashboard.timeline.empty')}
              </Typography>
            ) : (
              <List disablePadding>
                {timeline.map((event, index) => {
                  const chipColor = timelineChipColor[event.type as TimelineType] ?? 'default'
                  const date = new Date(event.date)
                  const metadata = event.metadata ?? {}
                  const system = metadata.system
                  const risk = metadata.classification ? t(`riskLevels.${metadata.classification}`) : undefined
                  return (
                    <React.Fragment key={event.id}>
                      <ListItem
                        alignItems="flex-start"
                        disableGutters
                        secondaryAction={<Chip size="small" label={t(`dashboard.timeline.types.${event.type}`)} color={chipColor} />}
                      >
                        <ListItemText
                          primary={
                            <Stack direction="row" justifyContent="space-between" spacing={2}>
                              <Typography variant="subtitle2">
                                {t(`dashboard.timeline.items.${event.type}.title`)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {dateFormatter.format(date)}
                              </Typography>
                            </Stack>
                          }
                          secondary={
                            <Typography variant="body2" color="text.secondary">
                              {t(`dashboard.timeline.items.${event.type}.description`, {
                                system,
                                risk,
                                incident: metadata.incident,
                                owner: metadata.owner,
                                document: metadata.document,
                                task: metadata.task
                              })}
                            </Typography>
                          }
                        />
                      </ListItem>
                      {index < timeline.length - 1 && <Divider component="li" sx={{ my: 1 }} />}
                    </React.Fragment>
                  )
                })}
              </List>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardHeader
            title={t('dashboard.actions.title')}
            subheader={t('dashboard.actions.subtitle')}
          />
          <CardContent sx={{ pt: 0 }}>
            {pendingActions.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                {t('dashboard.actions.empty')}
              </Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('dashboard.actions.columns.task')}</TableCell>
                      <TableCell>{t('dashboard.actions.columns.system')}</TableCell>
                      <TableCell>{t('dashboard.actions.columns.due')}</TableCell>
                      <TableCell>{t('dashboard.actions.columns.owner')}</TableCell>
                      <TableCell>{t('dashboard.actions.columns.status')}</TableCell>
                      <TableCell>{t('dashboard.actions.columns.priority')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingActions.map(action => {
                      const dueDate = dateFormatterShort.format(new Date(action.due))
                      return (
                        <TableRow key={action.id} hover>
                          <TableCell>{t(action.titleKey, { system: action.systemName })}</TableCell>
                          <TableCell>{action.systemName}</TableCell>
                          <TableCell>{dueDate}</TableCell>
                          <TableCell>{action.owner}</TableCell>
                          <TableCell>
                            <Chip
                              label={t(`dashboard.actions.status.${action.status}`)}
                              size="small"
                              color={statusColor[action.status]}
                              variant={action.status === 'todo' ? 'outlined' : 'filled'}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={t(`dashboard.actions.priority.${action.priority}`)}
                              size="small"
                              color={priorityColor[action.priority]}
                              variant={action.priority === 'low' ? 'outlined' : 'filled'}
                            />
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

import React from 'react'
import { Card, CardHeader, CardContent, Tabs, Tab, Box, Table, TableHead, TableRow, TableCell, TableBody, Chip, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

const audits = [
  { id: 'au-1', name: 'AI Act readiness', scope: 'Motor RRHH', date: '2025-09-20', owner: 'Laura Pérez', status: 'scheduled' },
  { id: 'au-2', name: 'Data governance review', scope: 'Scoring Crédito', date: '2025-10-05', owner: 'Marcos Díaz', status: 'in_progress' },
  { id: 'au-3', name: 'Security controls', scope: 'Monitorización Fraude', date: '2025-10-18', owner: 'Equipo SecOps', status: 'completed' }
]

const evidences = [
  { id: 'EV-101', type: 'dataset', system: 'Chat Soporte', updated: '2025-09-12', owner: 'Data Office' },
  { id: 'EV-204', type: 'audit', system: 'Motor RRHH', updated: '2025-09-08', owner: 'Compliance' },
  { id: 'EV-305', type: 'security', system: 'Monitorización Fraude', updated: '2025-09-10', owner: 'SecOps' }
]

export default function AuditEvidencesView() {
  const { t, i18n } = useTranslation()
  const [tab, setTab] = React.useState(0)
  const dateFormatter = React.useMemo(() => new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium' }), [i18n.language])

  return (
    <Card>
      <CardHeader title={t('auditEvidences.title')} />
      <CardContent>
        <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ mb: 2 }}>
          <Tab label={t('auditEvidences.tabs.audits')} />
          <Tab label={t('auditEvidences.tabs.evidences')} />
        </Tabs>

        {tab === 0 && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>{t('auditEvidences.audits.upcomingTitle')}</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('auditEvidences.audits.columns.name')}</TableCell>
                  <TableCell>{t('auditEvidences.audits.columns.scope')}</TableCell>
                  <TableCell>{t('auditEvidences.audits.columns.date')}</TableCell>
                  <TableCell>{t('auditEvidences.audits.columns.owner')}</TableCell>
                  <TableCell>{t('auditEvidences.audits.columns.status')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {audits.map(audit => (
                  <TableRow key={audit.id}>
                    <TableCell>{audit.name}</TableCell>
                    <TableCell>{audit.scope}</TableCell>
                    <TableCell>{dateFormatter.format(new Date(audit.date))}</TableCell>
                    <TableCell>{audit.owner}</TableCell>
                    <TableCell>
                      <Chip
                        label={t(`auditEvidences.audits.status.${audit.status}`)}
                        size="small"
                        color={audit.status === 'completed' ? 'success' : audit.status === 'in_progress' ? 'warning' : 'default'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}

        {tab === 1 && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>{t('auditEvidences.evidences.tableTitle')}</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('auditEvidences.evidences.columns.id')}</TableCell>
                  <TableCell>{t('auditEvidences.evidences.columns.type')}</TableCell>
                  <TableCell>{t('auditEvidences.evidences.columns.system')}</TableCell>
                  <TableCell>{t('auditEvidences.evidences.columns.updated')}</TableCell>
                  <TableCell>{t('auditEvidences.evidences.columns.owner')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {evidences.map(evidence => (
                  <TableRow key={evidence.id}>
                    <TableCell>{evidence.id}</TableCell>
                    <TableCell>
                      <Chip label={t(`auditEvidences.evidences.types.${evidence.type}`)} size="small" />
                    </TableCell>
                    <TableCell>{evidence.system}</TableCell>
                    <TableCell>{dateFormatter.format(new Date(evidence.updated))}</TableCell>
                    <TableCell>{evidence.owner}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

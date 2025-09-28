import React from 'react'
import { Grid, Card, CardHeader, CardContent, Typography, Table, TableBody, TableCell, TableHead, TableRow, List, ListItem, ListItemText, Stack, Chip } from '@mui/material'
import { useI18n } from '../../shared/i18n'

const businessUnits = [
  { id: 'bu-1', name: 'People & Culture', lead: 'Laura Pérez' },
  { id: 'bu-2', name: 'Risk & Compliance', lead: 'Marcos Díaz' },
  { id: 'bu-3', name: 'Customer Care', lead: 'Sofía Vidal' }
]

const raciMatrix = [
  { system: 'Motor RRHH', responsible: 'Laura Pérez', accountable: 'Marcos Díaz', consulted: 'Sofía Vidal', informed: 'Consejo Ético' },
  { system: 'Scoring Crédito', responsible: 'Marcos Díaz', accountable: 'Dirección Riesgos', consulted: 'Legal', informed: 'Comité ESG' },
  { system: 'Chat Soporte', responsible: 'Sofía Vidal', accountable: 'Dirección CX', consulted: 'Seguridad', informed: 'Relaciones Laborales' }
]

const keyContacts = [
  { name: 'Laura Pérez', roleKey: 'orgRoles.roles.complianceLead', email: 'laura.perez@example.com', phone: '+34 600 123 456' },
  { name: 'Marcos Díaz', roleKey: 'orgRoles.roles.riskOwner', email: 'marcos.diaz@example.com', phone: '+34 600 987 654' },
  { name: 'Ana López', roleKey: 'orgRoles.roles.legalAdvisor', email: 'ana.lopez@example.com', phone: '+34 600 222 333' },
  { name: 'Jordi Serra', roleKey: 'orgRoles.roles.dataSteward', email: 'jordi.serra@example.com', phone: '+34 600 444 555' }
]

export default function OrgRolesView() {
  const { t } = useI18n()

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <Card sx={{ height: '100%' }}>
          <CardHeader
            title={t('orgRoles.units.title')}
            subheader={t('orgRoles.units.description')}
          />
          <CardContent>
            <List>
              {businessUnits.map(unit => (
                <ListItem key={unit.id} disableGutters sx={{ pb: 1 }}>
                  <ListItemText
                    primary={<Typography variant="subtitle2">{unit.name}</Typography>}
                    secondary={<Typography variant="body2" color="text.secondary">{unit.lead}</Typography>}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={8}>
        <Card>
          <CardHeader title={t('orgRoles.matrix.title')} />
          <CardContent>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('orgRoles.matrix.columns.system')}</TableCell>
                  <TableCell align="center">{t('orgRoles.matrix.columns.responsible')}</TableCell>
                  <TableCell align="center">{t('orgRoles.matrix.columns.accountable')}</TableCell>
                  <TableCell align="center">{t('orgRoles.matrix.columns.consulted')}</TableCell>
                  <TableCell align="center">{t('orgRoles.matrix.columns.informed')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {raciMatrix.map(row => (
                  <TableRow key={row.system}>
                    <TableCell>{row.system}</TableCell>
                    <TableCell align="center">{row.responsible}</TableCell>
                    <TableCell align="center">{row.accountable}</TableCell>
                    <TableCell align="center">{row.consulted}</TableCell>
                    <TableCell align="center">{row.informed}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardHeader title={t('orgRoles.contacts.title')} />
          <CardContent>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('orgRoles.contacts.columns.name')}</TableCell>
                  <TableCell>{t('orgRoles.contacts.columns.role')}</TableCell>
                  <TableCell>{t('orgRoles.contacts.columns.email')}</TableCell>
                  <TableCell>{t('orgRoles.contacts.columns.phone')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {keyContacts.map(contact => (
                  <TableRow key={contact.email}>
                    <TableCell>{contact.name}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip label={t(contact.roleKey)} size="small" />
                      </Stack>
                    </TableCell>
                    <TableCell>{contact.email}</TableCell>
                    <TableCell>{contact.phone}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

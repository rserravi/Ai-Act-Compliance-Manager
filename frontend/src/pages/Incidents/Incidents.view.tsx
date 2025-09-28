import React from 'react'
import { Paper } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { useI18n } from '../../shared/i18n'
import { useIncidentsViewModel } from './Incidents.viewmodel'

export default function IncidentsView() {
  const { items } = useIncidentsViewModel()
  const { t } = useI18n()

  const columns: GridColDef[] = [
    { field: 'id', headerName: t('incidents.columns.id'), width: 120 },
    { field: 'system', headerName: t('incidents.columns.system'), flex: 1 },
    {
      field: 'severity',
      headerName: t('incidents.columns.severity'),
      width: 140,
      valueFormatter: ({ value }) => value ? t(`incident.severity.${value as string}`) : value
    },
    {
      field: 'status',
      headerName: t('incidents.columns.status'),
      width: 140,
      valueFormatter: ({ value }) => value ? t(`incident.status.${value as string}`) : value
    },
    { field: 'date', headerName: t('incidents.columns.date'), width: 180 }
  ]

  return (
    <Paper sx={{ height: 420 }}>
      <DataGrid rows={items} columns={columns} getRowId={(r) => r.id} disableRowSelectionOnClick />
    </Paper>
  )
}

import React from 'react'
import {
  Box,
  Button,
  Grid,
  TextField,
  MenuItem,
  Paper,
  CircularProgress,
  Chip,
  Stack,
  Typography
} from '@mui/material'
import { DataGrid, GridColDef, GridRenderCellParams, GridValueGetter } from '@mui/x-data-grid'
import { useTranslation } from 'react-i18next'
import { useProjectsViewModel } from './Projects.viewmodel'
import { useNavigate } from 'react-router-dom'
import type { AISystem } from '../../domain/models'
import { useProjectContext } from '../../shared/project-context'

const roleFilterValues = ['', 'provider', 'importer', 'distributor', 'user'] as const
const riskFilterValues = ['', 'alto', 'limitado', 'minimo'] as const
const docFilterValues = ['', 'vigente', 'borrador', 'obsoleta', 'na'] as const

type ProjectState = 'initial' | 'in_progress' | 'maintenance'

type ProjectRow = AISystem & {
  projectState: ProjectState
  roleLabel: string
  riskLabel: string
  docLabel: string
}

function resolveProjectState(system: AISystem): ProjectState {
  if (!system.docStatus || system.docStatus === 'na') return 'initial'
  if (system.docStatus === 'vigente') return 'maintenance'
  return 'in_progress'
}

export default function ProjectsView() {
  const navigate = useNavigate()
  const { setActiveProjectId } = useProjectContext()
  const { items, loading, setFilter } = useProjectsViewModel()
  const { t, i18n } = useTranslation()

  const rows = React.useMemo<ProjectRow[]>(() =>
    items.map((item) => ({
      ...item,
      projectState: resolveProjectState(item),
      roleLabel: item.role ? t(`roles.${item.role}`) : t('common.notAvailable'),
      riskLabel: item.risk ? t(`riskLevels.${item.risk}`) : t('common.notAvailable'),
      docLabel: item.docStatus ? t(`docStatus.${item.docStatus}`) : t('common.notAvailable')
    }))
  , [items, t, i18n.resolvedLanguage])

  const stateColors: Record<ProjectState, 'default' | 'warning' | 'success'> = {
    initial: 'default',
    in_progress: 'warning',
    maintenance: 'success'
  }

  const riskColors: Record<string, 'error' | 'warning' | 'info' | 'success' | 'default'> = {
    alto: 'error',
    limitado: 'warning',
    minimo: 'default'
  }

  const docColors: Record<string, 'error' | 'warning' | 'success' | 'default'> = {
    vigente: 'success',
    borrador: 'warning',
    obsoleta: 'error',
    na: 'default'
  }

  const columns: GridColDef<ProjectRow>[] = [
    { field: 'name', headerName: t('projects.columns.name'), flex: 1, minWidth: 200 },
    {
      field: 'role',
      headerName: t('projects.columns.role'),
      width: 180,
      valueGetter: ((value, row) => row.roleLabel) as GridValueGetter<ProjectRow>,
      renderCell: (params: GridRenderCellParams<ProjectRow>) => (
        <Chip
          label={params.row.roleLabel}
          size="small"
          variant={params.row.role ? 'filled' : 'outlined'}
        />
      )
    },
    {
      field: 'projectState',
      headerName: t('projects.columns.state'),
      width: 160,
      renderCell: (params: GridRenderCellParams<ProjectRow, ProjectState>) => {
        const state = params.row.projectState
        return (
          <Chip
            label={t(`projects.state.labels.${state}`)}
            color={stateColors[state]}
            size="small"
            variant={state === 'initial' ? 'outlined' : 'filled'}
          />
        )
      }
    },
    {
      field: 'risk',
      headerName: t('projects.columns.risk'),
      width: 160,
      valueGetter: ((value, row) => row.riskLabel) as GridValueGetter<ProjectRow>,
      renderCell: (params: GridRenderCellParams<ProjectRow>) => (
        <Chip
          label={params.row.riskLabel}
          size="small"
          color={params.row.risk ? riskColors[params.row.risk] ?? 'default' : 'default'}
          variant={params.row.risk ? 'filled' : 'outlined'}
        />
      )
    },
    {
      field: 'docStatus',
      headerName: t('projects.columns.docStatus'),
      width: 160,
      valueGetter: ((value, row) => row.docLabel) as GridValueGetter<ProjectRow>,
      renderCell: (params: GridRenderCellParams<ProjectRow>) => (
        <Chip
          label={params.row.docLabel}
          size="small"
          color={params.row.docStatus ? docColors[params.row.docStatus] ?? 'default' : 'default'}
          variant={params.row.docStatus ? 'filled' : 'outlined'}
        />
      )
    },
    { field: 'lastAssessment', headerName: t('projects.columns.lastAssessment'), width: 180 },
    {
      field: 'actions',
      headerName: t('projects.columns.actions'),
      width: 160,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<ProjectRow>) => (
        <Button
          size="small"
          onClick={() => {
            setActiveProjectId(params.row.id)
            navigate(`/projects/${params.row.id}/incidents`)
          }}
        >
          {t('common.view')}
        </Button>
      )
    }
  ]

  return (
    <Box>
      <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Grid item>
          <Button variant="contained" onClick={() => navigate('/projects/new')}>
            + {t('projects.actions.newProject')}
          </Button>
        </Grid>
        <Grid item>
          <TextField
            select
            label={t('projects.filters.role.label')}
            size="small"
            onChange={(event) => setFilter((f) => ({ ...f, role: event.target.value || undefined }))}
            sx={{ minWidth: 160 }}
          >
            {roleFilterValues.map((value) => (
              <MenuItem key={value || 'all'} value={value}>
                {value ? t(`roles.${value}`) : t('projects.filters.role.all')}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item>
          <TextField
            select
            label={t('projects.filters.risk.label')}
            size="small"
            onChange={(event) => setFilter((f) => ({ ...f, risk: event.target.value || undefined }))}
            sx={{ minWidth: 160 }}
          >
            {riskFilterValues.map((value) => (
              <MenuItem key={value || 'all'} value={value}>
                {value ? t(`riskLevels.${value}`) : t('projects.filters.risk.all')}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item>
          <TextField
            select
            label={t('projects.filters.doc.label')}
            size="small"
            onChange={(event) => setFilter((f) => ({ ...f, doc: event.target.value || undefined }))}
            sx={{ minWidth: 160 }}
          >
            {docFilterValues.map((value) => (
              <MenuItem key={value || 'all'} value={value}>
                {value ? t(`docStatus.${value}`) : t('projects.filters.doc.all')}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item>
          <TextField
            label={t('projects.filters.search.label')}
            size="small"
            onChange={(event) => setFilter((f) => ({ ...f, q: event.target.value || undefined }))}
          />
        </Grid>
      </Grid>

      <Paper sx={{ height: 440, position: 'relative' }}>
        {loading && (
          <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', zIndex: 1 }}>
            <CircularProgress />
          </Box>
        )}
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row.id}
          disableRowSelectionOnClick
        />
      </Paper>
    </Box>
  )
}

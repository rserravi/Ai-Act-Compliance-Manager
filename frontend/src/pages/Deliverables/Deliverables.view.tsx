import React, { useState } from 'react'
import { useDeliverablesViewModel } from './Deliverables.viewmodel'
import {
  Paper,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Link as MuiLink,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  TextField,
  MenuItem
} from '@mui/material'
import { useI18n } from '../../shared/i18n'

export default function DeliverablesView() {
  const {
    documents,
    project,
    assignModalOpen,
    selectedDoc,
    handleUpload,
    openAssignModal,
    closeAssignModal,
    handleAssign
  } = useDeliverablesViewModel()
  const { t } = useI18n()
  const [assignee, setAssignee] = useState('')
  const [dueDate, setDueDate] = useState('')

  const statusColors: Record<string, 'default' | 'info' | 'warning' | 'success'> = {
    Abierto: 'default',
    Comenzado: 'info',
    'En Revisión': 'warning',
    Terminado: 'success'
  }

  const onConfirmAssign = () => {
    if (assignee && dueDate) {
      handleAssign(assignee, dueDate)
      setAssignee('')
      setDueDate('')
    }
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {t('deliverables.title', { defaultValue: 'Entregables del Proyecto' })}
      </Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>{t('deliverables.columns.name', { defaultValue: 'Entregable' })}</TableCell>
              <TableCell>{t('deliverables.columns.status', { defaultValue: 'Estado' })}</TableCell>
              <TableCell align="center">{t('deliverables.columns.version', { defaultValue: 'Versión' })}</TableCell>
              <TableCell align="right">{t('deliverables.columns.actions', { defaultValue: 'Acciones' })}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell component="th" scope="row">
                  {doc.name}
                </TableCell>
                <TableCell>
                  <Chip label={doc.status} color={statusColors[doc.status] ?? 'default'} size="small" />
                </TableCell>
                <TableCell align="center">{doc.version > 0 ? `v${doc.version}` : '-'}</TableCell>
                <TableCell align="right">
                  <Button sx={{ mr: 1 }} href={doc.link} component={MuiLink} target="_blank" disabled={!doc.link} size="small">
                    {t('common.view')}
                  </Button>
                  <Button sx={{ mr: 1 }} variant="outlined" size="small" onClick={() => handleUpload(doc.id, doc.version)}>
                    {t('deliverables.actions.upload', { defaultValue: 'Subir' })}
                  </Button>
                  <Button variant="contained" size="small" onClick={() => openAssignModal(doc)}>
                    {t('deliverables.actions.assign', { defaultValue: 'Asignar' })}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={assignModalOpen} onClose={closeAssignModal} maxWidth="xs" fullWidth>
        <DialogTitle>{t('deliverables.assignModal.title', { defaultValue: 'Asignar Entregable' })}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography variant="subtitle1">{selectedDoc?.name}</Typography>
            <TextField
              select
              label={t('deliverables.assignModal.assignee', { defaultValue: 'Asignar a' })}
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              fullWidth
            >
              {(project?.team ?? []).map(member => (
                <MenuItem key={member.id} value={member.name}>
                  {member.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label={t('deliverables.assignModal.dueDate', { defaultValue: 'Fecha de entrega' })}
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAssignModal}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={onConfirmAssign}>{t('common.send')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
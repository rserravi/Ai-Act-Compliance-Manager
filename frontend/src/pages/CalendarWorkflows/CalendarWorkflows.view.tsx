import React, { useState } from 'react'
import { useCalendarWorkflowsViewModel } from './CalendarWorkflows.viewmodel'
import { Box, Typography, Paper, Grid, Card, CardContent, Popover, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material'
import { useI18n } from '../../shared/i18n'
import { Task } from '../../domain/models'

const KanbanCard = ({ task, onOpenPopover }: { task: Task, onOpenPopover: (event: React.MouseEvent<HTMLElement>, task: Task) => void }) => {
  return (
    <Card
      sx={{ mb: 1, cursor: 'pointer' }}
      onClick={(e) => onOpenPopover(e, task)}
      onMouseEnter={(e) => onOpenPopover(e, task)}
    >
      <CardContent sx={{ p: 1.5 }}>
        <Typography variant="body2">{task.title}</Typography>
      </CardContent>
    </Card>
  )
}

export default function CalendarWorkflowsView() {
  const { tasks } = useCalendarWorkflowsViewModel()
  const { t } = useI18n()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>, task: Task) => {
    setAnchorEl(event.currentTarget)
    setSelectedTask(task)
  }

  const handlePopoverClose = () => {
    setAnchorEl(null)
    setSelectedTask(null)
  }

  const open = Boolean(anchorEl)

  const kanbanColumns: { status: Task['status']; title: string }[] = [
    { status: 'todo', title: t('calendarWorkflows.workflows.columns.backlog', {defaultValue: 'Backlog'}) },
    { status: 'in_review', title: t('calendarWorkflows.workflows.columns.inProgress', {defaultValue: 'In Progress'}) },
    { status: 'approved', title: t('calendarWorkflows.workflows.columns.done', {defaultValue: 'Done'}) }
  ]

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {t('calendarWorkflows.workflows.title', {defaultValue: 'Workflows'})}
      </Typography>

      {/* Kanban Board */}
      <Grid container spacing={2}>
        {kanbanColumns.map(col => (
          <Grid item xs={12} md={4} key={col.status}>
            <Paper sx={{ p: 1, bgcolor: 'grey.100', height: '100%' }}>
              <Typography variant="h6" sx={{ p: 1 }}>{col.title}</Typography>
              <Box sx={{ maxHeight: 400, overflowY: 'auto', p: 1 }}>
                {tasks.filter(task => task.status === col.status).map(task => (
                  <KanbanCard key={task.id} task={task} onOpenPopover={handlePopoverOpen} />
                ))}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Tasks Table */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        {t('calendarWorkflows.tasksTable.title', {defaultValue: 'All Tasks'})}
      </Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="tasks table">
          <TableHead>
            <TableRow>
              <TableCell>{t('dashboard.actions.columns.task')}</TableCell>
              <TableCell>{t('dashboard.actions.columns.assignee', {defaultValue: 'Assignee'})}</TableCell>
              <TableCell>{t('dashboard.actions.columns.due')}</TableCell>
              <TableCell>{t('dashboard.actions.columns.status')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>{task.title}</TableCell>
                <TableCell>{task.assignee ?? 'N/A'}</TableCell>
                <TableCell>{task.due ? new Date(task.due).toLocaleDateString() : 'N/A'}</TableCell>
                <TableCell><Chip label={task.status} size="small" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Task Detail Popover */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        disableRestoreFocus
      >
        {selectedTask && (
          <Box sx={{ p: 2, maxWidth: 300 }}>
            <Typography variant="h6" gutterBottom>{selectedTask.title}</Typography>
            <Typography variant="body2"><strong>{t('dashboard.actions.columns.assignee', {defaultValue: 'Assignee'})}:</strong> {selectedTask.assignee ?? 'N/A'}</Typography>
            <Typography variant="body2"><strong>{t('dashboard.actions.columns.due', {defaultValue: 'Due Date'})}:</strong> {selectedTask.due ? new Date(selectedTask.due).toLocaleDateString() : 'N/A'}</Typography>
            <Typography variant="body2"><strong>{t('dashboard.actions.columns.status', {defaultValue: 'Status'})}:</strong> {selectedTask.status}</Typography>
          </Box>
        )}
      </Popover>
    </Box>
  )
}
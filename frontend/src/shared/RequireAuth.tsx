import React from 'react'
import { Box, CircularProgress } from '@mui/material'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './auth-context'

interface RequireAuthProps {
  children: React.ReactElement
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const { user, token, isRestoringSession } = useAuth()
  const location = useLocation()

  if (isRestoringSession) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!user || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

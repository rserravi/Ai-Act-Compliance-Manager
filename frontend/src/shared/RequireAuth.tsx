import React, { useEffect } from 'react'
import { Box, CircularProgress } from '@mui/material'
import { Navigate, useLocation } from 'react-router-dom'
import { authStore } from '../state/auth-store'
import { useObservableValue } from './hooks/useObservable'

interface RequireAuthProps {
  children: React.ReactElement
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const user = useObservableValue(authStore.user)
  const token = useObservableValue(authStore.token)
  const isRestoringSession = useObservableValue(authStore.isRestoringSession)
  const location = useLocation()

  useEffect(() => {
    authStore.ensureSessionRestored().catch((error) => {
      console.error('Failed to restore authentication session', error)
    })
  }, [])

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

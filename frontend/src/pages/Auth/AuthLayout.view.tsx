import React, { useEffect } from 'react'
import { Box, CircularProgress, Container } from '@mui/material'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { authStore } from '../../state/auth-store'
import { useObservableValue } from '../../shared/hooks/useObservable'

type AuthLocationState = {
  from?: {
    pathname?: string
  }
}

export default function AuthLayout() {
  const user = useObservableValue(authStore.user)
  const isRestoringSession = useObservableValue(authStore.isRestoringSession)
  const location = useLocation()
  const state = (location.state ?? null) as AuthLocationState | null
  const fromPath = state?.from?.pathname
  const redirectTo = fromPath && fromPath !== '/login' ? fromPath : '/'

  useEffect(() => {
    authStore.ensureSessionRestored().catch((error) => {
      console.error('Failed to restore session', error)
    })
  }, [])

  if (isRestoringSession) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: (theme) => theme.palette.background.default
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  if (user) {
    return <Navigate to={redirectTo} replace />
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: (theme) => theme.palette.background.default,
        py: { xs: 4, md: 8 }
      }}
    >
      <Container maxWidth="sm">
        <Outlet />
      </Container>
    </Box>
  )
}

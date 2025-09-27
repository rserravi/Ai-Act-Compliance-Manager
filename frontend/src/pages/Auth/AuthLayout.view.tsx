import React from 'react'
import { Box, CircularProgress, Container } from '@mui/material'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../shared/auth-context'

type AuthLocationState = {
  from?: {
    pathname?: string
  }
}

export default function AuthLayout() {
  const { user, isRestoringSession } = useAuth()
  const location = useLocation()
  const state = (location.state ?? null) as AuthLocationState | null
  const fromPath = state?.from?.pathname
  const redirectTo = fromPath && fromPath !== '/login' ? fromPath : '/'

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

import React, { useState } from 'react'
import {
  Alert,
  Button,
  Divider,
  Link,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../shared/auth-context'

type AuthLocationState = {
  from?: {
    pathname?: string
  }
}

export default function LoginView() {
  const { t } = useTranslation()
  const [form, setForm] = useState({ company: '', email: '', password: '' })
  const [error, setError] = useState<string | null>(null)
  const [activeMethod, setActiveMethod] = useState<'password' | 'sso' | null>(null)
  const { loginWithPassword, loginWithSso, isAuthenticating } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state ?? null) as AuthLocationState | null
  const fromPath = state?.from?.pathname
  const redirectTo = fromPath && fromPath !== '/login' ? fromPath : '/'

  const handleChange = (field: 'company' | 'email' | 'password') =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm(prev => ({ ...prev, [field]: event.target.value }))
    }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setActiveMethod('password')
    try {
      await loginWithPassword({
        company: form.company.trim(),
        email: form.email.trim(),
        password: form.password
      })
      navigate(redirectTo, { replace: true })
    } catch (err) {
      console.error(err)
      setError(t('auth.feedback.loginError'))
    } finally {
      setActiveMethod(null)
    }
  }

  const handleSSO = async () => {
    setError(null)
    setActiveMethod('sso')
    try {
      await loginWithSso({
        company: form.company.trim(),
        email: form.email.trim(),
        provider: 'sso'
      })
      navigate(redirectTo, { replace: true })
    } catch (err) {
      console.error(err)
      setError(t('auth.feedback.ssoError'))
    } finally {
      setActiveMethod(null)
    }
  }

  const isSSOEnabled = form.company.trim().length > 0 && form.email.trim().length > 0
  const passwordLoading = isAuthenticating && activeMethod === 'password'
  const ssoLoading = isAuthenticating && activeMethod === 'sso'

  return (
    <Paper elevation={4} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
      <Stack spacing={3} component="form" onSubmit={handleSubmit}>
        <Stack spacing={0.5}>
          <Typography variant="h4" fontWeight={600}>
            {t('auth.login.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('auth.login.subtitle')}
          </Typography>
        </Stack>

        {error && <Alert severity="error">{error}</Alert>}
        <Stack spacing={2}>
          <TextField
            label={t('auth.fields.company')}
            value={form.company}
            onChange={handleChange('company')}
            required
            autoComplete="organization"
            fullWidth
          />
          <TextField
            label={t('auth.fields.email')}
            value={form.email}
            onChange={handleChange('email')}
            type="email"
            required
            autoComplete="email"
            fullWidth
          />
          <TextField
            label={t('auth.fields.password')}
            value={form.password}
            onChange={handleChange('password')}
            type="password"
            required
            autoComplete="current-password"
            fullWidth
          />
        </Stack>

        <Button type="submit" variant="contained" size="large" disabled={passwordLoading}>
          {t('auth.login.submit')}
        </Button>

        <Divider>{t('auth.login.or')}</Divider>

        <Button
          variant="outlined"
          size="large"
          onClick={handleSSO}
          disabled={!isSSOEnabled || ssoLoading}
        >
          {t('auth.login.ssoButton')}
        </Button>

        <Typography variant="body2" color="text.secondary" textAlign="center">
          {t('auth.login.ssoHint')}
        </Typography>

        <Typography variant="body2" textAlign="center">
          {t('auth.login.noAccount')}{' '}
          <Link component={RouterLink} to="/sign-in">
            {t('auth.login.goToSignUp')}
          </Link>
        </Typography>
      </Stack>
    </Paper>
  )
}

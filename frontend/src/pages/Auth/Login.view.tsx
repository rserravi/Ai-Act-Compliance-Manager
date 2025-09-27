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
import { Link as RouterLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { login, loginWithSSO } from '../../services/auth'

export default function LoginView() {
  const { t } = useTranslation()
  const [form, setForm] = useState({ company: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [ssoLoading, setSsoLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleChange = (field: 'company' | 'email' | 'password') =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm(prev => ({ ...prev, [field]: event.target.value }))
    }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setSsoLoading(false)
    setError(null)
    setSuccess(null)
    try {
      const response = await login({
        company: form.company.trim(),
        email: form.email.trim(),
        password: form.password
      })
      setSuccess(t('auth.feedback.loginSuccess', { name: response.user.full_name }))
    } catch (err) {
      console.error(err)
      setError(t('auth.feedback.loginError'))
    } finally {
      setLoading(false)
    }
  }

  const handleSSO = async () => {
    setSsoLoading(true)
    setLoading(false)
    setError(null)
    setSuccess(null)
    try {
      const response = await loginWithSSO({
        company: form.company.trim(),
        email: form.email.trim(),
        provider: 'sso'
      })
      setSuccess(
        t('auth.feedback.ssoSuccess', {
          name: response.user.full_name,
          provider: t('auth.login.ssoLabel')
        })
      )
    } catch (err) {
      console.error(err)
      setError(t('auth.feedback.ssoError'))
    } finally {
      setSsoLoading(false)
    }
  }

  const isSSOEnabled = form.company.trim().length > 0 && form.email.trim().length > 0

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
        {success && <Alert severity="success">{success}</Alert>}

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

        <Button type="submit" variant="contained" size="large" disabled={loading}>
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

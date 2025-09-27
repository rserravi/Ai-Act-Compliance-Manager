import React, { useMemo, useState } from 'react'
import {
  Alert,
  Avatar,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { signIn } from '../../services/auth'
import { Visibility, VisibilityOff } from '@mui/icons-material'

type ContactMethod = 'email' | 'sms' | 'whatsapp' | 'slack'

const contactMethods: ContactMethod[] = ['email', 'sms', 'whatsapp', 'slack']

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Unable to read file'))
    reader.readAsDataURL(file)
  })
}

export default function SignInView() {
  const { t } = useTranslation()
  const [fullName, setFullName] = useState('')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [contactMethod, setContactMethod] = useState<ContactMethod>('email')
  const [contactValue, setContactValue] = useState('')
  const [slackWorkspace, setSlackWorkspace] = useState('')
  const [slackChannel, setSlackChannel] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarData, setAvatarData] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const browserLanguage = useMemo(
    () => (typeof navigator !== 'undefined' && navigator.language ? navigator.language : 'en'),
    []
  )

  const isPasswordValid = useMemo(() => {
    if (password.length < 6) return false
    const hasUppercase = /[A-Z]/.test(password)
    const hasExtended = /[^A-Za-z0-9]/.test(password)
    return hasUppercase && hasExtended
  }, [password])

  const contactLabel = useMemo(() => {
    if (contactMethod === 'email') return t('auth.signup.contactEmail')
    if (contactMethod === 'sms') return t('auth.signup.contactPhoneSms')
    if (contactMethod === 'whatsapp') return t('auth.signup.contactPhoneWhatsapp')
    return t('auth.signup.contactSlackUser')
  }, [contactMethod, t])

  const handleContactMethod = (_: React.MouseEvent<HTMLElement>, value: ContactMethod | null) => {
    if (!value) return
    setContactMethod(value)
    setContactValue('')
    setSlackWorkspace('')
    setSlackChannel('')
  }

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      setAvatarPreview(null)
      setAvatarData(null)
      return
    }

    try {
      const base64 = await fileToBase64(file)
      setAvatarPreview(base64)
      setAvatarData(base64)
    } catch (err) {
      console.error(err)
      setError(t('auth.feedback.avatarError'))
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const contact = {
        method: contactMethod,
        value: contactValue.trim(),
        workspace: contactMethod === 'slack' ? slackWorkspace.trim() || undefined : undefined,
        channel: contactMethod === 'slack' ? slackChannel.trim() || undefined : undefined
      }

      const response = await signIn({
        full_name: fullName.trim(),
        company: company.trim(),
        email: email.trim(),
        contact,
        avatar: avatarData ?? undefined,
        password,
        preferences: { language: browserLanguage }
      })

      setSuccess(response.message ?? t('auth.feedback.signUpSuccess', { name: response.user.full_name }))
    } catch (err) {
      console.error(err)
      setError(t('auth.feedback.signUpError'))
    } finally {
      setLoading(false)
    }
  }

  const isFormValid =
    fullName.trim().length > 0 &&
    company.trim().length > 0 &&
    email.trim().length > 0 &&
    isPasswordValid &&
    (contactMethod === 'slack'
      ? slackWorkspace.trim().length > 0 && slackChannel.trim().length > 0
      : contactValue.trim().length > 0)

  return (
    <Paper elevation={4} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
      <Stack spacing={3} component="form" onSubmit={handleSubmit}>
        <Stack spacing={0.5}>
          <Typography variant="h4" fontWeight={600}>
            {t('auth.signup.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('auth.signup.subtitle')}
          </Typography>
        </Stack>

        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        <Stack spacing={2}>
          <TextField
            label={t('auth.signup.fullName')}
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            required
            fullWidth
          />
          <TextField
            label={t('auth.signup.company')}
            value={company}
            onChange={(event) => setCompany(event.target.value)}
            required
            fullWidth
          />
          <TextField
            label={t('auth.signup.email')}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            required
            fullWidth
          />
          <TextField
            label={t('auth.signup.password')}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type={showPassword ? 'text' : 'password'}
            required
            fullWidth
            error={password.length > 0 && !isPasswordValid}
            helperText={t('auth.signup.passwordHelper')}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(prev => !prev)}
                    edge="end"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Stack>

        <Stack spacing={1.5}>
          <Typography variant="subtitle2" color="text.secondary">
            {t('auth.signup.contactLabel')}
          </Typography>
          <ToggleButtonGroup value={contactMethod} exclusive onChange={handleContactMethod} fullWidth>
            {contactMethods.map(method => (
              <ToggleButton key={method} value={method} aria-label={method}>
                {t(`auth.contactMethods.${method}`)}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          {contactMethod !== 'slack' && (
            <TextField
              label={contactLabel}
              value={contactValue}
              onChange={(event) => setContactValue(event.target.value)}
              required
              fullWidth
            />
          )}

          {contactMethod === 'slack' && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label={t('auth.signup.slackWorkspace')}
                  value={slackWorkspace}
                  onChange={(event) => setSlackWorkspace(event.target.value)}
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label={t('auth.signup.slackChannel')}
                  value={slackChannel}
                  onChange={(event) => setSlackChannel(event.target.value)}
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label={contactLabel}
                  value={contactValue}
                  onChange={(event) => setContactValue(event.target.value)}
                  required
                  fullWidth
                />
              </Grid>
            </Grid>
          )}
        </Stack>

        <Stack spacing={1} alignItems="flex-start">
          <Typography variant="subtitle2" color="text.secondary">
            {t('auth.signup.avatarLabel')}
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar src={avatarPreview ?? undefined} sx={{ width: 64, height: 64 }}>
              {fullName ? fullName[0]?.toUpperCase() : undefined}
            </Avatar>
            <Button variant="outlined" component="label">
              {avatarPreview ? t('auth.signup.changeAvatar') : t('auth.signup.uploadAvatar')}
              <input type="file" hidden accept="image/*" onChange={handleAvatarChange} />
            </Button>
          </Stack>
        </Stack>

        <Button type="submit" variant="contained" size="large" disabled={loading || !isFormValid}>
          {t('auth.signup.submit')}
        </Button>

        <Typography variant="body2" textAlign="center">
          {t('auth.signup.hasAccount')}{' '}
          <Link component={RouterLink} to="/login">
            {t('auth.signup.goToLogin')}
          </Link>
        </Typography>
      </Stack>
    </Paper>
  )
}

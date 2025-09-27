import React, { useEffect, useMemo, useRef, useState } from 'react'
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
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { useAuth } from '../../shared/auth-context'

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
  const navigate = useNavigate()
  const { register: registerUser, verifyRegistration, resendRegistrationCode, isAuthenticating } = useAuth()
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
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [registration, setRegistration] = useState<{
    id: string
    expiresAt: string
    email: string
  } | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [activeAction, setActiveAction] = useState<'register' | 'verify' | 'resend' | null>(null)
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
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

  useEffect(() => {
    return () => {
      if (redirectTimer.current) {
        clearTimeout(redirectTimer.current)
      }
    }
  }, [])

  const handleRegisterSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    setActiveAction('register')

    try {
      const contact = {
        method: contactMethod,
        value: contactValue.trim(),
        workspace: contactMethod === 'slack' ? slackWorkspace.trim() || undefined : undefined,
        channel: contactMethod === 'slack' ? slackChannel.trim() || undefined : undefined
      }

      const trimmedEmail = email.trim()

      const response = await registerUser({
        full_name: fullName.trim(),
        company: company.trim(),
        email: trimmedEmail,
        contact,
        avatar: avatarData ?? undefined,
        password,
        preferences: { language: browserLanguage }
      })

      setRegistration({ id: response.registration_id, expiresAt: response.expires_at, email: trimmedEmail })
      setVerificationCode('')
      setSuccess(t('auth.feedback.signUpVerificationSent', { email: trimmedEmail }))
    } catch (err) {
      console.error(err)
      setError(t('auth.feedback.signUpError'))
    } finally {
      setActiveAction(null)
    }
  }

  const handleVerificationSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!registration) return

    setError(null)
    setSuccess(null)
    setActiveAction('verify')

    try {
      const response = await verifyRegistration({
        registration_id: registration.id,
        code: verificationCode.trim()
      })

      setSuccess(response.message ?? t('auth.feedback.signUpVerified'))
      redirectTimer.current = setTimeout(() => {
        navigate('/', { replace: true })
      }, 1000)
    } catch (err) {
      console.error(err)
      setError(t('auth.feedback.signUpVerificationError'))
    } finally {
      setActiveAction(null)
    }
  }

  const handleResendCode = async () => {
    if (!registration) return

    setError(null)
    setSuccess(null)
    setActiveAction('resend')

    try {
      const response = await resendRegistrationCode({ registration_id: registration.id })
      setRegistration(prev => (prev ? { ...prev, expiresAt: response.expires_at } : prev))
      setVerificationCode('')
      setSuccess(t('auth.feedback.signUpVerificationResent', { email: registration.email }))
    } catch (err) {
      console.error(err)
      setError(t('auth.feedback.signUpVerificationError'))
    } finally {
      setActiveAction(null)
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

  const registering = isAuthenticating && activeAction === 'register'
  const verifying = isAuthenticating && activeAction === 'verify'
  const resending = isAuthenticating && activeAction === 'resend'

  if (registration) {
    return (
      <Paper elevation={4} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
        <Stack spacing={3} component="form" onSubmit={handleVerificationSubmit}>
          <Stack spacing={0.5}>
            <Typography variant="h4" fontWeight={600}>
              {t('auth.signup.verificationTitle')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('auth.signup.verificationSubtitle', { email: registration.email })}
            </Typography>
          </Stack>

          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}

          <TextField
            label={t('auth.signup.verificationCodeLabel')}
            value={verificationCode}
            onChange={(event) => setVerificationCode(event.target.value.toUpperCase())}
            inputProps={{ maxLength: 8, style: { letterSpacing: '0.3em', textTransform: 'uppercase' } }}
            required
            fullWidth
          />

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={verifying || verificationCode.trim().length !== 8}
            >
              {t('auth.signup.verifyButton')}
            </Button>
            <Button
              type="button"
              variant="outlined"
              size="large"
              onClick={handleResendCode}
              disabled={resending}
            >
              {t('auth.signup.resendButton')}
            </Button>
          </Stack>

          <Typography variant="body2" textAlign="center" color="text.secondary">
            {t('auth.signup.resendHelp')}
          </Typography>
        </Stack>
      </Paper>
    )
  }

  return (
    <Paper elevation={4} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
      <Stack spacing={3} component="form" onSubmit={handleRegisterSubmit}>
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

        <Button type="submit" variant="contained" size="large" disabled={registering || !isFormValid}>
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

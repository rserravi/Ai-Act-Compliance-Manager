import React from 'react'
import { Grid, Card, CardHeader, CardContent, FormControl, InputLabel, Select, MenuItem, FormControlLabel, Switch, TextField, Button, Stack } from '@mui/material'
import { useI18n } from '../../shared/i18n'

export default function SettingsView() {
  const { t } = useI18n()
  const [themeMode, setThemeMode] = React.useState<'light' | 'dark'>('light')
  const [language, setLanguage] = React.useState('es')
  const [notifications, setNotifications] = React.useState({ email: true, slack: false, sms: false })
  const [apiKey, setApiKey] = React.useState('sk-****-demo')

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title={t('settings.preferences.title')} />
          <CardContent>
            <Stack spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('settings.preferences.language')}</InputLabel>
                <Select
                  value={language}
                  label={t('settings.preferences.language')}
                  onChange={(event) => setLanguage(event.target.value)}
                >
                  <MenuItem value="es">ES · Español</MenuItem>
                  <MenuItem value="en">EN · English</MenuItem>
                  <MenuItem value="ca">CA · Català</MenuItem>
                  <MenuItem value="fr">FR · Français</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>{t('settings.preferences.theme')}</InputLabel>
                <Select
                  value={themeMode}
                  label={t('settings.preferences.theme')}
                  onChange={(event) => setThemeMode(event.target.value as 'light' | 'dark')}
                >
                  <MenuItem value="light">{t('settings.preferences.themeOptions.light')}</MenuItem>
                  <MenuItem value="dark">{t('settings.preferences.themeOptions.dark')}</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title={t('settings.notifications.title')} />
          <CardContent>
            <Stack spacing={1}>
              {(['email', 'slack', 'sms'] as const).map(channel => (
                <FormControlLabel
                  key={channel}
                  control={<Switch checked={notifications[channel]} onChange={(event) => setNotifications(prev => ({ ...prev, [channel]: event.target.checked }))} />}
                  label={t(`settings.notifications.channels.${channel}`)}
                />
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardHeader title={t('settings.integrations.title')} />
          <CardContent>
            <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}>
              <TextField
                label={t('settings.integrations.apiKey')}
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                fullWidth
              />
              <Button variant="outlined" onClick={() => setApiKey('sk-****-' + Math.random().toString(36).slice(2, 8))}>
                {t('settings.integrations.regenerate')}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

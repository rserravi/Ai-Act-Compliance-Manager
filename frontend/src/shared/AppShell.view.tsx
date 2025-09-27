import React from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  CssBaseline,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Container,
  IconButton,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  Avatar,
  Tooltip,
  Divider
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import SearchIcon from '@mui/icons-material/Search'
import { alpha, useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTranslation } from 'react-i18next'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { supportedLanguages, type SupportedLanguage } from './i18n'
import { useProjectContext } from './project-context'

const drawerWidth = 240

const programNavigation = [
  { labelKey: 'nav.dashboard', to: '/' },
  { labelKey: 'nav.projects', to: '/projects' },
  { labelKey: 'nav.incidents', to: '/incidents' },
  { labelKey: 'nav.settings', to: '/settings' }
] as const

const languageOptions = supportedLanguages

const userProfile = {
  name: 'Rocío Serrano',
  initials: 'RS'
}

export default function AppShell() {
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const location = useLocation()
  const { t, i18n } = useTranslation()
  const { activeProject } = useProjectContext()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const toggle = () => setMobileOpen(v => !v)

  const projectNavigation = activeProject
    ? [
        { labelKey: 'nav.project.deliverables', to: `/projects/${activeProject.id}/deliverables` },
        { labelKey: 'nav.project.calendar', to: `/projects/${activeProject.id}/calendar` },
        { labelKey: 'nav.project.org', to: `/projects/${activeProject.id}/org` },
        { labelKey: 'nav.project.audit', to: `/projects/${activeProject.id}/audit` }
      ]
    : []

  const drawer = (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Typography variant="h6" sx={{ px: 1, pb: 1 }}>{t('app.shortTitle')}</Typography>
      <List>
        {programNavigation.map(item => (
          <ListItemButton
            key={item.to}
            component={Link}
            to={item.to}
            selected={location.pathname === item.to}
            onClick={() => { if (isMobile) setMobileOpen(false) }}
          >
            <ListItemText primary={t(item.labelKey)} />
          </ListItemButton>
        ))}
      </List>
      {activeProject && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="caption" sx={{ px: 1, pb: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {t('nav.projectGroup', { name: activeProject.name })}
          </Typography>
          <List>
            {projectNavigation.map(item => (
              <ListItemButton
                key={item.to}
                component={Link}
                to={item.to}
                selected={location.pathname.startsWith(item.to)}
              >
                <ListItemText primary={t(item.labelKey)} />
              </ListItemButton>
            ))}
          </List>
        </>
      )}
    </Box>
  )

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar sx={{ gap: 1.5 }}>
          {isMobile && (
            <IconButton color="inherit" edge="start" onClick={toggle} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
            {t('app.title')}
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center', px: 2 }}>
            <TextField
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('app.searchPlaceholder')}
              size="small"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                sx: { color: 'inherit' }
              }}
              inputProps={{ 'aria-label': t('app.searchAria') }}
              sx={{
                flex: 1,
                minWidth: { sm: 220, md: 320 },
                maxWidth: 420,
                backgroundColor: (theme) => alpha(theme.palette.common.white, 0.12),
                borderRadius: 1,
                color: 'inherit',
                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.light', borderWidth: 1 }
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Select
              value={i18n.resolvedLanguage ?? i18n.language}
              onChange={(event) => i18n.changeLanguage(event.target.value as SupportedLanguage)}
              size="small"
              variant="outlined"
              sx={{
                backgroundColor: (theme) => alpha(theme.palette.common.white, 0.12),
                color: 'inherit',
                borderRadius: 1,
                minWidth: 84,
                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.light', borderWidth: 1 }
              }}
              inputProps={{ 'aria-label': t('app.languageSelectAria') }}
            >
              {languageOptions.map((code) => (
                <MenuItem key={code} value={code}>
                  {t(`languages.${code}.short`)} · {t(`languages.${code}.full`)}
                </MenuItem>
              ))}
            </Select>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', alignItems: 'flex-end' }}>
              <Typography variant="caption" sx={{ lineHeight: 1, opacity: 0.72 }}>{t('app.greeting')}</Typography>
              <Typography variant="body2" sx={{ lineHeight: 1 }}>
                {userProfile.name}
              </Typography>
            </Box>
            <Tooltip title={userProfile.name}>
              <Avatar sx={{ bgcolor: 'secondary.main', width: 36, height: 36 }}>
                {userProfile.initials}
              </Avatar>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>
      <Box component="nav" sx={{ width: isMobile ? 0 : drawerWidth, flexShrink: 0 }}>
        {isMobile && (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={toggle}
            ModalProps={{ keepMounted: true }}
            sx={{ '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}
          >
            {drawer}
          </Drawer>
        )}
        {!isMobile && (
          <Drawer
            variant="permanent"
            sx={{ '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}
            open
          >
            {drawer}
          </Drawer>
        )}
      </Box>
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Toolbar />
        <Container maxWidth="lg" sx={{ py: 3 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  )
}

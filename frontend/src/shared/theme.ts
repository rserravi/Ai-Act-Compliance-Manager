import { createTheme } from '@mui/material/styles'

export const appTheme = createTheme({
  shape: { borderRadius: 12 },
  spacing: 8,
  palette: {
    mode: 'light',
    primary: { main: '#0052CC' },
    secondary: { main: '#7E57C2' }
  },
  typography: {
    fontFamily: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'Arial'].join(',')
  }
})

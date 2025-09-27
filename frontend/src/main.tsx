import React from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@mui/material/styles'
import { I18nextProvider } from 'react-i18next'
import { appTheme } from './shared/theme'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import i18n from './shared/i18n'
import { ProjectProvider } from './shared/project-context'

const root = createRoot(document.getElementById('root')!)
root.render(
  <I18nextProvider i18n={i18n}>
    <ThemeProvider theme={appTheme}>
      <BrowserRouter>
        <ProjectProvider>
          <App />
        </ProjectProvider>
      </BrowserRouter>
    </ThemeProvider>
  </I18nextProvider>
)

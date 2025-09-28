import React, { useEffect, useState } from 'react'
import { Box, Paper, Typography, TextField, Button } from '@mui/material'
import { useI18n } from '../../shared/i18n'
import dossierData from '../../configs/technical-dossier.json'

const STORAGE_KEY = 'technical-dossier-draft'

type Field = {
  id: string
  label: string
  type: string
  required?: boolean
}

type Section = {
  id: string
  title: string
  fields: Field[]
}

export default function TechnicalDossierEditor() {
  const sections: Section[] = dossierData.technical_dossier.sections as Section[]
  const [values, setValues] = useState<Record<string, any>>({})
  const { t } = useI18n()

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) setValues(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(values))
  }, [values])

  function handleChange(id: string, val: any) {
    setValues(v => ({ ...v, [id]: val }))
  }

  function syncBackend() {
    console.log('Sync dossier:', values)
    alert(t('technicalDossier.actions.syncSuccess'))
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h5">{t('technicalDossier.title')}</Typography>
      {sections.map((section) => {
        const sectionTitle = t(`technicalDossier.sections.${section.id}.title`, { defaultValue: section.title })
        return (
          <Box key={section.id} sx={{ my: 2 }}>
            <Typography variant="h6">{sectionTitle}</Typography>
            {section.fields.map((field) => {
              const label = t(`technicalDossier.sections.${section.id}.fields.${field.id}`, { defaultValue: field.label })
              return (
                <TextField
                  key={field.id}
                  label={label}
                  required={field.required}
                  value={values[field.id] ?? ''}
                  onChange={e => handleChange(field.id, e.target.value)}
                  fullWidth
                  multiline={field.type === 'textarea'}
                  sx={{ my: 1 }}
                />
              )
            })}
          </Box>
        )
      })}
      <Button variant="contained" onClick={syncBackend}>{t('technicalDossier.actions.sync')}</Button>
    </Paper>
  )
}

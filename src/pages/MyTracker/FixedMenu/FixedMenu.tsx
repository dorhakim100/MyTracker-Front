import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Typography } from '@mui/material'
import { RootState } from '../../../store/store'

export function FixedMenu() {
  const { t } = useTranslation()
  const prefs = useSelector((state: RootState) => state.systemModule.prefs)

  return (
    <div
      className={`fixed-menu page-container ${
        prefs.isDarkMode ? 'dark-mode' : ''
      }`}
    >
      <Typography variant="h6" className="bold-header">
        {t('prefs.fixedMenu')}
      </Typography>
    </div>
  )
}

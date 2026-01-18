import { useSelector } from 'react-redux'
import { RootState } from '../../../../store/store'

import { Typography, Box } from '@mui/material'
import { PreferencesCard } from '../../../../components/PreferencesCard/PreferencesCard'

export function TrainerSettings() {
  const prefs = useSelector(
    (storeState: RootState) => storeState.systemModule.prefs
  )

  return (
    <Box className={`trainer-settings-container ${prefs.isDarkMode ? 'dark-mode' : ''} ${prefs.favoriteColor}`}>
      <Typography variant="h4" className="bold-header">
        Settings
      </Typography>

      <PreferencesCard />
    </Box>
  )
}

import { Typography, Box } from '@mui/material'
import { PreferencesCard } from '../../../../components/PreferencesCard/PreferencesCard'

export function TrainerSettings() {
  return (
    <Box className='trainer-settings-container'>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Manage your trainer account settings here.
      </Typography>
      <PreferencesCard />
    </Box>
  )
}

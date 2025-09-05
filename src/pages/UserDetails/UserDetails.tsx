import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Typography,
} from '@mui/material'
import { RootState } from '../../store/store'
import { logout } from '../../store/actions/user.actions'
import { setPrefs } from '../../store/actions/system.actions'
import type { Prefs } from '../../types/system/Prefs'
import { DarkModeSwitch } from '../../components/DarkModeSwitch/DarkModeSwitch'

export function UserDetails() {
  const prefs = useSelector(
    (storeState: RootState) => storeState.systemModule.prefs
  )
  const user = useSelector(
    (storeState: RootState) => storeState.userModule.user
  )
  const [favoriteColor, setFavoriteColor] = useState<string>(
    prefs.favoriteColor || '#1976d2'
  )

  const colorChoices = useMemo<string[]>(
    () => ['#1976d2', '#9c27b0', '#2e7d32', '#ed6c02', '#d32f2f', '#00897b'],
    []
  )

  function onToggleDarkMode() {
    const newPrefs: Prefs = { ...prefs, isDarkMode: !prefs.isDarkMode }
    setPrefs(newPrefs)
  }

  function onChangeFavoriteColor(color: string) {
    setFavoriteColor(color)
    const newPrefs: Prefs = { ...prefs, favoriteColor: color }
    setPrefs(newPrefs)
  }

  return (
    <Box className='user-page' sx={{ p: 2, display: 'grid', gap: 2 }}>
      <Card variant='outlined'>
        <CardContent>
          <Box
            className='user-profile'
            sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
          >
            <Box
              component='img'
              src={user?.imgUrl || '/logo-square.png'}
              alt='Profile'
              sx={{ width: 64, height: 64, borderRadius: '50%' }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography variant='h6'>
                {user?.fullname || 'User Profile'}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Manage your account and preferences
              </Typography>
            </Box>
            <Button
              variant='contained'
              color='primary'
              onClick={() => logout()}
            >
              Logout
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Card variant='outlined'>
        <CardContent>
          <Typography variant='h6' gutterBottom>
            Preferences
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant='body1' sx={{ minWidth: 140 }}>
              Dark mode
            </Typography>
            <DarkModeSwitch
              checked={prefs.isDarkMode}
              onClick={onToggleDarkMode}
            />
          </Box>

          <Divider sx={{ my: 1 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant='body1' sx={{ minWidth: 140 }}>
              Favorite color
            </Typography>
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              {colorChoices.map((color) => (
                <Button
                  key={color}
                  className='color-button'
                  variant={favoriteColor === color ? 'contained' : 'outlined'}
                  onClick={() => onChangeFavoriteColor(color)}
                  sx={{
                    minWidth: 0,
                    width: 32,
                    height: 32,
                    p: 0,
                    borderRadius: '50%',
                    bgcolor: color,
                    borderColor: color,
                    '&:hover': { bgcolor: color },
                  }}
                />
              ))}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

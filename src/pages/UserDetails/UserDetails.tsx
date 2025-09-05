import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { Button, Card, CardContent, Divider, Typography } from '@mui/material'
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
    <div className={`user-page ${prefs.isDarkMode ? 'dark-mode' : ''}`}>
      <Card
        variant='outlined'
        className={`card user-details ${prefs.isDarkMode ? 'dark-mode' : ''}`}
      >
        <div className='profile-container'>
          <img
            className='profile-avatar'
            src={user?.imgUrl || '/logo-square.png'}
            alt='Profile'
          />
          <div className='profile-info'>
            <Typography variant='h5'>
              {user?.fullname || 'User Profile'}
            </Typography>
          </div>
        </div>
      </Card>

      <Card
        variant='outlined'
        className={`card user-details ${prefs.isDarkMode ? 'dark-mode' : ''}`}
      >
        <Typography variant='h6' className='section-title'>
          Preferences
        </Typography>

        <div className='prefs-switch-container'>
          <Typography variant='body1' className='prefs-label'>
            Dark mode
          </Typography>
          <DarkModeSwitch
            checked={prefs.isDarkMode}
            onClick={onToggleDarkMode}
          />
        </div>

        <Divider className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`} />

        <div className='color-prefs-container'>
          <Typography variant='body1' className='prefs-label'>
            Favorite color
          </Typography>
          <div className='color-options'>
            {colorChoices.map((color) => (
              <Button
                key={color}
                className={`color-button ${
                  favoriteColor === color ? 'selected' : ''
                }`}
                onClick={() => onChangeFavoriteColor(color)}
                data-color={color}
              />
            ))}
          </div>
        </div>
      </Card>

      <Button variant='contained' color='primary' onClick={() => logout()}>
        Logout
      </Button>
    </div>
  )
}

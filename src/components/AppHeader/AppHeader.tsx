import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { RootState } from '../../store/store'
import { setIsPrefs } from '../../store/actions/system.actions'

import logoRegular from '../../../public/logo.png'
import logoDark from '../../../public/logo-dark.png'
import { IconButton } from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'

export function AppHeader() {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const isPrefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.isPrefs
  )

  const [logo, setLogo] = useState<string>(logoRegular)

  useEffect(() => {
    if (prefs.isDarkMode) {
      setLogo(logoDark)
    } else {
      setLogo(logoRegular)
    }
  }, [prefs.isDarkMode])

  function onTogglePrefs() {
    setIsPrefs(!isPrefs)
  }

  return (
    <>
      <header className={`app-header ${prefs.isDarkMode ? 'dark-mode' : ''}`}>
        <img src={logo} alt='logo' />
        <IconButton onClick={onTogglePrefs}>
          <SettingsIcon />
        </IconButton>
      </header>
    </>
  )
}

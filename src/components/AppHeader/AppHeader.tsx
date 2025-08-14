import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { Link, useNavigate } from 'react-router-dom'

import { Route } from '../../assets/routes/routes'

import { RootState } from '../../store/store'
import {
  onClosePrefsHeader,
  setIsHeader,
  setIsPrefs,
} from '../../store/actions/system.actions'
import { DropdownMenu } from '../DropdownMenu/DropdownMenu'

import logoRegular from '../../../public/logo.png'
import logoDark from '../../../public/logo-dark.png'
import { IconButton } from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'

interface AppHeaderProps {
  routes: Route[]
}

export function AppHeader({ routes }: AppHeaderProps) {
  const navigate = useNavigate()

  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const isHeader = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.isHeader
  )

  const isPrefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.isPrefs
  )

  const navigateToPage = (route: string) => {
    navigate(route)
  }

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

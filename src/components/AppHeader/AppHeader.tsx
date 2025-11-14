import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { apps } from '../../assets/config/apps'
import { RootState } from '../../store/store'
import { MenuItem } from '@mui/material'
import { Select } from '@mui/material'
import { setApp } from '../../store/actions/system.actions'
import { App } from '../../types/app/App'

export function AppHeader() {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )
  const app = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.app
  )
  // const isPrefs = useSelector(
  //   (stateSelector: RootState) => stateSelector.systemModule.isPrefs
  // )

  const [logo, setLogo] = useState<string>(apps.myTracker.logo)

  useEffect(() => {
    switch (app) {
      case apps.myTracker:
        setLogo(apps.myTracker.logo)
        break
      case apps.liftMate:
        setLogo(apps.liftMate.logo)
        break
      default:
        setLogo(apps.myTracker.logo)
        break
    }
  }, [prefs.isDarkMode, app])

  // function onTogglePrefs() {
  //   setIsPrefs(!isPrefs)
  // }

  return (
    <>
      <header className={`app-header ${prefs.isDarkMode ? 'dark-mode' : ''}`}>
        {/* <img src={logo} alt="logo" /> */}
        <div className="app-select-container">
          <Select
            labelId="header-select-label"
            id="header-select"
            value={app}
            onChange={(event) => {
              setApp(event.target.value as App)
            }}
            label="App"
          >
            {Object.values(apps).map((app) => (
              <MenuItem key={app.id} value={app.id} className="app-menu-item">
                <img src={app.logo} alt={app.name} />
                <span
                  className={`app-name ${prefs.isDarkMode ? 'dark-mode' : ''}`}
                >
                  {app.name}
                </span>
              </MenuItem>
            ))}
          </Select>
        </div>
      </header>
    </>
  )
}

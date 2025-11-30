import { useSelector } from 'react-redux'

import { apps } from '../../assets/config/apps'
import { RootState } from '../../store/store'
import { MenuItem } from '@mui/material'
import { Select } from '@mui/material'
import { setPrefs } from '../../store/actions/system.actions'
import { App } from '../../types/app/App'

export function AppHeader() {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  return (
    <>
      <header className={`app-header ${prefs.isDarkMode ? 'dark-mode' : ''}`}>
        {/* <img src={logo} alt="logo" /> */}
        <div className='app-select-container'>
          <Select
            labelId='header-select-label'
            id='header-select'
            value={prefs.app}
            onChange={(event) => {
              setPrefs({ ...prefs, app: event.target.value as App })
            }}
            label='App'
          >
            {Object.values(apps).map((app) => (
              <MenuItem key={app.id} value={app.id} className='app-menu-item'>
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

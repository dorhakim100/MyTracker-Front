import { useSelector } from 'react-redux'

import { apps } from '../../assets/config/apps'
import { RootState } from '../../store/store'

export function AppHeader() {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  return (
    <>
      <header className={`app-header ${prefs.isDarkMode ? 'dark-mode' : ''}`}>
        <img src={apps.myTracker.logo} alt="logo" />
        <span className={`app-name ${prefs.isDarkMode ? 'dark-mode' : ''}`}>
          {apps.myTracker.name}
        </span>
        {/* <div className='app-select-container'>
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
        </div> */}
      </header>
    </>
  )
}

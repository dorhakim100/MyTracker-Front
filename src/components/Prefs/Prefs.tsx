import { useState } from 'react'
import { useSelector } from 'react-redux'

import {
  setPrefs,
  setIsPrefs,
  onClosePrefsHeader,
} from '../../store/actions/system.actions'

import { DarkModeSwitch } from '../DarkModeSwitch/DarkModeSwitch'
import { LanguageSwitch } from '../LanguageSwitch/LanguageSwitch'

import CloseIcon from '@mui/icons-material/Close'
// import LanguageIcon from '@mui/icons-material/Language'
// import DarkModeIcon from '@mui/icons-material/DarkMode'
// import LightModeIcon from '@mui/icons-material/LightMode'

import { RootState } from '../../store/store'
import { ShadowOverlay } from '../ShadowOverlay/ShadowOverlay'

export function Prefs() {
  const prefs = useSelector(
    (storeState: RootState) => storeState.systemModule.prefs
  )
  const isPrefs = useSelector(
    (storeState: RootState) => storeState.systemModule.isPrefs
  )

  const [darkMode, setDarkMode] = useState(prefs.isDarkMode)

  function onSetPrefs(type: string) {
    let newPrefs
    switch (type) {
      case 'lang': {
        const newLang = prefs.lang === 'en' ? 'he' : 'en'
        newPrefs = { ...prefs, lang: newLang }
        setPrefs(newPrefs)
        import('i18next').then(({ default: i18n }) =>
          i18n.changeLanguage(newLang)
        )
        return
      }

      case 'darkMode': {
        const newMode = !darkMode
        newPrefs = { ...prefs, isDarkMode: newMode }
        setDarkMode(newMode)
        setPrefs(newPrefs)
        // closePrefsModal()
        return
      }
      default:
        break
    }
  }

  const closePrefsModal = () => setIsPrefs(false)
  return (
    <>
      <ShadowOverlay isVisble={isPrefs} handleClose={onClosePrefsHeader} />
      <div
        className={`prefs-panel ${isPrefs ? 'visible' : ''} ${
          prefs.isDarkMode ? 'dark-mode' : ''
        }`}
        // onMouseLeave={closePrefsModal}
      >
        <div className='close-container' onClick={closePrefsModal}>
          <CloseIcon />
        </div>
        <div className='prefs-control'>
          <LanguageSwitch
            onClick={() => onSetPrefs('lang')}
            checked={prefs.lang === 'he'}
          />
          <DarkModeSwitch
            onClick={() => onSetPrefs('darkMode')}
            checked={prefs.isDarkMode}
          />
        </div>
      </div>{' '}
    </>
  )
}

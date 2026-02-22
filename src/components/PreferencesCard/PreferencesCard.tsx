import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Divider, Typography } from '@mui/material'
import { RootState } from '../../store/store'
import { setPrefs } from '../../store/actions/system.actions'
import type { Prefs } from '../../types/system/Prefs'
import { DarkModeSwitch } from '../../components/DarkModeSwitch/DarkModeSwitch'
import { ColorPicker } from '../../components/ColorPicker/ColorPicker'
import { LanguageSwitch } from '../../components/LanguageSwitch/LanguageSwitch'
import { useTranslation } from 'react-i18next'

export function PreferencesCard() {
  const { t } = useTranslation()
  const prefs = useSelector(
    (storeState: RootState) => storeState.systemModule.prefs
  )

  const [favoriteColor, setFavoriteColor] = useState<string>(
    prefs.favoriteColor || '#1976d2'
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

  function onToggleLanguage() {
    const newPrefs: Prefs = {
      ...prefs,
      lang: prefs.lang === 'en' ? 'he' : 'en',
    }
    setPrefs(newPrefs)
    import('i18next').then(({ default: i18n }) =>
      i18n.changeLanguage(newPrefs.lang)
    )
  }

  return (
    <>
      <div className='prefs-switch-container'>
        <Typography
          variant='body1'
          className='prefs-label'
        >
          {t('prefs.darkMode')}
        </Typography>
        <DarkModeSwitch
          checked={prefs.isDarkMode}
          onClick={onToggleDarkMode}
        />
      </div>
      <Divider className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`} />
      <div className='prefs-switch-container'>
        <Typography
          variant='body1'
          className='prefs-label'
        >
          {t('prefs.language')}
        </Typography>
        <LanguageSwitch
          checked={prefs.lang === 'he'}
          onClick={onToggleLanguage}
        />
      </div>
      <Divider className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`} />

      <div className='color-prefs-container'>
        <Typography
          variant='body1'
          className='prefs-label'
        >
          {t('prefs.favoriteColor')}
        </Typography>
        <ColorPicker
          pickedColor={favoriteColor}
          onColorPick={onChangeFavoriteColor}
        />
      </div>
    </>
  )
}

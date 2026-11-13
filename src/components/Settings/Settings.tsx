import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import Divider from '@mui/material/Divider'
import { CustomIOSSwitch } from '../../CustomMui/CustomIOSSwitch/CustomIOSSwitch'
import { CustomSelect } from '../../CustomMui/CustomSelect/CustomSelect'
import { CustomToggle } from '../../CustomMui/CustomToggle/CustomToggle'
import { InfoHint } from '../InfoHint/InfoHint'
import { useSlideDialogTitle } from '../SlideDialog/slide-dialog-title'
import { settingsNs } from './locals'
import './locals'
import { ColorOption } from './ColorOption/ColorOption'
import { HealthSetting } from './HealthSetting/HealthSetting'
import { RootState, store } from '../../store/store'
import { setPrefs } from '../../store/actions/system.actions'
import { setTrainees, updateUser } from '../../store/actions/user.actions'
import { showErrorMsg } from '../../services/event-bus.service'
import {
  APP_FONTS,
  type AppFont,
  type ColorMode,
} from '../../types/system/Prefs'
import type { User } from '../../types/user/User'

const FONT_LABELS: Record<AppFont, string> = {
  'font-rubik': 'Rubik',
  'font-heebo': 'Heebo',
  'font-assistant': 'Assistant',
}

const COLOR_KEYS = [
  'primary',
  'blue',
  'yellow',
  'red',
  'orange',
  'green',
  'deepPurple',
  'purple',
  'pink',
] as const

interface SettingsProps {
  person?: User
}

export function Settings({ person }: SettingsProps) {
  const { t, i18n } = useTranslation(settingsNs)
  const { t: tCommon } = useTranslation()
  const prefs = useSelector((state: RootState) => state.systemModule.prefs)

  const MODE_OPTIONS = [
    { value: 'light', label: t('light') },
    { value: 'dark', label: t('dark') },
    { value: 'system', label: t('system') },
  ]
  useSlideDialogTitle(t('title'))

  function onChangeMode(next: string) {
    if (next !== 'light' && next !== 'dark' && next !== 'system') return
    const colorMode = next as ColorMode
    const isDarkMode =
      colorMode === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
        : colorMode === 'dark'
    setPrefs({ ...prefs, colorMode, isDarkMode })
  }

  function onChangeLanguage(next: string) {
    const lang = next === 'he' ? 'he' : 'en'
    setPrefs({ ...prefs, lang })
    i18n.changeLanguage(lang)
  }

  function onChangeFont(next: string) {
    setPrefs({ ...prefs, font: next as AppFont })
  }

  function onChangeColor(next: string) {
    setPrefs({ ...prefs, favoriteColor: next })
  }

  async function onToggleFixedMenu() {
    if (!person?._id) return
    const updated = { ...person, isFixedMenu: !person.isFixedMenu }
    try {
      const saved = await updateUser(updated)
      const trainees = store.getState().userModule.trainees
      const idx = trainees.findIndex((trainee) => trainee._id === saved._id)
      if (idx === -1) return
      const next = [...trainees]
      next[idx] = saved
      setTrainees(next)
    } catch {
      showErrorMsg(tCommon('messages.error.updateUser'))
    }
  }

  const mode = prefs.colorMode || (prefs.isDarkMode ? 'dark' : 'light')

  return (
    <div className='settings-container'>
      <HealthSetting />
      <Divider
        className={`divider ${prefs.isDarkMode ? 'dark-mode' : 'light-mode'}`}
      />
      <div className='settings-row settings-row-stack'>
        <span className='settings-row-label'>{t('mode')}</span>
        <CustomToggle
          value={mode}
          variant='segment'
          ariaLabel={t('mode')}
          className='settings-mode-toggle'
          onChange={onChangeMode}
          options={MODE_OPTIONS}
        />
      </div>
      <Divider
        className={`divider ${prefs.isDarkMode ? 'dark-mode' : 'light-mode'}`}
      />{' '}
      <div className='settings-row'>
        <span className='settings-row-label'>{t('language')}</span>
        <CustomSelect
          label={t('language')}
          values={['en', 'he']}
          className={prefs.favoriteColor}
          value={prefs.lang}
          valueLabels={{ en: t('english'), he: t('hebrew') }}
          onChange={onChangeLanguage}
        />
      </div>
      <Divider
        className={`divider ${prefs.isDarkMode ? 'dark-mode' : 'light-mode'}`}
      />{' '}
      <div className='settings-row'>
        <span className='settings-row-label'>{t('font')}</span>
        <CustomSelect
          label={t('font')}
          values={[...APP_FONTS]}
          className={prefs.favoriteColor}
          value={prefs.font || 'font-rubik'}
          valueLabels={FONT_LABELS}
          onChange={onChangeFont}
        />
      </div>
      <Divider
        className={`divider ${prefs.isDarkMode ? 'dark-mode' : 'light-mode'}`}
      />{' '}
      <div className='settings-row'>
        <span className='settings-row-label'>{t('favoriteColor')}</span>
        <CustomSelect
          label={t('favoriteColor')}
          className={prefs.favoriteColor}
          values={[...COLOR_KEYS]}
          value={prefs.favoriteColor || 'primary'}
          onChange={onChangeColor}
          renderOption={(color) => <ColorOption color={color} />}
        />
      </div>
      <Divider
        className={`divider ${prefs.isDarkMode ? 'dark-mode' : 'light-mode'}`}
      />
      <div className='settings-row'>
        <span className='settings-row-label'>
          {t('fixedMenu')}
          <InfoHint
            title={t('fixedMenuInfoTitle')}
            description={t('fixedMenuInfo')}
            className={prefs.favoriteColor}
          />
        </span>
        <CustomIOSSwitch
          color={prefs.favoriteColor}
          checked={!!person?.isFixedMenu}
          onClick={onToggleFixedMenu}
        />
      </div>
    </div>
  )
}

import { Divider, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { setPrefs } from '../../store/actions/system.actions'
import type { HealthProvider, Prefs } from '../../types/system/Prefs'
import { CustomIOSSwitch } from '../../CustomMui/CustomIOSSwitch/CustomIOSSwitch'
import { reloadHealthForCurrentProvider } from '../../store/actions/health.actions'
import { showErrorMsg } from '../../services/event-bus.service'
import { HealthConnect } from '../HealthConnect/HealthConnect'
import './styles/HealthProviderCard.scss'
import { healthService } from '../../services/health/health.service'

export function HealthProviderCard() {
  const { t } = useTranslation()
  const prefs = useSelector(
    (storeState: RootState) => storeState.systemModule.prefs
  )
  const isNative = useSelector(
    (storeState: RootState) => storeState.systemModule.isNative
  )
  const user = useSelector(
    (storeState: RootState) => storeState.userModule.user
  )
  const useGoogleHealth = prefs.healthProvider === 'google'

  const isGoogleHealthPlatform = healthService.isGoogleHealthPlatform()
  async function onToggleHealthProvider() {
    const nextProvider: HealthProvider = useGoogleHealth ? 'native' : 'google'
    const newPrefs: Prefs = { ...prefs, healthProvider: nextProvider }
    setPrefs(newPrefs)

    try {
      await reloadHealthForCurrentProvider(user?._id)
    } catch (err) {
      showErrorMsg(
        err instanceof Error ? err.message : t('health.providerSwitchError')
      )
    }
  }

  return (
    <div
      className={`health-provider-card-container ${
        prefs.isDarkMode ? 'dark-mode' : ''
      }`}
    >
      {isNative && (
        <>
          <div className='health-provider-row'>
            <div className='health-provider-copy'>
              <Typography
                variant='body1'
                className='prefs-label'
              >
                {t('health.providerLabel')}
              </Typography>
            </div>
            <CustomIOSSwitch
              color={prefs.favoriteColor}
              checked={useGoogleHealth}
              onClick={onToggleHealthProvider}
            />
          </div>
          <Typography
            variant='caption'
            className='health-provider-caption'
          >
            {t('health.providerCaption')}
          </Typography>
          <Divider
            className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`}
          />
        </>
      )}
      {isGoogleHealthPlatform ? (
        <Typography variant='body1'>{t('health.connectSuccess')}</Typography>
      ) : (
        <HealthConnect />
      )}
    </div>
  )
}

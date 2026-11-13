import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HealthConnect } from '../../../../components/HealthConnect/HealthConnect'
import { healthService } from '../../../../services/health/health.service'
import { showErrorMsg } from '../../../../services/event-bus.service'
import { setPrefs } from '../../../../store/actions/system.actions'
import { setHealthData } from '../../../../store/actions/health.actions'
import { store } from '../../../../store/store'
import { allowPhoneHealthNs } from './locals'
import './locals'
import ShareIcon from '@mui/icons-material/Share'

interface AllowPhoneHealthProps {
  onAllowed: () => void
}

export function AllowPhoneHealth({ onAllowed }: AllowPhoneHealthProps) {
  const { t } = useTranslation(allowPhoneHealthNs)
  const [busy, setBusy] = useState(false)

  async function onAllow() {
    setBusy(true)
    try {
      const granted = await healthService.requestPhoneHealthPermission()
      if (!granted) {
        await healthService.openPhoneHealthSettings()
        return
      }

      const prefs = store.getState().systemModule.prefs
      setPrefs({ ...prefs, usePhoneHealth: true })
      await setHealthData()
      onAllowed()
    } catch {
      showErrorMsg(t('error'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <HealthConnect
      title={t('title')}
      buttonText={t('button')}
      buttonIcon={<ShareIcon />}
      onClick={onAllow}
      disabled={busy}
    />
  )
}

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import Typography from '@mui/material/Typography'
import {
  HealthMethods,
  type HealthMethodId,
} from './HealthMethods/HealthMethods'
import { CustomAlertDialog } from '../../../CustomMui/CustomAlertDialog/CustomAlertDialog'
import { CustomButton } from '../../../CustomMui/CustomButton/CustomButton'
import { SlideDialog } from '../../SlideDialog/SlideDialog'
import { healthSettingNs } from './locals'
import './locals'
import { RootState } from '../../../store/store'
import { setPrefs } from '../../../store/actions/system.actions'
import {
  clearHealthSnapshot,
  reloadHealthForCurrentProvider,
  setGoogleHealthConnected,
  setGoogleHealthFlag,
  setHealthData,
  setPermitted,
} from '../../../store/actions/health.actions'
import { googleHealthService } from '../../../services/health/google-health.service'
import { healthService } from '../../../services/health/health.service'
import { startGoogleHealthConnect } from '../../../services/auth/google-auth.service'
import {
  showErrorMsg,
  showSuccessMsg,
} from '../../../services/event-bus.service'

export function HealthSetting() {
  const { t } = useTranslation(healthSettingNs)
  const { t: tCommon } = useTranslation()
  const prefs = useSelector((state: RootState) => state.systemModule.prefs)
  const isNative = useSelector(
    (state: RootState) => state.systemModule.isNative
  )
  const signedInUser = useSelector((state: RootState) => state.userModule.user)

  const [open, setOpen] = useState(false)
  const [ready, setReady] = useState(false)
  const [phoneConnected, setPhoneConnected] = useState(false)
  const [googleConnected, setGoogleConnected] = useState(false)
  const [pending, setPending] = useState<HealthMethodId | null>(null)
  const [busy, setBusy] = useState(false)

  const activeIsGoogle = !isNative || prefs.healthProvider === 'google'
  const activeConnected = activeIsGoogle ? googleConnected : phoneConnected

  useEffect(() => {
    let cancelled = false

    async function load() {
      const userId = signedInUser?._id
      if (userId) {
        try {
          const status = await googleHealthService.getStatus(userId)
          if (!cancelled) {
            setGoogleConnected(status.connected)
            setGoogleHealthFlag(status.connected)
          }
        } catch {
          if (!cancelled) setGoogleConnected(false)
        }
      }

      if (isNative) {
        const authorized = await healthService.isPhoneHealthAuthorized()
        if (!cancelled) setPhoneConnected(authorized)
      }

      if (!cancelled) setReady(true)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [signedInUser?._id, isNative, prefs.usePhoneHealth, prefs.healthProvider])

  async function onConnect(method: HealthMethodId) {
    const userId = signedInUser?._id
    if (!userId) {
      showErrorMsg(tCommon('health.connectError'))
      return
    }

    setBusy(true)
    try {
      if (method === 'google') {
        setPrefs({ ...prefs, healthProvider: 'google' })
        const result = await startGoogleHealthConnect({
          userId,
          returnTo: '/',
        })
        if (result?.connected) {
          const status = await googleHealthService.getStatus(userId)
          setGoogleConnected(status.connected)
          await setGoogleHealthConnected(status.connected)
          if (status.connected) {
            await setHealthData()
            showSuccessMsg(tCommon('health.connectSuccess'))
          }
        }
        return
      }

      setPrefs({ ...prefs, healthProvider: 'native', usePhoneHealth: true })
      await reloadHealthForCurrentProvider(userId)
      setPhoneConnected(await healthService.isPhoneHealthAuthorized())
    } catch {
      showErrorMsg(tCommon('health.connectError'))
    } finally {
      setBusy(false)
    }
  }

  async function onConfirmDisconnect() {
    const method = pending
    setPending(null)
    if (!method) return

    const userId = signedInUser?._id
    if (method === 'google' && !userId) {
      showErrorMsg(t('disconnectError'))
      return
    }

    setBusy(true)
    try {
      if (method === 'google' && userId) {
        await googleHealthService.disconnect(userId)
        setGoogleConnected(false)
        if (activeIsGoogle) {
          await setGoogleHealthConnected(false)
          clearHealthSnapshot()
        } else {
          setGoogleHealthFlag(false)
        }
        return
      }

      setPrefs({ ...prefs, usePhoneHealth: false })
      setPhoneConnected(false)
      await setPermitted(false)
      if (!activeIsGoogle) clearHealthSnapshot()
      try {
        await healthService.openPhoneHealthSettings()
      } catch {
        showErrorMsg(t('disconnectError'))
      }
    } catch {
      showErrorMsg(t('disconnectError'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className='settings-row'>
        <div className='settings-row-label'>
          <span>{t('title')}</span>
          {ready && activeConnected ? (
            <span className='settings-connected-tag'>{t('connected')}</span>
          ) : null}
        </div>
        {ready ? (
          <CustomButton
            text={activeConnected ? t('change') : t('connect')}
            onClick={() => setOpen(true)}
            disabled={busy}
          />
        ) : null}
      </div>

      <SlideDialog
        open={open}
        onClose={() => setOpen(false)}
        type='full'
        title={t('title')}
        component={
          <HealthMethods
            isNative={isNative}
            phoneConnected={phoneConnected}
            googleConnected={googleConnected}
            busy={busy}
            onConnect={onConnect}
            onDisconnect={setPending}
          />
        }
      />

      <CustomAlertDialog
        open={pending !== null}
        onClose={() => setPending(null)}
        title={t('disconnectTitle')}
      >
        <div className='health-disconnect-confirm'>
          <Typography variant='body2'>{t('disconnectBody')}</Typography>
          <div className='buttons-container'>
            <CustomButton
              text={tCommon('common.cancel')}
              fullWidth
              onClick={() => setPending(null)}
            />
            <CustomButton
              text={t('disconnect')}
              className='delete-account-button'
              fullWidth
              onClick={onConfirmDisconnect}
            />
          </div>
        </div>
      </CustomAlertDialog>
    </>
  )
}

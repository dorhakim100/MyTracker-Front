import { useEffect, useState } from 'react'
import { App as CapApp } from '@capacitor/app'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import Typography from '@mui/material/Typography'
import { HealthMethods } from './HealthMethods/HealthMethods'
import { CustomAlertDialog } from '../../../CustomMui/CustomAlertDialog/CustomAlertDialog'
import { CustomButton } from '../../../CustomMui/CustomButton/CustomButton'
import { SlideDialog } from '../../SlideDialog/SlideDialog'
import { healthSettingNs } from './locals'
import './locals'
import { RootState, store } from '../../../store/store'
import { setPrefs } from '../../../store/actions/system.actions'
import {
  clearHealthSnapshot,
  reloadHealthForCurrentProvider,
  setGoogleHealthConnected,
  setGoogleHealthFlag,
  setHealthData,
} from '../../../store/actions/health.actions'
import { googleHealthService } from '../../../services/health/google-health.service'
import { healthService } from '../../../services/health/health.service'
import { startGoogleHealthConnect } from '../../../services/auth/google-auth.service'
import {
  showErrorMsg,
  showSuccessMsg,
} from '../../../services/event-bus.service'

function syncPhoneHealthPref(authorized: boolean) {
  const current = store.getState().systemModule.prefs
  if (current.usePhoneHealth === authorized) return

  setPrefs({ ...current, usePhoneHealth: authorized })
}

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
  const [phoneAuthorized, setPhoneAuthorized] = useState(false)
  const [googleConnected, setGoogleConnected] = useState(false)
  const [confirmGoogle, setConfirmGoogle] = useState(false)
  const [busy, setBusy] = useState(false)

  const activeIsGoogle = !isNative || prefs.healthProvider === 'google'
  const activeConnected = activeIsGoogle ? googleConnected : phoneAuthorized

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
        const authorized = await healthService.getPhoneHealthPermission()
        if (!cancelled) {
          setPhoneAuthorized(authorized)
          syncPhoneHealthPref(authorized)
        }
      }

      if (!cancelled) setReady(true)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [signedInUser?._id, isNative, prefs.usePhoneHealth, prefs.healthProvider])

  useEffect(() => {
    if (!open || !isNative) return

    async function refresh() {
      const authorized = await healthService.getPhoneHealthPermission()
      setPhoneAuthorized(authorized)
      syncPhoneHealthPref(authorized)
    }

    function onVisible() {
      if (document.visibilityState === 'visible') refresh()
    }

    const listener = CapApp.addListener('appStateChange', ({ isActive }) => {
      if (isActive) refresh()
    })
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      listener.then((handle) => handle.remove())
    }
  }, [open, isNative])

  async function onTogglePhone(next: boolean) {
    setBusy(true)
    try {
      if (next) {
        const granted = await healthService.requestPhoneHealthPermission()
        setPhoneAuthorized(granted)
        syncPhoneHealthPref(granted)
        if (!granted) {
          await healthService.openPhoneHealthSettings()
          return
        }
        const userId = signedInUser?._id
        const provider = store.getState().systemModule.prefs.healthProvider
        if (userId && provider !== 'google') {
          await reloadHealthForCurrentProvider(userId)
        }
        return
      }

      await healthService.openPhoneHealthSettings()
      const authorized = await healthService.getPhoneHealthPermission()
      setPhoneAuthorized(authorized)
      syncPhoneHealthPref(authorized)
    } catch {
      showErrorMsg(t('disconnectError'))
    } finally {
      setBusy(false)
    }
  }

  async function onConnectGoogle() {
    const userId = signedInUser?._id
    if (!userId) {
      showErrorMsg(tCommon('health.connectError'))
      return
    }

    setBusy(true)
    try {
      setPrefs({
        ...store.getState().systemModule.prefs,
        healthProvider: 'google',
      })
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
    } catch {
      showErrorMsg(tCommon('health.connectError'))
    } finally {
      setBusy(false)
    }
  }

  async function onConfirmDisconnect() {
    setConfirmGoogle(false)
    const userId = signedInUser?._id
    if (!userId) {
      showErrorMsg(t('disconnectError'))
      return
    }

    setBusy(true)
    try {
      await googleHealthService.disconnect(userId)
      setGoogleConnected(false)
      if (activeIsGoogle) {
        await setGoogleHealthConnected(false)
        clearHealthSnapshot()
      } else {
        setGoogleHealthFlag(false)
      }
    } catch {
      showErrorMsg(t('disconnectError'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className='settings-row health'>
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
            phoneAuthorized={phoneAuthorized}
            googleConnected={googleConnected}
            busy={busy}
            onTogglePhone={onTogglePhone}
            onConnectGoogle={onConnectGoogle}
            onDisconnectGoogle={() => setConfirmGoogle(true)}
          />
        }
      />

      <CustomAlertDialog
        open={confirmGoogle}
        onClose={() => setConfirmGoogle(false)}
        title={t('disconnectTitle')}
      >
        <div className='health-disconnect-confirm'>
          <Typography variant='body2'>{t('disconnectBody')}</Typography>
          <div className='buttons-container'>
            <CustomButton
              text={tCommon('common.cancel')}
              fullWidth
              onClick={() => setConfirmGoogle(false)}
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

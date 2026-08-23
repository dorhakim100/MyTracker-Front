import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import { loginWithGoogle } from '../../store/actions/user.actions'
import {
  loadGoogleHealthConnection,
  setHealthData,
  setGoogleHealthConnected,
} from '../../store/actions/health.actions'
import { showErrorMsg, showSuccessMsg } from '../../services/event-bus.service'
import { loadPrefs, setActiveRoute } from '../../store/actions/system.actions'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { getDefaultsPrefs } from '../../services/system/system.service'

const colors = [
  'primary',
  'blue',
  'red',
  'yellow',
  'green',
  'orange',
  'deepPurple',
  'purple',
  'pink',
]

export function GoogleAuthCallback() {
  const { t } = useTranslation()
  const user = useSelector((state: RootState) => state.userModule.user)
  const prefs = useSelector((state: RootState) => state.systemModule.prefs)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    loadPrefs()
  }, [])

  useEffect(() => {
    const defaultPrefs = getDefaultsPrefs()
    if (prefs.isDarkMode) {
      document.body.classList.add('dark-mode')
    } else {
      document.body.classList.remove('dark-mode')
    }
    document.body.classList.remove(...colors)
    document.body.classList.add(
      prefs.favoriteColor || defaultPrefs.favoriteColor
    )
  }, [prefs.isDarkMode, prefs.favoriteColor])

  useEffect(() => {
    const completeAuth = async () => {
      const error = searchParams.get('error')
      const code = searchParams.get('code')
      const connected = searchParams.get('connected')
      const returnTo = searchParams.get('returnTo') || '/'
      const safeReturnTo = returnTo.startsWith('/') ? returnTo : '/'
      const userId = user?._id
      if (error) {
        showErrorMsg(t('auth.googleSignInError'))
        navigate(connected || code ? safeReturnTo : '/signin', {
          replace: true,
        })
        return
      }

      if (connected === '1') {
        try {
          if (userId) {
            await loadGoogleHealthConnection(userId)
            await setHealthData()
            await setGoogleHealthConnected(true)
          }
          showSuccessMsg(t('health.connectSuccess'))
          setActiveRoute(safeReturnTo)
          navigate(safeReturnTo, { replace: true })
        } catch {
          showErrorMsg(t('health.connectError'))
          navigate(safeReturnTo, { replace: true })
        }
        return
      }

      if (!code) {
        showErrorMsg(t('auth.googleSignInError'))
        navigate('/signin', { replace: true })
        return
      }

      try {
        const userRes = await loginWithGoogle(code)

        if (userRes && userRes?._id) {
          await loadGoogleHealthConnection(userRes?._id)
          await setHealthData()
          await setGoogleHealthConnected(true)
        }
        showSuccessMsg(t('auth.loginSuccess'))
        setActiveRoute(safeReturnTo)
        navigate(safeReturnTo, { replace: true })
      } catch {
        showErrorMsg(t('auth.googleSignInError'))
        navigate('/signin', { replace: true })
      }
    }

    completeAuth()
  }, [navigate, searchParams, t])

  return (
    <Stack
      className={`google-auth-callback-container ${
        prefs.isDarkMode ? 'dark-mode' : ''
      } ${prefs.favoriteColor || ''}`}
      alignItems='center'
      justifyContent='center'
      sx={{ minHeight: '100dvh', gap: 2, p: 3, color: 'inherit' }}
    >
      <CircularProgress />
      <Typography variant='body1'>{t('auth.googleSignInLoading')}</Typography>
    </Stack>
  )
}

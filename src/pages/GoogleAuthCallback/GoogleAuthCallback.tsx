import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import { loginWithGoogle } from '../../store/actions/user.actions'
import { showErrorMsg, showSuccessMsg } from '../../services/event-bus.service'
import { setActiveRoute } from '../../store/actions/system.actions'

export function GoogleAuthCallback() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const completeAuth = async () => {
      const error = searchParams.get('error')
      const code = searchParams.get('code')
      const returnTo = searchParams.get('returnTo') || '/'

      if (error) {
        showErrorMsg(t('auth.googleSignInError'))
        navigate('/signin', { replace: true })
        return
      }

      if (!code) {
        showErrorMsg(t('auth.googleSignInError'))
        navigate('/signin', { replace: true })
        return
      }

      try {
        await loginWithGoogle(code)
        showSuccessMsg(t('auth.loginSuccess'))
        setActiveRoute(returnTo.startsWith('/') ? returnTo : '/')
        navigate(returnTo.startsWith('/') ? returnTo : '/', { replace: true })
      } catch {
        showErrorMsg(t('auth.googleSignInError'))
        navigate('/signin', { replace: true })
      }
    }

    completeAuth()
  }, [navigate, searchParams, t])

  return (
    <Stack
      alignItems='center'
      justifyContent='center'
      sx={{ minHeight: '100dvh', gap: 2, p: 3 }}
    >
      <CircularProgress />
      <Typography variant='body1'>{t('auth.googleSignInLoading')}</Typography>
    </Stack>
  )
}

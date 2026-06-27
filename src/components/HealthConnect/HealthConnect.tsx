import { useTranslation } from 'react-i18next'
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun'
import { startGoogleHealthConnect } from '../../services/auth/google-auth.service'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'
import GoogleIcon from '@mui/icons-material/Google'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import Typography from '@mui/material/Typography'
import { showErrorMsg } from '../../services/event-bus.service'

export function HealthConnect() {
  const { t } = useTranslation()
  const prefs = useSelector((state: RootState) => state.systemModule.prefs)
  const user = useSelector((state: RootState) => state.userModule.user)
  const onConnect = async () => {
    const userId = user?._id
    if (!userId) {
      showErrorMsg(t('health.connectError'))
      return
    }
    try {
      await startGoogleHealthConnect({ userId, returnTo: '/' })
    } catch {
      showErrorMsg(t('health.connectError'))

      // httpService already surfaces auth errors via redirect/login flow
    }
  }

  return (
    <div
      className={`health-connect-container ${
        prefs.isDarkMode ? 'dark-mode' : ''
      }`}
    >
      <div className='title-container'>
        <DirectionsRunIcon />
        <Typography
          variant='body1'
          className='bold-header'
        >
          {t('health.connectTitle')}
        </Typography>
      </div>
      <CustomButton
        onClick={onConnect}
        text={t('common.connect')}
        icon={<GoogleIcon />}
      />
    </div>
  )
}

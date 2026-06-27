import { useTranslation } from 'react-i18next'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun'
import { startGoogleHealthConnect } from '../../../services/auth/google-auth.service'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store/store'
import { showErrorMsg, showSuccessMsg } from '../../../services/event-bus.service'
import {
  loadGoogleHealthConnection,
  setGoogleHealthConnected,
  setHealthData,
} from '../../../store/actions/health.actions'

export function Prompt() {
  const { t } = useTranslation()
  const user = useSelector((state: RootState) => state.userModule.user)
  const onConnect = async () => {
    try {
      if (!user?._id) {
        return
      }

      const result = await startGoogleHealthConnect({
        userId: user._id,
        returnTo: '/',
      })

      if (result?.connected) {
        await loadGoogleHealthConnection(user._id)
        await setHealthData()
        await setGoogleHealthConnected(true)
        showSuccessMsg(t('health.connectSuccess'))
      }
    } catch {
      showErrorMsg(t('health.connectError'))
    }
  }

  return (
    <div className='health-connect-prompt-container'>
      <DirectionsRunIcon className='health-connect-prompt-icon' />
      <Typography
        variant='h6'
        className='bold-header'
      >
        {t('health.connectTitle')}
      </Typography>
      <Typography
        variant='body2'
        className='health-connect-prompt-description'
      >
        {t('health.connectDescription')}
      </Typography>
      <Button
        variant='contained'
        onClick={onConnect}
      >
        {t('health.connectButton')}
      </Button>
    </div>
  )
}

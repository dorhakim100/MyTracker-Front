import { useTranslation } from 'react-i18next'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun'
import { startGoogleHealthConnect } from '../../../services/auth/google-auth.service'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store/store'

export function Prompt() {
  const { t } = useTranslation()
  const user = useSelector((state: RootState) => state.userModule.user)
  const onConnect = async () => {
    try {
      if (!user?._id) {
        return
      }
      await startGoogleHealthConnect({ userId: user._id, returnTo: '/' })
    } catch {
      // httpService already surfaces auth errors via redirect/login flow
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

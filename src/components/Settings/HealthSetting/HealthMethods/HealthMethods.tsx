import GoogleIcon from '@mui/icons-material/Google'
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone'
import { useTranslation } from 'react-i18next'
import { healthSettingNs } from '../locals'
import { HealthMethod } from './HealthMethod/HealthMethod'

export type HealthMethodId = 'native' | 'google'

interface HealthMethodsProps {
  isNative: boolean
  phoneConnected: boolean
  googleConnected: boolean
  busy: boolean
  onConnect: (method: HealthMethodId) => void
  onDisconnect: (method: HealthMethodId) => void
}

export function HealthMethods({
  isNative,
  phoneConnected,
  googleConnected,
  busy,
  onConnect,
  onDisconnect,
}: HealthMethodsProps) {
  const { t } = useTranslation(healthSettingNs)

  return (
    <div className='health-methods-container'>
      {isNative ? (
        <HealthMethod
          icon={<PhoneIphoneIcon />}
          title={t('phoneTitle')}
          description={t('phoneDescription')}
          connected={phoneConnected}
          connectedLabel={t('connected')}
          connectLabel={t('connect')}
          disconnectLabel={t('disconnect')}
          busy={busy}
          onConnect={() => onConnect('native')}
          onDisconnect={() => onDisconnect('native')}
        />
      ) : null}
      <HealthMethod
        icon={<GoogleIcon />}
        title={t('googleTitle')}
        description={t('googleDescription')}
        connected={googleConnected}
        connectedLabel={t('connected')}
        connectLabel={t('connect')}
        disconnectLabel={t('disconnect')}
        busy={busy}
        onConnect={() => onConnect('google')}
        onDisconnect={() => onDisconnect('google')}
      />
    </div>
  )
}

import GoogleIcon from '@mui/icons-material/Google'
import { useTranslation } from 'react-i18next'
import { healthSettingNs } from '../locals'
import { HealthMethod } from './HealthMethod/HealthMethod'
import { PhoneHealth } from './PhoneHealth/PhoneHealth'

interface HealthMethodsProps {
  isNative: boolean
  phoneAuthorized: boolean
  googleConnected: boolean
  busy: boolean
  onTogglePhone: (next: boolean) => void
  onConnectGoogle: () => void
  onDisconnectGoogle: () => void
}

export function HealthMethods({
  isNative,
  phoneAuthorized,
  googleConnected,
  busy,
  onTogglePhone,
  onConnectGoogle,
  onDisconnectGoogle,
}: HealthMethodsProps) {
  const { t } = useTranslation(healthSettingNs)

  return (
    <div className='health-methods-container'>
      {isNative ? (
        <PhoneHealth
          checked={phoneAuthorized}
          busy={busy}
          onChange={onTogglePhone}
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
        onConnect={onConnectGoogle}
        onDisconnect={onDisconnectGoogle}
      />
    </div>
  )
}

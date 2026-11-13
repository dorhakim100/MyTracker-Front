import type { ReactNode } from 'react'
import Typography from '@mui/material/Typography'
import { CustomButton } from '../../../../../CustomMui/CustomButton/CustomButton'

interface HealthMethodProps {
  icon: ReactNode
  title: string
  description: string
  connected: boolean
  connectedLabel: string
  connectLabel: string
  disconnectLabel: string
  busy: boolean
  onConnect: () => void
  onDisconnect: () => void
}

export function HealthMethod({
  icon,
  title,
  description,
  connected,
  connectedLabel,
  connectLabel,
  disconnectLabel,
  busy,
  onConnect,
  onDisconnect,
}: HealthMethodProps) {
  return (
    <div className='health-method'>
      <div className='health-method-heading'>
        {icon}
        <div className='health-method-copy'>
          <div className='health-method-title'>
            <span>{title}</span>
            {connected ? (
              <span className='settings-connected-tag'>{connectedLabel}</span>
            ) : null}
          </div>
          <Typography
            variant='body2'
            className='health-method-description'
          >
            {description}
          </Typography>
        </div>
      </div>
      <CustomButton
        text={connected ? disconnectLabel : connectLabel}
        className={connected ? 'delete-account-button' : ''}
        disabled={busy}
        onClick={connected ? onDisconnect : onConnect}
      />
    </div>
  )
}

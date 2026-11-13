import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { CustomIOSSwitch } from '../../../../../CustomMui/CustomIOSSwitch/CustomIOSSwitch'
import { RootState } from '../../../../../store/store'
import { healthSettingNs } from '../../locals'

interface PhoneHealthProps {
  checked: boolean
  busy: boolean
  onChange: (next: boolean) => void
}

export function PhoneHealth({ checked, busy, onChange }: PhoneHealthProps) {
  const { t } = useTranslation(healthSettingNs)
  const favoriteColor = useSelector(
    (state: RootState) => state.systemModule.prefs.favoriteColor
  )

  return (
    <div className='health-method'>
      <div className='health-method-heading'>
        <PhoneIphoneIcon />
        <div className='health-method-copy'>
          <div className='health-method-title'>
            <span>{t('phoneTitle')}</span>
          </div>
          <Typography
            variant='body2'
            className='health-method-description'
          >
            {t('phoneDescription')}
          </Typography>
        </div>
      </div>
      <CustomIOSSwitch
        className='phone-health-switch'
        color={favoriteColor}
        checked={checked}
        disabled={busy}
        onChange={(_, next) => onChange(next)}
      />
    </div>
  )
}

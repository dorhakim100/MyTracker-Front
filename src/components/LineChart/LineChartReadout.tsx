import CloseIcon from '@mui/icons-material/Close'
import { useTranslation } from 'react-i18next'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'

export interface LineChartReadoutContent {
  title: string
  subtitle: string
}

interface LineChartReadoutProps {
  title: string
  subtitle: string
  onDismiss: () => void
  isDarkMode?: boolean
}

export function LineChartReadout({
  title,
  subtitle,
  onDismiss,
  isDarkMode = false,
}: LineChartReadoutProps) {
  const { t } = useTranslation()

  return (
    <div
      className={`line-chart-readout container ${isDarkMode ? 'dark-mode' : ''}`}
    >
      <div className='readout-text'>
        <span className='readout-title'>{title}</span>
        <span className='readout-subtitle'>{subtitle}</span>
      </div>
      <CustomButton
        isIcon={true}
        icon={<CloseIcon />}
        onClick={onDismiss}
        backgroundColor='transparent'
        ariaLabel={t('common.close')}
        tooltipTitle={t('common.close')}
        shouldVibrate={false}
        className='readout-dismiss'
      />
    </div>
  )
}

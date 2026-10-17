import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { prBadgeNs } from './locals'
import './locals'

interface PrBadgeProps {
  type: 'weight' | 'volume'
  animationDelayMs?: number
}

export function PrBadge({ type, animationDelayMs }: PrBadgeProps) {
  const { t } = useTranslation(prBadgeNs)
  const isDarkMode = useSelector(
    (state: RootState) => state.systemModule.prefs.isDarkMode,
  )

  return (
    <span
      className={`pr-badge ${type} ${isDarkMode ? 'dark' : ''}`}
      style={
        animationDelayMs == null
          ? undefined
          : { animationDelay: `${animationDelayMs}ms` }
      }
    >
      {type === 'weight' ? t('weightPr') : t('volumePr')}
    </span>
  )
}

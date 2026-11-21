import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import Lottie from 'lottie-react'
import streakFlame from '../../../public/streak-flame.json'
import { liveStreakNs } from './locals'

interface LiveStreakProps {
  count: number
  icon?: ReactNode
  showLottie?: boolean
  label?: string
  size?: 'medium' | 'large'
}

export function LiveStreak({
  count,
  icon,
  showLottie = true,
  label,
  size = 'medium',
}: LiveStreakProps) {
  const { t } = useTranslation(liveStreakNs)

  const displayCount = count > 999 ? '+999' : count
  const sizeClass = count > 999 ? 'medium' : size

  return (
    <div
      className={`live-streak-container ${sizeClass}`}
      aria-label={label ?? t('liveStreak', { count })}
    >
      {icon && (
        <span
          className='live-streak-icon'
          aria-hidden='true'
        >
          {icon}
        </span>
      )}
      <bdi>{displayCount}</bdi>
      {showLottie && (
        <span
          className='live-streak-mark'
          aria-hidden='true'
        >
          <Lottie
            className='streak-flame'
            animationData={streakFlame}
            loop={true}
            autoplay={true}
          />
        </span>
      )}
    </div>
  )
}

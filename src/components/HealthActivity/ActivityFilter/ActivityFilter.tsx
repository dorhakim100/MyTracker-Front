import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import TodayIcon from '@mui/icons-material/Today'
import Lottie from 'lottie-react'
import { CustomButton } from '../../../CustomMui/CustomButton/CustomButton'
import { RootState } from '../../../store/store'
import type { ActivityFrame } from '../../../types/health/Activity'
import streakFlame from '../../../../public/streak-flame.json'
import { activityFilterNs } from './locals'
import './locals'

const FRAMES: ActivityFrame[] = ['week', 'month', 'quarter', 'year']

interface ActivityFilterProps {
  frame: ActivityFrame
  loading: boolean
  canGoPrevious: boolean
  canGoNext: boolean
  canGoCurrent: boolean
  onFrame: (frame: ActivityFrame) => void
  onPrevious: () => void
  onNext: () => void
  onToday: () => void
  period: string
  liveStreak?: number
}

export function ActivityFilter({
  frame,
  loading,
  canGoPrevious,
  canGoNext,
  canGoCurrent,
  onFrame,
  onPrevious,
  onNext,
  onToday,
  period,
  liveStreak,
}: ActivityFilterProps) {
  const { t } = useTranslation(activityFilterNs)
  const isRtl = useSelector(
    (state: RootState) => state.systemModule.prefs.lang === 'he'
  )
  const PreviousIcon = isRtl ? ChevronRightIcon : ChevronLeftIcon
  const NextIcon = isRtl ? ChevronLeftIcon : ChevronRightIcon
  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return (
    <div className='activity-filter-container'>
      <div className='activity-frames'>
        <div className='activity-frame-buttons'>
          {FRAMES.map((item) => (
            <CustomButton
              key={item}
              text={t(item)}
              variant='thin'
              className={item === frame ? 'active' : ''}
              onClick={() => onFrame(item)}
              ariaLabel={t(item)}
              disabled={loading || frame === item}
            />
          ))}
        </div>
      </div>
      <div className='activity-paging'>
        {liveStreak != null && (
          <div
            className='activity-live-streak'
            aria-label={t('liveStreak', { count: liveStreak })}
          >
            <bdi>{liveStreak}</bdi>
            <Lottie
              className='streak-flame'
              animationData={streakFlame}
              loop={!reduceMotion}
              autoplay={!reduceMotion}
            />
          </div>
        )}
        <p className='activity-period'>
          <bdi>{period}</bdi>
        </p>
        <div className='activity-paging-actions'>
          <CustomButton
            isIcon
            icon={<PreviousIcon />}
            variant='flat'
            disabled={!canGoPrevious || loading}
            ariaLabel={t('previous')}
            onClick={onPrevious}
          />
          <CustomButton
            isIcon
            icon={<TodayIcon />}
            variant='flat'
            disabled={!canGoCurrent || loading}
            ariaLabel={t('today')}
            onClick={onToday}
          />
          <CustomButton
            isIcon
            icon={<NextIcon />}
            variant='flat'
            disabled={!canGoNext || loading}
            ariaLabel={t('next')}
            onClick={onNext}
          />
        </div>
      </div>
    </div>
  )
}

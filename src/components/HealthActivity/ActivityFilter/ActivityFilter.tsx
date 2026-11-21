import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import TodayIcon from '@mui/icons-material/Today'
import { CustomButton } from '../../../CustomMui/CustomButton/CustomButton'
import { Chevron } from '../../../CustomMui/Chevron/Chevron'
import { GoalTag } from '../../../CustomMui/GoalTag/GoalTag'
import { LiveStreak } from '../../LiveStreak/LiveStreak'
import type { ActivityFrame, ActivityTag } from '../../../types/health/Activity'
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
  icon?: ReactNode
  target?: ActivityTag | null
  goalLabel?: string
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
  icon,
  target,
  goalLabel,
}: ActivityFilterProps) {
  const { t } = useTranslation(activityFilterNs)
  const hasStreak = liveStreak != null && liveStreak > 0

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

      <div className={`activity-paging ${hasStreak ? 'has-streak' : ''}`}>
        {hasStreak && (
          <LiveStreak
            count={liveStreak}
            icon={icon}
          />
        )}
        <div className='activity-paging-content'>
          <p className='activity-period'>
            <bdi>{period}</bdi>
          </p>{' '}
          {target && (
            <div className='activity-goal-tag'>
              <GoalTag
                target={target}
                label={goalLabel}
              />
            </div>
          )}
        </div>
        <div className='activity-paging-actions'>
          <CustomButton
            isIcon
            icon={<Chevron direction='back' />}
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
            icon={<Chevron />}
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

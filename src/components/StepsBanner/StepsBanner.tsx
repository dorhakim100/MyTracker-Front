import { Typography } from '@mui/material'
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun'
import { useTranslation } from 'react-i18next'
import { GoalBanner } from '../GoalBanner/GoalBanner'
import { formatNumberWithCommas } from '../../services/util.service'


export interface StepsBannerProps {
  steps: number
  /** When set, shows current / goal like other banners. */
  goal?: number
  className?: string
}

export function StepsBanner({ steps, goal, className }: StepsBannerProps) {
  const { t } = useTranslation()

  const formattedSteps = formatNumberWithCommas(steps)

  return (
    <div className={`steps-banner-container ${className ?? ''}`.trim()}>
      <Typography
        variant='h6'
        className='bold-header steps-banner-title'
      >
        {t('steps.stepsToday')}
      </Typography>
      <GoalBanner
        // current={steps}
        current={formattedSteps}
        goal={goal}
        isGoal={goal !== undefined}
        icon={<DirectionsRunIcon />}
      />
    </div>
  )
}

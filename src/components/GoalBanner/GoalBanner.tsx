import { Typography } from '@mui/material'
import FlagIcon from '@mui/icons-material/Flag'
import { formatNumberWithCommas } from '../../services/util.service'

interface GoalBannerProps {
  current: number | string
  goal?: number | string
  extraValue?: string
  icon?: React.ReactNode
  isGoal?: boolean
  afterValue?: string
}

export function GoalBanner({
  current,
  goal,
  extraValue = '',
  icon,
  isGoal = true,
  afterValue = '',
}: GoalBannerProps) {
  const formattedCurrent = formatNumberWithCommas(+current)
  let formattedGoal = goal
  if (goal) {
    formattedGoal = formatNumberWithCommas(+goal)
  }

  return (
    <div className='goal-banner banner'>
      <div className='value-container'>
        <Typography
          variant='body1'
          className='bold-header'
        >
          {formattedCurrent + extraValue}
          <span className='after-value'>{afterValue}</span>
        </Typography>
        {isGoal && (
          <>
            <span>/</span>
            <Typography
              variant='body1'
              className='bold-header'
            >
              {formattedGoal + extraValue}
              <span className='after-value'>{afterValue}</span>
            </Typography>
          </>
        )}
      </div>
      {icon || <FlagIcon />}
    </div>
  )
}

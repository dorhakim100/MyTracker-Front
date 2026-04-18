import { Typography } from '@mui/material'
import FlagIcon from '@mui/icons-material/Flag'

interface GoalBannerProps {
  current: number | string
  goal?: number | string
  extraValue?: string
  icon?: React.ReactNode
  isGoal?: boolean
}

export function GoalBanner({
  current,
  goal,
  extraValue = '',
  icon,
  isGoal = true,
}: GoalBannerProps) {
  return (
    <div className='goal-banner banner'>
      <div className='value-container'>
        <Typography variant='body1' className='bold-header'>{current + extraValue}</Typography>
        {isGoal && <>
        <span>/</span>
        <Typography variant='body1' className='bold-header'>{goal + extraValue}</Typography>
        </>}
      </div>
      {icon || <FlagIcon />}
    </div>
  )
}

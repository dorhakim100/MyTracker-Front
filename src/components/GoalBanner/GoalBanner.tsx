import { Typography } from '@mui/material'
import FlagIcon from '@mui/icons-material/Flag'

interface GoalBannerProps {
  current: number | string
  goal: number | string
  extraValue?: string
}

export function GoalBanner({
  current,
  goal,
  extraValue = '',
}: GoalBannerProps) {
  return (
    <div className='goal-banner banner'>
      <div className='value-container'>
        <Typography variant='body1'>{current + extraValue}</Typography>
        <span>/</span>
        <Typography variant='body1'>{goal + extraValue}</Typography>
      </div>
      <FlagIcon />
    </div>
  )
}

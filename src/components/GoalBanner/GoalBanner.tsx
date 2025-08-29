import { Typography } from '@mui/material'
import FlagIcon from '@mui/icons-material/Flag'

interface GoalBannerProps {
  current: number
  goal: number
}

export function GoalBanner({ current, goal }: GoalBannerProps) {
  return (
    <div className='goal-banner banner'>
      <div className='value-container'>
        <Typography variant='body1'>{current}</Typography>
        <span>/</span>
        <Typography variant='body1'>{goal}</Typography>
      </div>
      <FlagIcon />
    </div>
  )
}

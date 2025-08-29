import { Typography } from '@mui/material'
import FlagIcon from '@mui/icons-material/Flag'

interface GoalBannerProps {
  current: number
  goal: number
  isGram?: boolean
}

export function GoalBanner({ current, goal, isGram = false }: GoalBannerProps) {
  return (
    <div className='goal-banner banner'>
      <div className='value-container'>
        <Typography variant='body1'>{current + (isGram ? 'g' : '')}</Typography>
        <span>/</span>
        <Typography variant='body1'>{goal + (isGram ? 'g' : '')}</Typography>
      </div>
      <FlagIcon />
    </div>
  )
}

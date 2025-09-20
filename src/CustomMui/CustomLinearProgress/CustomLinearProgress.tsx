import { LinearProgress, Typography } from '@mui/material'
import { GoalBanner } from '../../components/GoalBanner/GoalBanner'

interface CustomLinearProgressProps {
  value: number
  color?: string
  currentValue?: string
  goalValue?: string
  header?: string
  isGram?: boolean
}

export function CustomLinearProgress({
  value,
  color = 'black',
  currentValue,
  goalValue,
  header,
  isGram = false,
}: CustomLinearProgressProps) {
  return (
    <div className='linear-progress-container'>
      <div className='header-container'>
        <Typography variant='body1'>{header}</Typography>
      </div>
      <LinearProgress
        variant='determinate'
        value={value > 100 ? 100 : value}
        sx={{
          height: 8,
          borderRadius: 4,

          backgroundColor: 'lightgray',

          '& .MuiLinearProgress-bar': {
            backgroundColor: color,
          },
        }}
      />
      {currentValue && goalValue && (
        <GoalBanner
          current={(+currentValue).toFixed(0)}
          goal={(+goalValue).toFixed(0)}
          extraValue={isGram ? 'g' : ''}
        />
      )}
    </div>
  )
}

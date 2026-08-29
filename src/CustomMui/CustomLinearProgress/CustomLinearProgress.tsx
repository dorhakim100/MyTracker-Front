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
  color,
  currentValue,
  goalValue,
  header,
  isGram = false,
}: CustomLinearProgressProps) {
  return (
    <div className='linear-progress-container'>
      <div className='header-container'>
        <Typography
          variant='body1'
          className='bold-header'
        >
          {header}
        </Typography>
      </div>
      <LinearProgress
        variant='determinate'
        className='custom-linear-progress'
        value={value > 100 ? 100 : value}
        style={{
          ['--progress-accent' as string]: color || 'var(--accent)',
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

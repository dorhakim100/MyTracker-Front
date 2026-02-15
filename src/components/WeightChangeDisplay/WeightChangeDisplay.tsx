import { Typography } from '@mui/material'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'

export interface WeightChangeDisplayProps {
  value: number
  range?: string
}

export function WeightChangeDisplay({
  value,
  range = '7D',
}: WeightChangeDisplayProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )
  const hasChange = value !== 0
  const isPositive = value > 0
  const isNegative = value < 0

  const valueText =
    value !== 0 && value > 0
      ? `+${value} kg`
      : value < 0
        ? `${value} kg`
        : 'No change'

  return (
    <div
      className={`weight-change-display ${prefs.isDarkMode ? 'dark-mode' : ''}`}
    >
      <Typography
        variant='body1'
        className={`value ${hasChange ? 'has-change' : ''} ${isPositive ? 'positive' : ''} ${isNegative ? 'negative' : ''} ${prefs.isDarkMode ? 'dark-mode' : ''}`}
      >
        {valueText}
      </Typography>
      <Typography
        variant='caption'
        className={`since-last ${prefs.isDarkMode ? 'dark-mode' : ''}`}
      >
        ({range})
      </Typography>
    </div>
  )
}

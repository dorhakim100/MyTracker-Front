import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'

import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'

interface CircularProgressProps {
  value: number
  text: string
  color?: string
}

const colorMap: Record<string, string> = {
  primary: 'var(--primary-color)',
  blue: 'var(--picker-color-blue)',
  yellow: 'var(--picker-color-yellow)',
  red: 'var(--picker-color-red)',
  orange: 'var(--picker-color-orange)',
  green: 'var(--picker-color-green)',
  deepPurple: 'var(--picker-color-deep-purple)',
  purple: 'var(--picker-color-purple)',
  pink: 'var(--picker-color-pink)',
}

export function CircularProgress({
  value,
  text,
  color,
}: CircularProgressProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const progressColor = color || colorMap[prefs.favoriteColor]

  // if color is provided, use it
  // only if dark mode
  // if no color is provided, use default color
  // if light mode, use black
  const textColor = color
    ? prefs.isDarkMode
      ? color || colorMap[prefs.favoriteColor]
      : 'black'
    : colorMap[prefs.favoriteColor]

  return (
    <div className='circular-progress'>
      <CircularProgressbar
        value={value}
        text={text}
        styles={buildStyles({
          pathColor: progressColor,
          textColor: textColor,
          trailColor: '#e6e6e6',
          textSize: '1.8rem',

          // textStyle: {
          //   fontWeight: 700,
          // },
        })}
      />
    </div>
  )
}

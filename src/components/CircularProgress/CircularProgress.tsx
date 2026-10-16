import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'

import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { formatNumberWithCommas } from '../../services/util.service'
import { RollingNumber } from '../RollingNumber/RollingNumber'
import { useCrossedGoal } from '../../hooks/useCrossedGoal'
// import { GoalBanner } from '../GoalBanner/GoalBanner'
import { useTranslation } from 'react-i18next'
import { useEffect, useMemo, useState } from 'react'

interface CircularProgressProps {
  value: number
  text: string
  color?: string
  afterText?: string
  isTextValue?: boolean
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
  afterText,
  isTextValue = true,
}: CircularProgressProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )
  const { t } = useTranslation()
  const progressColor = color || colorMap[prefs.favoriteColor]

  const [afterMountValue, setAfterMountValue] = useState(0)
  const [textValue, setTextValue] = useState(isTextValue ? 0 : text)
  useEffect(() => {
    setAfterMountValue(value)
    if (isTextValue) {
      setTextValue(text)
    }
  }, [value])

  // if color is provided, use it
  // only if dark mode
  // if no color is provided, use default color
  // if light mode, use black
  const textColor = color
    ? prefs.isDarkMode
      ? color || colorMap[prefs.favoriteColor]
      : 'black'
    : colorMap[prefs.favoriteColor]
  const goalCrossed = useCrossedGoal(value)

  return (
    <div
      className={`circular-progress${goalCrossed ? ' goal-crossed' : ''}`}
      style={{ ['--progress-accent' as string]: progressColor }}
    >
      <CircularProgressbar
        value={afterMountValue}
        text=''
        styles={buildStyles({
          pathColor: progressColor,
          textColor: textColor,
          trailColor: 'var(--ring-trail)',
          textSize: '1.8rem',

          // textStyle: {
          //   fontWeight: 700,
          // },
        })}
      />
      <span
        className='circular-progress-value'
        style={{ color: textColor }}
      >
        <RollingNumber value={Number(textValue) || 0} />
      </span>
      {afterText && (
        // <GoalBanner
        // current={separateThousands(+afterText)}

        // extraValue=''
        // isGoal={false}
        // />
        <span className='after-text bold-header'>
          {t('macros.outOf')} {formatNumberWithCommas(+afterText)}
        </span>
      )}
    </div>
  )
}

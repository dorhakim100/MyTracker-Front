import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'

import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { formatNumberWithCommas } from '../../services/util.service'
import { RollingNumber } from '../RollingNumber/RollingNumber'
import { useCrossedGoal } from '../../hooks/useCrossedGoal'
// import { GoalBanner } from '../GoalBanner/GoalBanner'
import { useTranslation } from 'react-i18next'
import { useEffect, useRef, useState } from 'react'
import CustomSkeleton from '../../CustomMui/CustomSkeleton/CustomSkeleton'

interface CircularProgressProps {
  value: number
  text: string
  color?: string
  afterText?: string
  isTextValue?: boolean
  isLoading?: boolean
}

function shownAfter(value: string) {
  const amount = Number(value)
  if (Number.isFinite(amount)) return formatNumberWithCommas(amount)
  return value
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

const RING_STROKE = 8
const OVERFLOW_STROKE = 6
const RING_RADIUS = 50 - RING_STROKE / 2
const RING_LENGTH = Math.PI * 2 * RING_RADIUS
const RING_LIMIT = 300
const BLEND_FROM = 85
const BLEND_TO = 115

function clampRing(value: number) {
  if (!Number.isFinite(value) || value <= 0) return 0
  return Math.min(value, RING_LIMIT)
}

const RING_EASE_MS = 500

function easeOut(amount: number) {
  if (amount <= 0) return 0
  if (amount >= 1) return 1
  const cx = 0.99
  const bx = 0.06
  const ax = 1 - cx - bx
  const cy = 3
  const by = -3
  const ay = 1 - cy - by
  let t = amount
  for (let step = 0; step < 6; step++) {
    const x = ((ax * t + bx) * t + cx) * t
    const slope = (3 * ax * t + 2 * bx) * t + cx
    if (Math.abs(x - amount) < 0.0001 || slope === 0) break
    t -= (x - amount) / slope
  }
  const solved = Math.min(Math.max(t, 0), 1)
  return ((ay * solved + by) * solved + cy) * solved
}

export function CircularProgress({
  value,
  text,
  color,
  afterText,
  isTextValue = true,
  isLoading = false,
}: CircularProgressProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )
  const { t } = useTranslation()
  const progressColor = color || colorMap[prefs.favoriteColor]
  const [ringShown, setRingShown] = useState(0)
  const shownRef = useRef(0)
  const [textValue, setTextValue] = useState(isTextValue ? 0 : text)
  useEffect(() => {
    const target = clampRing(value)
    const from = shownRef.current
    if (from === target) return

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    if (reduceMotion) {
      shownRef.current = target
      setRingShown(target)
      return
    }

    const start = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const progress = Math.min((now - start) / RING_EASE_MS, 1)
      const next = from + (target - from) * easeOut(progress)
      shownRef.current = next
      setRingShown(next)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value])
  useEffect(() => {
    if (isTextValue) {
      setTextValue(text)
    }
  }, [text, isTextValue])

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
      style={{
        ['--progress-accent' as string]: progressColor,
        ['--ring-stroke' as string]: String(RING_STROKE),
        ['--overflow-stroke' as string]: String(OVERFLOW_STROKE),
        ['--blend-from' as string]: `${BLEND_FROM * 3.6}deg`,
        ['--bright-at' as string]: `${(BLEND_TO - 100) * 3.6}deg`,
        ['--ring-shown' as string]: String(ringShown),
        ['--ring-length' as string]: `${RING_LENGTH}px`,
      }}
    >
      <div className='circular-progress-ring'>
        <CircularProgressbar
          value={Math.min(ringShown, 100)}
          text=''
          strokeWidth={RING_STROKE}
          styles={buildStyles({
            pathColor: progressColor,
            textColor: textColor,
            trailColor: 'var(--ring-trail)',
            textSize: '1.8rem',
            pathTransitionDuration: 0,

            // textStyle: {
            //   fontWeight: 700,
            // },
          })}
        />
        <div
          className='circular-progress-blend'
          aria-hidden='true'
        />
        <div
          className='circular-progress-overflow'
          aria-hidden='true'
        />
        <div
          className='circular-progress-light-blend'
          aria-hidden='true'
        />
        <div
          className='circular-progress-light'
          aria-hidden='true'
        />
        <div
          className={`progress-cursor${ringShown >= 100 ? ' over-100' : ''}`}
          aria-hidden='true'
        >
          <span className='progress-cursor-dot' />
        </div>
      </div>
      {isLoading ? (
        <div className='loading-container'>
          <CustomSkeleton
            width={40}
            height={100}
            variant='text'
            isDarkMode={prefs.isDarkMode}
          />
          <CustomSkeleton
            width={60}
            height={30}
            variant='text'
            isDarkMode={prefs.isDarkMode}
          />
        </div>
      ) : (
        <>
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
              {t('macros.outOf')} {shownAfter(afterText)}
            </span>
          )}
        </>
      )}
    </div>
  )
}

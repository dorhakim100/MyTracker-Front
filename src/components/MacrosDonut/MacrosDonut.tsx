import { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import {
  calculateCarbCalories,
  calculateFatCalories,
  calculateProteinCalories,
} from '../../services/macros/macros.service'
import { RootState } from '../../store/store'
import { useSelector } from 'react-redux'
import { formatNumberWithCommas } from '../../services/util.service'

interface MacrosDonutProps {
  protein: number
  carbs: number
  fats: number
  calories?: number
  showProgress?: boolean
  currentProtein?: number
  currentCarbs?: number
  currentFats?: number
  currentCalories?: number
  goalCalories?: number
  /** When set with showProgress, draws blinking pending-change wedges. */
  previewProtein?: number
  previewCarbs?: number
  previewFats?: number
  /** Denominator for fill/blink (defaults to protein/carbs/fats ring props). */
  fillDenomProtein?: number
  fillDenomCarbs?: number
  fillDenomFats?: number
  /** Signed calorie delta shown next to baseline in progress mode. */
  calorieDelta?: number
}

const proteinColor = 'var(--macro-protein)'
const carbsColor = 'var(--macro-carbs)'
const fatsColor = 'var(--macro-fats)'

// Match `.donut` `--size` / `--thickness`. Visible ring is half of thickness.
const DONUT_SIZE = 160
const DONUT_THICKNESS = 18
const RING_WIDTH = DONUT_THICKNESS / 2
const RING_RADIUS = DONUT_SIZE / 2 - RING_WIDTH / 2
const DONUT_CENTER = DONUT_SIZE / 2

function clampProgress(current: number, goal: number) {
  if (!goal || goal <= 0) return 0
  return Math.min(1, Math.max(0, current / goal))
}

function segmentEnds(
  segmentStart: number,
  segmentPct: number,
  baseline: number,
  projected: number,
  denom: number
) {
  const a = segmentStart + segmentPct * clampProgress(baseline, denom)
  const b = segmentStart + segmentPct * clampProgress(projected, denom)
  // Solid stays on the shared portion; blink covers add wedge or removal zone.
  // On decrease, fill must end at projected so the removed arc can pulse over pale.
  return {
    fillEnd: Math.min(a, b),
    blinkStart: Math.min(a, b),
    blinkEnd: Math.max(a, b),
  }
}

export function MacrosDonut({
  protein,
  carbs,
  fats,
  calories,
  showProgress = false,
  currentProtein = 0,
  currentCarbs = 0,
  currentFats = 0,
  currentCalories,
  goalCalories,
  previewProtein,
  previewCarbs,
  previewFats,
  fillDenomProtein,
  fillDenomCarbs,
  fillDenomFats,
  calorieDelta,
}: MacrosDonutProps) {
  const { t } = useTranslation()
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const proteinCalories = calculateProteinCalories(protein)
  const carbsCalories = calculateCarbCalories(carbs)
  const fatsCalories = calculateFatCalories(fats)

  const total = +(
    calories || Math.max(proteinCalories + carbsCalories + fatsCalories, 0.0001)
  )

  const pPct = (proteinCalories / total) * 100
  const cPct = (carbsCalories / total) * 100
  const fPct = (fatsCalories / total) * 100

  const pDenom = fillDenomProtein ?? protein
  const cDenom = fillDenomCarbs ?? carbs
  const fDenom = fillDenomFats ?? fats

  const hasPreview =
    showProgress &&
    previewProtein !== undefined &&
    previewCarbs !== undefined &&
    previewFats !== undefined

  const pProjected = hasPreview ? previewProtein : currentProtein
  const cProjected = hasPreview ? previewCarbs : currentCarbs
  const fProjected = hasPreview ? previewFats : currentFats

  const pSeg = segmentEnds(0, pPct, currentProtein, pProjected, pDenom)
  const cSeg = segmentEnds(pPct, cPct, currentCarbs, cProjected, cDenom)
  const fSeg = segmentEnds(pPct + cPct, fPct, currentFats, fProjected, fDenom)

  const showBlink =
    hasPreview &&
    (Math.abs(pSeg.blinkEnd - pSeg.blinkStart) > 0.05 ||
      Math.abs(cSeg.blinkEnd - cSeg.blinkStart) > 0.05 ||
      Math.abs(fSeg.blinkEnd - fSeg.blinkStart) > 0.05)

  const fillArcs = [
    { key: 'protein', color: 'var(--pColor)', start: 0, end: pSeg.fillEnd },
    { key: 'carbs', color: 'var(--cColor)', start: pPct, end: cSeg.fillEnd },
    {
      key: 'fats',
      color: 'var(--fColor)',
      start: pPct + cPct,
      end: fSeg.fillEnd,
    },
  ]

  type CSSVars = CSSProperties & Record<string, string | number>
  const donutStyle: CSSVars = {
    '--size': `${DONUT_SIZE}px`,
    '--thickness': `${DONUT_THICKNESS}px`,
    '--p': `${pPct}%`,
    '--c': `${cPct}%`,
    '--f': `${fPct}%`,
    '--pBlinkStart': `${pSeg.blinkStart}%`,
    '--pBlinkEnd': `${pSeg.blinkEnd}%`,
    '--cBlinkStart': `${cSeg.blinkStart}%`,
    '--cBlinkEnd': `${cSeg.blinkEnd}%`,
    '--fBlinkStart': `${fSeg.blinkStart}%`,
    '--fBlinkEnd': `${fSeg.blinkEnd}%`,
    '--pColor': proteinColor,
    '--cColor': carbsColor,
    '--fColor': fatsColor,
  }

  const centerCurrent =
    currentCalories ??
    calculateProteinCalories(currentProtein) +
      calculateCarbCalories(currentCarbs) +
      calculateFatCalories(currentFats)

  const centerGoal = goalCalories ?? total
  const roundedDelta = calorieDelta !== undefined ? Math.round(calorieDelta) : 0
  const showDelta = showProgress && roundedDelta !== 0
  const deltaLabel = roundedDelta > 0 ? `+${roundedDelta}` : `${roundedDelta}`

  return (
    <div
      className={`donut${showProgress ? ' show-progress' : ''}${
        showBlink ? ' show-preview-blink' : ''
      }`}
      style={donutStyle}
    >
      {showProgress && (
        <>
          <div
            className='donut-pale'
            aria-hidden
          />
          <svg
            className='donut-fill'
            viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`}
            aria-hidden
          >
            {fillArcs.map((arc) => {
              const length = Math.max(0, arc.end - arc.start)
              if (length < 0.08) return null
              return (
                <circle
                  key={arc.key}
                  cx={DONUT_CENTER}
                  cy={DONUT_CENTER}
                  r={RING_RADIUS}
                  fill='none'
                  stroke={arc.color}
                  strokeWidth={RING_WIDTH}
                  strokeLinecap={length >= 99.9 ? 'butt' : 'round'}
                  pathLength={100}
                  strokeDasharray={`${length} ${100 - length}`}
                  strokeDashoffset={-arc.start}
                  transform={`rotate(-90 ${DONUT_CENTER} ${DONUT_CENTER})`}
                />
              )
            })}
          </svg>
          {showBlink && (
            <div
              className='donut-blink'
              aria-hidden
            />
          )}
        </>
      )}
      <div
        className={`donut-inner ${prefs.isDarkMode ? 'dark-mode' : ''} ${
          prefs.favoriteColor
        }`}
      >
        <div className='totals'>
          {showProgress ? (
            <>
              <div className='value-row'>
                <div className='value'>
                  {formatNumberWithCommas(+centerCurrent.toFixed(0))}
                </div>
                {showDelta && (
                  <div
                    className={`calorie-delta ${
                      roundedDelta > 0 ? 'positive' : 'negative'
                    } ${prefs.isDarkMode ? 'dark-mode' : ''}`}
                  >
                    {deltaLabel}
                  </div>
                )}
              </div>
              <div className='after-text bold-header'>
                {t('macros.outOf')}{' '}
                {formatNumberWithCommas(+centerGoal.toFixed(0))}
              </div>
            </>
          ) : (
            <>
              <div className='value'>
                {formatNumberWithCommas(+total.toFixed(0))}
              </div>
              <div className='label'>{t('macros.kcal')}</div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

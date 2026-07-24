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
}

const proteinColor = 'var(--macro-protein)'
const carbsColor = 'var(--macro-carbs)'
const fatsColor = 'var(--macro-fats)'

function clampProgress(current: number, goal: number) {
  if (!goal || goal <= 0) return 0
  return Math.min(1, Math.max(0, current / goal))
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

  const pProgress = clampProgress(currentProtein, protein)
  const cProgress = clampProgress(currentCarbs, carbs)
  const fProgress = clampProgress(currentFats, fats)

  const pFill = pPct * pProgress
  const cFillEnd = pPct + cPct * cProgress
  const fFillEnd = pPct + cPct + fPct * fProgress

  type CSSVars = CSSProperties & Record<string, string | number>
  const donutStyle: CSSVars = {
    '--p': `${pPct}%`,
    '--c': `${cPct}%`,
    '--f': `${fPct}%`,
    '--pFill': `${pFill}%`,
    '--cFillEnd': `${cFillEnd}%`,
    '--fFillEnd': `${fFillEnd}%`,
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

  return (
    <div
      className={`donut${showProgress ? ' show-progress' : ''}`}
      style={donutStyle}
    >
      {showProgress && (
        <>
          <div className='donut-pale' aria-hidden />
          <div className='donut-fill' aria-hidden />
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
              <div className='value'>
                {formatNumberWithCommas(+centerCurrent.toFixed(0))}
              </div>
              <div className='after-text bold-header'>
                {t('macros.outOf')}{' '}
                {formatNumberWithCommas(+centerGoal.toFixed(0))}
              </div>
            </>
          ) : (
            <>
              <div className='value'>{total.toFixed(0)}</div>
              <div className='label'>{t('macros.kcal')}</div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

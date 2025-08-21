import React, { CSSProperties } from 'react'
import {
  calculateCarbCalories,
  calculateFatCalories,
  calculateProteinCalories,
  roundToNearest50,
} from '../../services/macros/macros.service'
import { RootState } from '../../store/store'
import { useSelector } from 'react-redux'

interface MacrosDonutProps {
  protein: number
  carbs: number
  fats: number
}

const proteinColor = 'var(--macro-protein)'
const carbsColor = 'var(--macro-carbs)'
const fatsColor = 'var(--macro-fats)'

export function MacrosDonut({ protein, carbs, fats }: MacrosDonutProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const proteinCalories = calculateProteinCalories(protein)
  const carbsCalories = calculateCarbCalories(carbs)
  const fatsCalories = calculateFatCalories(fats)

  const total = Math.max(proteinCalories + carbsCalories + fatsCalories, 0.0001)
  const pPct = (proteinCalories / total) * 100
  const cPct = (carbsCalories / total) * 100
  const fPct = (fatsCalories / total) * 100

  type CSSVars = CSSProperties & Record<string, string | number>
  const donutStyle: CSSVars = {
    '--p': `${pPct}%`,
    '--c': `${cPct}%`,
    '--f': `${fPct}%`,
    '--pColor': proteinColor,
    '--cColor': carbsColor,
    '--fColor': fatsColor,
  }

  return (
    <div className='donut' style={donutStyle}>
      <div className={`donut-inner ${prefs.isDarkMode ? 'dark-mode' : ''}`}>
        <div className='totals'>
          <div className='value'>{roundToNearest50(total)}</div>
          <div className='label'>kcal</div>
        </div>
      </div>
    </div>
  )
}

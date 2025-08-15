import { Card, Typography } from '@mui/material'
import type { CSSProperties } from 'react'
import { Macros } from '../Macros/Macros'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'

interface MacrosDistributionProps {
  protein: number
  carbs: number
  fats: number
}

const proteinColor = 'var(--macro-protein)'
const carbsColor = 'var(--macro-carbs)'
const fatsColor = 'var(--macro-fats)'

export function MacrosDistribution({
  protein,
  carbs,
  fats,
}: MacrosDistributionProps) {
  const total = Math.max(protein + carbs + fats, 0.0001)
  const pPct = (protein / total) * 100
  const cPct = (carbs / total) * 100
  const fPct = (fats / total) * 100

  type CSSVars = CSSProperties & Record<string, string | number>
  const donutStyle: CSSVars = {
    '--p': `${pPct}%`,
    '--c': `${cPct}%`,
    '--f': `${fPct}%`,
    '--pColor': proteinColor,
    '--cColor': carbsColor,
    '--fColor': fatsColor,
  }

  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  return (
    <Card
      className={`card macros-distribution ${
        prefs.isDarkMode ? 'dark-mode' : ''
      }`}
    >
      <Typography variant='h6'>Distribution</Typography>

      <div className='donut' style={donutStyle}>
        <div className={`donut-inner ${prefs.isDarkMode ? 'dark-mode' : ''}`}>
          <div className='totals'>
            <div className='value'>{Math.round(total)}g</div>
            <div className='label'>total</div>
          </div>
        </div>
      </div>
      <Macros protein={protein} carbs={carbs} fats={fats} />
    </Card>
  )
}

import { useState } from 'react'
import { Box, Card, Typography } from '@mui/material'
import type { CSSProperties } from 'react'
import { Macros } from '../Macros/Macros'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { EditIcon } from '../EditIcon/EditIcon'
import { SlideDialog } from '../SlideDialog/SlideDialog'

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

  const [open, setOpen] = useState(false)
  const onClose = () => {
    setOpen(false)
  }

  const edit = () => {
    setOpen(true)
  }

  return (
    <>
      <Card
        className={`card macros-distribution ${
          prefs.isDarkMode ? 'dark-mode' : ''
        }`}
      >
        <Typography variant='h6'>Distribution</Typography>
        <EditIcon onClick={edit} />
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
      <SlideDialog
        open={open}
        onClose={onClose}
        component={<EditComponent />}
      />
    </>
  )
}

import Slider from 'rc-slider'

function EditComponent() {
  const [protein, setProtein] = useState(30)
  const [carbs, setCarbs] = useState(40)
  const [fat, setFat] = useState(30)

  const macros = [
    {
      name: 'Protein',
      value: protein,
      onChange: (value: number) => handleChange('protein', value),
      color: proteinColor,
    },
    {
      name: 'Carbs',
      value: carbs,
      onChange: (value: number) => handleChange('carbs', value),
      color: carbsColor,
    },
    {
      name: 'Fat',
      value: fat,
      onChange: (value: number) => handleChange('fat', value),
      color: fatsColor,
    },
  ]

  const handleChange = (macro: 'protein' | 'carbs' | 'fat', value: number) => {
    // Clamp between 0–100
    let p = protein,
      c = carbs,
      f = fat

    switch (macro) {
      case 'protein':
        p = value
        break
      case 'carbs':
        c = value
        break
      case 'fat':
        f = value
        break
      default:
        break
    }

    // Normalize so total = 100
    const total = p + c + f

    if (total !== 100) {
      const factor = 100 / total
      p = Math.round(p * factor)
      c = Math.round(c * factor)
      f = Math.round(f * factor)
    }

    setProtein(p)
    setCarbs(c)
    setFat(f)
  }

  return (
    <Box>
      <div className='edit-macros-container'>
        {macros.map((macro) => (
          <div
            className='macro-container'
            key={`percantage-edit-${macro.name}`}
          >
            <div className='macro-title'>
              <Typography variant='h6'>{macro.name}</Typography>
              <Typography variant='body1'>{macro.value}%</Typography>
              <Typography variant='body1'>{macro.value + 400} kcal</Typography>
            </div>
            <Slider
              value={macro.value}
              onChange={(v) => macro.onChange(v as number)}
              max={80}
              min={10}
              step={2}
              handleStyle={{
                // borderColor: '#000',
                // backgroundColor: '#fff',
                width: '20px',
                height: '20px',
                padding: '0px',
                // marginBottom: '0px',
                marginTop: '-8px',
                // marginLeft: '0px',
                // marginRight: '0px',
              }}
              // railStyle={{ backgroundColor: '#eee' }}
              trackStyle={{ backgroundColor: macro.color }}
            />
          </div>
        ))}
      </div>
    </Box>
  )
}

import { useMemo, useState } from 'react'
import { Card, Divider, Typography } from '@mui/material'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { CustomInput } from '../../CustomMui/CustomInput/CustomInput'
import { CustomToggle } from '../../CustomMui/CustomToggle/CustomToggle'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'
import type { ToggleOption } from '../../CustomMui/CustomToggle/CustomToggle'
import { bmrService, type Gender } from '../../services/bmr/bmr.service'

interface BmrFormState {
  ageYears: string
  gender: Gender
  heightCm: string
  weightKg: string
}

const genderOptions: ToggleOption[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
]

export function BmrCard() {
  const prefs = useSelector(
    (storeState: RootState) => storeState.systemModule.prefs
  )

  const [form, setForm] = useState<BmrFormState>({
    ageYears: '',
    gender: 'male',
    heightCm: '',
    weightKg: '',
  })

  const bmr = useMemo(() => {
    const age = Number(form.ageYears)
    const height = Number(form.heightCm)
    const weight = Number(form.weightKg)
    return bmrService.calculate({
      ageYears: Number.isFinite(age) ? age : 0,
      gender: form.gender,
      heightCm: Number.isFinite(height) ? height : 0,
      weightKg: Number.isFinite(weight) ? weight : 0,
    })
  }, [form])

  function onChange<K extends keyof BmrFormState>(
    key: K,
    value: BmrFormState[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function onReset() {
    setForm({ ageYears: '', gender: 'male', heightCm: '', weightKg: '' })
  }

  return (
    <Card
      variant='outlined'
      className={`card bmr-card ${prefs.isDarkMode ? 'dark-mode' : ''}`}
    >
      <Typography variant='h6'>BMR Calculator</Typography>

      <div className='bmr-form-grid'>
        <div className='form-row'>
          <Typography variant='body2'>Gender</Typography>
          <CustomToggle
            value={form.gender}
            options={genderOptions}
            onChange={(val) => onChange('gender', val as Gender)}
            className='gender-toggle'
          />
        </div>

        <div className='form-row'>
          <Typography variant='body2'>Age</Typography>
          <CustomInput
            value={form.ageYears}
            onChange={(val) => onChange('ageYears', val.replace(/[^0-9]/g, ''))}
            placeholder='Years'
            size='small'
          />
        </div>

        <div className='form-row'>
          <Typography variant='body2'>Height</Typography>
          <CustomInput
            value={form.heightCm}
            onChange={(val) =>
              onChange('heightCm', val.replace(/[^0-9.]/g, ''))
            }
            placeholder='cm'
            size='small'
          />
        </div>

        <div className='form-row'>
          <Typography variant='body2'>Weight</Typography>
          <CustomInput
            value={form.weightKg}
            onChange={(val) =>
              onChange('weightKg', val.replace(/[^0-9.]/g, ''))
            }
            placeholder='kg'
            size='small'
          />
        </div>
      </div>

      <Divider className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`} />

      <div className='bmr-result-row'>
        <Typography variant='body1'>BMR</Typography>
        <Typography variant='h5' className='bmr-value'>
          {bmr ? `${bmr} kcal/day` : '--'}
        </Typography>
      </div>

      <CustomButton text='Reset' onClick={onReset} fullWidth />
    </Card>
  )
}

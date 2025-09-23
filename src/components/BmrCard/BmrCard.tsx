import { useMemo, useState } from 'react'
import { Divider, Typography } from '@mui/material'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { CustomToggle } from '../../CustomMui/CustomToggle/CustomToggle'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'
import type { ToggleOption } from '../../CustomMui/CustomToggle/CustomToggle'
import {
  bmrService,
  type Gender,
  type ActivityLevel,
} from '../../services/bmr/bmr.service'
import { BmrFormState } from '../../types/bmrForm/BmrForm'
import { CustomSelect } from '../../CustomMui/CustomSelect/CustomSelect'
import { getArrayOfNumbers } from '../../services/util.service'

import MaleIcon from '@mui/icons-material/Male'
import FemaleIcon from '@mui/icons-material/Female'

const genderOptions: ToggleOption[] = [
  { value: 'male', label: 'Male', icon: <MaleIcon /> },
  { value: 'female', label: 'Female', icon: <FemaleIcon /> },
]

const activityOptions: ToggleOption[] = [
  { value: 'bmr', label: 'BMR' },
  { value: 'sedentary', label: 'None' },
  { value: 'light', label: '1-3 / wk' },
  { value: 'moderate', label: '4-5 / wk' },
  { value: 'daily', label: 'Daily' },
  //   { value: 'very_intense', label: 'Intense job' },
]

interface Options {
  label: string
  values: ToggleOption[] | string[]
  onChange: (val: string) => void
  type: 'toggle' | 'select'
  key: keyof BmrFormState
  extra?: string
  className?: string
}

export function BmrCard() {
  const prefs = useSelector(
    (storeState: RootState) => storeState.systemModule.prefs
  )

  const [form, setForm] = useState<BmrFormState>(
    bmrService.getDefaultFormState()
  )

  const bmr = useMemo(() => {
    const age = +form.ageYears
    const height = +form.heightCm
    const weight = +form.weightKg
    return bmrService.calculate({
      ageYears: age,
      gender: form.gender,
      heightCm: height,
      weightKg: weight,
    })
  }, [form])

  //   const activityBuffer = useMemo(() => {
  //     return bmrService.calculateActivityBuffer(bmr, form.activity)
  //   }, [bmr, form.activity])

  const tdee = useMemo(() => {
    return bmrService.calculateTDEE(bmr, form.activity)
  }, [bmr, form.activity])

  const options: Options[] = [
    {
      label: 'Gender',
      values: genderOptions,
      onChange: (val: string) => onChange('gender', val as Gender),
      type: 'toggle',
      className: 'full-width',

      key: 'gender',
    },
    {
      label: 'Age',
      onChange: (val: string) => onChange('ageYears', val),
      values: getArrayOfNumbers(1, 100, true) as string[],
      type: 'select',
      key: 'ageYears',
      className: 'first-column',
    },
    {
      label: 'Height',
      onChange: (val: string) => onChange('heightCm', val),
      values: getArrayOfNumbers(100, 250, true) as string[],
      type: 'select',
      key: 'heightCm',
      extra: 'cm',
      className: 'second-column',
    },
    {
      label: 'Weight',
      onChange: (val: string) => onChange('weightKg', val),
      values: getArrayOfNumbers(30, 250, true) as string[],
      type: 'select',
      key: 'weightKg',
      extra: 'kg',
      className: 'full-width',
    },
    {
      label: 'Activity',
      values: activityOptions,
      onChange: (val: string) => onChange('activity', val as ActivityLevel),
      type: 'toggle',
      key: 'activity',
      className: 'full-width',
    },
  ]

  function onChange<K extends keyof BmrFormState>(
    key: K,
    value: BmrFormState[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function onReset() {
    setForm(bmrService.getDefaultFormState())
  }

  return (
    <div
      //   variant='outlined'
      className={`bmr-card ${prefs.isDarkMode ? 'dark-mode' : ''}`}
    >
      {/* <Typography variant='h6'>BMR Calculator</Typography> */}

      <div className='bmr-form-container'>
        {options.map((option) => {
          if (option.type === 'select')
            return (
              <div
                className={`select-container ${option.className}`}
                key={`${option.key}-${option.label}`}
              >
                <CustomSelect
                  label={option.label}
                  values={option.values as string[]}
                  value={form[option.key as keyof BmrFormState]}
                  onChange={(val) =>
                    onChange(option.key as keyof BmrFormState, val)
                  }
                  extra={option.extra}
                />
              </div>
            )

          if (option.type === 'toggle')
            return (
              <div
                className={`toggle-container ${option.className}`}
                key={`${option.key}-${option.label}`}
              >
                <Typography variant='body1'>{option.label}</Typography>
                <CustomToggle
                  value={form[option.key as keyof BmrFormState]}
                  options={option.values as ToggleOption[]}
                  onChange={(val) =>
                    onChange(option.key as keyof BmrFormState, val)
                  }
                />
              </div>
            )
        })}
      </div>

      <Divider className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`} />

      <div className='bmr-result-grid'>
        <div className='bmr-result-row'>
          <Typography variant='body1'>BMR</Typography>
          <Typography variant='h6' className='bmr-value'>
            {bmr ? `${bmr} kcal` : '--'}
          </Typography>
        </div>
        {/* <div className='bmr-result-row'>
          <Typography variant='body1'>Activity buffer</Typography>
          <Typography variant='h6' className='bmr-value'>
            {bmr ? `+${activityBuffer} kcal` : '--'}
          </Typography>
        </div> */}
        <div className='bmr-result-row total'>
          <Typography variant='body1'>Daily calories</Typography>
          <Typography variant='h5' className='bmr-value'>
            {bmr ? `${tdee} kcal` : '--'}
          </Typography>
        </div>
      </div>

      <CustomButton text='Reset' onClick={onReset} fullWidth />
    </div>
  )
}

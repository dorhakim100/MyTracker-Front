import Picker from 'react-mobile-picker'
import { getArrayOfNumbers } from '../../services/util.service'

import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { useState, useEffect } from 'react'
import { Typography } from '@mui/material'
import { Divider } from '@mui/material'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'

interface WeightEditProps {
  value: number
  onChange: (value: number) => void
  isHideSaveButton?: boolean
}

export function WeightEdit({
  value,
  onChange,
  isHideSaveButton = false,
}: WeightEditProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const [pickerWeight, setPickerWeight] = useState<{
    firstValue: number
    secondValue: number
  }>({
    firstValue: value,
    secondValue: 0,
  })

  useEffect(() => {
    const firstValue = Math.floor(value)
    let secondValue = Math.round((value - firstValue) * 10)

    if (firstValue === 0 && secondValue === 0) {
      secondValue = 0.1
    }

    setPickerWeight({
      firstValue: firstValue,
      secondValue: secondValue,
    })
  }, [value])

  const onUpdateClick = () => {
    onChange(pickerWeight.firstValue + pickerWeight.secondValue / 10)
  }

  useEffect(() => {
    if (!isHideSaveButton) return
    onChange(pickerWeight.firstValue + pickerWeight.secondValue / 10)
  }, [pickerWeight])

  return (
    <div className='picker-container'>
      <Picker
        value={pickerWeight}
        onChange={(next) =>
          setPickerWeight({
            firstValue: next.firstValue,
            secondValue: next.secondValue,
          })
        }
      >
        <Picker.Column name='firstValue'>
          {getArrayOfNumbers(30, 150).map((number) => (
            <Picker.Item key={number} value={number}>
              {({ selected }) => (
                <Typography
                  variant='h5'
                  className={`${selected ? 'selected' : ''}`}
                >
                  {number}
                </Typography>
              )}
            </Picker.Item>
          ))}
        </Picker.Column>
        <Divider
          orientation='vertical'
          flexItem
          className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`}
        />
        <Picker.Column name='secondValue'>
          {getArrayOfNumbers(0, 9).map((number) => (
            <Picker.Item key={number} value={number}>
              {({ selected }) => (
                <Typography
                  variant='h5'
                  className={`${selected ? 'selected' : ''}`}
                >
                  {number}
                </Typography>
              )}
            </Picker.Item>
          ))}
        </Picker.Column>
      </Picker>
      {!isHideSaveButton && (
        <CustomButton text='Save' onClick={onUpdateClick} />
      )}
    </div>
  )
}

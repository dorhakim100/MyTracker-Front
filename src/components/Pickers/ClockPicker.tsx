import Picker from 'react-mobile-picker'
import { EditItem } from '../../types/editItem/editItem'

import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'
import { Divider, Typography } from '@mui/material'

import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { useEffect, useState } from 'react'
import { getArrayOfNumbers } from '../../services/util.service'

export function ClockPicker({
  value,
  onChange,
  buttonsValues = [1, 50, 100],
  isAfterValue = true,
}: {
  value: number
  onChange: (key: keyof EditItem, value: number) => void
  buttonsValues?: number[]
  isAfterValue?: boolean
}) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const [pickerValue, setPickerValue] = useState<{
    numberOfServings: number
    afterValue: number
  }>({
    numberOfServings: value,
    afterValue: 0,
  })

  const values = getArrayOfNumbers(0, 150)
  const afterValues = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]

  const buttons = buttonsValues.map((value) => ({
    value,
    onClick: onButtonClick,
  }))

  function onButtonClick(value: number) {
    setPickerValue({
      ...pickerValue,
      numberOfServings: value,
    })
  }

  // Keep picker in sync with external value
  useEffect(() => {
    const firstValue = Math.floor(value)
    let secondValue = Math.round((value - firstValue) * 10) / 10
    if (firstValue === 0 && secondValue === 0) {
      secondValue = 0.1
    }

    setPickerValue((prev) => ({
      ...prev,
      numberOfServings: firstValue,
      afterValue: secondValue,
    }))
  }, [value])

  useEffect(() => {
    const newValue = pickerValue.numberOfServings + pickerValue.afterValue
    onChange('numberOfServings', newValue)
  }, [pickerValue])

  return (
    <div className="picker-container">
      <Picker
        value={pickerValue}
        onChange={(next) =>
          setPickerValue(
            next as unknown as { numberOfServings: number; afterValue: number }
          )
        }
      >
        <Picker.Column name="numberOfServings">
          {values.map((number) => (
            <Picker.Item key={number} value={number}>
              {({ selected }) => (
                <Typography
                  variant="h5"
                  className={`${selected ? 'selected' : ''}`}
                >
                  {number}
                </Typography>
              )}
            </Picker.Item>
          ))}
        </Picker.Column>
        {isAfterValue && (
          <>
            <Divider
              orientation="vertical"
              flexItem
              className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`}
            />
            <Picker.Column name="afterValue">
              {afterValues.map((number) => (
                <Picker.Item key={number} value={number}>
                  {({ selected }) => (
                    <Typography
                      variant="h5"
                      className={`${selected ? 'selected' : ''}`}
                    >
                      {number}
                    </Typography>
                  )}
                </Picker.Item>
              ))}
            </Picker.Column>
          </>
        )}
      </Picker>
      <div className="buttons-container">
        {buttons.map((button) => (
          <CustomButton
            key={`${button.value}-button`}
            onClick={() => onButtonClick(button.value)}
            className={`${prefs.favoriteColor}`}
            text={button.value.toString()}
            fullWidth
          />
        ))}
      </div>
    </div>
  )
}

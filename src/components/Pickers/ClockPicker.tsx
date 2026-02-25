import Picker from 'react-mobile-picker'
import { useTranslation } from 'react-i18next'
import { EditItem } from '../../types/editItem/editItem'

import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'
import { DialogActions, Divider, Typography } from '@mui/material'

import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { useEffect, useRef, useState } from 'react'
import { getArrayOfNumbers } from '../../services/util.service'

export function ClockPicker({
  value,
  onChange,
  buttonsValues = [1, 50, 100],
  isAfterValue = true,
  minValue = 0,
  maxValue = 150,
  isButtonsVisible = true,
  onClose,
  isSaveCancelButtonsVisible = true,
  valuesToDisplay,
  isRounded = true,
  sentOnCancel = () => {},
}: {
  value: number
  onChange: (key: keyof EditItem, value: number) => void
  buttonsValues?: number[]
  isAfterValue?: boolean
  minValue?: number
  maxValue?: number
  isButtonsVisible?: boolean
  onClose: () => void
  isSaveCancelButtonsVisible?: boolean
  valuesToDisplay?: number[]
  isRounded?: boolean
  sentOnCancel?: () => void
}) {
  const { t } = useTranslation()
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const originalValue = useRef(Math.floor(value))
  const originalAfterValue = useRef(
    Math.round((value - originalValue.current) * 10) / 10
  )

  const [pickerValue, setPickerValue] = useState<{
    numberOfServings: number
    afterValue: number
  }>({
    numberOfServings: value,
    afterValue: 0,
  })

  const values =
    valuesToDisplay || getArrayOfNumbers(isAfterValue ? 0 : minValue, maxValue)
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
    const firstValue = isRounded ? Math.floor(value) : value
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

  function onCancel() {
    setPickerValue({
      numberOfServings: originalValue.current,
      afterValue: originalAfterValue.current,
    })
    onClose()
    if (sentOnCancel) sentOnCancel()
  }

  function onSave() {
    onClose()
    const newValue = pickerValue.numberOfServings + pickerValue.afterValue
    onChange('numberOfServings', newValue)
  }

  return (
    <div className='picker-container'>
      <Picker
        value={pickerValue}
        // wheelMode='normal'
        onChange={(next) =>
          setPickerValue(
            next as unknown as { numberOfServings: number; afterValue: number }
          )
        }
        wheelMode='normal'
        className='clock-picker'
      >
        <Picker.Column name='numberOfServings'>
          {values.map((number) => (
            <Picker.Item
              key={number}
              value={number}
            >
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
        {isAfterValue && (
          <>
            <Divider
              orientation='vertical'
              flexItem
              className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`}
            />
            <Picker.Column name='afterValue'>
              {afterValues.map((number) => (
                <Picker.Item
                  key={number}
                  value={number}
                >
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
          </>
        )}
      </Picker>
      {isButtonsVisible && (
        <div className='buttons-container'>
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
      )}
      {isSaveCancelButtonsVisible && (
        <DialogActions className='save-cancel-container'>
          <CustomButton
            text={t('common.cancel')}
            onClick={onCancel}
            className='delete-account-button'
            fullWidth
          />
          <CustomButton
            text={t('common.save')}
            onClick={onSave}
            className={`${prefs.favoriteColor} save-button`}
            fullWidth
          />
        </DialogActions>
      )}
    </div>
  )
}

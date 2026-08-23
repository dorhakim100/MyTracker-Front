import { useTranslation } from 'react-i18next'
import { EditItem } from '../../types/editItem/editItem'

import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'
import { DialogActions, Divider } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'

import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { getArrayOfNumbers } from '../../services/util.service'
import { useDragHaptics } from '../../hooks/useDragHaptics'
import {
  CLOCK_ITEM_HEIGHT,
  CLOCK_PICKER_HEIGHT,
  ClockPickerColumn as WheelColumn,
} from './ClockPickerColumn'

const AFTER_VALUES = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]

export type ClockPickerValues = Record<string, number>

export type ClockPickerColumnConfig = {
  name: string
  values: number[]
  label?: ReactNode | ((value: number) => ReactNode)
  format?: (value: number) => string
}

export type ClockPickerColumn = ClockPickerColumnConfig

export function ClockPicker({
  value = 0,
  onChange,
  buttonsValues = [1, 50, 100],
  incrementButtons,
  incrementColumn,
  isAfterValue = true,
  minValue = 0,
  maxValue = 150,
  isButtonsVisible = true,
  onClose = () => {},
  isSaveCancelButtonsVisible = true,
  valuesToDisplay,
  isRounded = true,
  sentOnCancel = () => {},
  columns,
  columnValues,
  onSaveValues,
  header,
  height = CLOCK_PICKER_HEIGHT,
  labelsClassName,
  className = '',
}: {
  value?: number
  onChange?: (key: keyof EditItem, value: number) => void
  buttonsValues?: number[]
  incrementButtons?: number[]
  incrementColumn?: string
  isAfterValue?: boolean
  minValue?: number
  maxValue?: number
  isButtonsVisible?: boolean
  onClose?: () => void
  isSaveCancelButtonsVisible?: boolean
  valuesToDisplay?: number[]
  isRounded?: boolean
  sentOnCancel?: () => void
  columns?: ClockPickerColumnConfig[]
  columnValues?: ClockPickerValues
  onSaveValues?: (values: ClockPickerValues) => void
  header?: ReactNode | ((values: ClockPickerValues) => ReactNode)
  height?: number
  labelsClassName?: string
  className?: string
}) {
  const { t } = useTranslation()
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const resolvedColumns = useMemo(
    () =>
      columns ||
      getConvenienceColumns({
        isAfterValue,
        minValue,
        maxValue,
        valuesToDisplay,
      }),
    [columns, isAfterValue, minValue, maxValue, valuesToDisplay]
  )

  const originalValue = useRef(Math.floor(value))
  const originalAfterValue = useRef(
    Math.round((value - originalValue.current) * 10) / 10
  )
  const originalColumnValues = useRef(
    columnValues || getConvenienceValues(value, isRounded, isAfterValue)
  )

  const [pickerValue, setPickerValue] = useState<ClockPickerValues>(
    columnValues || getConvenienceValues(value, isRounded, isAfterValue)
  )
  const [slideNonce, setSlideNonce] = useState(0)

  const hasLiveCommitted = useRef(false)
  const commitRef = useRef<(shouldClose: boolean) => void>(() => {})

  const hapticValue = resolvedColumns
    .map((column) => pickerValue[column.name])
    .join('|')
  useDragHaptics({
    itemHeight: CLOCK_ITEM_HEIGHT,
    value: hapticValue,
  })

  useEffect(() => {
    if (columns) return
    const next = getConvenienceValues(value, isRounded, isAfterValue)
    setPickerValue((prev) =>
      arePickerValuesEqual(prev, next) ? prev : next
    )
  }, [value, isRounded, isAfterValue, columns])

  useEffect(() => {
    if (isSaveCancelButtonsVisible) return
    if (!hasLiveCommitted.current) {
      hasLiveCommitted.current = true
      return
    }
    commitRef.current(false)
  }, [pickerValue, isSaveCancelButtonsVisible])

  function onColumnChange(name: string, nextValue: number) {
    setPickerValue((prev) => {
      const next = { ...prev, [name]: nextValue }
      if (
        !columns &&
        isAfterValue &&
        next.numberOfServings === 0 &&
        next.afterValue === 0
      ) {
        next.afterValue = 0.1
      }
      return next
    })
  }

  function onAbsoluteButtonClick(buttonValue: number) {
    const key = incrementColumn || resolvedColumns[0].name
    const column = resolvedColumns.find((item) => item.name === key)
    const nextValue = column
      ? getNearestColumnValue(column.values, buttonValue)
      : buttonValue
    setPickerValue({
      ...pickerValue,
      [key]: nextValue,
    })
    setSlideNonce((nonce) => nonce + 1)
  }

  function onIncrementButtonClick(delta: number) {
    const key = incrementColumn || resolvedColumns[0].name
    const column = resolvedColumns.find((item) => item.name === key)
    if (!column) return

    const current = pickerValue[key]
    const nearest = getNearestColumnValue(column.values, current + delta)
    setPickerValue({
      ...pickerValue,
      [key]: nearest,
    })
    setSlideNonce((nonce) => nonce + 1)
  }

  function getCombinedValue() {
    if (!isAfterValue) return pickerValue.numberOfServings
    return pickerValue.numberOfServings + (pickerValue.afterValue || 0)
  }

  function commit(shouldClose: boolean) {
    if (onSaveValues) {
      onSaveValues(pickerValue)
    } else {
      onChange?.('numberOfServings', getCombinedValue())
    }
    if (shouldClose) onClose()
  }
  commitRef.current = commit

  function onCancel() {
    setPickerValue(
      columns
        ? originalColumnValues.current
        : {
            numberOfServings: originalValue.current,
            afterValue: originalAfterValue.current,
          }
    )
    onClose()
    sentOnCancel()
  }

  function onSave() {
    commit(true)
  }

  const showAbsoluteButtons =
    isButtonsVisible && buttonsValues.length > 0 && !incrementButtons?.length
  const showIncrementButtons =
    isButtonsVisible && !!incrementButtons?.length
  const showLabels = resolvedColumns.some((column) => column.label)

  return (
    <div className={`picker-container ${className}`}>
      {header && (
        <div className='clock-picker-header'>
          {typeof header === 'function' ? header(pickerValue) : header}
        </div>
      )}
      <div
        className={`clock-picker${
          resolvedColumns.length > 2 ? ' clock-picker-multi' : ''
        }`}
        style={{ height }}
      >
        {resolvedColumns.flatMap((column, index) => {
          const columnNode = (
            <WheelColumn
              key={column.name}
              name={column.name}
              values={column.values}
              value={pickerValue[column.name]}
              format={column.format}
              height={height}
              slideNonce={slideNonce}
              onChange={(nextValue) => onColumnChange(column.name, nextValue)}
            />
          )

          if (index === 0) {
            return [columnNode]
          }

          return [
            <Divider
              key={`${column.name}-divider`}
              orientation='vertical'
              flexItem
              className='divider'
            />,
            columnNode,
          ]
        })}
        <div
          className='clock-picker-highlight'
          style={{ height: CLOCK_ITEM_HEIGHT }}
        >
          <span className='clock-picker-highlight-line top' />
          <span className='clock-picker-highlight-line bottom' />
        </div>
      </div>
      {showLabels && (
        <div className={labelsClassName || 'clock-picker-labels'}>
          {resolvedColumns.map((column) => (
            <div
              key={`${column.name}-label`}
              className='clock-picker-label'
            >
              {typeof column.label === 'function'
                ? column.label(pickerValue[column.name])
                : column.label}
            </div>
          ))}
        </div>
      )}
      {showAbsoluteButtons && (
        <div className='buttons-container'>
          {buttonsValues.map((buttonValue) => (
            <CustomButton
              key={`${buttonValue}-button`}
              onClick={() => onAbsoluteButtonClick(buttonValue)}
              className={`${prefs.favoriteColor}`}
              text={buttonValue.toString()}
              fullWidth
              shouldVibrate={false}
            />
          ))}
        </div>
      )}
      {showIncrementButtons && incrementButtons && (
        <div className='buttons-container'>
          {incrementButtons.map((delta) => (
            <CustomButton
              key={`${delta}-increment`}
              onClick={() => onIncrementButtonClick(delta)}
              className={`${prefs.favoriteColor}`}
              text={Math.abs(delta).toString()}
              icon={delta < 0 ? <RemoveIcon /> : <AddIcon />}
              fullWidth
              shouldVibrate={false}
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
            shouldVibrate={false}
          />
          <CustomButton
            text={t('common.save')}
            onClick={onSave}
            className={`${prefs.favoriteColor} save-button`}
            fullWidth
            shouldVibrate={false}
          />
        </DialogActions>
      )}
    </div>
  )
}

function getConvenienceColumns({
  isAfterValue,
  minValue,
  maxValue,
  valuesToDisplay,
}: {
  isAfterValue: boolean
  minValue: number
  maxValue: number
  valuesToDisplay?: number[]
}): ClockPickerColumnConfig[] {
  const values =
    valuesToDisplay ||
    (getArrayOfNumbers(isAfterValue ? 0 : minValue, maxValue) as number[])

  const columns: ClockPickerColumnConfig[] = [
    {
      name: 'numberOfServings',
      values,
    },
  ]

  if (isAfterValue) {
    columns.push({
      name: 'afterValue',
      values: AFTER_VALUES,
      format: getSecondValueString,
    })
  }

  return columns
}

function getConvenienceValues(
  value: number,
  isRounded: boolean,
  isAfterValue: boolean
): ClockPickerValues {
  const firstValue = isRounded ? Math.floor(value) : value
  let secondValue = Math.round((value - firstValue) * 10) / 10
  if (firstValue === 0 && secondValue === 0) {
    secondValue = 0.1
  }

  return {
    numberOfServings: firstValue,
    afterValue: isAfterValue ? secondValue : 0,
  }
}

function getSecondValueString(value: number) {
  if (value === 0) return '.0'
  return `.${value.toString().split('.')[1]}`
}

function getNearestColumnValue(values: number[], target: number) {
  const min = values[0]
  const max = values[values.length - 1]
  const clamped = Math.min(Math.max(target, min), max)
  return values.reduce((best, item) =>
    Math.abs(item - clamped) < Math.abs(best - clamped) ? item : best
  )
}

function arePickerValuesEqual(a: ClockPickerValues, b: ClockPickerValues) {
  const keys = Object.keys(b)
  return keys.every((key) => a[key] === b[key])
}

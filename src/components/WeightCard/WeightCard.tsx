import { useEffect, useState } from 'react'

import { Card, Typography } from '@mui/material'
import { RootState } from '../../store/store'
import { useSelector } from 'react-redux'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'

export function WeightCard() {
  const prefs = useSelector(
    (storeState: RootState) => storeState.systemModule.prefs
  )

  //   const user = useSelector(
  //     (storeState: RootState) => storeState.userModule.user
  //   )

  const [open, setOpen] = useState(false)
  const [weightToAdd, setWeightToAdd] = useState(50.5)

  const onClose = () => {
    setOpen(false)
  }

  const onSave = (value: number) => {
    setWeightToAdd(value)
    onClose()
  }

  const onOpenModal = () => {
    setOpen(true)
  }

  return (
    <>
      <Card
        variant='outlined'
        className={`card weight-card ${prefs.isDarkMode ? 'dark-mode' : ''}`}
      >
        <Typography variant='h6'>Weight: {weightToAdd} kg</Typography>

        <CustomButton text='Update Weight' onClick={onOpenModal} />
      </Card>
      <SlideDialog
        open={open}
        onClose={onClose}
        component={<EditComponent value={weightToAdd} onChange={onSave} />}
        onSave={() => onSave(weightToAdd)}
        title='Update Weight'
      />
    </>
  )
}

import Picker from 'react-mobile-picker'
import { SlideDialog } from '../SlideDialog/SlideDialog'
import { getArrayOfNumbers } from '../../services/util.service'
interface EditComponentProps {
  value: number
  onChange: (value: number) => void
}

function EditComponent({ value, onChange }: EditComponentProps) {
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
  }, [])

  const onUpdateClick = () => {
    onChange(pickerWeight.firstValue + pickerWeight.secondValue / 10)
  }

  return (
    <div className='picker-container'>
      <Typography variant='h6'>
        {pickerWeight.firstValue}.{pickerWeight.secondValue} kg
      </Typography>
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
              {number}
            </Picker.Item>
          ))}
        </Picker.Column>
        <Picker.Column name='secondValue'>
          {getArrayOfNumbers(0, 9).map((number) => (
            <Picker.Item key={number} value={number}>
              {number}
            </Picker.Item>
          ))}
        </Picker.Column>
      </Picker>
      <CustomButton text='Save' onClick={onUpdateClick} />
    </div>
  )
}

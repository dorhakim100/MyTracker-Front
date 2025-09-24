import { useEffect, useMemo, useState } from 'react'

import { Card, Typography } from '@mui/material'
import { RootState } from '../../store/store'
import { useSelector } from 'react-redux'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'
import {
  optimisticUpdateUser,
  updateUser,
} from '../../store/actions/user.actions'
import { User } from '../../types/user/User'
import { showSuccessMsg, showErrorMsg } from '../../services/event-bus.service'
import { messages } from '../../assets/config/messages'

export function WeightCard() {
  const prefs = useSelector(
    (storeState: RootState) => storeState.systemModule.prefs
  )

  const user = useSelector(
    (storeState: RootState) => storeState.userModule.user
  )

  const [open, setOpen] = useState(false)
  const [weightToAdd, setWeightToAdd] = useState(50.5)

  const selectedDay = useSelector(
    (storeState: RootState) => storeState.userModule.selectedDay
  )

  const [selectedDate, setSelectedDate] = useState(
    getDateFromISO(new Date().toISOString())
  )

  const heDate = useMemo(() => {
    const date = new Date(selectedDate)
    return date.toLocaleDateString('he')
  }, [selectedDate])

  // const isToday = useMemo(() => {
  //   const lastLogTime = user?.weights[0].createdAt

  //   if (!lastLogTime) return false

  //   const lastLogIso = getDateFromISO(lastLogTime)

  //   const todayIso = getDateFromISO(new Date().toISOString())

  //   return lastLogIso === todayIso
  // }, [user?.weights])

  useEffect(() => {
    // if (selectedDay?.weight) {
    //   setWeightToAdd(selectedDay.weight.kg)
    // }

    const getDay = async () => {
      const today = await dayService.query({
        date: selectedDate,
        userId: user?._id,
      })
      console.log('today', today)
      // setWeightToAdd(today.weight.kg)
    }

    getDay()
  }, [selectedDate, user])

  const onClose = () => {
    setOpen(false)
  }

  const onSave = async (value: number) => {
    if (!user) return showErrorMsg(messages.error.updateWeight)
    setWeightToAdd(value)
    try {
      const weightToSave = {
        kg: value,
        userId: user?._id,
      }
      const userToUpdate = {
        ...user,
        weights: [weightToSave, ...user.weights],
      }
      optimisticUpdateUser(userToUpdate as User)
      const savedWeight = await weightService.save(weightToSave)
      userToUpdate.weights[0] = savedWeight
      await updateUser(userToUpdate as User)
      showSuccessMsg(messages.success.updateWeight)
    } catch (err) {
      console.log('err', err)
      showErrorMsg(messages.error.updateWeight)
    }
    onClose()
  }

  const onOpenModal = () => {
    setOpen(true)
  }

  const onChangeDate = (date: string) => {
    setSelectedDate(date)
  }

  return (
    <>
      <Card
        variant='outlined'
        className={`card weight-card ${prefs.isDarkMode ? 'dark-mode' : ''}`}
      >
        <CustomDatePicker
          value={selectedDay?.date}
          onChange={onChangeDate}
          className={prefs.favoriteColor}
        />
        {<Typography variant='body2'>{heDate}</Typography>}
        {
          <Typography variant='h6'>
            Weight: {selectedDay?.weight?.kg || user?.weights[0]?.kg || 0} kg
          </Typography>
        }

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
import { getArrayOfNumbers, getDateFromISO } from '../../services/util.service'
import { weightService } from '../../services/weight/weight.service'
import { dayService } from '../../services/day/day.service'
import { CustomDatePicker } from '../../CustomMui/CustomDatePicker/CustomDatePicker'

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

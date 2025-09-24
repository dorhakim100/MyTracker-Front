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
import { setSelectedDiaryDay } from '../../store/actions/user.actions'

const DEFAULT_WEIGHT = 60

export function WeightCard() {
  const prefs = useSelector(
    (storeState: RootState) => storeState.systemModule.prefs
  )

  const user = useSelector(
    (storeState: RootState) => storeState.userModule.user
  )

  const [open, setOpen] = useState(false)
  const [weightToAdd, setWeightToAdd] = useState(DEFAULT_WEIGHT)

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
    const getDay = async () => {
      const today = await dayService.query({
        date: selectedDate,
        userId: user?._id,
      })
      const loggedWeight = today.weight?.kg || DEFAULT_WEIGHT
      setWeightToAdd(loggedWeight)
      setSelectedDiaryDay(today)
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
      const dateToSave = new Date(selectedDate).setMilliseconds(0)

      const weightToSave = {
        kg: value,
        userId: user?._id,
        createdAt: dateToSave,
      }

      const newWeights = [...user.weights, weightToSave]
      newWeights.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
      const userToUpdate = {
        ...user,
        weights: newWeights,
      }
      optimisticUpdateUser(userToUpdate as User)
      const savedWeight = await weightService.save(weightToSave)

      const index = userToUpdate.weights.findIndex(
        (weight) => weight.createdAt === dateToSave
      )
      userToUpdate.weights[index] = savedWeight

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

  const renderWeight = () => {
    const weight = selectedDay?.weight?.kg

    return weight ? (
      <Typography variant='body1' className='weight-text'>
        {weight}
        <span className='weight-text-kg'>kg</span>
      </Typography>
    ) : (
      <Typography variant='body1' className='weight-text'>
        Not logged that day
      </Typography>
    )
  }

  return (
    <>
      <Card
        variant='outlined'
        className={`card weight-card ${prefs.isDarkMode ? 'dark-mode' : ''}`}
      >
        <div className='date-picker-container'>
          <CustomDatePicker
            value={selectedDay?.date}
            onChange={onChangeDate}
            className={`${prefs.favoriteColor}`}
          />
        </div>
        <Typography variant='body2' className='date-text'>
          Date: {heDate}
        </Typography>

        <div className='weight-container'>{renderWeight()}</div>

        <div className='update-weight-button-container'>
          <CustomButton
            text='Update Weight'
            onClick={onOpenModal}
            className={`${prefs.favoriteColor}`}
          />
        </div>
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

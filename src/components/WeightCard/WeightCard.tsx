import { useEffect, useMemo, useState } from 'react'

import { Card, Typography } from '@mui/material'
import { RootState } from '../../store/store'
import { useSelector } from 'react-redux'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'

import { showSuccessMsg, showErrorMsg } from '../../services/event-bus.service'
import { messages } from '../../assets/config/messages'
import {
  optimisticUpdateUser,
  setSelectedDiaryDay,
} from '../../store/actions/user.actions'
import { Weight } from '../../types/weight/Weight'

import scaleAnimation from '../../../public/scale.json'
import { SlideDialog } from '../SlideDialog/SlideDialog'
import { WeightEdit } from './WeightEdit'
import { dayService } from '../../services/day/day.service'
import { getDateFromISO } from '../../services/util.service'
import { weightService } from '../../services/weight/weight.service'
import { LoggedToday } from '../../types/loggedToday/LoggedToday'
import { CustomDatePicker } from '../../CustomMui/CustomDatePicker/CustomDatePicker'
import Lottie from 'lottie-react'

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
      const loggedWeight =
        today.weight?.kg || user?.lastWeight?.kg || DEFAULT_WEIGHT
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

      const weightToSave: Weight | Partial<Weight> = {
        kg: value,
        userId: user?._id,
        createdAt: dateToSave,
      }

      if (selectedDay?.weight?._id) {
        weightToSave._id = selectedDay.weight._id
      }

      const savedWeight = await weightService.save(weightToSave)

      const todayIso = getDateFromISO(new Date().toISOString())

      if (selectedDay?.date === todayIso) {
        optimisticUpdateUser({ ...user, lastWeight: savedWeight })
      }

      setSelectedDiaryDay({
        ...selectedDay,
        weight: savedWeight,
      } as LoggedToday)

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
        Haven't logged that day...
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
        <div className='animation-container'>
          <Lottie animationData={scaleAnimation} loop={true} />
        </div>
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
        component={<WeightEdit value={weightToAdd} onChange={onSave} />}
        onSave={() => onSave(weightToAdd)}
        title='Update Weight'
      />
    </>
  )
}

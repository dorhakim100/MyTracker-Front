import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Card, Typography } from '@mui/material'
import { RootState } from '../../store/store'
import { useSelector } from 'react-redux'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'

import { showSuccessMsg, showErrorMsg } from '../../services/event-bus.service'
import {
  optimisticUpdateUser,
  setSelectedDiaryDay,
} from '../../store/actions/user.actions'
import { Weight } from '../../types/weight/Weight'
import { WeightStatistics } from '../WeightStatistics/WeightStatistics'

import scaleAnimation from '../../../public/scale.json'
import { SlideDialog } from '../SlideDialog/SlideDialog'
import { WeightEdit } from './WeightEdit'
import { dayService } from '../../services/day/day.service'
import { getDateFromISO } from '../../services/util.service'
import { weightService } from '../../services/weight/weight.service'
import { LoggedToday } from '../../types/loggedToday/LoggedToday'
import { CustomDatePicker } from '../../CustomMui/CustomDatePicker/CustomDatePicker'
import Lottie from 'lottie-react'
import { healthService } from '../../services/health/health.service'
import TimelineIcon from '@mui/icons-material/Timeline'
import CustomSkeleton from '../../CustomMui/CustomSkeleton/CustomSkeleton'

const DEFAULT_WEIGHT = 60

export function WeightCard() {
  const { t } = useTranslation()
  const isNative = useSelector(
    (storeState: RootState) => storeState.systemModule.isNative
  )
  const prefs = useSelector(
    (storeState: RootState) => storeState.systemModule.prefs
  )

  const user = useSelector(
    (storeState: RootState) => storeState.userModule.user
  )

  const [open, setOpen] = useState(false)
  const [statisticsOpen, setStatisticsOpen] = useState(false)
  const [weightToAdd, setWeightToAdd] = useState(DEFAULT_WEIGHT)
  const [isLoadingWeight, setIsLoadingWeight] = useState(false)
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

  useEffect(() => {
    const getDay = async () => {
      try {
        setIsLoadingWeight(true)
        const today = await dayService.query({
          date: selectedDate,
          userId: user?._id,
        })
        const loggedWeight =
          today.weight?.kg || user?.lastWeight?.kg || DEFAULT_WEIGHT
        setWeightToAdd(loggedWeight)
        setSelectedDiaryDay(today)
      } finally {
        setIsLoadingWeight(false)
      }
    }

    getDay()
  }, [selectedDate, user])

  const onClose = () => {
    setOpen(false)
  }

  const onSave = async (value: number) => {
    if (!user) return showErrorMsg(t('messages.error.updateWeight'))
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
      const isToday = selectedDay?.date === todayIso

      if (savedWeight && isToday) {
        optimisticUpdateUser({ ...user, lastWeight: savedWeight })
      }

      if (savedWeight) {
        setSelectedDiaryDay({
          ...selectedDay,
          weight: { ...savedWeight },
        } as LoggedToday)
      }

      if (isNative && isToday) {
        await healthService.saveWeight(value)
      }

      showSuccessMsg(t('messages.success.updateWeight'))
    } catch {
      showErrorMsg(t('messages.error.updateWeight'))
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

    if (isLoadingWeight) {
      return (
        <CustomSkeleton
          variant='text'
          width={'100%'}
          height={50}
          isDarkMode={prefs.isDarkMode}
        />
      )
    }

    return weight ? (
      <Typography
        variant='body1'
        className='weight-text has-value'
      >
        {weight}
        <span className='weight-text-kg'>{t('weight.kg')}</span>
      </Typography>
    ) : (
      <Typography
        variant='body1'
        className='weight-text'
      >
        {t('weight.noWeightLogged')}
      </Typography>
    )
  }

  return (
    <>
      <Card
        variant='outlined'
        className={`card weight-card ${prefs.isDarkMode ? 'dark-mode' : ''} ${
          prefs.favoriteColor
        }`}
      >
        <div className='statistics-button-container'>
          <CustomButton
            borderIcon
            onClick={() => setStatisticsOpen(true)}
            className={`${prefs.favoriteColor} statistics-button`}
            icon={<TimelineIcon />}
            ariaLabel={t('weight.statistics')}
            isIcon
          />
        </div>
        <div className='date-picker-container'>
          <CustomDatePicker
            value={selectedDay?.date}
            onChange={onChangeDate}
            className={`${prefs.favoriteColor}`}
          />
        </div>

        <div className='weight-container'>
          {renderWeight()}
          <Typography
            variant='body2'
            className='date-text'
          >
            {t('date.date')}: {heDate}
          </Typography>
        </div>
        <div className='animation-container'>
          <Lottie
            animationData={scaleAnimation}
            loop={true}
          />
        </div>
        <div className='update-weight-button-container'>
          <CustomButton
            text={t('weight.updateWeight')}
            onClick={onOpenModal}
            className={`${prefs.favoriteColor}`}
          />
        </div>
      </Card>
      <SlideDialog
        open={open}
        onClose={onClose}
        component={
          <WeightEdit
            value={weightToAdd}
            onChange={onSave}
            onClose={onClose}
          />
        }
        title={t('weight.updateWeight')}
      />
      {user && (
        <SlideDialog
          open={statisticsOpen}
          onClose={() => setStatisticsOpen(false)}
          type='full'
          title={t('weight.statistics')}
          component={<WeightStatistics user={user} />}
        />
      )}
    </>
  )
}

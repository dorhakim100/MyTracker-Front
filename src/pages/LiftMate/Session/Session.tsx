import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store/store'

import { DayController } from '../../../components/DayController/DayController'
import { DAY_IN_MS } from '../../../assets/config/times'
import {
  handleSessionDayChange,
  setSelectedSessionDay,
} from '../../../store/actions/workout.action'
import { getDateFromISO } from '../../../services/util.service'
import { showErrorMsg } from '../../../services/event-bus.service'
import { messages } from '../../../assets/config/messages'

export function Session() {
  const sessionDay = useSelector(
    (state: RootState) => state.workoutModule.sessionDay
  )
  const user = useSelector((state: RootState) => state.userModule.user)

  const [selectedDay, setSelectedDay] = useState(new Date())
  const [selectedDayDate] = useState(new Date().toISOString())

  const [sessionFilter, setSessionFilter] = useState({
    userId: user?._id,
    date: selectedDayDate,
  })

  const [direction, setDirection] = useState(1)

  const isToday = useMemo(() => {
    const isToday =
      sessionFilter?.date === getDateFromISO(new Date().toISOString())

    return isToday
  }, [sessionDay?.date, sessionFilter])

  useEffect(() => {
    if (!user) return
    const updateSessionDay = async () => {
      try {
        const day = await handleSessionDayChange(sessionFilter.date, user)
        setSelectedSessionDay(day)
      } catch (err) {
        showErrorMsg(messages.error.getSessionDay)
      }
    }
    updateSessionDay()
  }, [user, sessionFilter])

  const onDayChange = (diff: number) => {
    const newDate = new Date(selectedDay.getTime() + diff * DAY_IN_MS)

    setDirection(diff)
    setSelectedDay(newDate)
    setSessionFilter({
      userId: user?._id,
      date: getDateFromISO(newDate?.toISOString()),
    })
  }

  const onDateChange = (date: string) => {
    setSelectedDay(new Date(date))
    setSessionFilter({
      userId: user?._id,
      date: date,
    })
  }
  // if (!sessionDay) return null
  return (
    <div className='page-container workout-container'>
      <DayController
        selectedDay={selectedDay}
        selectedDayDate={sessionFilter.date}
        isToday={isToday}
        onDayChange={onDayChange}
        onDateChange={onDateChange}
      />
    </div>
  )
}

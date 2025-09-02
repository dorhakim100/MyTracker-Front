import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'

import { TimesContainer } from '../../components/TimesContainer/TimesContainer'
import { StatsCarousel } from '../../components/StatsCarousel/StatsCarousel'
import { CurrMeal } from '../../components/CurrMeal/CurrMeal'
import {
  handleDiaryDayChange,
  setSelectedDiaryDay,
} from '../../store/actions/user.actions'
import { getDateFromISO } from '../../services/util.service'

const CHECK_INTERVAL = 1000 * 60 // minute

export function Dashboard() {
  const user = useSelector((state: RootState) => state.userModule.user)

  useEffect(() => {
    if (!user) return
    setSelectedDiaryDay(user.loggedToday)
  }, [user])

  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      const dateToCheck = getDateFromISO(new Date().toISOString())

      handleDiaryDayChange(dateToCheck, user)
    }, CHECK_INTERVAL)
    return () => clearInterval(interval)
  }, [user])

  return (
    <div className='page-container dashboard-container'>
      <TimesContainer />
      <StatsCarousel />
      <CurrMeal />
    </div>
  )
}

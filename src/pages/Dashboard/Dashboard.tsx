import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'

import { TimesContainer } from '../../components/TimesContainer/TimesContainer'
import { StatsCarousel } from '../../components/StatsCarousel/StatsCarousel'
import { CurrMeal } from '../../components/CurrMeal/CurrMeal'
import { setSelectedDiaryDay } from '../../store/actions/user.actions'

export function Dashboard() {
  const user = useSelector((state: RootState) => state.userModule.user)

  useEffect(() => {
    if (!user) return
    setSelectedDiaryDay(user.loggedToday)
  }, [user])

  return (
    <div className='page-container dashboard-container'>
      <TimesContainer />
      <StatsCarousel />
      <CurrMeal />
    </div>
  )
}

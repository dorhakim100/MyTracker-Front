import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store/store'

import { TimesContainer } from '../../../components/TimesContainer/TimesContainer'
import { StatsCarousel } from '../../../components/StatsCarousel/StatsCarousel'
import { CurrMeal } from '../../../components/CurrMeal/CurrMeal'
import { CaloriesProgress } from '../../../components/CaloriesProgress/CaloriesProgress'
import { MacrosDistribution } from '../../../components/MacrosDistribution/MacrosDistribution'
import { MacrosProgress } from '../../../components/MacrosProgress/MacrosProgress'
import {
  handleDiaryDayChange,
  setSelectedDiaryDay,
} from '../../../store/actions/user.actions'
import { getDateFromISO } from '../../../services/util.service'

const CHECK_INTERVAL = 1000 * 60 // minute

export function Dashboard() {
  const user = useSelector((state: RootState) => state.userModule.user)

  const [macros, setMacros] = useState({
    protein: { percentage: 0, gram: 0 },
    carbs: { percentage: 0, gram: 0 },
    fats: { percentage: 0, gram: 0 },
  })

  const [calories, setCalories] = useState(user?.loggedToday?.calories || 0)

  const statsCarouselItems = useMemo(() => {
    if (!user) return []

    return [
      <CaloriesProgress
        key="calories"
        percentageValue={calories / user.currGoal?.dailyCalories}
        current={calories}
        goal={user.currGoal?.dailyCalories}
      />,
      <MacrosProgress
        key="macros-progress"
        protein={macros.protein}
        carbs={macros.carbs}
        fats={macros.fats}
      />,
      <MacrosDistribution
        key="macros-distribution"
        protein={macros.protein.gram}
        carbs={macros.carbs.gram}
        fats={macros.fats.gram}
      />,
    ]
  }, [user, calories, macros])

  useEffect(() => {
    if (!user) return
    setSelectedDiaryDay(user.loggedToday)
  }, [user])

  useEffect(() => {
    if (!user) return

    const interval = setInterval(checkDiaryDayChange, CHECK_INTERVAL)
    return () => clearInterval(interval)
  }, [user])

  useEffect(() => {
    checkDiaryDayChange()
  }, [user])

  useEffect(() => {
    if (!user || !user?.loggedToday) return

    const protein = user?.loggedToday?.logs.reduce(
      (acc, log) => acc + log.macros.protein,
      0
    )
    const carbs = user?.loggedToday?.logs.reduce(
      (acc, log) => acc + log.macros.carbs,
      0
    )
    const fats = user?.loggedToday?.logs.reduce(
      (acc, log) => acc + log.macros.fat,
      0
    )
    const macrosToSet = {
      protein: {
        percentage: getPercentage(protein, user?.currGoal?.macros.protein),
        gram: user?.currGoal?.macros.protein,
      },
      carbs: {
        percentage: getPercentage(carbs, user?.currGoal?.macros.carbs),
        gram: user?.currGoal?.macros.carbs,
      },
      fats: {
        percentage: getPercentage(fats, user?.currGoal?.macros.fat),
        gram: user?.currGoal?.macros.fat,
      },
    }
    setMacros(macrosToSet)
  }, [user])

  useEffect(() => {
    const caloriesToSet = user?.loggedToday?.calories
    if (!caloriesToSet && caloriesToSet !== 0) return
    const newCalories = caloriesToSet
    setCalories(newCalories)
  }, [user?.loggedToday?.calories])

  function getPercentage(value: number, goal: number) {
    return (value / goal) * 100
  }

  function checkDiaryDayChange() {
    if (!user) return
    const dateToCheck = getDateFromISO(new Date().toISOString())
    handleDiaryDayChange(dateToCheck, user)
  }

  return (
    <div className="page-container dashboard-container">
      <TimesContainer />
      <StatsCarousel items={statsCarouselItems} showSkeleton={!user} />
      <CurrMeal />
    </div>
  )
}

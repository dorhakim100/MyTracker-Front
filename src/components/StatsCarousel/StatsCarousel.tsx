import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'

import 'swiper/css'
import 'swiper/css/pagination'

import { CaloriesProgress } from '../CaloriesProgress/CaloriesProgress'
import { MacrosDistribution } from '../MacrosDistribution/MacrosDistribution'
import { MacrosProgress } from '../MacrosProgress/MacrosProgress'
import { RootState } from '../../store/store'
import { Card } from '@mui/material'
import { CustomSkeleton } from '../../CustomMui/CustomSkeleton/CustomSkeleton'

export function StatsCarousel() {
  const user = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.user
  )

  const [macros, setMacros] = useState({
    protein: { percentage: 0, gram: 0 },
    carbs: { percentage: 0, gram: 0 },
    fats: { percentage: 0, gram: 0 },
  })

  const [calories, setCalories] = useState(user?.loggedToday?.calories || 0)

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

  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  if (!user)
    return (
      <Card
        className={`card calories-progress skeleton ${
          prefs.isDarkMode ? 'dark-mode' : ''
        }`}
      >
        <CustomSkeleton
          variant='text'
          width='50%'
          height={30}
          className='title'
          isDarkMode={prefs.isDarkMode}
        />
        <CustomSkeleton
          variant='circular'
          width='150px'
          height='150px'
          className='circular-progress'
          isDarkMode={prefs.isDarkMode}
        />

        <CustomSkeleton
          variant='rectangular'
          width='150px'
          height='40px'
          className='goal-container'
          isDarkMode={prefs.isDarkMode}
        />
      </Card>
    )

  if (user)
    return (
      <Swiper
        spaceBetween={30}
        pagination={{ clickable: true }}
        modules={[Pagination]}
        className='stats-carousel'
      >
        <SwiperSlide>
          <CaloriesProgress
            percentageValue={calories / user.currGoal?.dailyCalories}
            // percentageValue={calories / 2500}
            current={calories}
            goal={user.currGoal?.dailyCalories}
            // goal={2500}
          />
        </SwiperSlide>

        <SwiperSlide>
          <MacrosProgress
            protein={macros.protein}
            carbs={macros.carbs}
            fats={macros.fats}
          />
        </SwiperSlide>

        <SwiperSlide>
          <MacrosDistribution
            protein={macros.protein.gram}
            carbs={macros.carbs.gram}
            fats={macros.fats.gram}
          />
        </SwiperSlide>
      </Swiper>
    )
}

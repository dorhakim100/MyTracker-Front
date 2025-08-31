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
    if (!user || !user?.loggedToday?.logs?.length) return

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
    console.log('changed')
    console.log(user)

    const caloriesToSet = user?.loggedToday?.calories
    if (!caloriesToSet && caloriesToSet !== 0) return
    const newCalories = caloriesToSet
    setCalories(newCalories)
  }, [user?.loggedToday?.calories])

  function getPercentage(value: number, goal: number) {
    return (value / goal) * 100
  }

  if (!user) return null

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
            percentageValue={calories / user.currGoal.dailyCalories}
            current={calories}
            goal={user.currGoal?.dailyCalories}
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

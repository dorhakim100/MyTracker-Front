import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'

import 'swiper/css'
import 'swiper/css/pagination'

import { CaloriesProgress } from '../CaloriesProgress/CaloriesProgress'
import { MacrosDistribution } from '../MacrosDistribution/MacrosDistribution'
import { MacrosProgress } from '../MacrosProgress/MacrosProgress'
import { getRandomIntInclusive } from '../../services/util.service'
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

  function _getRandomPercentage() {
    return getRandomIntInclusive(0, 100)
  }

  useEffect(() => {
    if (!user) return
    console.log('user', user)
    const macrosToSet = {
      protein: {
        percentage: getPercentage(
          user?.loggedToday?.protein,
          user?.currGoal?.macros.protein
        ),
        gram: user?.currGoal?.macros.protein,
      },
      carbs: {
        percentage: getPercentage(
          user?.loggedToday?.carbs,
          user?.currGoal?.macros.carbs
        ),
        gram: user?.currGoal?.macros.carbs,
      },
      fats: {
        percentage: getPercentage(
          user?.loggedToday?.fat,
          user?.currGoal?.macros.fat
        ),
        gram: user?.currGoal?.macros.fat,
      },
    }
    setMacros(macrosToSet)
  }, [user])

  function getPercentage(value: number, goal: number) {
    return (value / goal) * 100
  }

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
            // percentageValue={50}
            current={user.loggedToday?.calories}
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

import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'

import 'swiper/css'
import 'swiper/css/pagination'

import { CaloriesProgress } from '../CaloriesProgress/CaloriesProgress'
import { MacrosDistribution } from '../MacrosDistribution/MacrosDistribution'
import { MacrosProgress } from '../MacrosProgress/MacrosProgress'
import { getRandomIntInclusive } from '../../services/util.service'

export function StatsCarousel() {
  function _getRandomPercentage() {
    return getRandomIntInclusive(0, 100)
  }

  const macros = {
    protein: { percentage: _getRandomPercentage(), value: 178 },
    carbs: { percentage: _getRandomPercentage(), value: 205 },
    fats: { percentage: _getRandomPercentage(), value: 63 },
  }

  return (
    <Swiper
      spaceBetween={30}
      pagination={{ clickable: true }}
      modules={[Pagination]}
      className='stats-carousel'
    >
      <SwiperSlide>
        <CaloriesProgress percentageValue={50} current={1000} goal={2000} />
      </SwiperSlide>

      <SwiperSlide>
        <MacrosProgress
          protein={macros.protein.percentage}
          carbs={macros.carbs.percentage}
          fats={macros.fats.percentage}
        />
      </SwiperSlide>

      <SwiperSlide>
        <MacrosDistribution
          protein={macros.protein.value}
          carbs={macros.carbs.value}
          fats={macros.fats.value}
        />
      </SwiperSlide>
    </Swiper>
  )
}

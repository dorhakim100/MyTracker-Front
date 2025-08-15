import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'

import 'swiper/css'
import 'swiper/css/pagination'

import { CaloriesProgress } from '../CaloriesProgress/CaloriesProgress'
import { MacrosDistribution } from '../MacrosDistribution/MacrosDistribution'
import { MacrosProgress } from '../MacrosProgress/MacrosProgress'

export function StatsCarousel() {
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
        <MacrosDistribution protein={100} carbs={100} fats={100} />
      </SwiperSlide>

      <SwiperSlide>
        <MacrosProgress protein={100} carbs={100} fats={100} />
      </SwiperSlide>
    </Swiper>
  )
}

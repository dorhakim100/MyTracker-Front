import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'

import 'swiper/css'
import 'swiper/css/pagination'

import { CaloriesProgress } from '../CaloriesProgress/CaloriesProgress'

export function StatsCarousel() {
  return (
    <Swiper
      spaceBetween={30}
      pagination={{ clickable: true }}
      modules={[Pagination]}
      className='mySwiper'
    >
      <SwiperSlide>
        <CaloriesProgress value={50} current={1000} goal={2000} />
      </SwiperSlide>

      <SwiperSlide>
        <CaloriesProgress value={50} current={1000} goal={2000} />
      </SwiperSlide>

      <SwiperSlide>
        <CaloriesProgress value={50} current={1000} goal={2000} />
      </SwiperSlide>
    </Swiper>
  )
}

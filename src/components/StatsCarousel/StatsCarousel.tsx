import { ReactNode } from 'react'
import { useSelector } from 'react-redux'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'

import 'swiper/css'
import 'swiper/css/pagination'

import { RootState } from '../../store/store'
import { Card } from '@mui/material'
import { CustomSkeleton } from '../../CustomMui/CustomSkeleton/CustomSkeleton'

interface StatsCarouselProps {
  items: ReactNode[]
  showSkeleton?: boolean
  skeletonComponent?: ReactNode
  className?: string
  direction?: 'horizontal' | 'vertical'
}

export function StatsCarousel({
  items,
  showSkeleton = false,
  skeletonComponent,
  className = '',
  direction = 'horizontal',
}: StatsCarouselProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  // Show skeleton if requested or if no items provided
  if (showSkeleton || items.length === 0) {
    if (skeletonComponent) {
      return <>{skeletonComponent}</>
    }

    return (
      <Card
        className={`card calories-progress skeleton ${
          prefs.isDarkMode ? 'dark-mode' : ''
        } ${className}`}
      >
        <CustomSkeleton
          variant="text"
          width="50%"
          height={30}
          className="title"
          isDarkMode={prefs.isDarkMode}
        />
        <CustomSkeleton
          variant="circular"
          width="150px"
          height="150px"
          className="circular-progress"
          isDarkMode={prefs.isDarkMode}
        />
        <CustomSkeleton
          variant="rectangular"
          width="150px"
          height="40px"
          className="goal-container"
          isDarkMode={prefs.isDarkMode}
        />
      </Card>
    )
  }

  return (
    <Swiper
      spaceBetween={30}
      pagination={{ clickable: true }}
      modules={[Pagination]}
      className={`stats-carousel ${className} ${direction}`}
      direction={direction}
    >
      {items.map((item, index) => (
        <SwiperSlide key={index}>{item}</SwiperSlide>
      ))}
    </Swiper>
  )
}

import { ReactNode, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import type { Swiper as SwiperInstance } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'

import 'swiper/css'
import 'swiper/css/pagination'

import { RootState } from '../../store/store'
import { Card } from '@mui/material'
import { CustomSkeleton } from '../../CustomMui/CustomSkeleton/CustomSkeleton'
import { indexedDbService } from '../../services/indexeddb.service'
import { STATS_CAROUSEL_INDEX_STORE_NAME } from '../../constants/store.constants'

interface StatsCarouselIndexRecord {
  _id: string
  index: number
}

const slideIndexCache = new Map<string, number>()

function cachedSlideIndex(storageKey: string) {
  const cached = slideIndexCache.get(storageKey)
  return cached === undefined ? null : cached
}

async function readSlideIndex(storageKey: string) {
  try {
    const saved = await indexedDbService.get<StatsCarouselIndexRecord>(
      STATS_CAROUSEL_INDEX_STORE_NAME,
      storageKey
    )
    const index =
      typeof saved?.index === 'number' && saved.index >= 0 ? saved.index : 0
    slideIndexCache.set(storageKey, index)
    return index
  } catch {
    slideIndexCache.set(storageKey, 0)
    return 0
  }
}

function isSwiperReady(swiper: object) {
  return 'initialized' in swiper && swiper.initialized === true
}

async function writeSlideIndex(storageKey: string, index: number) {
  slideIndexCache.set(storageKey, index)
  try {
    await indexedDbService.put(STATS_CAROUSEL_INDEX_STORE_NAME, {
      _id: storageKey,
      index,
    })
  } catch {
    return
  }
}

interface StatsCarouselProps {
  items: ReactNode[]
  showSkeleton?: boolean
  skeletonComponent?: ReactNode
  className?: string
  direction?: 'horizontal' | 'vertical'
  deferInactiveSlides?: boolean
  storageKey?: string
}

export function StatsCarousel({
  items,
  showSkeleton = false,
  skeletonComponent,
  className = '',
  direction = 'horizontal',
  deferInactiveSlides = false,
  storageKey = 'stats-carousel',
}: StatsCarouselProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )
  const swiperRef = useRef<SwiperInstance | null>(null)
  const previousLength = useRef(items.length)
  const [initialIndex, setInitialIndex] = useState<number | null>(() =>
    cachedSlideIndex(storageKey)
  )
  const [activeIndex, setActiveIndex] = useState(
    () => cachedSlideIndex(storageKey) ?? 0
  )
  const [paintedThrough, setPaintedThrough] = useState(0)

  useEffect(() => {
    let cancelled = false
    const cached = cachedSlideIndex(storageKey)
    if (cached === null) setInitialIndex(null)
    else {
      setInitialIndex(cached)
      setActiveIndex(cached)
    }
    readSlideIndex(storageKey).then((index) => {
      if (cancelled) return
      setInitialIndex(index)
      setActiveIndex(index)
    })
    return () => {
      cancelled = true
    }
  }, [storageKey])

  useEffect(() => {
    if (initialIndex === null || items.length === 0) return
    if (initialIndex < items.length) return
    setInitialIndex(0)
    setActiveIndex(0)
    writeSlideIndex(storageKey, 0)
  }, [initialIndex, items.length, storageKey])

  useEffect(() => {
    const previous = previousLength.current
    previousLength.current = items.length
    const swiper = swiperRef.current
    if (!swiper || items.length === 0 || previous === items.length) return
    if (swiper.realIndex < items.length) return
    swiper.slideTo(0)
    writeSlideIndex(storageKey, 0)
  }, [items.length, storageKey])

  useEffect(() => {
    if (!deferInactiveSlides) return
    const frame = requestAnimationFrame(() => {
      setPaintedThrough(activeIndex + 1)
    })
    return () => cancelAnimationFrame(frame)
  }, [activeIndex, deferInactiveSlides])

  const visibleThrough = deferInactiveSlides
    ? Math.max(paintedThrough, activeIndex)
    : items.length

  const startIndex =
    initialIndex !== null && initialIndex < items.length ? initialIndex : 0

  // Show skeleton if requested, if no items, or until the saved slide is known
  if (showSkeleton || items.length === 0 || initialIndex === null) {
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
  }

  return (
    <Swiper
      spaceBetween={30}
      pagination={{ clickable: true }}
      modules={[Pagination]}
      className={`stats-carousel ${className} ${direction}`}
      direction={direction}
      loop={items.length > 1}
      initialSlide={startIndex}
      onSwiper={(swiper) => {
        swiperRef.current = swiper
      }}
      onSlideChange={(swiper) => {
        if (!isSwiperReady(swiper)) return
        const index = swiper.realIndex
        if (deferInactiveSlides) setActiveIndex(index)
        writeSlideIndex(storageKey, index)
      }}
    >
      {items.map((item, index) => (
        <SwiperSlide key={index}>
          {!deferInactiveSlides || index <= visibleThrough ? (
            item
          ) : (
            <div className='stats-carousel-slide-placeholder' />
          )}
        </SwiperSlide>
      ))}
    </Swiper>
  )
}

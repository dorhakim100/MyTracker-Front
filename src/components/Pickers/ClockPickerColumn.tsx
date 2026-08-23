import { useEffect, useLayoutEffect, useRef } from 'react'
import { Typography } from '@mui/material'
import { AnimatedWrapper } from '../AnimatedWrapper/AnimatedWrapper'

export const CLOCK_ITEM_HEIGHT = 36
export const CLOCK_PICKER_HEIGHT = 216

const MAX_FLICK_ITEMS = 60
const MIN_COAST_VELOCITY = 0.25
const FRICTION = 0.97
const SAMPLE_MS = 80
const BUTTON_SLIDE_MS = 300

export function ClockPickerColumn({
  name,
  values,
  value,
  onChange,
  format,
  height = CLOCK_PICKER_HEIGHT,
  itemHeight = CLOCK_ITEM_HEIGHT,
  slideNonce = 0,
}: {
  name: string
  values: number[]
  value: number
  onChange: (value: number) => void
  format?: (value: number) => string
  height?: number
  itemHeight?: number
  slideNonce?: number
}) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const samplesRef = useRef<{ y: number; t: number }[]>([])
  const lastYRef = useRef<number | null>(null)
  const isDraggingRef = useRef(false)
  const coastFrameRef = useRef<number | null>(null)
  const slideFrameRef = useRef<number | null>(null)
  const ignoreScrollRef = useRef(false)
  const lastEmittedRef = useRef(value)
  const slideNonceRef = useRef(slideNonce)
  const pad = (height - itemHeight) / 2

  function getIndex(next: number) {
    const index = values.indexOf(next)
    return index < 0 ? 0 : index
  }

  function getMaxScroll() {
    return Math.max(0, (values.length - 1) * itemHeight)
  }

  function stopCoast() {
    if (coastFrameRef.current == null) return
    cancelAnimationFrame(coastFrameRef.current)
    coastFrameRef.current = null
  }

  function stopSlide() {
    if (slideFrameRef.current == null) return
    cancelAnimationFrame(slideFrameRef.current)
    slideFrameRef.current = null
    ignoreScrollRef.current = false
  }

  function snapToNearest() {
    const scroller = scrollerRef.current
    if (!scroller) return
    const index = Math.round(scroller.scrollTop / itemHeight)
    const nextIndex = Math.min(values.length - 1, Math.max(0, index))
    scroller.scrollTop = nextIndex * itemHeight
  }

  function isFlicking() {
    return isDraggingRef.current || coastFrameRef.current != null
  }

  function slideToValue(next: number) {
    const scroller = scrollerRef.current
    if (!scroller) return

    const target = getIndex(next) * itemHeight
    const start = scroller.scrollTop
    const distance = target - start
    if (Math.abs(distance) < 1) return

    stopCoast()
    stopSlide()

    ignoreScrollRef.current = true

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    if (reducedMotion) {
      scroller.scrollTop = target
      requestAnimationFrame(() => {
        ignoreScrollRef.current = false
      })
      return
    }

    const startTime = performance.now()

    function step(now: number) {
      const t = Math.min(1, (now - startTime) / BUTTON_SLIDE_MS)
      const eased = 1 - Math.pow(1 - t, 3)
      if (scroller) {
        scroller.scrollTop = start + distance * eased
      }

      if (t < 1) {
        slideFrameRef.current = requestAnimationFrame(step)
        return
      }

      if (scroller) {
        scroller.scrollTop = target
      }
      slideFrameRef.current = null
      requestAnimationFrame(() => {
        ignoreScrollRef.current = false
      })
    }

    slideFrameRef.current = requestAnimationFrame(step)
  }

  useLayoutEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return
    scroller.scrollTop = getIndex(value) * itemHeight
  }, [])

  useEffect(() => {
    const fromButton = slideNonce !== slideNonceRef.current
    slideNonceRef.current = slideNonce

    if (fromButton) {
      lastEmittedRef.current = value
      slideToValue(value)
      return
    }

    if (value === lastEmittedRef.current) return
    lastEmittedRef.current = value
    if (isFlicking()) return
    slideToValue(value)
  }, [value, itemHeight, slideNonce])

  useEffect(() => {
    return () => {
      stopCoast()
      stopSlide()
    }
  }, [])

  function onScroll() {
    if (ignoreScrollRef.current) return
    const scroller = scrollerRef.current
    if (!scroller) return
    const index = Math.round(scroller.scrollTop / itemHeight)
    const next = values[Math.min(values.length - 1, Math.max(0, index))]
    if (next === value) return
    lastEmittedRef.current = next
    onChange(next)
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    stopCoast()
    stopSlide()
    isDraggingRef.current = true
    lastYRef.current = e.clientY
    samplesRef.current = [{ y: e.clientY, t: Date.now() }]
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!isDraggingRef.current || lastYRef.current == null) return
    const scroller = scrollerRef.current
    if (!scroller) return

    const dy = e.clientY - lastYRef.current
    lastYRef.current = e.clientY
    scroller.scrollTop = Math.min(
      getMaxScroll(),
      Math.max(0, scroller.scrollTop - dy)
    )

    const now = Date.now()
    samplesRef.current.push({ y: e.clientY, t: now })
    samplesRef.current = samplesRef.current.filter(
      (sample) => now - sample.t <= SAMPLE_MS
    )
  }

  function getReleaseVelocity() {
    const samples = samplesRef.current
    if (samples.length < 2) return 0
    const first = samples[0]
    const last = samples[samples.length - 1]
    const dt = last.t - first.t
    if (dt < 16) return 0
    return (last.y - first.y) / dt
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!isDraggingRef.current) return
    isDraggingRef.current = false
    lastYRef.current = null
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }

    let velocity = -getReleaseVelocity()
    samplesRef.current = []

    const maxVelocity = (MAX_FLICK_ITEMS * itemHeight * (1 - FRICTION)) / 16
    if (Math.abs(velocity) > maxVelocity) {
      velocity = Math.sign(velocity) * maxVelocity
    }

    if (Math.abs(velocity) < MIN_COAST_VELOCITY) {
      snapToNearest()
      return
    }

    let lastTime = performance.now()

    function step(now: number) {
      const scroller = scrollerRef.current
      if (!scroller) {
        coastFrameRef.current = null
        return
      }

      const dt = Math.min(32, now - lastTime)
      lastTime = now
      scroller.scrollTop = Math.min(
        getMaxScroll(),
        Math.max(0, scroller.scrollTop + velocity * dt)
      )
      velocity *= Math.pow(FRICTION, dt / 16)

      const atEdge =
        scroller.scrollTop <= 0 || scroller.scrollTop >= getMaxScroll()
      if (atEdge || Math.abs(velocity) < MIN_COAST_VELOCITY) {
        coastFrameRef.current = null
        snapToNearest()
        return
      }

      coastFrameRef.current = requestAnimationFrame(step)
    }

    coastFrameRef.current = requestAnimationFrame(step)
  }

  return (
    <div
      className='clock-picker-column'
      data-column={name}
      style={{ height }}
    >
      <div
        ref={scrollerRef}
        className='clock-picker-wheel'
        onScroll={onScroll}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          className='clock-picker-pad'
          style={{ height: pad }}
        />
        {values.map((number) => (
          <div
            key={`${name}-${number}`}
            className='clock-picker-item'
            style={{ height: itemHeight }}
          >
            <AnimatedWrapper disabled>
              <Typography
                variant='h5'
                className={number === value ? 'selected' : ''}
              >
                {format ? format(number) : number}
              </Typography>
            </AnimatedWrapper>
          </div>
        ))}
        <div
          className='clock-picker-pad'
          style={{ height: pad }}
        />
      </div>
    </div>
  )
}

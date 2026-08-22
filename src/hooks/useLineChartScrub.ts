import { useCallback, useRef, useState } from 'react'
import { capacitorService } from '../services/capacitor.service'

export const POINT_DOT_MAX = 31
export const POINT_RADIUS = 3
export const POINT_ACTIVE_RADIUS = 6
export const POINT_ACTIVE_BORDER = 2.5
export const SCRUB_LOCK_THRESHOLD_PX = 12

export type SeriesValue = number | null
export type LineChartScrubKind = 'tap' | 'scrub'

export interface LineChartScrubMeta {
  kind: LineChartScrubKind
  clientX: number
  clientY: number
  nativeEvent: Event
}

type AxisLock = 'none' | 'horizontal' | 'vertical'

export function shouldShowPointDots(pointCount: number) {
  return pointCount > 0 && pointCount <= POINT_DOT_MAX
}

export function lastRealIndex(series: SeriesValue[] | undefined): number | null {
  if (!series?.length) return null
  for (let i = series.length - 1; i >= 0; i--) {
    if (series[i] != null && Number.isFinite(series[i] as number)) return i
  }
  return null
}

function isRealValue(value: SeriesValue) {
  return value != null && Number.isFinite(value)
}

export function nearestRealIndex(
  series: SeriesValue[] | undefined,
  index: number,
  preferIndex: number | null = null
): number | null {
  if (!series?.length) return null
  const clamped = clampChartIndex(index, series.length)
  if (clamped == null) return null
  if (isRealValue(series[clamped])) return clamped

  for (let dist = 1; dist < series.length; dist++) {
    const left = clamped - dist
    const right = clamped + dist
    const leftOk = left >= 0 && isRealValue(series[left])
    const rightOk = right < series.length && isRealValue(series[right])
    if (leftOk && rightOk) {
      if (preferIndex === left || preferIndex === right) return preferIndex
      return right
    }
    if (leftOk) return left
    if (rightOk) return right
  }

  return lastRealIndex(series)
}

export function clampChartIndex(index: number, length: number): number | null {
  if (length <= 0) return null
  if (index < 0) return 0
  if (index >= length) return length - 1
  return index
}

export function indexFromScaleValue(
  value: unknown,
  labels: string[]
): number | null {
  if (!labels.length) return null
  let idx: number
  if (typeof value === 'number' && Number.isFinite(value)) {
    idx = Math.round(value)
  } else if (typeof value === 'string') {
    idx = labels.indexOf(value)
    if (idx < 0) return null
  } else {
    return null
  }
  return clampChartIndex(idx, labels.length)
}

interface UseLineChartScrubParams {
  getIndexFromClientX: (clientX: number) => number | null
  onSelect: (index: number, meta: LineChartScrubMeta) => void
}

export function useLineChartScrub({
  getIndexFromClientX,
  onSelect,
}: UseLineChartScrubParams) {
  const containerRef = useRef<HTMLDivElement>(null)
  const startRef = useRef<{ x: number; y: number; pointerId: number } | null>(
    null
  )
  const lockRef = useRef<AxisLock>('none')
  const lastIndexRef = useRef<number | null>(null)
  const getIndexRef = useRef(getIndexFromClientX)
  const onSelectRef = useRef(onSelect)
  const [isScrubbing, setIsScrubbing] = useState(false)

  getIndexRef.current = getIndexFromClientX
  onSelectRef.current = onSelect

  const syncLastIndex = useCallback((index: number | null) => {
    lastIndexRef.current = index
  }, [])

  const emitFromPointer = useCallback(
    (
      clientX: number,
      clientY: number,
      kind: LineChartScrubKind,
      nativeEvent: Event
    ) => {
      const index = getIndexRef.current(clientX)
      if (index == null) return
      const changed = lastIndexRef.current !== index
      if (kind === 'scrub' && !changed) return
      lastIndexRef.current = index
      if (changed) capacitorService.vibrate('Light')
      onSelectRef.current(index, { kind, clientX, clientY, nativeEvent })
    },
    []
  )

  const endGesture = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const start = startRef.current
    if (!start || e.pointerId !== start.pointerId) return

    const lock = lockRef.current
    startRef.current = null
    lockRef.current = 'none'
    setIsScrubbing(false)

    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }

    if (lock === 'none') {
      emitFromPointer(e.clientX, e.clientY, 'tap', e.nativeEvent)
    }
  }, [emitFromPointer])

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    startRef.current = { x: e.clientX, y: e.clientY, pointerId: e.pointerId }
    lockRef.current = 'none'
  }, [])

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const start = startRef.current
      if (!start || e.pointerId !== start.pointerId) return

      const dx = e.clientX - start.x
      const dy = e.clientY - start.y

      if (lockRef.current === 'none') {
        const absX = Math.abs(dx)
        const absY = Math.abs(dy)
        if (absX < SCRUB_LOCK_THRESHOLD_PX && absY < SCRUB_LOCK_THRESHOLD_PX) {
          return
        }
        if (absY > absX) {
          lockRef.current = 'vertical'
          return
        }
        lockRef.current = 'horizontal'
        setIsScrubbing(true)
        if (e.pointerType === 'mouse') {
          try {
            e.currentTarget.setPointerCapture(e.pointerId)
          } catch {
            // capture is best-effort (some environments disallow it)
          }
        }
      }

      if (lockRef.current !== 'horizontal') return

      emitFromPointer(e.clientX, e.clientY, 'scrub', e.nativeEvent)
    },
    [emitFromPointer]
  )

  return {
    containerRef,
    isScrubbing,
    syncLastIndex,
    onPointerDown,
    onPointerMove,
    onPointerUp: endGesture,
    onPointerCancel: endGesture,
    onLostPointerCapture: endGesture,
  }
}

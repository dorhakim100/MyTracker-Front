import { useEffect, useRef } from 'react'

interface UseInfiniteScrollTriggerOptions {
  hasMore: boolean
  isLoading: boolean
  onLoadMore: () => void | Promise<void>
  enabled?: boolean
  root?: Element | null
  rootMargin?: string
  threshold?: number
}

export function useInfiniteScrollTrigger({
  hasMore,
  isLoading,
  onLoadMore,
  enabled = true,
  root = null,
  rootMargin = '0px 0px 200px 0px',
  threshold = 0,
}: UseInfiniteScrollTriggerOptions) {
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const isTriggeredRef = useRef(false)

  useEffect(() => {
    if (!enabled || !hasMore || isLoading) return

    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observedRoot = root && root.contains(sentinel) ? root : null

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0]
        if (!firstEntry) return
        if (!firstEntry.isIntersecting) {
          // Allow the next load only after user leaves bottom area.
          isTriggeredRef.current = false
          return
        }
        if (isTriggeredRef.current) return
        isTriggeredRef.current = true
        onLoadMore()
      },
      { root: observedRoot, rootMargin, threshold }
    )

    observer.observe(sentinel)

    return () => observer.disconnect()
  }, [enabled, hasMore, isLoading, onLoadMore, root, rootMargin, threshold])

  return { sentinelRef }
}


import { useInfiniteScrollTrigger } from '../../hooks/useInfiniteScrollTrigger'

interface BottomReachIndicatorProps {
  hasMore: boolean
  isLoading: boolean
  onReachBottom: () => void | Promise<void>
}

export function BottomReachIndicator({
  hasMore,
  isLoading,
  onReachBottom,
}: BottomReachIndicatorProps) {
  const { sentinelRef } = useInfiniteScrollTrigger({
    hasMore,
    isLoading,
    onLoadMore: onReachBottom,
  })

  return (
    <div
      ref={sentinelRef}
      style={{ height: 1 }}
    />
  )
}


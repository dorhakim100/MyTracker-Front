import { useInfiniteScrollTrigger } from '../../hooks/useInfiniteScrollTrigger'
import CircularProgress from '@mui/material/CircularProgress';
import { RootState } from '../../store/store';
import { useSelector } from 'react-redux';
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

  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )


  return (
    <>
    <div
      ref={sentinelRef}

      className={`bottom-reach-indicator ${prefs.isDarkMode ? 'dark' : 'light'}`}
      >

      {hasMore && <CircularProgress className={`${prefs.favoriteColor}`} />}
      </div>
      </>
  )
}

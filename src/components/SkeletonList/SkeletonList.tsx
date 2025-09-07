import { Box } from '@mui/material'
import CustomSkeleton from '../../CustomMui/CustomSkeleton/CustomSkeleton'
import { RootState } from '../../store/store'
import { useSelector } from 'react-redux'

interface SkeletonListProps {
  SKELETON_NUMBER?: number
}

export function SkeletonList({ SKELETON_NUMBER = 8 }: SkeletonListProps) {
  const prefs = useSelector((state: RootState) => state.systemModule.prefs)

  return (
    <Box className='results'>
      {Array.from({ length: SKELETON_NUMBER }).map((_, index) => (
        <div
          className='search-item-container skeleton'
          key={`${index}-skeleton-search-item`}
        >
          <CustomSkeleton
            variant='circular'
            width={50}
            height={50}
            isDarkMode={prefs.isDarkMode}
          />
          <div className='text-container'>
            <CustomSkeleton
              variant='text'
              width='100%'
              height={20}
              isDarkMode={prefs.isDarkMode}
            />
            <CustomSkeleton
              variant='text'
              width='25%'
              height={20}
              isDarkMode={prefs.isDarkMode}
            />
          </div>
        </div>
      ))}
    </Box>
  )
}

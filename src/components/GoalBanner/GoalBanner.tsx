import { LinearProgress, Typography } from '@mui/material'
import FlagIcon from '@mui/icons-material/Flag'
import { formatNumberWithCommas } from '../../services/util.service'
// import CustomSkeleton from '../../CustomMui/CustomSkeleton/CustomSkeleton'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'

interface GoalBannerProps {
  current: number | string
  goal?: number | string
  extraValue?: string
  icon?: React.ReactNode
  isGoal?: boolean
  afterValue?: string
  loading?: boolean
  size?: 's' | 'm' | 'l'
}

export function GoalBanner({
  current,
  goal,
  extraValue = '',
  icon,
  isGoal = true,
  afterValue = '',
  loading = false,
  size = 'm',
}: GoalBannerProps) {
  const prefs = useSelector((state: RootState) => state.systemModule.prefs)
  const formattedCurrent = formatNumberWithCommas(+current)
  let formattedGoal = goal
  if (goal) {
    formattedGoal = formatNumberWithCommas(+goal)
  }

  // if (loading && current === 0) {
  //   return (
  //     <div className='goal-banner banner'>
  //       <div className='value-container'>
  //         <CustomSkeleton
  //           width={80}
  //           height={21}
  //           isDarkMode={prefs.isDarkMode}
  //         />
  //       </div>
  //       {icon || <FlagIcon />}
  //     </div>
  //   )
  // }
  return (
    <div className={`goal-banner banner ${size}`}>
      <div className='value-container'>
        <Typography
          variant='body1'
          className='bold-header'
        >
          {formattedCurrent + extraValue}
          <span className='after-value'>{afterValue}</span>
        </Typography>
        {isGoal && (
          <>
            <span>/</span>
            <Typography
              variant='body1'
              className='bold-header'
            >
              {formattedGoal + extraValue}
              <span className='after-value'>{afterValue}</span>
            </Typography>
          </>
        )}
      </div>
      {icon || <FlagIcon />}
      <LinearProgress
        className={`linear-progress ${prefs.favoriteColor} ${
          loading ? 'show' : ''
        }`}
      />
    </div>
  )
}

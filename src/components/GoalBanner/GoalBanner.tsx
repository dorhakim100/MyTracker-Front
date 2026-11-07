import { LinearProgress, Typography } from '@mui/material'
import FlagIcon from '@mui/icons-material/Flag'
import { formatNumberWithCommas } from '../../services/util.service'
import { RollingNumber } from '../RollingNumber/RollingNumber'
// import CustomSkeleton from '../../CustomMui/CustomSkeleton/CustomSkeleton'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import {
  useEffect,
  useRef,
  useState,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import TouchRippleBase, {
  type TouchRippleActions,
  type TouchRippleProps,
} from '@mui/material/ButtonBase/TouchRipple'
import { EllipsisText } from '../../CustomMui/EllipsisText/EllipsisText'

// MUI's .d.ts types the inner render function. The runtime export is forwardRef.
const TouchRipple = TouchRippleBase as unknown as ForwardRefExoticComponent<
  TouchRippleProps & RefAttributes<TouchRippleActions>
>

interface GoalBannerProps {
  current: number | string
  goal?: number | string
  extraValue?: string
  icon?: React.ReactNode
  isGoal?: boolean
  afterValue?: string
  loading?: boolean
  size?: 's' | 'm' | 'l'
  animateCurrent?: boolean
  onClick?: () => void
  iconPlacement?: 'left' | 'right'
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
  animateCurrent = false,
  onClick,
  iconPlacement = 'right',
}: GoalBannerProps) {
  const rippleRef = useRef<TouchRippleActions>(null)
  const prefs = useSelector((state: RootState) => state.systemModule.prefs)
  let formattedGoal = goal
  if (goal) {
    formattedGoal = formatNumberWithCommas(+goal)
  }
  const isClickable = !!onClick

  const [afterMountCurrent, setAfterMountCurrent] = useState(
    animateCurrent ? 0 : current
  )
  useEffect(() => {
    setAfterMountCurrent(current)
  }, [current])

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
    <div
      className={`goal-banner banner ${size} ${
        isClickable ? 'clickable' : ''
      } icon-${iconPlacement}`}
      onPointerDown={(e) => rippleRef.current?.start(e)}
      onPointerUp={() => rippleRef.current?.stop()}
      onPointerLeave={() => rippleRef.current?.stop()}
    >
      {isClickable && <TouchRipple ref={rippleRef} />}

      <div className='value-container'>
        <EllipsisText>
          <Typography
            variant='body1'
            className='bold-header'
          >
            {animateCurrent ? (
              <RollingNumber value={+afterMountCurrent || 0} />
            ) : (
              afterMountCurrent
            )}
            {extraValue}
            <span className='after-value'>{afterValue}</span>
          </Typography>
        </EllipsisText>
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
      <div className='icon-container'>{icon || <FlagIcon />}</div>
      {isClickable && <ChevronRightIcon className='chevron-right' />}
      <LinearProgress
        className={`linear-progress ${prefs.favoriteColor} ${
          loading ? 'show' : ''
        }`}
      />
    </div>
  )
}

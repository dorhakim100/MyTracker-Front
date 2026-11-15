import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import type { SvgIconProps } from '@mui/material/SvgIcon'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'

interface ChevronProps extends SvgIconProps {
  direction?: 'forward' | 'back'
}

export function Chevron({
  direction = 'forward',
  className = '',
  ...iconProps
}: ChevronProps) {
  const isRtl = useSelector(
    (state: RootState) => state.systemModule.prefs.lang === 'he'
  )
  const showRight =
    (direction === 'forward' && !isRtl) || (direction === 'back' && isRtl)
  const Icon = showRight ? ChevronRightIcon : ChevronLeftIcon

  return (
    <Icon
      {...iconProps}
      className={`directional-chevron ${className}`.trim()}
    />
  )
}

import type { SvgIconProps } from '@mui/material/SvgIcon'
import SvgIcon from '@mui/material/SvgIcon'

function TrendIcon({
  className = '',
  tone,
  children,
  ...props
}: SvgIconProps & { tone: 'gain' | 'lose' }) {
  return (
    <SvgIcon
      viewBox='0 0 24 24'
      {...props}
      className={`goal-trend-icon ${tone} ${className}`.trim()}
    >
      {children}
    </SvgIcon>
  )
}

export function GoalTrendUpIcon(props: SvgIconProps) {
  return (
    <TrendIcon
      tone='gain'
      {...props}
    >
      <polyline
        className='goal-trend-body'
        points='21 6 14 13 11 10 3 18'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='2'
      />
      <polyline
        className='goal-trend-body'
        points='21 10 21 6 17 6'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='2'
      />
      <path
        className='goal-trend-sign'
        d='M15.4 19.15h5.1M17.95 16.6v5.1'
        strokeLinecap='round'
        strokeWidth='2'
      />
    </TrendIcon>
  )
}

export function GoalTrendDownIcon(props: SvgIconProps) {
  return (
    <TrendIcon
      tone='lose'
      {...props}
    >
      <polyline
        className='goal-trend-body'
        points='21 18 14 11 11 14 3 6'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='2'
      />
      <polyline
        className='goal-trend-body'
        points='21 14 21 18 17 18'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='2'
      />
      <path
        className='goal-trend-sign'
        d='M15.4 4.85h5.1'
        strokeLinecap='round'
        strokeWidth='2'
      />
    </TrendIcon>
  )
}

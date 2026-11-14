import type { SvgIconProps } from '@mui/material/SvgIcon'
import SvgIcon from '@mui/material/SvgIcon'
import {
  caloriesMedalPath,
  stepsMedalPath,
} from '../../assets/health/medal-paths'

export type MedalIconSize = 's' | 'm' | 'l' | 'xl'

const medalSizeRem: Record<MedalIconSize, string> = {
  s: '1.1rem',
  m: '1.5rem',
  l: '1.75rem',
  xl: '2rem',
}

export type MedalIconProps = SvgIconProps & { size?: MedalIconSize }

function MedalIcon({
  d,
  size,
  sx,
  ...props
}: MedalIconProps & { d: string }) {
  const rem = size ? medalSizeRem[size] : undefined

  return (
    <SvgIcon
      viewBox='0 0 64 64'
      {...props}
      sx={[
        rem ? { fontSize: rem, width: rem, height: rem } : null,
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <path
        fill='currentColor'
        fillRule='evenodd'
        d={d}
      />
    </SvgIcon>
  )
}

export function StepsMedalIcon(props: MedalIconProps) {
  return (
    <MedalIcon
      d={stepsMedalPath}
      {...props}
    />
  )
}

export function CaloriesMedalIcon(props: MedalIconProps) {
  return (
    <MedalIcon
      d={caloriesMedalPath}
      {...props}
    />
  )
}

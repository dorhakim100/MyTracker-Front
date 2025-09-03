import { Skeleton, type SkeletonProps } from '@mui/material'
import { alpha } from '@mui/material/styles'

interface CustomSkeletonProps extends SkeletonProps {
  isDarkMode?: boolean
}

export function CustomSkeleton({
  isDarkMode = false,
  sx,
  ...rest
}: CustomSkeletonProps) {
  const baseColor = isDarkMode ? alpha('#ffffff', 0.12) : alpha('#000000', 0.06)

  const shimmerColor = isDarkMode
    ? alpha('#ffffff', 0.2)
    : alpha('#000000', 0.12)

  const mergedSx = Array.isArray(sx)
    ? [
        {
          bgcolor: baseColor,
          '&::after': {
            background: `linear-gradient(90deg, transparent, ${shimmerColor}, transparent)`,
          },
        },
        ...sx,
      ]
    : [
        {
          bgcolor: baseColor,
          '&::after': {
            background: `linear-gradient(90deg, transparent, ${shimmerColor}, transparent)`,
          },
        },
        sx,
      ]

  return <Skeleton sx={mergedSx} {...rest} />
}

export default CustomSkeleton

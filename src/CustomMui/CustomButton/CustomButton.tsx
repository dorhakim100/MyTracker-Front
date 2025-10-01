import { Button, IconButton } from '@mui/material'
import type { SxProps, Theme } from '@mui/material/styles'
import { motion } from 'framer-motion'
import type { ReactNode, MouseEvent } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'

interface CustomButtonProps {
  text?: string
  className?: string
  isIcon?: boolean
  icon?: ReactNode
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void
  disabled?: boolean
  backgroundColor?: string
  ariaLabel?: string
  size?: 'small' | 'medium' | 'large'
  fullWidth?: boolean
  sx?: SxProps<Theme>
}

export function CustomButton({
  text,
  className,
  isIcon = false,
  icon,
  onClick,
  disabled = false,
  backgroundColor,
  ariaLabel,
  size = 'medium',
  fullWidth = false,
  sx,
}: CustomButtonProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const resolvedBg = backgroundColor || prefs.favoriteColor || undefined

  const MotionWrapper = motion.div

  return (
    <MotionWrapper
      whileTap={!disabled ? { scale: 0.94 } : undefined}
      whileHover={!disabled ? { scale: 0.98 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      className={`custom-button-wrapper ${
        prefs.isDarkMode ? 'dark-mode' : ''
      } ${disabled ? 'disabled' : ''}`}
    >
      {isIcon ? (
        <IconButton
          aria-label={ariaLabel || (typeof text === 'string' ? text : 'button')}
          onClick={onClick}
          disabled={disabled}
          className={`custom-button ${className || ''}`}
          sx={{
            backgroundColor: resolvedBg,
            color: resolvedBg ? '#fff' : undefined,
            borderRadius: 999,
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent',
            '&:hover': {
              backgroundColor: resolvedBg,
              filter: resolvedBg ? 'brightness(0.95)' : undefined,
            },
            '&:active': {
              transform: 'scale(0.98)',
            },
            '&:focus': { outline: 'none' },
            ...sx,
          }}
        >
          {icon}
        </IconButton>
      ) : (
        <Button
          variant='contained'
          size={size}
          fullWidth={fullWidth}
          aria-label={ariaLabel || (typeof text === 'string' ? text : 'button')}
          onClick={onClick}
          disabled={disabled}
          className={`custom-button ${className || ''} ${
            prefs.favoriteColor || ''
          } ${disabled ? 'disabled' : ''}`}
        >
          {text}
          {icon && icon}
        </Button>
      )}
    </MotionWrapper>
  )
}

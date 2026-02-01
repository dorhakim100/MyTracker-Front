import { Button, IconButton, Tooltip } from '@mui/material'
import type { SxProps, Theme } from '@mui/material/styles'
import type { ReactNode, MouseEvent } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { ClickAnimation } from '../../components/ClickAnimation/ClickAnimation'

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
  isIconReverse?: boolean
  tooltipTitle?: string
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
  isIconReverse = false,
  tooltipTitle,
}: CustomButtonProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const isDashboard = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.isDashboard
  )

  // const resolvedBg = backgroundColor || prefs.favoriteColor || undefined
  const resolvedBg = backgroundColor || undefined

  return (
    <ClickAnimation
      disabled={isDashboard ? true : disabled}
      className={`custom-button-wrapper ${
        prefs.isDarkMode ? 'dark-mode' : ''
      } ${disabled ? 'disabled' : ''} ${prefs.favoriteColor || ''}`}
    >
      {isIcon ? (
        <Tooltip
          title={
            tooltipTitle ||
            ariaLabel ||
            (typeof text === 'string' ? text : 'button')
          }
          disableHoverListener={tooltipTitle && isDashboard ? false : true}
          disableTouchListener={tooltipTitle && isDashboard ? false : true}
          disableFocusListener={tooltipTitle && isDashboard ? false : true}
        >
          <span style={{ display: 'inline-flex' }}>
            <IconButton
              aria-label={
                ariaLabel || (typeof text === 'string' ? text : 'button')
              }
              onClick={onClick}
              disabled={disabled}
              className={`custom-button ${className || ''} `}
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
          </span>
        </Tooltip>
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
          } ${disabled ? 'disabled' : ''} ${
            prefs.isDarkMode ? 'dark-mode' : ''
          } ${isDashboard ? 'dashboard' : ''}`}
        >
          {icon && isIconReverse && icon}
          {text}
          {icon && !isIconReverse && icon}
        </Button>
      )}
    </ClickAnimation>
  )
}

import Fab from '@mui/material/Fab'
import { Tooltip } from '@mui/material'
import type { SxProps, Theme } from '@mui/material/styles'
import type { ReactNode, MouseEvent } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { ClickAnimation } from '../../components/ClickAnimation/ClickAnimation'
import { capacitorService } from '../../services/capacitor.service'
import type { CustomButtonVariant } from '../CustomButton/CustomButton'

interface CustomFloatingButtonProps {
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
  shouldVibrate?: boolean
  variant?: CustomButtonVariant
}

export function CustomFloatingButton({
  text,
  className,
  // isIcon = false,
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
  shouldVibrate = true,
  variant,
}: CustomFloatingButtonProps) {
  const resolvedVariant = variant ?? 'strong'
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )
  const isDashboard = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.isDashboard
  )

  const resolvedBg = backgroundColor || undefined
  const isCircular = !text
  const label = ariaLabel || (typeof text === 'string' ? text : 'button')

  return (
    <ClickAnimation
      disabled={isDashboard ? true : disabled}
      className={`custom-floating-button-wrapper variant-${resolvedVariant} ${
        prefs.isDarkMode ? 'dark-mode' : ''
      } ${disabled ? 'disabled' : ''} ${prefs.favoriteColor || ''}`}
    >
      <Tooltip
        title={tooltipTitle || label}
        disableHoverListener={
          tooltipTitle && isDashboard ? false : !tooltipTitle
        }
        disableTouchListener={tooltipTitle && isDashboard ? false : true}
        disableFocusListener={tooltipTitle && isDashboard ? false : true}
      >
        <span
          className={`custom-floating-button-span ${
            fullWidth ? 'full-width' : ''
          }`}
        >
          <Fab
            variant={isCircular ? 'circular' : 'extended'}
            size={size}
            aria-label={label}
            disabled={disabled}
            onClick={async (e) => {
              onClick?.(e)
              if (shouldVibrate) {
                capacitorService.vibrate('Light')
              }
            }}
            className={`custom-floating-button variant-${resolvedVariant} ${
              className || ''
            } ${prefs.favoriteColor || ''} ${disabled ? 'disabled' : ''} ${
              prefs.isDarkMode ? 'dark-mode' : ''
            } ${isDashboard ? 'dashboard' : ''} ${
              isIconReverse ? 'icon-reverse' : ''
            }`}
            sx={{
              backgroundColor: resolvedBg,
              color: resolvedBg ? '#fff' : undefined,
              width: fullWidth && !isCircular ? '100%' : undefined,
              '&:hover': {
                backgroundColor: resolvedBg,
                filter: resolvedBg ? 'brightness(0.95)' : undefined,
              },
              '&:focus': { outline: 'none' },
              ...sx,
            }}
          >
            {icon && isIconReverse ? null : icon}
            {!isCircular && text}
            {icon && isIconReverse ? icon : null}
          </Fab>
        </span>
      </Tooltip>
    </ClickAnimation>
  )
}

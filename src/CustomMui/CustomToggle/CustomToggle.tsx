import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import ToggleButton from '@mui/material/ToggleButton'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import Badge from '@mui/material/Badge'

export interface ToggleOption {
  value: string
  label: string
  ariaLabel?: string
  icon?: React.ReactNode
  badgeIcon?: React.ReactNode
  getDisabled?: () => boolean
}

interface CustomToggleProps {
  value: string
  options: ToggleOption[]
  onChange: (newValue: string) => void
  exclusive?: boolean
  className?: string
  ariaLabel?: string
  isBadge?: boolean
  isReversedIcon?: boolean
}

export function CustomToggle({
  value,
  options,
  onChange,
  exclusive = true,
  className,
  ariaLabel = 'toggle-group',
  isBadge = false,
  isReversedIcon = false,
}: CustomToggleProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )
  return (
    <ToggleButtonGroup
      value={value}
      exclusive={exclusive}
      onChange={(_, newValue) => {
        if (newValue !== null) onChange(newValue)
      }}
      aria-label={ariaLabel}
      className={`custom-toggle no-scroll ${className} ${prefs.favoriteColor}`}
    >
      {options.map((opt) => (
        <ToggleButton
          key={opt.value}
          value={opt.value}
          aria-label={opt.ariaLabel || opt.value}
          disabled={opt.getDisabled?.() || false}
        >
          {isBadge && (
            <Badge
              badgeContent={opt.badgeIcon}
              className={`${prefs.favoriteColor} toggle-badge`}
            ></Badge>
          )}
          {!isReversedIcon && opt.icon}
          {opt.label}
          {isReversedIcon && opt.icon}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  )
}

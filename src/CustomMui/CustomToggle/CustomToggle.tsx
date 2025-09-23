import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import ToggleButton from '@mui/material/ToggleButton'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'

export interface ToggleOption {
  value: string
  label: string
  ariaLabel?: string
  icon?: React.ReactNode
}

interface CustomToggleProps {
  value: string
  options: ToggleOption[]
  onChange: (newValue: string) => void
  exclusive?: boolean
  className?: string
  ariaLabel?: string
}

export function CustomToggle({
  value,
  options,
  onChange,
  exclusive = true,
  className,
  ariaLabel = 'toggle-group',
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
        >
          {opt.icon}
          {opt.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  )
}

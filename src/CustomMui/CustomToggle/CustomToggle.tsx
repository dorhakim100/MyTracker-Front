import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import ToggleButton from '@mui/material/ToggleButton'

export interface ToggleOption {
  value: string
  label: string
  ariaLabel?: string
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
  return (
    <ToggleButtonGroup
      value={value}
      exclusive={exclusive}
      onChange={(_, newValue) => {
        if (newValue !== null) onChange(newValue)
      }}
      aria-label={ariaLabel}
      className={className}
    >
      {options.map((opt) => (
        <ToggleButton
          key={opt.value}
          value={opt.value}
          aria-label={opt.ariaLabel || opt.value}
        >
          {opt.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  )
}

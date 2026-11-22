import type { ReactElement, SyntheticEvent } from 'react'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'

export interface CustomTabOption<T extends string = string> {
  value: T
  label: string
  icon?: ReactElement | string
  disabled?: boolean
  ariaLabel?: string
}

export interface CustomTabsProps<T extends string = string> {
  value: T
  options: CustomTabOption<T>[]
  onChange: (value: T) => void
  className?: string
  ariaLabel?: string
  variant?: 'standard' | 'fullWidth' | 'scrollable'
  centered?: boolean
  size?: 'slim' | 'fat'
}

export function CustomTabs<T extends string = string>({
  value,
  options,
  onChange,
  className,
  ariaLabel = 'tabs',
  variant = 'standard',
  centered = false,
  size,
}: CustomTabsProps<T>) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )
  const isScrollable = variant === 'scrollable'

  function onTabChange(_event: SyntheticEvent, next: T) {
    onChange(next)
  }

  return (
    <div
      className={`custom-tabs-container ${prefs.favoriteColor || ''} ${
        size || ''
      } ${className || ''}`}
    >
      <Tabs
        className='custom-tabs'
        value={value}
        onChange={onTabChange}
        aria-label={ariaLabel}
        variant={variant}
        centered={variant === 'standard' && centered}
        textColor='inherit'
        scrollButtons={isScrollable ? 'auto' : false}
        allowScrollButtonsMobile={isScrollable}
      >
        {options.map((option) => (
          <Tab
            key={option.value}
            className='press-ripple'
            value={option.value}
            label={option.label}
            icon={option.icon}
            iconPosition={option.icon ? 'start' : 'top'}
            disabled={option.disabled}
            aria-label={option.ariaLabel || option.label}
          />
        ))}
      </Tabs>
    </div>
  )
}

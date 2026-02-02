import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import type { ReactNode } from 'react'
import { useRef } from 'react'
import { IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useSelector } from 'react-redux'
import type { RootState } from '../../store/store'

interface CustomInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  startIconFn?: () => ReactNode
  endIconFn?: () => ReactNode
  autoFocus?: boolean
  size?: 'small' | 'medium'
  className?: string
  isRemoveIcon?: boolean
  onBlur?: () => void
}

export function CustomInput({
  value,
  onChange,
  placeholder,
  startIconFn,
  endIconFn,
  // autoFocus = false,
  size = 'medium',
  className,
  isRemoveIcon,
  onBlur,
}: CustomInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  return (
    <TextField
      onBlur={onBlur}
      fullWidth
      size={size}
      ref={inputRef}
      // autoFocus={autoFocus}
      autoFocus={false}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`custom-input ${className} ${
        prefs.isDarkMode ? 'dark-mode' : ''
      }`}
      InputProps={{
        startAdornment: startIconFn ? (
          <InputAdornment position='start'>{startIconFn()}</InputAdornment>
        ) : undefined,
        endAdornment: endIconFn ? (
          <InputAdornment position='end'>{endIconFn()}</InputAdornment>
        ) : isRemoveIcon ? (
          <InputAdornment position='end'>
            <IconButton onClick={() => onChange('')}>
              <CloseIcon />
            </IconButton>
          </InputAdornment>
        ) : undefined,
      }}
    />
  )
}

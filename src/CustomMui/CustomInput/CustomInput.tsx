import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import type { ReactNode } from 'react'

interface CustomInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  startIconFn?: () => ReactNode
  endIconFn?: () => ReactNode
  autoFocus?: boolean
  size?: 'small' | 'medium'
  className?: string
}

export function CustomInput({
  value,
  onChange,
  placeholder,
  startIconFn,
  endIconFn,
  autoFocus = false,
  size = 'medium',
  className,
}: CustomInputProps) {
  return (
    <TextField
      fullWidth
      size={size}
      autoFocus={autoFocus}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
      InputProps={{
        startAdornment: startIconFn ? (
          <InputAdornment position='start'>{startIconFn()}</InputAdornment>
        ) : undefined,
        endAdornment: endIconFn ? (
          <InputAdornment position='end'>{endIconFn()}</InputAdornment>
        ) : undefined,
      }}
    />
  )
}

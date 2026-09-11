import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import type { HTMLInputTypeAttribute, ReactNode } from 'react'
import { useRef } from 'react'
import { IconButton, Tooltip } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import type { RootState } from '../../store/store'
import { capacitorService } from '../../services/capacitor.service'

interface CustomInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  startIconFn?: () => ReactNode
  endIconFn?: () => ReactNode
  autoFocus?: boolean
  size?: 's' | 'm'
  type?: HTMLInputTypeAttribute
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
  size = 'm',
  type = 'text',
  className,
  isRemoveIcon,
  onBlur,
}: CustomInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )
  const { t } = useTranslation()
  return (
    <TextField
      onBlur={onBlur}
      fullWidth
      size={size === 's' ? 'small' : 'medium'}
      type={type}
      ref={inputRef}
      // autoFocus={autoFocus}
      autoFocus={false}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`custom-input size-${size} ${className} ${
        prefs.isDarkMode ? 'dark-mode' : ''
      }`}
      InputProps={{
        startAdornment: startIconFn ? (
          <InputAdornment position='start'>{startIconFn()}</InputAdornment>
        ) : undefined,
        endAdornment: endIconFn ? (
          <InputAdornment position='end'>{endIconFn()}</InputAdornment>
        ) : isRemoveIcon ? (
          <Tooltip title={t('common.clear')}>
            <InputAdornment position='end'>
              <IconButton onClick={() => {
                onChange('')
                capacitorService.vibrate('Light')
              }}>
                <CloseIcon />
              </IconButton>
            </InputAdornment>
          </Tooltip>
        ) : undefined,
      }}
    />
  )
}

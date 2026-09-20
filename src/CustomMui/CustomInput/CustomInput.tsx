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
  multiline?: boolean
  minRows?: number
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
  multiline = false,
  minRows = 4,
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
      type={multiline ? undefined : type}
      ref={inputRef}
      // autoFocus={autoFocus}
      autoFocus={false}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      multiline={multiline}
      minRows={multiline ? minRows : undefined}
      inputProps={multiline ? { dir: 'auto' } : undefined}
      className={`custom-input size-${size} ${
        multiline ? 'multiline' : ''
      } ${className} ${prefs.isDarkMode ? 'dark-mode' : ''}`}
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

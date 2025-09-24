import { useMemo, useState } from 'react'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import { CustomButton } from '../CustomButton/CustomButton'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'

interface CustomDatePickerProps {
  value?: string // ISO (yyyy-mm-dd)
  onChange: (isoDate: string) => void
  ariaLabel?: string
  className?: string
}

export function CustomDatePicker({
  value,
  onChange,
  ariaLabel,
  className,
}: CustomDatePickerProps) {
  const [open, setOpen] = useState(false)
  const [localIso, setLocalIso] = useState<string>(
    () => value || new Date().toISOString().split('T')[0]
  )

  const dateValue = useMemo(() => new Date(localIso), [localIso])

  function toIsoDateOnly(date: Date) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  function onOpen() {
    setOpen(true)
  }

  function onClose() {
    setOpen(false)
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <CustomButton
        isIcon
        icon={<CalendarMonthIcon />}
        ariaLabel={ariaLabel || 'open date picker'}
        onClick={onOpen}
        className={`custom-date-picker-button ${className || ''}`}
      />
      <MobileDatePicker
        value={dateValue}
        onChange={(newDate: Date | null) => {
          if (!newDate) return
          const iso = toIsoDateOnly(newDate)
          setLocalIso(iso)
          onChange(iso)
          onClose()
        }}
        open={open}
        onClose={onClose}
        slotProps={{ textField: { style: { display: 'none' } } }}
      />
    </LocalizationProvider>
  )
}

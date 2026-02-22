import { useTranslation } from 'react-i18next'
import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { he } from 'date-fns/locale'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import { CustomButton } from '../CustomButton/CustomButton'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { RootState } from '../../store/store'

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
  const { t } = useTranslation()
  const lang = useSelector((state: RootState) => state.systemModule.prefs.lang)
  const [open, setOpen] = useState(false)

  const localIso = useMemo(
    () => value || new Date().toISOString().split('T')[0],
    [value]
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
    <LocalizationProvider
      dateAdapter={AdapterDateFns}
      adapterLocale={lang === 'he' ? he : undefined}
    >
      <CustomButton
        isIcon
        icon={<CalendarMonthIcon />}
        ariaLabel={ariaLabel || 'open date picker'}
        onClick={onOpen}
        className={`custom-date-picker-button ${className || ''}`}
        tooltipTitle={t('common.selectDate')}
      />

      <MobileDatePicker
        value={dateValue}
        onChange={(newDate: Date | null) => {
          if (!newDate) return
          const iso = toIsoDateOnly(newDate)

          onChange(iso)
          onClose()
        }}
        open={open}
        onClose={onClose}
        slotProps={{ textField: { style: { display: 'none' } } }}
        localeText={{
          cancelButtonLabel: t('common.cancel'),
          okButtonLabel: t('common.save'),
        }}
        className={`${className || ''}`}
      />
    </LocalizationProvider>
  )
}

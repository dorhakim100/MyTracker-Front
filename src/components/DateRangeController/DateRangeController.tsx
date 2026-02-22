import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { Divider, Typography } from '@mui/material'
import { CustomDatePicker } from '../../CustomMui/CustomDatePicker/CustomDatePicker'
import { useTranslation } from 'react-i18next'

interface DateRangeControllerProps {
  selectedPastDate: {
    from: string
    to: string
  }
  onDateChange: (dates: { from: string; to: string }) => void
}

export function DateRangeController({
  selectedPastDate,
  onDateChange,
}: DateRangeControllerProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const { t } = useTranslation()
  const fromDate = new Date(selectedPastDate?.from)
  const toDate = new Date(selectedPastDate?.to)

  return (
    <div className='date-picker-container'>
      <Typography variant='body1'>
        {t('date.from')}: {fromDate.toLocaleDateString('he')}
      </Typography>
      <CustomDatePicker
        value={selectedPastDate?.from}
        onChange={(date) =>
          onDateChange({ ...selectedPastDate, from: date || '' })
        }
        className={`${prefs.favoriteColor}`}
      />
      <Divider
        className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`}
        orientation='vertical'
        flexItem
      />
      <Typography variant='body1'>
        {t('date.to')}: {toDate.toLocaleDateString('he')}
      </Typography>
      <CustomDatePicker
        value={selectedPastDate?.to}
        onChange={(date) =>
          onDateChange({ ...selectedPastDate, to: date || '' })
        }
        className={`${prefs.favoriteColor}`}
      />
    </div>
  )
}

import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { Typography } from '@mui/material'
import { CustomDatePicker } from '../../CustomMui/CustomDatePicker/CustomDatePicker'

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

  return (
    <div className='date-picker-container'>
      <Typography variant='body1'>From: {selectedPastDate?.from}</Typography>
      <CustomDatePicker
        value={selectedPastDate?.from}
        onChange={(date) =>
          onDateChange({ ...selectedPastDate, from: date || '' })
        }
        className={`${prefs.favoriteColor}`}
      />
      <Typography variant='body1'>To: {selectedPastDate?.to}</Typography>
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

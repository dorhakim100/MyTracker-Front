import { IconButton } from '@mui/material'
import { useSelector } from 'react-redux'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

import { RootState } from '../../store/store'
import { TimesContainer } from '../TimesContainer/TimesContainer'
import { CustomDatePicker } from '../../CustomMui/CustomDatePicker/CustomDatePicker'

interface DayControllerProps {
  selectedDay: Date
  selectedDayDate: string
  isToday: boolean
  onDayChange: (diff: number) => void
  onDateChange: (date: string) => void
}

export function DayController({
  selectedDay,
  selectedDayDate,
  isToday,
  onDayChange,
  onDateChange,
}: DayControllerProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  return (
    <div className='day-controller-container'>
      <IconButton onClick={() => onDayChange(-1)}>
        <ArrowBackIcon />
      </IconButton>
      <div
        className={`time-controls-container ${
          isToday ? `today ${prefs.favoriteColor}` : ''
        } ${prefs.isDarkMode ? 'dark-mode' : ''}`}
      >
        <TimesContainer isClock={false} selectedDay={selectedDay} />
        <CustomDatePicker value={selectedDayDate} onChange={onDateChange} />
      </div>
      <IconButton onClick={() => onDayChange(1)}>
        <ArrowForwardIcon />
      </IconButton>
    </div>
  )
}

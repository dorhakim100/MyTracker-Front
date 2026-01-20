import { IconButton, Tooltip } from '@mui/material'
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
  const isDashboard = useSelector((state: RootState) => state.systemModule.isDashboard)
  return (
    <div className='day-controller-container'>
      <Tooltip title="Previous day" disableHoverListener={!isDashboard}>

        <IconButton onClick={() => onDayChange(-1)}>
          <ArrowBackIcon />
        </IconButton>
      </Tooltip>
      <div
        className={`time-controls-container ${isToday ? `today ${prefs.favoriteColor}` : ''
          } ${prefs.isDarkMode ? 'dark-mode' : ''}`}
      >
        <TimesContainer isClock={false} selectedDay={selectedDay} />
        <CustomDatePicker value={selectedDayDate} onChange={onDateChange} />
      </div>
      <Tooltip title="Next day" disableHoverListener={!isDashboard}>

        <IconButton onClick={() => onDayChange(1)}>
          <ArrowForwardIcon />
        </IconButton>
      </Tooltip>
    </div>
  )
}

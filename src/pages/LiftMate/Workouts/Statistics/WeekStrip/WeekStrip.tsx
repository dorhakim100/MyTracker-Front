import { WeekDay } from '../../../../../types/stats/WorkoutStats'

interface WeekStripProps {
  days: WeekDay[]
  lang: string
  isDarkMode?: boolean
}

function weekdayLetter(date: string, lang: string) {
  const [year, month, day] = date.split('-').map(Number)
  const noon = new Date(Date.UTC(year, month - 1, day, 12))
  return new Intl.DateTimeFormat(lang === 'he' ? 'he' : 'en', {
    weekday: 'narrow',
    timeZone: 'Asia/Jerusalem',
  }).format(noon)
}

export function WeekStrip({ days, lang, isDarkMode = false }: WeekStripProps) {
  return (
    <div className='week-strip'>
      {days.map((day) => (
        <div
          key={day.date}
          className={`week-day ${day.isToday ? 'is-today' : ''} ${
            day.isFuture ? 'is-future' : ''
          } ${isDarkMode ? 'dark-mode' : ''}`}
        >
          <span className='letter'>{weekdayLetter(day.date, lang)}</span>
          <span className='number'>{Number(day.date.slice(8, 10))}</span>
          {day.hasWorkout && !day.isFuture && <span className='mark' />}
        </div>
      ))}
    </div>
  )
}

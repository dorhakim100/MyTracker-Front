import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'

interface TimesContainerProps {
  isClock?: boolean
  selectedDay?: Date
  className?: string
}

const dateLocale = (lang: 'en' | 'he') => (lang === 'he' ? 'he-IL' : 'en')

export function TimesContainer({
  isClock = true,
  selectedDay = new Date(),
  className = '',
}: TimesContainerProps) {
  const lang = useSelector(
    (state: RootState) => state.systemModule.prefs.lang
  )

  const [timeString, setTimeString] = useState(
    new Date().toLocaleTimeString(lang === 'he' ? 'he-IL' : 'en', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  )
  const [dateString, setDateString] = useState(
    selectedDay.toLocaleDateString(dateLocale(lang), {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
  )

  useEffect(() => {
    const locale = lang === 'he' ? 'he-IL' : 'en'
    const interval = setInterval(() => {
      const now = new Date()
      setTimeString(
        now.toLocaleTimeString(locale, {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [lang])

  useEffect(() => {
    setDateString(
      selectedDay.toLocaleDateString(dateLocale(lang), {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
    )
  }, [selectedDay, lang])

  return (
    <div className={`times-container ${className}`}>
      <div className="time-date-container">
        {isClock && <span className="time">{timeString}</span>}{' '}
        <span className="date">{dateString}</span>
      </div>
    </div>
  )
}

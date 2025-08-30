import { useEffect, useState } from 'react'

interface TimesContainerProps {
  isClock?: boolean
  selectedDay?: Date
}

export function TimesContainer({
  isClock = true,
  selectedDay = new Date(),
}: TimesContainerProps) {
  const [timeString, setTimeString] = useState(
    new Date().toLocaleTimeString('he', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  )
  const [dateString, setDateString] = useState(
    selectedDay.toLocaleDateString('eng', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
  )

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      setTimeString(
        now.toLocaleTimeString('he', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      )

      // setDateString(
      //   now.toLocaleDateString('eng', {
      //     weekday: 'long',
      //     day: 'numeric',
      //     month: 'long',
      //   })
      // )
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    setDateString(
      selectedDay.toLocaleDateString('eng', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
    )
  }, [selectedDay])

  return (
    <div className='times-container'>
      <div className='time-date-container'>
        {isClock && <span className='time'>{timeString}</span>}{' '}
        <span className='date'>{dateString}</span>
      </div>
    </div>
  )
}

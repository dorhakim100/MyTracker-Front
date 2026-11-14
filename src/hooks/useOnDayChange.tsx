import { useEffect, useRef, useState } from 'react'

const todayLocale = (date: Date) =>
  date.toLocaleDateString('en', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

export function useOnDayChange() {
  const mountedTodayRef = useRef(todayLocale(new Date()))
  const [today, setToday] = useState(todayLocale(new Date()))
  const [shouldTrigger, setShouldTrigger] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      setToday(todayLocale(now))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (today !== mountedTodayRef.current) {
      mountedTodayRef.current = today
      setShouldTrigger(true)
    }
  }, [today])

  return { shouldTrigger }
}

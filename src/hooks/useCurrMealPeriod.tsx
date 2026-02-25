import { useEffect, useState } from 'react'
import { getCurrMealPeriod } from '../services/util.service'

export function useCurrMealPeriod() {
  const [currMealPeriod, setCurrMealPeriod] = useState(getCurrMealPeriod())

  useEffect(() => {
    const interval = setInterval(() => {
      const next = getCurrMealPeriod()
      setCurrMealPeriod((prev) => (prev !== next ? next : prev))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return currMealPeriod
}

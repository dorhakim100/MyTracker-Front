import { useEffect, useState } from 'react'
import NumberFlow, { type Format } from '@number-flow/react'

interface RollingNumberProps {
  value: number
  className?: string
  format?: Format
  prefix?: string
  suffix?: string
  /** Roll up from 0 once, when a recap first appears. */
  fromZero?: boolean
}

export function RollingNumber({
  value,
  className = '',
  format,
  prefix,
  suffix,
  fromZero = false,
}: RollingNumberProps) {
  const safe = Number.isFinite(value) ? value : 0
  const [shown, setShown] = useState(fromZero ? 0 : safe)

  useEffect(() => {
    if (!fromZero) {
      setShown(safe)
      return
    }
    const frame = requestAnimationFrame(() => setShown(safe))
    return () => cancelAnimationFrame(frame)
  }, [safe, fromZero])

  return (
    <NumberFlow
      className={`rolling-number ${className}`.trim()}
      value={shown}
      format={format}
      prefix={prefix}
      suffix={suffix}
      respectMotionPreference
    />
  )
}

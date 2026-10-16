import { useEffect, useRef, useState } from 'react'
import { capacitorService } from '../services/capacitor.service'

/** True for a short beat when a percent moves from a real in-progress value past 100. */
export function useCrossedGoal(percent: number) {
  const previous = useRef(percent)
  const [justCrossed, setJustCrossed] = useState(false)

  useEffect(() => {
    if (!Number.isFinite(percent)) return
    const before = previous.current
    previous.current = percent
    const wasInProgress =
      Number.isFinite(before) && before > 0 && before < 100
    if (!wasInProgress || percent < 100) return

    setJustCrossed(true)
    if (document.visibilityState === 'visible') {
      capacitorService.vibrate('Medium')
    }
    const timeout = window.setTimeout(() => setJustCrossed(false), 320)
    return () => window.clearTimeout(timeout)
  }, [percent])

  return justCrossed
}

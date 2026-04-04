import { useCallback, useEffect, useMemo, useRef } from 'react'
import debounce from 'lodash/debounce'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
) {
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  })

  const debouncedFn = useMemo(
    () =>
      debounce((...args: Parameters<T>) => {
        callbackRef.current(...args)
      }, delay),
    [delay]
  )

  useEffect(() => {
    return () => {
      debouncedFn.flush()
    }
  }, [debouncedFn])

  const flush = useCallback(() => debouncedFn.flush(), [debouncedFn])
  const cancel = useCallback(() => debouncedFn.cancel(), [debouncedFn])

  return { debouncedFn, flush, cancel }
}

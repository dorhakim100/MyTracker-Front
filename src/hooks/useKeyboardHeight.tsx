import { useEffect, useState } from 'react'

export function useKeyboardHeight() {
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  useEffect(() => {
    // Enable overlay mode (keyboard doesn't push the whole viewport)
    if ('virtualKeyboard' in navigator && navigator.virtualKeyboard) {
      ;(navigator.virtualKeyboard as any).overlaysContent = true
    }

    const handleResize = () => {
      if (window.visualViewport) {
        const viewport = window.visualViewport
        const heightDiff = window.innerHeight - viewport.height
        setKeyboardHeight(heightDiff > 0 ? heightDiff : 0)
      }
    }

    window.visualViewport?.addEventListener('resize', handleResize)
    return () =>
      window.visualViewport?.removeEventListener('resize', handleResize)
  }, [])

  return keyboardHeight
}

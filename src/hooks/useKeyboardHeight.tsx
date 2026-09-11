import { useEffect, useState } from 'react'

export function useKeyboardHeight() {
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  useEffect(() => {
    if ('virtualKeyboard' in navigator && navigator.virtualKeyboard) {
      ;(navigator.virtualKeyboard as any).overlaysContent = true
    }

    const updateKeyboardState = () => {
      const nextKeyboardHeight = window.visualViewport
        ? Math.max(window.innerHeight - window.visualViewport.height, 0)
        : 0

      setKeyboardHeight(nextKeyboardHeight)

      const hasSlideDialog = !!document.querySelector(
        '.MuiDialog-container.half-dialog, .MuiDialog-container.full-dialog'
      )

      const appOffset = hasSlideDialog || nextKeyboardHeight <= 0 ? 0 : nextKeyboardHeight

      document.documentElement.style.setProperty(
        '--app-keyboard-offset',
        `${appOffset}px`
      )
      document.body.style.transition = 'transform 180ms ease'
      document.body.style.willChange = 'transform'
      document.body.style.transform =
        appOffset > 0 ? `translateY(-${appOffset}px)` : 'translateY(0px)'
    }

    updateKeyboardState()
    window.visualViewport?.addEventListener('resize', updateKeyboardState)
    document.addEventListener('focusin', updateKeyboardState)
    document.addEventListener('focusout', updateKeyboardState)

    return () => {
      document.documentElement.style.removeProperty('--app-keyboard-offset')
      document.body.style.transition = ''
      document.body.style.willChange = ''
      document.body.style.transform = 'translateY(0px)'
      window.visualViewport?.removeEventListener('resize', updateKeyboardState)
      document.removeEventListener('focusin', updateKeyboardState)
      document.removeEventListener('focusout', updateKeyboardState)
    }
  }, [])

  return keyboardHeight
}

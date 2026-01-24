import { useEffect, useMemo, useRef, useState } from 'react'

type Platform = 'ios' | 'android' | 'desktop'

type UsePwaDetect = {
  isPwaInstalled: boolean
  isInstallable: boolean // we received beforeinstallprompt
  promptInstall: () => Promise<void>
  shouldShowInstallGuide: boolean // not standalone and likely installable
  platform: Platform
}

export function usePwaDetect(): UsePwaDetect {
  const [isPwaInstalled, setIsPwaInstalled] = useState<boolean>(false)
  const [isInstallable, setIsInstallable] = useState<boolean>(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const deferredPromptRef = useRef<any>(null)

  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
  const isIOS = /iphone|ipad|ipod/i.test(ua)
  const isAndroid = /android/i.test(ua)
  const platform: Platform = isIOS ? 'ios' : isAndroid ? 'android' : 'desktop'

  useEffect(() => {
    const updatePwaInstalled = () => {
      const matchPwa =
        typeof window !== 'undefined' &&
        window.matchMedia?.('(display-mode: standalone)').matches
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const iosStandalone =
        typeof navigator !== 'undefined' &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (navigator as any).standalone === true // iOS Safari
      setIsPwaInstalled(Boolean(matchPwa || iosStandalone))
    }

    updatePwaInstalled()

    // Some browsers can change display-mode on the fly
    const mm = window.matchMedia?.('(display-mode: standalone)')
    const onChange = () => updatePwaInstalled()
    mm?.addEventListener?.('change', onChange)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onBeforeInstallPrompt = (e: any) => {
      // Avoid re-capturing and re-calling preventDefault on route changes
      if (deferredPromptRef.current) return
      e.preventDefault()
      deferredPromptRef.current = e
      setIsInstallable(true)
    }

    const onAppInstalled = () => {
      deferredPromptRef.current = null
      setIsInstallable(false)
      updatePwaInstalled()
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onAppInstalled)

    return () => {
      mm?.removeEventListener?.('change', onChange)
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onAppInstalled)
    }
  }, [])

  const promptInstall = async () => {
    const dp = deferredPromptRef.current
    if (!dp) return
    await dp.prompt()
    await dp.userChoice // { outcome: 'accepted' | 'dismissed', platform: string }
    deferredPromptRef.current = null
    setIsInstallable(false)
  }

  const shouldShowInstallGuide = useMemo(() => {
    if (platform === 'desktop') {
      return false
    }
    // Not in standalone AND either (Chrome can prompt) OR (iOS where A2HS is manual)
    return !isPwaInstalled && (isInstallable || platform === 'ios')
  }, [isPwaInstalled, isInstallable, platform])

  return {
    isPwaInstalled,
    isInstallable,
    promptInstall,
    shouldShowInstallGuide,
    platform,
  }
}

import { useCallback, useLayoutEffect, useState } from 'react'

const DEFAULT_TOP_EPSILON = 2

export type UseMainScrollIsTopOptions = {
  /**
   * Distance from the top (px) that still counts as “at top”
   * (subpixel scroll, rubber-band). Default 2.
   */
  topEpsilon?: number
}

/**
 * Tracks whether the primary page `IonContent` (inside `<main>`) is scrolled to the top.
 *
 * Attach `contentRef` to that `IonContent` — e.g. `<PullToRefreshPage ref={contentRef}>` if it forwards the ref.
 */
export function useMainScrollIsTop(options?: UseMainScrollIsTopOptions) {
  const topEpsilon = options?.topEpsilon ?? DEFAULT_TOP_EPSILON
  const [ionContent, setIonContent] = useState<HTMLIonContentElement | null>(null)
  const [isTop, setIsTop] = useState(true)

  const applyScrollTop = useCallback(
    (scrollTop: number) => {
      setIsTop(scrollTop <= topEpsilon)
    },
    [topEpsilon]
  )

  const contentRef = useCallback((node: HTMLIonContentElement | null) => {
    setIonContent(node)
  }, [])

  useLayoutEffect(() => {
    if (!ionContent) return

    let cancelled = false
    let removeListener: (() => void) | undefined

    void ionContent.getScrollElement().then((scrollEl) => {
      if (cancelled) return
      const onScroll = () => applyScrollTop(scrollEl.scrollTop)
      applyScrollTop(scrollEl.scrollTop)
      scrollEl.addEventListener('scroll', onScroll, { passive: true })
      removeListener = () => scrollEl.removeEventListener('scroll', onScroll)
    })

    return () => {
      cancelled = true
      removeListener?.()
    }
  }, [ionContent, applyScrollTop])

  return { isTop, contentRef, ionContent }
}

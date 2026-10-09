import { useEffect, useRef } from 'react'

function nearestHorizontalScroller(
  element: HTMLElement,
  boundary: HTMLElement
) {
  let node = element.parentElement
  while (node) {
    const overflowX = getComputedStyle(node).overflowX
    if (overflowX === 'auto' || overflowX === 'scroll') return node
    if (node === boundary) break
    node = node.parentElement
  }
  return boundary
}

function revealChild(scroller: HTMLElement, child: HTMLElement) {
  const scrollerRect = scroller.getBoundingClientRect()
  const childRect = child.getBoundingClientRect()
  if (childRect.right > scrollerRect.right + 1) {
    scroller.scrollLeft += childRect.right - scrollerRect.right + 15
  } else if (childRect.left < scrollerRect.left - 1) {
    scroller.scrollLeft -= scrollerRect.left - childRect.left + 15
  }
}

export function useScrollLastChildIntoView(className: string, when: unknown) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = containerRef.current
    if (!root || !className) return

    const frame = requestAnimationFrame(() => {
      const matches = root.getElementsByClassName(className)
      const last = matches.item(matches.length - 1)
      if (!last) return
      const scroller = nearestHorizontalScroller(last as HTMLElement, root)
      revealChild(scroller, last as HTMLElement)
    })

    return () => cancelAnimationFrame(frame)
  }, [className, when])

  return containerRef
}

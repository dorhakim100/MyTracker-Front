import {
  Children,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { Cursor, useTypewriter } from 'react-simple-typewriter'

function getChildText(children: ReactNode): string {
  return Children.toArray(children)
    .map((child) => {
      if (typeof child === 'string' || typeof child === 'number') {
        return String(child)
      }
      if (isValidElement<{ children?: ReactNode }>(child)) {
        return getChildText(child.props.children)
      }
      return ''
    })
    .join('')
}

interface CustomAnimatedTextProps {
  children: ReactNode
  className?: string
  typeSpeed?: number
}

function TypedText({
  text,
  typeSpeed = 35,
}: {
  text: string
  typeSpeed?: number
}) {
  const [typedText] = useTypewriter({
    words: [text],
    loop: 1,
    typeSpeed,
    deleteSpeed: 0,
    delaySpeed: 300,
  })

  return (
    <>
      <span>{typedText}</span>
      <Cursor cursorStyle='|' />
    </>
  )
}

export function CustomAnimatedText({
  children,
  className = '',
  typeSpeed = 35,
}: CustomAnimatedTextProps) {
  const text = getChildText(children)
  const containerRef = useRef<HTMLSpanElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (prefersReducedMotion) return

    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      setIsVisible(true)
      observer.disconnect()
    })

    observer.observe(el)
    return () => observer.disconnect()
  }, [prefersReducedMotion])

  const showFullText = prefersReducedMotion || !text

  return (
    <span
      ref={containerRef}
      className={`custom-animated-text-container ${className}`.trim()}
    >
      {showFullText ? (
        text
      ) : isVisible ? (
        <TypedText
          typeSpeed={typeSpeed}
          key={text}
          text={text}
        />
      ) : null}
    </span>
  )
}

import { HTMLMotionProps, Transition, motion } from 'framer-motion'
import { ElementType, ReactNode } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'

type AnimatedElement =
  | 'div'
  | 'span'
  | 'section'
  | 'article'
  | 'main'
  | 'header'
  | 'footer'
  | 'ul'
  | 'ol'
  | 'li'
  | 'p'
  | 'tr'
  | 'td'
  | 'tbody'
  | 'thead'
  | 'button'

interface AnimatedWrapperProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode
  /** Which HTML element to render (e.g. 'div', 'li', 'tr'). */
  as?: AnimatedElement
  /** Optional class name for styling the wrapper. */
  className?: string
  /** Disable all enter animation and render as static content. */
  disabled?: boolean
  /** Initial horizontal offset (px) before the element animates into place. */
  offsetX?: number
  /** Initial vertical offset (px) before the element animates into place. */
  offsetY?: number
  /** Default animation duration in seconds. */
  duration?: number
  /** Delay before animation starts in seconds. */
  delay?: number
  /** If true, run the in-view animation only once. */
  once?: boolean
  /** Viewport visibility threshold required to trigger animation. */
  amount?: number | 'some' | 'all'
  /** Custom transition; overrides duration/delay defaults when provided. */
  transition?: Transition
}

export function AnimatedWrapper({
  children,
  as = 'div',
  className,
  disabled = false,
  offsetX = -10,
  offsetY = 0,
  duration = 0.3,
  delay = 0,
  once = false,
  amount = 0.1,
  initial,
  whileInView,
  viewport,
  transition,
  ...motionProps
}: AnimatedWrapperProps) {

  const prefs = useSelector((state: RootState) => state.systemModule.prefs)

  const effectiveXOffset = prefs.lang === 'he' ? -offsetX : offsetX

  const defaultInitial = { opacity: 0, x: effectiveXOffset, y: offsetY, scale: 0.9 }
  const defaultWhileInView = { opacity: 1, x: 0, y: 0, scale: 1 }
  const motionElements: Record<AnimatedElement, ElementType> = {
    div: motion.div,
    span: motion.span,
    section: motion.section,
    article: motion.article,
    main: motion.main,
    header: motion.header,
    footer: motion.footer,
    ul: motion.ul,
    ol: motion.ol,
    li: motion.li,
    p: motion.p,
    tr: motion.tr,
    td: motion.td,
    tbody: motion.tbody,
    thead: motion.thead,
    button: motion.button,
  }
  const MotionComponent = motionElements[as]

  return (
    <MotionComponent
      className={className}
      initial={disabled ? false : (initial ?? defaultInitial)}
      whileInView={disabled ? undefined : (whileInView ?? defaultWhileInView)}
      viewport={disabled ? undefined : (viewport ?? { once, amount })}

      transition={
        disabled
          ? undefined
          : (transition ?? { duration, ease: 'easeOut', delay })
      }
      {...motionProps}
    >
      {children}
    </MotionComponent>
  )
}

import { HTMLMotionProps, Transition, motion } from 'framer-motion'
import { ReactNode } from 'react'

interface AnimatedWrapperProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode
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
  const defaultInitial = { opacity: 0, x: offsetX, y: offsetY }
  const defaultWhileInView = { opacity: 1, x: 0, y: 0 }

  return (
    <motion.div
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
    </motion.div>
  )
}

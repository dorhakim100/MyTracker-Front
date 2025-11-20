import { motion, HTMLMotionProps } from 'framer-motion'
import { ReactNode } from 'react'

interface ClickAnimationProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode
  disabled?: boolean
  scaleOnTap?: number
  scaleOnHover?: number
  className?: string
}

export function ClickAnimation({
  children,
  disabled = false,
  scaleOnTap = 0.94,
  scaleOnHover = 0.98,
  className = '',
  ...motionProps
}: ClickAnimationProps) {
  const MotionContainer = motion.div

  return (
    <MotionContainer
      whileTap={!disabled ? { scale: scaleOnTap } : undefined}
      whileHover={!disabled ? { scale: scaleOnHover } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      className={className}
      {...motionProps}
    >
      {children}
    </MotionContainer>
  )
}

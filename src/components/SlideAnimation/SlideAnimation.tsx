import { PropsWithChildren } from 'react'
import { AnimatePresence, motion, Variants } from 'framer-motion'

interface SlideAnimationProps {
  motionKey: string | number
  direction?: number
  duration?: number
  distance?: number
  className?: string
}

export function SlideAnimation({
  children,
  motionKey,
  direction = 1,
  duration = 0.25,
  distance = 360,
  className,
}: PropsWithChildren<SlideAnimationProps>) {
  const variants: Variants = {
    enter: (dir: number) => ({ x: dir > 0 ? distance : -distance, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -distance : distance, opacity: 0 }),
  }

  return (
    <AnimatePresence initial={false} custom={direction} mode='wait'>
      <motion.div
        key={motionKey}
        custom={direction}
        variants={variants}
        initial='enter'
        animate='center'
        exit='exit'
        transition={{ type: 'tween', duration }}
        className={className}
        style={{
          overflow: 'hidden',
          willChange: 'transform',
          position: 'relative',
          zIndex: 0,
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

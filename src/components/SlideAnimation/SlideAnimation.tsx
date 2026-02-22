import { PropsWithChildren, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { AnimatePresence, motion, Variants } from 'framer-motion'
import { RootState } from '../../store/store'

interface SlideAnimationProps {
  motionKey: string | number
  direction?: number
  duration?: number
  distance?: number
  className?: string
  onClick?: () => void
  overflow?: 'hidden' | 'scroll'
}

export function SlideAnimation({
  children,
  motionKey,
  direction = 1,
  duration = 0.25,
  distance = 360,
  className,
  overflow = 'hidden',
  onClick,
}: PropsWithChildren<SlideAnimationProps>) {
  const isRtl = useSelector(
    (state: RootState) => state.systemModule.prefs.lang === 'he'
  )
  const effectiveDirection = useMemo(
    () => (isRtl ? -direction : direction),
    [isRtl, direction]
  )

  const variants: Variants = {
    enter: (dir: number) => ({ x: dir > 0 ? distance : -distance, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -distance : distance, opacity: 0 }),
  }

  return (
    <AnimatePresence initial={false} custom={effectiveDirection} mode="wait">
      <motion.div
        key={motionKey}
        custom={effectiveDirection}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ type: 'tween', duration }}
        className={className}
        style={{
          overflow,
          willChange: 'transform',
          position: 'relative',
          zIndex: 0,
        }}
        onClick={() => onClick?.()}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

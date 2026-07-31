import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import Marquee from 'react-fast-marquee'
import Typography, { TypographyProps } from '@mui/material/Typography'
import { RootState } from '../../store/store'

const CYCLE_PAUSE_MS = 5000

interface MarqueeTextProps extends Omit<TypographyProps, 'children'> {
  children: string
}

export function MarqueeText({
  children,
  className = '',
  variant,
  ...typographyProps
}: MarqueeTextProps) {
  const lang = useSelector((state: RootState) => state.systemModule.prefs.lang)
  const isRtl = lang === 'he'

  const containerRef = useRef<HTMLSpanElement>(null)
  const measureRef = useRef<HTMLSpanElement>(null)
  const pauseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const [isPlaying, setIsPlaying] = useState(true)

  useEffect(() => {
    const container = containerRef.current
    const measure = measureRef.current
    if (!container || !measure) return

    const checkOverflow = () => {
      setIsOverflowing(measure.scrollWidth > container.clientWidth)
    }

    checkOverflow()

    const observer = new ResizeObserver(checkOverflow)
    observer.observe(container)

    return () => observer.disconnect()
  }, [children, variant, className])

  useEffect(() => {
    return () => {
      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current)
    }
  }, [])

  function onCycleComplete() {
    setIsPlaying(false)
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current)
    pauseTimeoutRef.current = setTimeout(() => {
      setIsPlaying(true)
    }, CYCLE_PAUSE_MS)
  }

  return (
    <span
      ref={containerRef}
      className='marquee-text-container'
    >
      <Typography
        ref={measureRef}
        component='span'
        variant={variant}
        {...typographyProps}
        className={`marquee-text-measure ${className}`.trim()}
        aria-hidden
      >
        {children}
      </Typography>

      {isOverflowing ? (
        <span
          dir='ltr'
          className='marquee-text-track'
        >
          <Marquee
            play={isPlaying}
            delay={5}
            pauseOnHover={false}
            pauseOnClick={false}
            direction={isRtl ? 'right' : 'left'}
            gradient={false}
            onCycleComplete={onCycleComplete}
          >
            <Typography
              component='span'
              variant={variant}
              {...typographyProps}
              className={`marquee-text ${className}`.trim()}
            >
              {children}
            </Typography>
          </Marquee>
        </span>
      ) : (
        <Typography
          component='span'
          variant={variant}
          {...typographyProps}
          className={`marquee-text ${className}`.trim()}
        >
          {children}
        </Typography>
      )}
    </span>
  )
}

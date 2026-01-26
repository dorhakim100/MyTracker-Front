import React, { useState, useEffect, useRef } from 'react'
import { eventBus } from '../../services/event-bus.service'
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'

import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'

interface UserMsgData {
  txt: string
  type: 'success' | 'error'
}

const SWIPE_THRESHOLD = 100 // Minimum distance to trigger close
const VELOCITY_THRESHOLD = 750 // Minimum velocity to trigger close

export const UserMsg: React.FC = () => {
  const [msg, setMsg] = useState<UserMsgData | null>(null)
  // const msg = {
  //   txt: 'This is a message',
  //   type: 'success' as 'success' | 'error',
  // }
  const timeoutIdRef = useRef<number | null>(null)
  const isDraggingEnabled = useRef(false)
  const isScrolling = useRef(false)
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const y = useMotionValue(0)
  const opacity = useTransform(y, [0, 300], [1, 0])

  useEffect(() => {
    const unsubscribe = eventBus.on('show-msg', (incomingMsg: UserMsgData) => {
      setMsg(incomingMsg)
      // Reset drag position when new message appears
      y.set(0)

      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current)
      }

      // window.setTimeout returns a number in browsers
      timeoutIdRef.current = window.setTimeout(closeMsg, 3000)
    })

    return () => {
      unsubscribe()
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current)
      }
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current)
      }
    }
  }, [])

  const closeMsg = () => {
    setMsg(null)
    y.set(0)
  }

  const handleDragStart = () => {
    if (isScrolling.current) {
      isDraggingEnabled.current = false
      return
    }

    // Clear auto-close timeout when user starts dragging
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current)
      timeoutIdRef.current = null
    }

    isDraggingEnabled.current = true
  }

  const handleDrag = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (!isDraggingEnabled.current) {
      y.set(0)
      return
    }

    // Only allow downward swipes (positive offset.y)
    if (info.offset.y > 0) {
      // Upward movement - cancel drag
      isDraggingEnabled.current = false
      y.set(0)
      return
    }
  }

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    // Don't close if user was scrolling or drag wasn't enabled
    if (isScrolling.current || !isDraggingEnabled.current) {
      y.set(0)
      isDraggingEnabled.current = false
      return
    }

    const shouldClose =
      info.offset.y < -SWIPE_THRESHOLD || info.velocity.y < VELOCITY_THRESHOLD

    if (shouldClose) {
      closeMsg()
    } else {
      // Reset position
      y.set(0)
      // Restart auto-close timeout
      if (msg) {
        timeoutIdRef.current = window.setTimeout(closeMsg, 3000)
      }
    }

    isDraggingEnabled.current = false
  }

  // Detect scrolling in content area
  const handleContentScroll = () => {
    isScrolling.current = true

    // Clear existing timeout
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current)
    }

    // Reset scrolling flag after scroll ends
    scrollTimeout.current = setTimeout(() => {
      isScrolling.current = false
    }, 150)
  }

  const className = `user-msg ${msg?.type ?? ''} ${msg ? 'visible' : ''}`

  return (
    <section className={className}>
      {msg && (
        <motion.div
          drag='y'
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.2}
          dragMomentum={false}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          style={{
            y,
            opacity,
          }}
          onScroll={handleContentScroll}
          className='user-msg-motion-container'
        >
          <Alert
            severity={msg.type}
            className={msg.type}
          >
            <AlertTitle>
              {msg.type === 'success' ? 'Success' : 'Error'}
            </AlertTitle>
            {msg.txt}
          </Alert>
        </motion.div>
      )}
    </section>
  )
}

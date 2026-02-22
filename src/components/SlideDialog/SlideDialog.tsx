import * as React from 'react'
import { useTranslation } from 'react-i18next'
import Dialog from '@mui/material/Dialog'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import CloseIcon from '@mui/icons-material/Close'
import Slide from '@mui/material/Slide'
import { TransitionProps } from '@mui/material/transitions'
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'

import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import CircularProgress from '@mui/material/CircularProgress'
import { stylesVariables } from '../../assets/config/styles.variables'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<unknown>
  },
  ref: React.Ref<unknown>
) {
  return (
    <Slide
      direction='up'
      ref={ref}
      {...props}
    />
  )
})

interface SlideDialogProps {
  open: boolean
  onClose: () => void
  component: React.ReactElement
  title?: string
  onSave?: () => void
  type?: 'half' | 'full'
  enableSwipeToClose?: boolean
}

const SWIPE_THRESHOLD = 100 // Minimum distance to trigger close
const VELOCITY_THRESHOLD = 750 // Minimum velocity to trigger close

export function SlideDialog({
  open,
  onClose,
  component,
  title,
  onSave,
  type = 'half',
  enableSwipeToClose = true,
}: SlideDialogProps) {
  const { t } = useTranslation()
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const isLoading = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.isLoading
  )

  const isDashboard = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.isDashboard
  )

  const y = useMotionValue(0)
  const opacity = useTransform(y, [0, 300], [1, 0])
  const headerRef = React.useRef<HTMLDivElement>(null)
  const contentRef = React.useRef<HTMLDivElement>(null)
  const isScrolling = React.useRef(false)
  const scrollTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const isDraggingEnabled = React.useRef(false)
  const touchStartY = React.useRef<number | null>(null)
  const touchStartElement = React.useRef<HTMLElement | null>(null)

  const handleSave = async () => {
    try {
      await onSave?.()
      onClose()
    } catch (err) {
      console.log('err', err)
    }
  }

  // Handle pointer/touch start to detect if it's from header
  const handlePointerDown = (e: React.PointerEvent | React.TouchEvent) => {
    if (!enableSwipeToClose || !headerRef.current || isScrolling.current) {
      isDraggingEnabled.current = false
      return
    }

    const target = e.target as HTMLElement
    touchStartElement.current = target

    // Check if touch started from header area
    const isFromHeader = headerRef.current.contains(target)

    // Store touch start position
    if ('touches' in e && e.touches[0]) {
      touchStartY.current = e.touches[0].clientY
    } else if ('clientY' in e) {
      touchStartY.current = e.clientY
    }

    isDraggingEnabled.current = isFromHeader
  }

  const handleDragStart = (
    event: MouseEvent | TouchEvent | PointerEvent
    // info: PanInfo
  ) => {
    // Check if drag started from header area
    if (!enableSwipeToClose || !headerRef.current || isScrolling.current) {
      isDraggingEnabled.current = false
      return
    }

    // Get the target element from the event
    const target = (event.target || (event as any).currentTarget) as HTMLElement

    // Check if drag started from header area
    const isFromHeader = headerRef.current.contains(target)

    // Store touch start position if available
    if (event instanceof TouchEvent && event.touches[0]) {
      touchStartY.current = event.touches[0].clientY
    } else if ('clientY' in event) {
      touchStartY.current = event.clientY
    }

    isDraggingEnabled.current = isFromHeader

    // If not from header, prevent drag
    if (!isFromHeader) {
      isDraggingEnabled.current = false
    }
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
    if (info.offset.y < 0) {
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
    touchStartY.current = null
    touchStartElement.current = null

    // Don't close if user was scrolling or drag wasn't enabled
    if (isScrolling.current || !isDraggingEnabled.current) {
      y.set(0)
      isDraggingEnabled.current = false
      return
    }

    const shouldClose =
      info.offset.y > SWIPE_THRESHOLD || info.velocity.y > VELOCITY_THRESHOLD

    if (shouldClose && enableSwipeToClose) {
      onClose()
    } else {
      // Reset position
      y.set(0)
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

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current)
      }
    }
  }, [])

  return (
    <React.Fragment>
      <Dialog
        fullScreen
        className={`${type === 'half' ? 'half-dialog' : 'full-dialog'} ${isDashboard ? 'dashboard' : ''}`}
        open={open}
        onClose={handleSave}
        sx={{
          // bottom: 20,

          '& .MuiDialog-paper': {
            height: type === 'half' ? '800px' : '100%',
            paddingBottom: isDashboard ? '0' : '1.5em',
            overflow: 'hidden',
            backgroundColor: 'transparent !important',
            // background: 'transparent !important',
            // left: isDashboard ? `${stylesVariables.dashboardDialogLeft}px` : '0',
            width: isDashboard
              ? `calc(100vw - ${stylesVariables.dashboardDialogLeft}px)`
              : '100%',

            marginLeft: isDashboard
              ? `${stylesVariables.dashboardDialogLeft}px`
              : '0',
          },
        }}
        slots={{
          transition: Transition,
        }}
        slotProps={{
          paper: {
            className: `slide-dialog ${prefs.isDarkMode ? 'dark-mode' : ''} ${
              prefs.favoriteColor || ''
            }`,
            style: {
              borderTopRightRadius: '10px',
              borderTopLeftRadius: '10px',
            },
          },
        }}
      >
        <motion.div
          drag={enableSwipeToClose ? 'y' : false}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.2}
          dragMomentum={false}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          style={{
            y,
            opacity,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            ref={headerRef}
            onPointerDown={handlePointerDown}
            onTouchStart={handlePointerDown}
            style={{
              touchAction: 'none', // Prevent scrolling on header
            }}
          >
            <AppBar sx={{ position: 'relative' }}>
              <Toolbar className={`${prefs.favoriteColor}`}>
                <CustomButton
                  isIcon={true}
                  icon={<CloseIcon />}
                  onClick={onClose}
                  tooltipTitle={t('common.close')}
                />
                <Typography
                  sx={{ ml: 2, flex: 1 }}
                  variant='h6'
                  component='div'
                >
                  {title ?? t('common.edit')}
                </Typography>
                <div className='slide-drag-handle'></div>
                {isLoading && (
                  <CircularProgress
                    size={20}
                    color='inherit'
                  />
                )}
              </Toolbar>
            </AppBar>
          </div>
          <div
            ref={contentRef}
            className='slide-dialog-content'
            onScroll={handleContentScroll}
            style={{
              flex: 1,
              overflow: 'auto',
              touchAction: 'pan-y',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {component}
          </div>
        </motion.div>
      </Dialog>
    </React.Fragment>
  )
}

// ALTERNATIVE IMPLEMENTATION 2: Using Native Touch Events
// This is a lightweight option with no additional dependencies

import * as React from 'react'
import Dialog from '@mui/material/Dialog'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CloseIcon from '@mui/icons-material/Close'
import Slide from '@mui/material/Slide'
import { TransitionProps } from '@mui/material/transitions'

import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import CircularProgress from '@mui/material/CircularProgress'
import DragHandleIcon from '@mui/icons-material/DragHandle'

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<unknown>
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />
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

const SWIPE_THRESHOLD = 100
// const VELOCITY_THRESHOLD = 0.5

export function SlideDialog({
  open,
  onClose,
  component,
  title = 'Edit',
  onSave,
  type = 'half',
  enableSwipeToClose = true,
}: SlideDialogProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const isLoading = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.isLoading
  )

  const [touchStart, setTouchStart] = React.useState<number | null>(null)
  const [touchEnd, setTouchEnd] = React.useState<number | null>(null)
  const [dragY, setDragY] = React.useState(0)
  const [isDragging, setIsDragging] = React.useState(false)

  const handleSave = async () => {
    try {
      await onSave?.()
      onClose()
    } catch (err) {
      console.log('err', err)
    }
  }

  const minSwipeDistance = SWIPE_THRESHOLD

  const onTouchStart = (e: React.TouchEvent) => {
    if (!enableSwipeToClose) return
    setTouchEnd(null)
    setTouchStart(e.touches[0].clientY)
    setIsDragging(true)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (!enableSwipeToClose || touchStart === null) return
    const currentY = e.touches[0].clientY
    const diff = currentY - touchStart
    if (diff > 0) {
      // Only allow downward swipes
      setDragY(diff)
    }
  }

  const onTouchEnd = () => {
    if (!enableSwipeToClose || touchStart === null || touchEnd === null) {
      setIsDragging(false)
      setDragY(0)
      return
    }

    const distance = touchStart - touchEnd
    const isDownSwipe = distance < -minSwipeDistance

    if (isDownSwipe) {
      onClose()
    }

    setIsDragging(false)
    setDragY(0)
    setTouchStart(null)
    setTouchEnd(null)
  }

  const onMouseDown = (e: React.MouseEvent) => {
    if (!enableSwipeToClose) return
    setTouchEnd(null)
    setTouchStart(e.clientY)
    setIsDragging(true)
  }

  const onMouseMove = (e: React.MouseEvent) => {
    if (!enableSwipeToClose || touchStart === null) return
    const diff = e.clientY - touchStart
    if (diff > 0) {
      setDragY(diff)
    }
  }

  const onMouseUp = () => {
    if (!enableSwipeToClose || touchStart === null) return

    if (dragY > minSwipeDistance) {
      onClose()
    }

    setIsDragging(false)
    setDragY(0)
    setTouchStart(null)
    setTouchEnd(null)
  }

  const opacity = isDragging ? Math.max(0.3, 1 - dragY / 300) : 1
  const transform = isDragging ? `translateY(${dragY}px)` : 'translateY(0)'

  return (
    <React.Fragment>
      <Dialog
        fullScreen
        className={`${type === 'half' ? 'half-dialog' : 'full-dialog'}`}
        open={open}
        onClose={handleSave}
        sx={{
          '& .MuiDialog-paper': {
            height: type === 'half' ? '800px' : '100%',
            paddingBottom: '1.5em',
            overflow: 'hidden',
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
          },
        }}
      >
        <div
          style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            opacity,
            transform,
            transition: isDragging ? 'none' : 'opacity 0.2s, transform 0.2s',
            touchAction: 'pan-y',
          }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          <AppBar sx={{ position: 'relative' }}>
            <Toolbar className={`${prefs.favoriteColor}`}>
              <IconButton
                edge="start"
                color="inherit"
                onClick={onClose}
                aria-label="close"
              >
                <CloseIcon sx={{ color: '#fff' }} />
              </IconButton>
              <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                {title}
              </Typography>
              <DragHandleIcon sx={{ color: '#fff' }} />
              {isLoading && <CircularProgress size={20} color="inherit" />}
            </Toolbar>
          </AppBar>
          <div
            className="slide-dialog-content"
            style={{ flex: 1, overflow: 'auto' }}
          >
            {component}
          </div>
        </div>
      </Dialog>
    </React.Fragment>
  )
}

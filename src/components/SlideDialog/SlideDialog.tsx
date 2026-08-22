import * as React from 'react'
import { useTranslation } from 'react-i18next'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import CloseIcon from '@mui/icons-material/Close'
import { animate, useTransform } from 'motion/react'
import { Sheet } from 'react-modal-sheet'

import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import CircularProgress from '@mui/material/CircularProgress'
import { stylesVariables } from '../../assets/config/styles.variables'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'
import { MarqueeText } from '../MarqueeText/MarqueeText'

interface SlideDialogProps {
  open: boolean
  onClose: () => void
  component: React.ReactElement
  title?: string
  onSave?: () => void
  type?: 'half' | 'full'
  enableSwipeToClose?: boolean
}

const SHEET_BASE_Z_INDEX = 1200
const DRAG_VELOCITY_THRESHOLD = 900
const DRAG_CLOSE_THRESHOLD = 0.35
const SHEET_EASE: [number, number, number, number] = [0.32, 0.72, 0, 1]
const SHEET_DURATION = 0.5
const DISMISS_MOVE_THRESHOLD = 8
const HORIZONTAL_LOCK_THRESHOLD = 10

let openSheetCount = 0
const escapeHandlers: Array<() => void> = []

function isPickerColumn(start: EventTarget | null) {
  if (!(start instanceof Element)) return false
  if (
    start.closest(
      '.buttons-container, .save-cancel-container, .MuiDialogActions-root, .custom-button-wrapper, button'
    )
  ) {
    return false
  }
  if (start.closest('.clock-picker-column, .clock-picker, .weight-picker')) {
    return true
  }
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  if (target instanceof HTMLTextAreaElement) return true
  if (target.isContentEditable) return true
  if (!(target instanceof HTMLInputElement)) return false
  return ![
    'button',
    'checkbox',
    'color',
    'file',
    'image',
    'radio',
    'reset',
    'submit',
  ].includes(target.type)
}

function isVerticallyScrollable(node: HTMLElement) {
  const { overflowY } = window.getComputedStyle(node)
  if (
    overflowY !== 'auto' &&
    overflowY !== 'scroll' &&
    overflowY !== 'overlay'
  ) {
    return false
  }
  return node.scrollHeight > node.clientHeight + 1
}

function isGestureFromTop(target: EventTarget | null, boundary: HTMLElement) {
  let node: HTMLElement | null =
    target instanceof HTMLElement
      ? target
      : target instanceof Node
      ? target.parentElement
      : null

  while (node && node !== boundary) {
    if (isVerticallyScrollable(node) && node.scrollTop > 1) return false
    node = node.parentElement
  }

  return boundary.scrollTop <= 1
}

function getTouchPoint(event: TouchEvent) {
  const touch = event.touches[0] || event.changedTouches[0]
  return { x: touch.clientX, y: touch.clientY }
}

function swallowNextClick() {
  const onClick = (event: Event) => {
    event.preventDefault()
    event.stopPropagation()
  }
  document.addEventListener('click', onClick, true)
  window.setTimeout(() => {
    document.removeEventListener('click', onClick, true)
  }, 400)
}

function useSlideDialogLayer(isOpen: boolean) {
  const [zIndex, setZIndex] = React.useState(SHEET_BASE_Z_INDEX)
  const handleSaveRef = React.useRef<() => void>(() => {})

  const setHandleSave = React.useCallback((handler: () => void) => {
    handleSaveRef.current = handler
  }, [])

  React.useLayoutEffect(() => {
    if (!isOpen) return

    openSheetCount += 1
    setZIndex(SHEET_BASE_Z_INDEX + openSheetCount * 10)

    const onEscape = () => {
      handleSaveRef.current()
    }
    escapeHandlers.push(onEscape)

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      event.stopPropagation()
      const topHandler = escapeHandlers[escapeHandlers.length - 1]
      if (topHandler === onEscape) {
        topHandler()
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      openSheetCount = Math.max(0, openSheetCount - 1)
      const handlerIndex = escapeHandlers.lastIndexOf(onEscape)
      if (handlerIndex >= 0) {
        escapeHandlers.splice(handlerIndex, 1)
      }
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen])

  return { zIndex, setHandleSave }
}

function useOverscrollDismiss({
  enabled,
  scroller,
  onClose,
  onDragActiveChange,
}: {
  enabled: boolean
  scroller: HTMLDivElement | null
  onClose: () => void
  onDragActiveChange: (isDragging: boolean) => void
}) {
  const { y, height } = Sheet.useContext()
  const onCloseRef = React.useRef(onClose)
  const onDragActiveChangeRef = React.useRef(onDragActiveChange)

  onCloseRef.current = onClose
  onDragActiveChangeRef.current = onDragActiveChange

  React.useEffect(() => {
    if (!enabled || !scroller) return

    let startX = 0
    let startY = 0
    let originSheetY = 0
    let lastY = 0
    let lastTime = 0
    let velocityY = 0
    let sheetHeight = 0
    let locked = false
    let dismissing = false
    const previousTouchAction = scroller.style.touchAction

    const reset = () => {
      locked = false
      dismissing = false
      scroller.style.touchAction = previousTouchAction
      onDragActiveChangeRef.current(false)
      window.removeEventListener('touchmove', onTouchMove, true)
      window.removeEventListener('touchend', onTouchEnd, true)
      window.removeEventListener('touchcancel', onTouchEnd, true)
      window.removeEventListener('mousemove', onMouseMove, true)
      window.removeEventListener('mouseup', onMouseUp, true)
    }

    const onMove = (clientX: number, clientY: number, event: Event) => {
      if (locked) return

      const offsetX = clientX - startX
      const offsetY = clientY - startY
      const now = performance.now()
      const dt = now - lastTime
      if (dt > 0) velocityY = ((clientY - lastY) / dt) * 1000
      lastY = clientY
      lastTime = now

      if (!dismissing) {
        if (
          Math.abs(offsetX) > HORIZONTAL_LOCK_THRESHOLD &&
          Math.abs(offsetX) > Math.abs(offsetY)
        ) {
          locked = true
          return
        }
        if (offsetY <= 0) return
        if (offsetY >= Math.abs(offsetX) && event.cancelable) {
          event.preventDefault()
        }
        if (offsetY <= DISMISS_MOVE_THRESHOLD) return

        dismissing = true
        scroller.style.touchAction = 'none'
        onDragActiveChangeRef.current(true)
      }

      if (event.cancelable) event.preventDefault()
      event.stopPropagation()
      y.set(Math.max(originSheetY + offsetY, 0))
    }

    const onEnd = () => {
      if (!dismissing) {
        reset()
        return
      }

      const currentY = y.get()
      const shouldClose =
        velocityY > DRAG_VELOCITY_THRESHOLD ||
        currentY > sheetHeight * DRAG_CLOSE_THRESHOLD

      swallowNextClick()
      onDragActiveChangeRef.current(false)

      if (shouldClose) {
        onCloseRef.current()
      } else {
        animate(y, 0, {
          type: 'tween',
          ease: SHEET_EASE,
          duration: SHEET_DURATION,
        })
      }

      locked = false
      dismissing = false
      scroller.style.touchAction = previousTouchAction
      window.removeEventListener('touchmove', onTouchMove, true)
      window.removeEventListener('touchend', onTouchEnd, true)
      window.removeEventListener('touchcancel', onTouchEnd, true)
      window.removeEventListener('mousemove', onMouseMove, true)
      window.removeEventListener('mouseup', onMouseUp, true)
    }

    const onTouchMove = (event: TouchEvent) => {
      const point = getTouchPoint(event)
      onMove(point.x, point.y, event)
    }

    const onTouchEnd = () => {
      onEnd()
    }

    const onMouseMove = (event: MouseEvent) => {
      onMove(event.clientX, event.clientY, event)
    }

    const onMouseUp = () => {
      onEnd()
    }

    const beginGesture = (
      clientX: number,
      clientY: number,
      target: EventTarget | null
    ) => {
      if (isPickerColumn(target)) return false
      if (!isGestureFromTop(target, scroller)) return false

      const container = scroller.closest(
        '.react-modal-sheet-container'
      ) as HTMLElement | null
      startX = clientX
      startY = clientY
      lastY = clientY
      lastTime = performance.now()
      velocityY = 0
      originSheetY = y.get()
      sheetHeight = height || container?.offsetHeight || window.innerHeight
      locked = false
      dismissing = false
      return true
    }

    const onTouchStart = (event: TouchEvent) => {
      const point = getTouchPoint(event)
      if (!beginGesture(point.x, point.y, event.target)) return

      window.addEventListener('touchmove', onTouchMove, {
        capture: true,
        passive: false,
      })
      window.addEventListener('touchend', onTouchEnd, { capture: true })
      window.addEventListener('touchcancel', onTouchEnd, { capture: true })
    }

    const onMouseDown = (event: MouseEvent) => {
      if (event.button !== 0) return
      if (isEditableTarget(event.target)) return
      if (!beginGesture(event.clientX, event.clientY, event.target)) return

      window.addEventListener('mousemove', onMouseMove, true)
      window.addEventListener('mouseup', onMouseUp, true)
    }

    scroller.addEventListener('touchstart', onTouchStart, {
      capture: true,
      passive: true,
    })
    scroller.addEventListener('mousedown', onMouseDown, true)

    return () => {
      reset()
      scroller.removeEventListener('touchstart', onTouchStart, true)
      scroller.removeEventListener('mousedown', onMouseDown, true)
    }
  }, [enabled, height, scroller, y])
}

function SlideDialogSheet({
  onClose,
  component,
  title,
  isDragging,
  enableSwipeToClose,
  prefs,
  isLoading,
  onDragActiveChange,
}: {
  onClose: () => void
  component: React.ReactElement
  title?: string
  isDragging: boolean
  enableSwipeToClose: boolean
  prefs: RootState['systemModule']['prefs']
  isLoading: boolean
  onDragActiveChange: (isDragging: boolean) => void
}) {
  const { t } = useTranslation()
  const { y } = Sheet.useContext()
  const scrollerNode = React.useRef<HTMLDivElement | null>(null)
  const [scroller, setScroller] = React.useState<HTMLDivElement | null>(null)
  const dragOpacity = useTransform(y, [0, 480], [1, 0.35])

  const scrollerRef = React.useMemo(
    () => ({
      get current() {
        return scrollerNode.current
      },
      set current(node: HTMLDivElement | null) {
        scrollerNode.current = node
        setScroller(node)
      },
    }),
    []
  )

  useOverscrollDismiss({
    enabled: enableSwipeToClose,
    scroller,
    onClose,
    onDragActiveChange,
  })

  return (
    <Sheet.Container
      className={`slide-dialog MuiPaper-root MuiDialog-paper ${
        prefs.isDarkMode ? 'dark-mode' : ''
      } ${prefs.favoriteColor || ''}`}
      style={{ opacity: isDragging ? dragOpacity : 1 }}
    >
      <Sheet.Header className='slide-dialog-header'>
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar className={`${prefs.favoriteColor}`}>
            <CustomButton
              isIcon={true}
              icon={<CloseIcon />}
              onClick={onClose}
              tooltipTitle={t('common.close')}
            />
            <MarqueeText
              sx={{ marginInlineStart: 2, flex: 1 }}
              variant='h6'
              component='div'
            >
              {title ?? t('common.edit')}
            </MarqueeText>
            <div className='slide-drag-handle'></div>
            {isLoading && (
              <CircularProgress
                size={20}
                color='inherit'
              />
            )}
          </Toolbar>
        </AppBar>
      </Sheet.Header>
      <Sheet.Content
        disableDrag
        className='slide-dialog-body'
        scrollRef={scrollerRef}
        scrollClassName={`slide-dialog-content ${
          prefs.isDarkMode ? 'dark-mode' : ''
        }`}
      >
        <div className='slide-dialog-body-inner'>{component}</div>
      </Sheet.Content>
    </Sheet.Container>
  )
}

export function SlideDialog({
  open,
  onClose,
  component,
  title,
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

  const isDashboard = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.isDashboard
  )

  const { zIndex, setHandleSave } = useSlideDialogLayer(open)
  const [isMounted, setIsMounted] = React.useState(open)
  const [isDragging, setIsDragging] = React.useState(false)

  if (open && !isMounted) {
    setIsMounted(true)
  }

  const handleSave = React.useCallback(async () => {
    try {
      await onSave?.()
      onClose()
    } catch (err) {
      console.log('err', err)
    }
  }, [onSave, onClose])

  React.useEffect(() => {
    setHandleSave(() => {
      void handleSave()
    })
  }, [handleSave, setHandleSave])

  if (!open && !isMounted) return null

  return (
    <Sheet
      unstyled
      isOpen={open}
      onClose={onClose}
      onCloseEnd={() => {
        if (!open) setIsMounted(false)
      }}
      disableDrag={!enableSwipeToClose}
      disableDismiss={!enableSwipeToClose}
      detent={type === 'full' ? 'full' : 'default'}
      dragVelocityThreshold={DRAG_VELOCITY_THRESHOLD}
      dragCloseThreshold={DRAG_CLOSE_THRESHOLD}
      tweenConfig={{ ease: SHEET_EASE, duration: SHEET_DURATION }}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      className={`MuiDialog-root MuiDialog-container ${
        type === 'half' ? 'half-dialog' : 'full-dialog'
      } ${isDashboard ? 'dashboard' : ''}`}
      style={{
        zIndex,
        ...(isDashboard
          ? ({
              '--slide-dialog-dashboard-inset': `${stylesVariables.dashboardDialogLeft}px`,
            } as React.CSSProperties)
          : {}),
      }}
    >
      <SlideDialogSheet
        onClose={onClose}
        component={component}
        title={title}
        isDragging={isDragging}
        enableSwipeToClose={enableSwipeToClose}
        prefs={prefs}
        isLoading={isLoading}
        onDragActiveChange={setIsDragging}
      />
      <Sheet.Backdrop
        unstyled={false}
        className='slide-dialog-backdrop'
        onTap={() => {
          void handleSave()
        }}
      />
    </Sheet>
  )
}

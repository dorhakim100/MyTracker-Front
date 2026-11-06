import {
  Children,
  cloneElement,
  isValidElement,
  useRef,
  type ForwardRefExoticComponent,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
  type RefAttributes,
} from 'react'
import TableRow from '@mui/material/TableRow'
import TouchRippleBase, {
  type TouchRippleActions,
  type TouchRippleProps,
} from '@mui/material/ButtonBase/TouchRipple'

// MUI's .d.ts types the inner render function. The runtime export is forwardRef.
const TouchRipple = TouchRippleBase as unknown as ForwardRefExoticComponent<
  TouchRippleProps & RefAttributes<TouchRippleActions>
>

type RippleHostProps = {
  className?: string
  children?: ReactNode
  onPointerDown?: (event: PointerEvent<HTMLElement>) => void
  onPointerUp?: (event: PointerEvent<HTMLElement>) => void
  onPointerLeave?: (event: PointerEvent<HTMLElement>) => void
  onPointerCancel?: (event: PointerEvent<HTMLElement>) => void
}

interface PressRippleProps {
  children: ReactElement
  className?: string
  isDisabled?: boolean
}

function placeRippleInFirstCell(cells: ReactNode, ripple: ReactNode) {
  const items = Children.toArray(cells)
  const index = items.findIndex((item) => isValidElement(item))
  if (index === -1) return items

  const cell = items[index] as ReactElement<RippleHostProps>
  items[index] = cloneElement(cell, {
    className: `${cell.props.className || ''} press-ripple-cell`.trim(),
    children: (
      <>
        <span className='press-ripple-overlay'>{ripple}</span>
        {cell.props.children}
      </>
    ),
  })
  return items
}

export function PressRipple({
  children,
  className = '',
  isDisabled = false,
}: PressRippleProps) {
  const rippleRef = useRef<TouchRippleActions>(null)
  const childProps = children.props as RippleHostProps
  const isRow = children.type === 'tr' || children.type === TableRow

  if (isDisabled) return children

  const start = (event: PointerEvent<HTMLElement>) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const overlay = event.currentTarget.querySelector('.press-ripple-overlay')
    if (overlay instanceof HTMLElement) {
      overlay.style.width = `${event.currentTarget.getBoundingClientRect().width}px`
    }
    rippleRef.current?.start(event)
  }

  const ripple = <TouchRipple ref={rippleRef} />

  return cloneElement(children, {
    className: `${childProps.className || ''} ${
      isRow ? 'press-ripple-row' : 'press-ripple'
    } ${className}`.trim(),
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      start(event)
      childProps.onPointerDown?.(event)
    },
    onPointerUp: (event: PointerEvent<HTMLElement>) => {
      rippleRef.current?.stop()
      childProps.onPointerUp?.(event)
    },
    onPointerLeave: (event: PointerEvent<HTMLElement>) => {
      rippleRef.current?.stop()
      childProps.onPointerLeave?.(event)
    },
    onPointerCancel: (event: PointerEvent<HTMLElement>) => {
      rippleRef.current?.stop()
      childProps.onPointerCancel?.(event)
    },
    children: isRow ? (
      placeRippleInFirstCell(childProps.children, ripple)
    ) : (
      <>
        {ripple}
        {childProps.children}
      </>
    ),
  } as RippleHostProps)
}

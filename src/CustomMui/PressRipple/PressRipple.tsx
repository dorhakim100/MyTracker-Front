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

const COLOR_CLASSES = [
  'primary',
  'blue',
  'yellow',
  'red',
  'orange',
  'green',
  'deepPurple',
  'purple',
  'pink',
]

type Rgb = { r: number; g: number; b: number }

function readRgb(value: string): Rgb | null {
  const hex = value.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)
  if (hex) {
    const raw = hex[1]
    const full =
      raw.length === 3
        ? raw
            .split('')
            .map((char) => char + char)
            .join('')
        : raw
    return {
      r: parseInt(full.slice(0, 2), 16),
      g: parseInt(full.slice(2, 4), 16),
      b: parseInt(full.slice(4, 6), 16),
    }
  }

  const match = value.match(
    /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+)(%?))?/
  )
  if (!match) return null

  let alpha = match[4] === undefined ? 1 : Number(match[4])
  if (match[5] === '%') alpha /= 100
  if (alpha < 0.2) return null

  return {
    r: Number(match[1]),
    g: Number(match[2]),
    b: Number(match[3]),
  }
}

function rgbToHsl({ r, g, b }: Rgb) {
  const red = r / 255
  const green = g / 255
  const blue = b / 255
  const max = Math.max(red, green, blue)
  const min = Math.min(red, green, blue)
  const lightness = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l: lightness }

  const delta = max - min
  const saturation =
    lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min)
  let hue = 0
  if (max === red) hue = (green - blue) / delta + (green < blue ? 6 : 0)
  else if (max === green) hue = (blue - red) / delta + 2
  else hue = (red - green) / delta + 4

  return { h: hue / 6, s: saturation, l: lightness }
}

function hslToRgb(h: number, s: number, l: number): Rgb {
  if (s === 0) {
    const tone = Math.round(l * 255)
    return { r: tone, g: tone, b: tone }
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  const channel = (amount: number) => {
    let t = amount
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }

  return {
    r: Math.round(channel(h + 1 / 3) * 255),
    g: Math.round(channel(h) * 255),
    b: Math.round(channel(h - 1 / 3) * 255),
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function rgbCss({ r, g, b }: Rgb) {
  return `rgb(${r}, ${g}, ${b})`
}

function resolveColor(el: HTMLElement, expression: string) {
  const parent =
    el.tagName === 'TR'
      ? el.querySelector('td, th') instanceof HTMLElement
        ? (el.querySelector('td, th') as HTMLElement)
        : document.body
      : el
  const probe = document.createElement('span')
  probe.style.cssText = `position:absolute;width:0;height:0;overflow:hidden;pointer-events:none;color:${expression}`
  parent.appendChild(probe)
  const color = readRgb(getComputedStyle(probe).color)
  probe.remove()
  return color
}

function nearestColorClass(start: Element, host: HTMLElement) {
  let node: Element | null = start
  while (node) {
    if (node instanceof HTMLElement) {
      const element = node
      if (COLOR_CLASSES.some((name) => element.classList.contains(name))) {
        return element
      }
    }
    if (node === host) return null
    node = node.parentElement
  }
  return null
}

function chromaticPaint(start: Element, host: HTMLElement) {
  let node: Element | null = start
  while (node) {
    const style = getComputedStyle(node)
    const foreground = readRgb(style.color)
    if (foreground && rgbToHsl(foreground).s >= 0.22) return foreground
    const background = readRgb(style.backgroundColor)
    if (background && rgbToHsl(background).s >= 0.28) return background
    if (node === host) return null
    node = node.parentElement
  }
  return null
}

const FALLBACK_PIGMENT: Rgb = { r: 0, g: 150, b: 136 }

function surfaceOf(start: Element): Rgb {
  let node: Element | null = start
  while (node) {
    const background = readRgb(getComputedStyle(node).backgroundColor)
    if (background) return background
    node = node.parentElement
  }
  return { r: 255, g: 255, b: 255 }
}

// Keep the element's hue and lift saturation just enough to read.
// Lightness stays near the pigment so the wash tints instead of glowing.
function vividRippleColor(start: Element, host: HTMLElement) {
  const colored = nearestColorClass(start, host)
  const pigment =
    (colored && resolveColor(colored, 'var(--accent)')) ||
    chromaticPaint(start, host) ||
    resolveColor(host, 'var(--accent)') ||
    readRgb(getComputedStyle(host).color) ||
    FALLBACK_PIGMENT

  const { h, s, l } = rgbToHsl(pigment)
  const surfaceLight = rgbToHsl(surfaceOf(host)).l
  if (s < 0.08) {
    const tone = surfaceLight > 0.55 ? 0.28 : 0.86
    return rgbCss(hslToRgb(0, 0, tone))
  }

  const saturation = clamp(s * 0.075 + 0.55, 0.58, 0.72)
  const lightness =
    surfaceLight > 0.55
      ? clamp(l * 0.4 + 0.26, 0.36, 0.46)
      : clamp(l * 0.55 + 0.28, 0.36, 0.46)
  return rgbCss(hslToRgb(h, saturation, lightness))
}

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
      overlay.style.width = `${
        event.currentTarget.getBoundingClientRect().width
      }px`
    }
    const pressed =
      event.target instanceof Element ? event.target : event.currentTarget
    event.currentTarget.style.setProperty(
      '--press-ripple-color',
      vividRippleColor(pressed, event.currentTarget)
    )
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

import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type SyntheticEvent,
} from 'react'
import {
  rememberedTab,
  rememberTab,
  subscribeTabFocus,
  tabFocusKey,
} from './tab-focus'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { capacitorService } from '../../services/capacitor.service'
import { SlideAnimation } from '../../components/SlideAnimation/SlideAnimation'

type TabMarkProps = HTMLAttributes<HTMLSpanElement> & {
  ownerState?: unknown
}

function markOffset(style?: CSSProperties) {
  if (!style || typeof style.width !== 'number') return null
  if (typeof style.left === 'number') {
    return { edge: 'left' as const, shift: style.left }
  }
  if (typeof style.right === 'number') {
    return { edge: 'right' as const, shift: -style.right }
  }
  return null
}

const TabMark = forwardRef<HTMLSpanElement, TabMarkProps>(function TabMark(
  { style, className, ownerState: _ownerState, ...rest },
  ref
) {
  const offset = markOffset(style)
  const [ready, setReady] = useState(false)
  const shift = offset?.shift

  useEffect(() => {
    if (ready || shift == null) return
    setReady(true)
  }, [ready, shift])

  const placed: CSSProperties | undefined = offset
    ? {
        ...style,
        left: offset.edge === 'left' ? 0 : style?.left,
        right: offset.edge === 'right' ? 0 : style?.right,
        transform: `translate3d(${offset.shift}px, 0, 0)`,
      }
    : style

  return (
    <span
      ref={ref}
      {...rest}
      className={`${className || ''} ${ready ? 'is-placed' : ''}`.trim()}
      style={placed}
    />
  )
})

export interface CustomTabOption<T extends string = string> {
  value: T
  label: string
  icon?: ReactElement | string
  disabled?: boolean
  ariaLabel?: string
}

export interface CustomTabsProps<T extends string = string> {
  value: T
  options: CustomTabOption<T>[]
  onChange: (value: T) => void
  className?: string
  ariaLabel?: string
  variant?: 'standard' | 'fullWidth' | 'scrollable'
  centered?: boolean
  size?: 'slim' | 'fat'
  disableAnimation?: boolean
  panelClassName?: string
  children?: ReactNode
}

export function CustomTabs<T extends string = string>({
  value,
  options,
  onChange,
  className,
  ariaLabel = 'tabs',
  variant = 'standard',
  centered = false,
  size,
  disableAnimation = false,
  panelClassName,
  children,
}: CustomTabsProps<T>) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )
  const isScrollable = variant === 'scrollable'
  const focusKey = tabFocusKey(options)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  function savedOption() {
    const saved = rememberedTab(focusKey)
    if (!saved || saved === value) return null
    return options.find((option) => option.value === saved) || null
  }

  useEffect(() => {
    if (!options.length) return
    if (options.some((option) => option.value === value)) return
    onChangeRef.current(options[0].value)
  }, [options, value])

  useEffect(
    () =>
      subscribeTabFocus(() => {
        const match = savedOption()
        if (!match) return
        onChangeRef.current(match.value)
      }),
    [focusKey, options, value]
  )

  function onTabChange(_event: SyntheticEvent, next: T) {
    rememberTab(focusKey, next)
    onChange(next)
    capacitorService.vibrate('Light').catch(() => {})
  }

  const bar = (
    <div
      className={`custom-tabs-container ${prefs.favoriteColor || ''} ${
        size || ''
      } ${className || ''}`}
    >
      <Tabs
        className='custom-tabs'
        value={value}
        onChange={onTabChange}
        aria-label={ariaLabel}
        variant={variant}
        centered={variant === 'standard' && centered}
        textColor='inherit'
        scrollButtons={isScrollable ? 'auto' : false}
        allowScrollButtonsMobile={isScrollable}
        slotProps={{ indicator: { component: TabMark } }}
        sx={{ '& .MuiTab-root': { textTransform: 'none' } }}
      >
        {options.map((option) => (
          <Tab
            key={option.value}
            className='press-ripple bold-header'
            value={option.value}
            label={option.label}
            icon={option.icon}
            iconPosition={option.icon ? 'start' : 'top'}
            disabled={option.disabled}
            aria-label={option.ariaLabel || option.label}
          />
        ))}
      </Tabs>
    </div>
  )

  if (children == null) return bar

  return (
    <>
      {bar}
      <CustomTabPanel
        value={value}
        options={options}
        disableAnimation={disableAnimation}
        className={panelClassName}
      >
        {children}
      </CustomTabPanel>
    </>
  )
}

function useTabDirection(value: string, options: { value: string }[]) {
  const [slide, setSlide] = useState({ direction: 1, value })

  if (slide.value !== value) {
    const previousIndex = options.findIndex(
      (option) => option.value === slide.value
    )
    const nextIndex = options.findIndex((option) => option.value === value)
    setSlide({
      direction: nextIndex >= previousIndex ? 1 : -1,
      value,
    })
  }

  return slide.direction
}

export function CustomTabPanel({
  value,
  options,
  disableAnimation = false,
  className,
  children,
}: {
  value: string
  options: { value: string }[]
  disableAnimation?: boolean
  className?: string
  children: ReactNode
}) {
  const direction = useTabDirection(value, options)

  if (disableAnimation) return children

  return (
    <SlideAnimation
      motionKey={value}
      direction={direction}
      className={className}
    >
      {children}
    </SlideAnimation>
  )
}

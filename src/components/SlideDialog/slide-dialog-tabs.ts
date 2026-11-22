import { createContext, useContext, useEffect } from 'react'
import type { CustomTabsProps } from '../../CustomMui/CustomTabs/CustomTabs'

export type SlideDialogTabs = Omit<CustomTabsProps, 'value' | 'onChange'> & {
  value?: string
  onChange?: (value: string) => void
}

export const SlideDialogTabsContext = createContext<
  ((tabs: SlideDialogTabs | null) => void) | null
>(null)

export function useSlideDialogTabs(tabs: SlideDialogTabs | null) {
  const setTabs = useContext(SlideDialogTabsContext)

  useEffect(() => {
    setTabs?.(tabs)
  }, [setTabs, tabs])

  useEffect(() => {
    return () => setTabs?.(null)
  }, [setTabs])
}

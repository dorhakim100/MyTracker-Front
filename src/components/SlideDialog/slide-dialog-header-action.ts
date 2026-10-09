import { createContext, useContext, useEffect, type ReactNode } from 'react'

export const SlideDialogHeaderActionContext = createContext<
  ((action: ReactNode) => void) | null
>(null)

// Lets sheet content place a control in the header. Scoped to the nearest
// dialog, so a sheet opened from within keeps its own action.
export function useSlideDialogHeaderAction(action: ReactNode) {
  const setAction = useContext(SlideDialogHeaderActionContext)

  useEffect(() => {
    setAction?.(action)
    return () => setAction?.(null)
  }, [setAction, action])
}

import { createContext, useContext, useEffect } from 'react'

export const SlideDialogTitleContext = createContext<
  ((title: string | null) => void) | null
>(null)

// Lets a sheet's content rename the header as it navigates. Scoped to the
// nearest dialog, so a sheet opened from within keeps its own title.
export function useSlideDialogTitle(title: string | null) {
  const setTitle = useContext(SlideDialogTitleContext)

  useEffect(() => {
    setTitle?.(title)
    return () => setTitle?.(null)
  }, [setTitle, title])
}

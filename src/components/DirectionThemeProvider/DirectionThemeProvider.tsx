import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { RootState } from '../../store/store'

interface DirectionThemeProviderProps {
  children: React.ReactNode
}

/**
 * Provides theme direction (RTL/LTR) based on app language.
 * Wraps the app so MUI components mirror correctly when Hebrew is selected.
 */
export function DirectionThemeProvider({ children }: DirectionThemeProviderProps) {
  const lang = useSelector(
    (state: RootState) => state.systemModule.prefs.lang
  )

  const theme = useMemo(
    () =>
      createTheme({
        direction: lang === 'he' ? 'rtl' : 'ltr',
      }),
    [lang]
  )

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>
}

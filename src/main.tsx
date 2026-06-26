import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { Provider } from 'react-redux'

import { CssVarsProvider } from '@mui/material/styles'

import { store } from './store/store'
import { DirectionThemeProvider } from './components/DirectionThemeProvider/DirectionThemeProvider'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/react-query/queryClient'

import './i18n'
import './index.css'
import '@ionic/react/css/normalize.css'
import '@ionic/react/css/core.css'
import '@ionic/react/css/padding.css'
import './assets/styles/main.scss'

import App from './App.tsx'
import { GoogleAuthCallback } from './pages/GoogleAuthCallback/GoogleAuthCallback.tsx'



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
      <Router>
        <CssVarsProvider>
          <DirectionThemeProvider>
            <link
              rel='stylesheet'
              href='https://fonts.googleapis.com/icon?family=Material+Icons'
            />
            <Routes>
              <Route
                path='/auth/google/callback'
                element={<GoogleAuthCallback />}
              />
              <Route path='/*' element={<App />} />
            </Routes>
          </DirectionThemeProvider>
        </CssVarsProvider>
      </Router>
      </QueryClientProvider>
    </Provider>
  </StrictMode>
)

import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Routes, Route, useLocation } from 'react-router'

import { routes } from './assets/routes/routes'

import { smoothScroll, getRoutes } from './services/util.service'

import { AppHeader } from './components/AppHeader/AppHeader'
import { AppFooter } from './components/AppFooter/AppFooter.tsx'
import { Prefs } from './components/Prefs/Prefs'
import { PrefsButton } from './components/PrefsButton/PrefsButton.tsx'

import { FixedBottomNavigation } from './CustomMui/BottomNavigation/FixedBottomNavigation.tsx'

import { RootState } from './store/store.ts'

import './App.css'
import { SearchBar } from './components/SearchBar/SearchBar.tsx'

function App() {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const user = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.user
  )

  const filteredRoutes = getRoutes(routes, user)

  const location = useLocation()

  useEffect(() => {
    if (prefs.isDarkMode) {
      document.body.classList.add('dark-mode')
    } else {
      document.body.classList.remove('dark-mode')
    }
  }, [prefs])

  useEffect(() => {
    smoothScroll()
  }, [location.pathname])

  return (
    <>
      <AppHeader routes={routes} />
      <Prefs />
      {/* <PrefsButton /> */}
      <main className={`main ${prefs.isDarkMode ? 'dark-mode' : ''}`}>
        <SearchBar />
        <Routes>
          {filteredRoutes.map((route, index) => (
            <Route key={index} path={route.path} element={<route.element />} />
          ))}
        </Routes>
      </main>
      <AppFooter />
      <FixedBottomNavigation routes={filteredRoutes} />
    </>
  )
}

export default App

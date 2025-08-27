import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Routes, Route, useLocation } from 'react-router'

import { routes } from './assets/routes/routes'

import { smoothScroll, getRoutes } from './services/util.service'

import { AppHeader } from './components/AppHeader/AppHeader'
import { Prefs } from './components/Prefs/Prefs'
import { UserMsg } from './components/UserMsg/UserMsg'

import { FixedBottomNavigation } from './CustomMui/BottomNavigation/FixedBottomNavigation.tsx'

import { RootState } from './store/store.ts'

import './App.css'
import { setRemembered } from './store/actions/user.actions.ts'

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

  useEffect(() => {
    setRemembered()
  }, [])

  return (
    <>
      <AppHeader routes={filteredRoutes} />
      <UserMsg />
      <Prefs />
      {/* <PrefsButton /> */}
      <main className={`main ${prefs.isDarkMode ? 'dark-mode' : ''}`}>
        {/* <SearchBar /> */}
        <Routes>
          {filteredRoutes.map((route, index) => (
            <Route key={index} path={route.path} element={<route.element />} />
          ))}
        </Routes>
      </main>

      <FixedBottomNavigation routes={filteredRoutes} />
    </>
  )
}

export default App

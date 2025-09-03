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
import { loadPrefs } from './store/actions/system.actions.ts'

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

    _handleManifest()
  }, [location.pathname])

  useEffect(() => {
    setRemembered()
  }, [])

  useEffect(() => {
    loadPrefs()
  }, [])

  function _handleManifest() {
    const manifest = document.querySelector<HTMLLinkElement>('#pwa-manifest')
    if (!manifest) return
    switch (location.pathname) {
      case '/diary':
        manifest.href = '/manifest-diary.json'
        break
      case '/progress':
        manifest.href = '/manifest-progress.json'
        break
      case '/signin':
        manifest.href = '/manifest-signin.json'
        break
      case '/user':
        manifest.href = '/manifest-user.json'
        break
      default:
        manifest.href = '/manifest.json'
        break
    }
  }

  return (
    <>
      <AppHeader />
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

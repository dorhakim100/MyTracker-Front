import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Routes, Route, useLocation } from 'react-router'

import { usePwaDetect } from './hooks/usePwaDetect.tsx'

import { routes } from './assets/routes/routes'

import { smoothScroll, getRoutes } from './services/util.service'

import { AppHeader } from './components/AppHeader/AppHeader'
import { Prefs } from './components/Prefs/Prefs'
import { UserMsg } from './components/UserMsg/UserMsg'

import { FixedBottomNavigation } from './CustomMui/BottomNavigation/FixedBottomNavigation.tsx'
import { SlideAnimation } from './components/SlideAnimation/SlideAnimation.tsx'

import { RootState } from './store/store.ts'

import './App.css'
import { handleFirstGoal, setRemembered } from './store/actions/user.actions.ts'
import { setFavoriteItems } from './store/actions/item.actions.ts'
import { loadPrefs } from './store/actions/system.actions.ts'
import { SignIn } from './CustomMui/SignIn/SignIn.tsx'
import { searchService } from './services/search/search-service.ts'
import { EditGoal } from './components/EditGoal/EditGoal.tsx'
import { ScreenLoader } from './components/ScreenLoader/ScreenLoader.tsx'
import { getDefaultsPrefs } from './services/system/system.service.ts'
import { PwaInstall } from './pages/PwaInstall/PwaInstall.tsx'

const colors = [
  'primary',
  'blue',
  'red',
  'yellow',
  'green',
  'orange',
  'deepPurple',
  'purple',
  'pink',
]

function App() {
  const {
    isPwaInstalled,
    isInstallable,
    promptInstall,
    shouldShowInstallGuide,
    platform,
  } = usePwaDetect()

  useEffect(() => {
    console.log('isPwaInstalled', isPwaInstalled)
    console.log('isInstallable', isInstallable)
    console.log('shouldShowInstallGuide', shouldShowInstallGuide)
    console.log('platform', platform)
  }, [platform])

  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const user = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.user
  )

  const slideDirection = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.slideDirection
  )

  const isFirstLoading = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.isFirstLoading
  )

  const filteredRoutes = getRoutes(routes, user)

  const location = useLocation()

  useEffect(() => {
    const defaultPrefs = getDefaultsPrefs()
    if (prefs.isDarkMode) {
      document.body.classList.add('dark-mode')
    } else {
      document.body.classList.remove('dark-mode')
    }
    document.body.classList.remove(...colors)

    document.body.classList.add(
      prefs.favoriteColor || defaultPrefs.favoriteColor
    )
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

  useEffect(() => {
    const loadFavoriteItems = async () => {
      const favoriteIDs = user?.favoriteItems
      if (!favoriteIDs || !favoriteIDs.length) return
      const favoriteItems = await searchService.searchFavoriteItems(
        favoriteIDs || []
      )

      setFavoriteItems(favoriteItems)
    }
    loadFavoriteItems()
  }, [user])

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

  if (shouldShowInstallGuide) {
    return <PwaInstall />
  }

  if (isFirstLoading) return <ScreenLoader />

  if ((user && !user.currGoal) || (user && !user.goals.length)) {
    return (
      <>
        <UserMsg />
        <main className={`main ${prefs.isDarkMode ? 'dark-mode' : ''}`}>
          <AppHeader />
          <div className=''>
            <EditGoal saveGoal={(goal) => handleFirstGoal(goal, user)} />
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <AppHeader />
      <UserMsg />
      <Prefs />
      {/* <PrefsButton /> */}

      <main
        className={`main ${prefs.isDarkMode ? 'dark-mode' : ''} ${
          user ? '' : 'no-user'
        }`}
      >
        <SlideAnimation
          motionKey={location.pathname}
          direction={slideDirection}
          duration={0.25}
        >
          {!user ? (
            <div className='page-container login-sign-up-container'>
              <SignIn />
            </div>
          ) : (
            <Routes location={location} key={location.pathname}>
              {filteredRoutes.map((route, index) => (
                <Route
                  key={index}
                  path={route.path}
                  element={<route.element />}
                />
              ))}
            </Routes>
          )}
        </SlideAnimation>
      </main>

      {user && <FixedBottomNavigation routes={filteredRoutes} />}
    </>
  )
}

export default App

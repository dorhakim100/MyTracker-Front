import { useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { Routes, Route, useLocation } from 'react-router'

import { usePwaDetect } from './hooks/usePwaDetect.tsx'

import { routes } from './assets/routes/routes'

import { smoothScroll } from './services/util.service'

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
import { TraineeUserCard } from './components/TraineeUserCard/TraineeUserCard.tsx'

const isProd = import.meta.env.PROD

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
  const { shouldShowInstallGuide, promptInstall, platform, isInstallable } =
    usePwaDetect()

  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const user = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.user
  )

  const traineeUser = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.traineeUser
  )

  const slideDirection = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.slideDirection
  )

  const isFirstLoading = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.isFirstLoading
  )

  const filteredRoutes = useMemo(() => {
    if (user) {
      return routes.filter((route) => route.path !== '/signin')
    }

    return routes
  }, [user?._id])

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

    const manifest = document.querySelector<HTMLLinkElement>('#pwa-manifest')
    if (manifest) {
      let desiredHref = '/manifest.json'
      switch (location.pathname) {
        case '/diary':
          desiredHref = '/manifest-diary.json'
          break
        case '/progress':
          desiredHref = '/manifest-progress.json'
          break
        case '/signin':
          desiredHref = '/manifest-signin.json'
          break
        case '/user':
          desiredHref = '/manifest-user.json'
          break
        default:
          desiredHref = '/manifest.json'
          break
      }
      if (!manifest.href.endsWith(desiredHref)) {
        manifest.href = desiredHref
      }
    }
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

  if (shouldShowInstallGuide && isProd) {
    return (
      <main className={`main ${prefs.isDarkMode ? 'dark-mode' : ''}`}>
        {/* <AppHeader /> */}
        <div className="">
          <PwaInstall
            promptInstall={promptInstall}
            platform={platform}
            isInstallable={isInstallable}
          />
        </div>
      </main>
    )
  }

  if (isFirstLoading) return <ScreenLoader />

  if ((user && !user.currGoal) || (user && !user.goals.length)) {
    return (
      <>
        <UserMsg />
        <main className={`main ${prefs.isDarkMode ? 'dark-mode' : ''}`}>
          {/* <AppHeader /> */}
          <div className="first-time-edit-goal-container">
            <EditGoal saveGoal={(goal) => handleFirstGoal(goal, user)} />
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      {/* <AppHeader /> */}
      <UserMsg />
      <Prefs />

      {traineeUser && <TraineeUserCard />}

      {/* <PrefsButton /> */}

      <main
        className={`main ${prefs.isDarkMode ? 'dark-mode' : ''} ${
          user ? '' : 'no-user'
        } ${prefs.favoriteColor || ''}`}
      >
        <SlideAnimation
          motionKey={location.pathname}
          direction={slideDirection}
          duration={0.25}
        >
          {!user ? (
            <div className="page-container login-sign-up-container">
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

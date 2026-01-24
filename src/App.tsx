import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'

import { usePwaDetect } from './hooks/usePwaDetect.tsx'

import { routes } from './assets/routes/routes'

import { smoothScroll } from './services/util.service'

import { Prefs } from './components/Prefs/Prefs'
import { UserMsg } from './components/UserMsg/UserMsg'

import { FixedBottomNavigation } from './CustomMui/BottomNavigation/FixedBottomNavigation.tsx'
import { SlideAnimation } from './components/SlideAnimation/SlideAnimation.tsx'

import { RootState } from './store/store.ts'

import { setRemembered } from './store/actions/user.actions.ts'
import { setFavoriteItems } from './store/actions/item.actions.ts'
import {
  loadPrefs,
  setIsNative,
  setIsDashboard,
} from './store/actions/system.actions.ts'
import { SignIn } from './CustomMui/SignIn/SignIn.tsx'
import { searchService } from './services/search/search-service.ts'
import { FirstGoalEdit } from './components/FirstGoalEdit/FirstGoalEdit.tsx'
import { ScreenLoader } from './components/ScreenLoader/ScreenLoader.tsx'
import { getDefaultsPrefs } from './services/system/system.service.ts'
import { PwaInstall } from './pages/PwaInstall/PwaInstall.tsx'
import { TraineeUserCard } from './components/TraineeUserCard/TraineeUserCard.tsx'
import { AppHeader } from './components/AppHeader/AppHeader.tsx'
import { Timer } from './components/Timer/Timer.tsx'
import { Capacitor } from '@capacitor/core'
import { TrainerDashboard } from './pages/TrainerDashboard/TrainerDashboard.tsx'

import './App.css'
import { Route, Routes } from 'react-router-dom'

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

  const isNative = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.isNative
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

  const isDashboard = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.isDashboard
  )

  const filteredRoutes = useMemo(() => {
    if (user) {
      return routes.filter((route) => route.path !== '/signin')
    }

    return routes
  }, [user?._id])

  // const location = useLocation()
  const [activeRoute, setActiveRoute] = useState<string>('/')

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

    if (isDashboard) {
      document.body.classList.add('dashboard')
    } else {
      document.body.classList.remove('dashboard')
    }
  }, [prefs, isDashboard])

  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform())
  }, [])

  useEffect(() => {
    if (platform !== 'desktop') {
      setIsDashboard(false)
      return
    }
    if (user && user.isTrainer && platform === 'desktop') {
      setIsDashboard(true)
    } else {
      setIsDashboard(false)
    }
  }, [user, platform])

  useEffect(() => {
    const themeColorMeta = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]'
    )
    if (themeColorMeta) {
      if (prefs.isDarkMode) {
        // Map favorite colors to their dark-gray variants
        const darkColors: Record<string, string> = {
          primary: '#0b1415',
          blue: '#0b0f17',
          yellow: '#12120b',
          red: '#120a0b',
          orange: '#120e0a',
          green: '#09100d',
          deepPurple: '#0c0a12',
          purple: '#0f0a10',
          pink: '#120a0e',
        }
        themeColorMeta.content = darkColors[prefs.favoriteColor] || '#0b1415'
      } else {
        themeColorMeta.content = '#f5f5f5' // light mode
      }
    }
  }, [prefs.isDarkMode, prefs.favoriteColor])

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

      // Get cached results immediately and set them
      const cachedItems = await searchService.searchFavoriteItems(
        favoriteIDs || [],
        // Callback when background fetch completes
        (completeItems) => {
          setFavoriteItems(completeItems)
        }
      )

      // Set cached items immediately (user can see them right away)
      setFavoriteItems(cachedItems)
    }
    loadFavoriteItems()
  }, [user?._id])

  const _getActiveRouteComponent = () => {
    const activeRouteComponent = filteredRoutes.find(
      (route) => route.path === activeRoute
    )
    return activeRouteComponent ? <activeRouteComponent.element /> : null
  }

  if (platform !== 'desktop' && shouldShowInstallGuide && isProd && !isNative) {
    return (
      <main className={`main ${prefs.isDarkMode ? 'dark-mode' : ''}`}>
        {/* <AppHeader /> */}
        <div className=''>
          <PwaInstall
            promptInstall={promptInstall}
            platform={platform}
            isInstallable={isInstallable}
          />
        </div>
      </main>
    )
  }

  if (isDashboard) {
    return <TrainerDashboard />
  }

  if (isFirstLoading) return <ScreenLoader />

  if ((user && !user.currGoal) || (user && !user.goals.length)) {
    return (
      <>
        <UserMsg />
        <FirstGoalEdit />
      </>
    )
  }

  return (
    <>
      <UserMsg />
      <Prefs />

      {traineeUser && <TraineeUserCard />}

      <main
        className={`main ${prefs.isDarkMode ? 'dark-mode' : ''} ${
          user ? '' : 'no-user'
        } ${prefs.favoriteColor || ''}`}
      >
        <SlideAnimation
          motionKey={activeRoute}
          direction={slideDirection}
          duration={0.25}
        >
          {!user ? (
            <div className='page-container login-sign-up-container'>
              <AppHeader />

              <SignIn />
            </div>
          ) : (
            <div key={activeRoute}>{_getActiveRouteComponent()}</div>
          )}

          <Routes>
            {filteredRoutes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={<route.element />}
              />
            ))}
          </Routes>
        </SlideAnimation>
        <Timer />
      </main>
      {user && (
        <FixedBottomNavigation
          routes={filteredRoutes}
          setActiveRoute={setActiveRoute}
          activeRoute={activeRoute}
        />
      )}
    </>
  )
}

export default App

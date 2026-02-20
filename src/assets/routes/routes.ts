// routes.ts
import React from 'react'

import { Dashboard } from '../../pages/MyTracker/Dashboard/Dashboard'
import { Diary } from '../../pages/MyTracker/Diary/Diary'
import { UserDetails } from '../../pages/UserDetails/UserDetails'
import { Workouts } from '../../pages/LiftMate/Workouts/Workouts.tsx'
import { SignIn } from '../../CustomMui/SignIn/SignIn.tsx'
import { App } from '../../types/app/App'

export interface Route {
  titleKey: string
  path: string
  element: React.ComponentType
  icon: React.ComponentType
  app: App
}

import DashboardIcon from '@mui/icons-material/Dashboard'
import SignInIcon from '@mui/icons-material/Login'
import UserIcon from '@mui/icons-material/Person'
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter'
import FastfoodIcon from '@mui/icons-material/Fastfood'

export const mainRoutes = ['/', '/diary', '/lift-mate/workouts', '/user']

export const routes: Route[] = [
  {
    titleKey: 'nav.dashboard',
    path: '/',
    element: Dashboard,
    icon: DashboardIcon,
    app: 'all',
  },
  {
    titleKey: 'nav.food',
    path: '/diary',
    element: Diary,
    icon: FastfoodIcon,
    app: 'all',
  },
  {
    titleKey: 'nav.workouts',
    path: '/lift-mate/workouts',
    element: Workouts,
    icon: FitnessCenterIcon,
    app: 'all',
  },
  {
    titleKey: 'nav.user',
    path: '/user',
    element: UserDetails,
    icon: UserIcon,
    app: 'all',
  },
  {
    titleKey: 'nav.signIn',
    path: '/signin',
    element: SignIn,
    icon: SignInIcon,
    app: 'all',
  },
]

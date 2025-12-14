// routes.ts
import React from 'react'

import { Dashboard } from '../../pages/MyTracker/Dashboard/Dashboard'
import { Diary } from '../../pages/MyTracker/Diary/Diary'
import { UserDetails } from '../../pages/UserDetails/UserDetails'
import { Workouts } from '../../pages/LiftMate/Workouts/Workouts.tsx'
import { SignIn } from '../../CustomMui/SignIn/SignIn.tsx'
import { App } from '../../types/app/App'

export interface Route {
  title: string
  path: string
  element: React.ComponentType
  icon: React.ComponentType
  app: App
}

import DashboardIcon from '@mui/icons-material/Dashboard'
import FormatListBulletedAddIcon from '@mui/icons-material/FormatListBulletedAdd'
import SignInIcon from '@mui/icons-material/Login'
import UserIcon from '@mui/icons-material/Person'
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter'

export const mainRoutes = ['/', '/diary', '/workouts', '/user']

export const routes: Route[] = [
  {
    title: 'Dashboard',
    path: '/',
    element: Dashboard,
    icon: DashboardIcon,
    app: 'all',
  },
  {
    title: 'Diary',
    path: '/diary',
    element: Diary,
    icon: FormatListBulletedAddIcon,
    app: 'all',
  },
  {
    title: 'Workouts',
    path: '/workouts',
    element: Workouts,
    icon: FitnessCenterIcon,
    app: 'all',
  },
  {
    title: 'User',
    path: '/user',
    element: UserDetails,
    icon: UserIcon,
    app: 'all',
  },
  {
    title: 'Sign in',
    path: '/signin',
    element: SignIn,
    icon: SignInIcon,
    app: 'all',
  },
]

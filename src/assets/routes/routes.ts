// routes.ts
import React from 'react'

import { Dashboard } from '../../pages/Dashboard/Dashboard'
import { Diary } from '../../pages/Diary/Diary'
import { Progress } from '../../pages/Progress/Progress'
import { UserDetails } from '../../pages/UserDetails/UserDetails'

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
import InsightsIcon from '@mui/icons-material/Insights'
import SignInIcon from '@mui/icons-material/Login'
import UserIcon from '@mui/icons-material/Person'
import { apps } from '../config/apps.ts'

export const routes: Route[] = [
  {
    title: 'Dashboard',
    path: '/',
    element: Dashboard,
    icon: DashboardIcon,
    app: apps.myTracker.id,
  },
  {
    title: 'Diary',
    path: '/diary',
    element: Diary,
    icon: FormatListBulletedAddIcon,
    app: apps.myTracker.id,
  },
  {
    title: 'Progress',
    path: '/progress',
    element: Progress,
    icon: InsightsIcon,
    app: apps.myTracker.id,
  },

  {
    title: 'Sign in',
    path: '/signin',
    element: SignIn,
    icon: SignInIcon,
    app: apps.myTracker.id,
  },

  {
    title: 'User',
    path: '/user',
    element: UserDetails,
    icon: UserIcon,
    app: apps.myTracker.id,
  },
]

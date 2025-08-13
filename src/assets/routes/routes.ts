// routes.ts
import React from 'react'

import { Dashboard } from '../../pages/Dashboard/Dashboard'
import { Diary } from '../../pages/Diary/Diary'
import { Progress } from '../../pages/Progress/Progress'
import { UserDetails } from '../../pages/UserDetails/UserDetails'

import { SignIn } from '../../CustomMui/SignIn/SignIn.tsx'

export interface Route {
  title: string
  path: string
  element: React.ComponentType
  icon: React.ComponentType
}

import DashboardIcon from '@mui/icons-material/Dashboard'
import FormatListBulletedAddIcon from '@mui/icons-material/FormatListBulletedAdd'
import InsightsIcon from '@mui/icons-material/Insights'
import SignInIcon from '@mui/icons-material/Login'
import UserIcon from '@mui/icons-material/Person'

export const routes: Route[] = [
  {
    title: 'Dashboard',
    path: '/',
    element: Dashboard,
    icon: DashboardIcon,
  },
  {
    title: 'Diary',
    path: '/diary',
    element: Diary,
    icon: FormatListBulletedAddIcon,
  },
  {
    title: 'Progress',
    path: '/progress',
    element: Progress,
    icon: InsightsIcon,
  },

  {
    title: 'Sign in',
    path: '/signin',
    element: SignIn,
    icon: SignInIcon,
  },

  {
    title: 'User',
    path: '/user',
    element: UserDetails,
    icon: UserIcon,
  },
]

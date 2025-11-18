// routes.ts
import React from 'react'

import { Dashboard } from '../../pages/MyTracker/Dashboard/Dashboard'
import { Diary } from '../../pages/MyTracker/Diary/Diary'
import { Progress as MyTrackerProgress } from '../../pages/MyTracker/Progress/Progress'
import { UserDetails } from '../../pages/UserDetails/UserDetails'

import { Workout } from '../../pages/LiftMate/Workout/Workout.tsx'
import { Workouts } from '../../pages/LiftMate/Workouts/Workouts.tsx'
import { Progress as LiftMateProgress } from '../../pages/LiftMate/Progress/Progress.tsx'

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

import FitnessCenterIcon from '@mui/icons-material/FitnessCenter'
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered'

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
    element: MyTrackerProgress,
    icon: InsightsIcon,
    app: apps.myTracker.id,
  },

  {
    title: 'Workout',
    path: '/lift-mate/workout',
    element: Workout,
    icon: FitnessCenterIcon,
    app: apps.liftMate.id,
  },
  {
    title: 'My Workouts',
    path: '/lift-mate/workouts',
    element: Workouts,
    icon: FormatListNumberedIcon,
    app: apps.liftMate.id,
  },
  {
    title: 'Progress',
    path: '/lift-mate/progress',
    element: LiftMateProgress,
    icon: InsightsIcon,
    app: apps.liftMate.id,
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

// trainerRoutes.ts
import React from 'react'

import DashboardIcon from '@mui/icons-material/Dashboard'
import PeopleIcon from '@mui/icons-material/People'
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter'
import SettingsIcon from '@mui/icons-material/Settings'
import FeaturedPlayListIcon from '@mui/icons-material/FeaturedPlayList'

// Placeholder components - will be created
import { TrainerDashboardOverview } from '../../pages/TrainerDashboard/pages/Dashboard/TrainerDashboardOverview'
import { Trainees } from '../../pages/TrainerDashboard/pages/Trainees/Trainees'
import { TrainerWorkouts } from '../../pages/TrainerDashboard/pages/Workouts/TrainerWorkouts'
import { TrainerExercises } from '../../pages/TrainerDashboard/pages/Exercises/TrainerExercises'
import { TrainerSettings } from '../../pages/TrainerDashboard/pages/Settings/TrainerSettings'
import { Dashboard } from '../../pages/MyTracker/Dashboard/Dashboard'
export interface TrainerRoute {
  title: string
  path: string
  element: React.ComponentType
  icon: React.ComponentType
}

export const trainerRoutes: TrainerRoute[] = [
  {
    title: 'Dashboard',
    path: '/trainer',
    element: Dashboard,
    icon: DashboardIcon,
  },
  {
    title: 'Trainees',
    path: '/trainer/trainees',
    element: Trainees,
    icon: PeopleIcon,
  },
  {
    title: 'Workouts',
    path: '/trainer/workouts',
    element: TrainerWorkouts,
    icon: FeaturedPlayListIcon,
  },
  {
    title: 'Exercises',
    path: '/trainer/exercises',
    element: TrainerExercises,
    icon: FitnessCenterIcon,
  },

  {
    title: 'Settings',
    path: '/trainer/settings',
    element: TrainerSettings,
    icon: SettingsIcon,
  },
]

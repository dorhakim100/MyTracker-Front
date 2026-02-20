// trainerRoutes.ts
import React from 'react'

import DashboardIcon from '@mui/icons-material/Dashboard'
import PeopleIcon from '@mui/icons-material/People'
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter'
import SettingsIcon from '@mui/icons-material/Settings'
import FeaturedPlayListIcon from '@mui/icons-material/FeaturedPlayList'
import UserIcon from '@mui/icons-material/Person'

import { Trainees } from '../../pages/TrainerDashboard/pages/Trainees/Trainees'
import { TrainerDashboardOverview } from '../../pages/TrainerDashboard/pages/Dashboard/TrainerDashboardOverview'
import { TrainerWorkouts } from '../../pages/TrainerDashboard/pages/Workouts/TrainerWorkouts'
import { TrainerExercises } from '../../pages/TrainerDashboard/pages/Exercises/TrainerExercises'
import { TrainerSettings } from '../../pages/TrainerDashboard/pages/Settings/TrainerSettings'
import { UserDetails } from '../../pages/UserDetails/UserDetails'

export interface TrainerRoute {
  titleKey: string
  path: string
  element: React.ComponentType
  icon: React.ComponentType
}

export const trainerRoutes: TrainerRoute[] = [
  {
    titleKey: 'nav.dashboard',
    path: '/trainer',
    element: TrainerDashboardOverview,
    icon: DashboardIcon,
  },
  {
    titleKey: 'nav.trainees',
    path: '/trainer/trainees',
    element: Trainees,
    icon: PeopleIcon,
  },
  {
    titleKey: 'nav.workouts',
    path: '/trainer/workouts',
    element: TrainerWorkouts,
    icon: FeaturedPlayListIcon,
  },
  {
    titleKey: 'nav.exercises',
    path: '/trainer/exercises',
    element: TrainerExercises,
    icon: FitnessCenterIcon,
  },
  {
    titleKey: 'nav.user',
    path: '/trainer/user',
    element: UserDetails,
    icon: UserIcon,
  },
  {
    titleKey: 'nav.settings',
    path: '/trainer/settings',
    element: TrainerSettings,
    icon: SettingsIcon,
  },
]

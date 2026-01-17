// trainerRoutes.ts
import React from 'react'

import DashboardIcon from '@mui/icons-material/Dashboard'
import PeopleIcon from '@mui/icons-material/People'
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter'
import RestaurantIcon from '@mui/icons-material/Restaurant'
import AnalyticsIcon from '@mui/icons-material/Analytics'
import MessageIcon from '@mui/icons-material/Message'
import SettingsIcon from '@mui/icons-material/Settings'

// Placeholder components - will be created
import { TrainerDashboardOverview } from '../../pages/TrainerDashboard/pages/Dashboard/TrainerDashboardOverview'
import { Trainees } from '../../pages/TrainerDashboard/pages/Trainees/Trainees'
import { TrainerWorkouts } from '../../pages/TrainerDashboard/pages/Workouts/TrainerWorkouts'
import { TrainerNutrition } from '../../pages/TrainerDashboard/pages/Nutrition/TrainerNutrition'
import { TrainerAnalytics } from '../../pages/TrainerDashboard/pages/Analytics/TrainerAnalytics'
import { TrainerMessages } from '../../pages/TrainerDashboard/pages/Messages/TrainerMessages'
import { TrainerSettings } from '../../pages/TrainerDashboard/pages/Settings/TrainerSettings'

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
    element: TrainerDashboardOverview,
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
    icon: FitnessCenterIcon,
  },
  {
    title: 'Nutrition',
    path: '/trainer/nutrition',
    element: TrainerNutrition,
    icon: RestaurantIcon,
  },
  {
    title: 'Analytics',
    path: '/trainer/analytics',
    element: TrainerAnalytics,
    icon: AnalyticsIcon,
  },
  {
    title: 'Messages',
    path: '/trainer/messages',
    element: TrainerMessages,
    icon: MessageIcon,
  },
  {
    title: 'Settings',
    path: '/trainer/settings',
    element: TrainerSettings,
    icon: SettingsIcon,
  },
]

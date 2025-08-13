// routes.ts
import React from 'react'

import { Home } from '../../pages/Home/Home'
import { About } from '../../pages/About/About'
import { Services } from '../../pages/Services/Services'

import { SignIn } from '../../CustomMui/SignIn/SignIn.tsx'

export interface Route {
  title: string
  path: string
  element: React.ComponentType
  icon: React.ComponentType
}

import HomeIcon from '@mui/icons-material/Home'
import AboutIcon from '@mui/icons-material/Info'
import ServicesIcon from '@mui/icons-material/Build'
import SignInIcon from '@mui/icons-material/Login'

export const routes: Route[] = [
  {
    title: 'Home',
    path: '/',
    element: Home,
    icon: HomeIcon,
  },
  {
    title: 'About',
    path: '/about',
    element: About,
    icon: AboutIcon,
  },
  {
    title: 'Services',
    path: '/services',
    element: Services,
    icon: ServicesIcon,
  },

  {
    title: 'Sign in',
    path: '/signin',
    element: SignIn,
    icon: SignInIcon,
  },
]

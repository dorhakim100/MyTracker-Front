import { Typography, Box } from '@mui/material'

import { Dashboard } from '../../../MyTracker/Dashboard/Dashboard'
import { RootState } from '../../../../store/store'
import { useSelector } from 'react-redux'

export function TrainerDashboardOverview() {
  const prefs = useSelector((state: RootState) => state.systemModule.prefs)
  return (



    <Dashboard />

  )
}

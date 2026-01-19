import { Typography, Box } from '@mui/material'
import { RootState } from '../../../../store/store'
import { useSelector } from 'react-redux'

import { Workouts } from '../../../LiftMate/Workouts/Workouts'

export function TrainerWorkouts() {
  const prefs = useSelector((state: RootState) => state.systemModule.prefs)
  return (


    <Workouts />

  )
}

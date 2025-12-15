import React from 'react'
import { Card, Divider, Typography } from '@mui/material'

import { Workout } from '../../../types/workout/Workout'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store/store'

import { CustomButton } from '../../../CustomMui/CustomButton/CustomButton'
import { capitalizeFirstLetter } from '../../../services/util.service'

interface WorkoutCardProps {
  workout: Workout
  className?: string
}

export function WorkoutCard({ workout, className }: WorkoutCardProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  console.log(workout)

  return (
    <Card
      className={`workout-card-container ${className} ${
        prefs.isDarkMode ? 'dark-mode' : ''
      }`}
    >
      <Typography variant="h6">{workout.name}</Typography>
      <Typography
        variant="body1"
        className="muscle-groups-list hide-text-overflow"
      >
        {workout.muscleGroups
          .map((muscleGroup) => capitalizeFirstLetter(muscleGroup))
          .join(', ')}
      </Typography>
      <Divider className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`} />
      <Typography variant="body1" className="exercises-list hide-text-overflow">
        {workout.exercises
          .map((exercise) => capitalizeFirstLetter(exercise.name))
          .join(', ')}
      </Typography>
    </Card>
  )
}

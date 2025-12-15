import React from 'react'
import { Card, Divider, Typography } from '@mui/material'

import { Workout } from '../../../types/workout/Workout'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store/store'

import { CustomButton } from '../../../CustomMui/CustomButton/CustomButton'
import { capitalizeFirstLetter } from '../../../services/util.service'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite'

import { CustomOptionsMenu } from '../../../CustomMui/CustomOptionsMenu/CustomOptionsMenu'
import { DropdownOption } from '../../../types/DropdownOption'
interface WorkoutCardProps {
  workout: Workout
  className?: string
}

const options: DropdownOption[] = [
  {
    title: 'Start Routine',
    onClick: () => {
      console.log('start routine')
    },
  },
]

export function WorkoutCard({ workout, className }: WorkoutCardProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  return (
    <Card
      className={`workout-card-container ${className} ${
        prefs.isDarkMode ? 'dark-mode' : ''
      }`}
    >
      <div className="header-container">
        <Typography variant="h6">{workout.name}</Typography>
        <CustomOptionsMenu
          options={options}
          triggerElement={
            <CustomButton isIcon={true} icon={<MoreHorizIcon />} />
          }
        />
      </div>
      <Typography
        variant="body1"
        className="muscle-groups-list hide-text-overflow"
      >
        {workout.muscleGroups
          .map((muscleGroup) => capitalizeFirstLetter(muscleGroup))
          .join(', ')}
      </Typography>
      <Divider className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`} />
      <Typography
        variant="body2"
        className="exercises-list hide-text-overflow opacity-70"
      >
        {workout.exercises
          .map((exercise) => capitalizeFirstLetter(exercise.name))
          .join(', ')}
      </Typography>
      <Divider className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`} />
      <CustomButton text="Start Routine" fullWidth={true} />
    </Card>
  )
}

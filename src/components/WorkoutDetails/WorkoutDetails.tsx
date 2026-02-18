import { useState } from 'react'

import { useSelector } from 'react-redux'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'

import { RootState } from '../../store/store'
import { Workout } from '../../types/workout/Workout'
import { capitalizeFirstLetter } from '../../services/util.service'
import { CustomList } from '../../CustomMui/CustomList/CustomList'
import { Exercise } from '../../types/exercise/Exercise'

import { SlideDialog } from '../SlideDialog/SlideDialog'
import { ExerciseDetails } from '../ExerciseDetails/ExerciseDetails'
import { getWorkoutMuscles } from '../../services/exersice-search/exersice-search'
interface WorkoutDetailsProps {
  workout: Workout | null
}

interface ExerciseDialogOptions {
  open: boolean
  exercise: Exercise | null
}

export function WorkoutDetails({ workout }: WorkoutDetailsProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const isDashboard = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.isDashboard
  )

  const [exersiceDialogOptions, setExersiceDialogOptions] =
    useState<ExerciseDialogOptions>({
      open: false,
      exercise: null,
    })

  const onOpenExerciseDetails = (exercise: Exercise) => {
    setExersiceDialogOptions({ open: true, exercise })
  }

  if (!workout) {
    return (
      <div className='workout-details-container'>
        <Typography>No workout selected</Typography>
      </div>
    )
  }
  const workoutMuscles = getWorkoutMuscles(workout).join(', ')

  return (
    <>
      <div className='workout-details-container'>
        <div className='header-container'>
          <Typography
            variant='h4'
            className='name-container bold-header'
          >
            {workout.name}
          </Typography>
          {workoutMuscles && workoutMuscles.length > 0 && (
            <Typography
              variant='body1'
              className='muscle-groups-container'
            >
              {workoutMuscles}
            </Typography>
          )}
        </div>
        <Divider className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`} />

        <CustomList
          items={workout.exercises}
          renderPrimaryText={(exercise) => capitalizeFirstLetter(exercise.name)}
          renderSecondaryText={(exercise) =>
            capitalizeFirstLetter(exercise.muscleGroups.join(', '))
          }
          className={`exercises-list  ${prefs.isDarkMode ? 'dark-mode' : ''} ${isDashboard ? 'dashboard' : ''}`}
          renderLeft={(exercise) => (
            <img
              src={exercise.image}
              alt={exercise.name}
            />
          )}
          getKey={(exercise) => exercise.exerciseId}
          onItemClick={(exercise) => onOpenExerciseDetails(exercise)}
        />
      </div>
      <SlideDialog
        open={exersiceDialogOptions.open}
        onClose={() =>
          setExersiceDialogOptions({ open: false, exercise: null })
        }
        component={
          <ExerciseDetails exercise={exersiceDialogOptions.exercise} />
        }
        title={capitalizeFirstLetter(
          exersiceDialogOptions.exercise?.name || ''
        )}
        type='full'
      />
    </>
  )
}

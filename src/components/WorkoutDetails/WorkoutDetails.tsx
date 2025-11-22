import { useSelector } from 'react-redux'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'

import { RootState } from '../../store/store'
import { Workout } from '../../types/workout/Workout'
import { capitalizeFirstLetter } from '../../services/util.service'
import { CustomList } from '../../CustomMui/CustomList/CustomList'

interface WorkoutDetailsProps {
  workout: Workout | null
}

export function WorkoutDetails({ workout }: WorkoutDetailsProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  if (!workout) {
    return (
      <div className='workout-details-container'>
        <Typography>No workout selected</Typography>
      </div>
    )
  }

  return (
    <div className='workout-details-container'>
      <div className='header-container'>
        <Typography variant='h4' className='name-container bold-header'>
          {workout.name}
        </Typography>
        {workout.muscleGroups && workout.muscleGroups.length > 0 && (
          <Typography variant='body1' className='muscle-groups-container'>
            {workout.muscleGroups
              .map((group) => capitalizeFirstLetter(group))
              .join(', ')}
          </Typography>
        )}
        {workout.date && (
          <Typography variant='body2' className='date-container'>
            {new Date(workout.date).toLocaleDateString()}
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
        className={`exercises-list ${prefs.isDarkMode ? 'dark-mode' : ''}`}
        renderLeft={(exercise) => (
          <img src={exercise.image} alt={exercise.name} />
        )}
        getKey={(exercise) => exercise.exerciseId}
      />
    </div>
  )
}

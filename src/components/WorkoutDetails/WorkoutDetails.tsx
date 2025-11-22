import { useSelector } from 'react-redux'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'

import { RootState } from '../../store/store'
import { Workout } from '../../types/workout/Workout'
import { capitalizeFirstLetter } from '../../services/util.service'

interface WorkoutDetailsProps {
  workout: Workout | null
}

export function WorkoutDetails({ workout }: WorkoutDetailsProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  if (!workout) {
    return (
      <div className="workout-details-container">
        <Typography>No workout selected</Typography>
      </div>
    )
  }

  return (
    <div className="workout-details-container">
      <div className="header-container">
        <Typography variant="h4" className="name-container">
          {workout.name}
        </Typography>
        {workout.muscleGroups && workout.muscleGroups.length > 0 && (
          <Typography variant="body1" className="muscle-groups-container">
            {workout.muscleGroups
              .map((group) => capitalizeFirstLetter(group))
              .join(', ')}
          </Typography>
        )}
        {workout.date && (
          <Typography variant="body2" className="date-container">
            {new Date(workout.date).toLocaleDateString()}
          </Typography>
        )}
      </div>

      {workout.details && (
        <div className="details-container">
          <Typography variant="h6">Details</Typography>
          <Typography variant="body1">{workout.details}</Typography>
        </div>
      )}

      {workout.exercises && workout.exercises.length > 0 && (
        <div className="exercises-container">
          <Typography variant="h6">Exercises</Typography>
          {workout.exercises.map((exercise, index) => (
            <div
              key={exercise.exerciseId || index}
              className="exercise-container"
            >
              <Typography
                variant="subtitle1"
                className="exercise-name-container"
              >
                {capitalizeFirstLetter(exercise.name)}
              </Typography>

              {exercise.muscleGroups && exercise.muscleGroups.length > 0 && (
                <Typography
                  variant="body2"
                  className="exercise-muscle-groups-container"
                >
                  {exercise.muscleGroups
                    .map((group) => capitalizeFirstLetter(group))
                    .join(', ')}
                </Typography>
              )}

              {exercise.equipment && exercise.equipment.length > 0 && (
                <Typography
                  variant="body2"
                  className="exercise-equipment-container"
                >
                  Equipment: {exercise.equipment.join(', ')}
                </Typography>
              )}

              {exercise.details && (
                <div className="exercise-details-container">
                  {exercise.details.sets && (
                    <div className="detail-item-container">
                      <Typography variant="body2">Sets:</Typography>
                      <Typography variant="body2">
                        Expected: {exercise.details.sets.expected} | Actual:{' '}
                        {exercise.details.sets.actual}
                      </Typography>
                    </div>
                  )}
                  {exercise.details.reps && (
                    <div className="detail-item-container">
                      <Typography variant="body2">Reps:</Typography>
                      <Typography variant="body2">
                        Expected: {exercise.details.reps.expected} | Actual:{' '}
                        {exercise.details.reps.actual}
                      </Typography>
                    </div>
                  )}
                  {exercise.details.weight && (
                    <div className="detail-item-container">
                      <Typography variant="body2">Weight:</Typography>
                      <Typography variant="body2">
                        Expected: {exercise.details.weight.expected} | Actual:{' '}
                        {exercise.details.weight.actual}
                      </Typography>
                    </div>
                  )}
                  {exercise.details.rpe && (
                    <div className="detail-item-container">
                      <Typography variant="body2">RPE:</Typography>
                      <Typography variant="body2">
                        Expected: {exercise.details.rpe.expected} | Actual:{' '}
                        {exercise.details.rpe.actual}
                      </Typography>
                    </div>
                  )}
                  {exercise.details.notes?.expected && (
                    <div className="detail-item-container">
                      <Typography variant="body2">Notes:</Typography>
                      <Typography variant="body2">
                        {exercise.details.notes.expected}
                      </Typography>
                    </div>
                  )}
                </div>
              )}

              {index < workout.exercises.length - 1 && (
                <Divider
                  className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

import { useSelector } from 'react-redux'
import { RootState } from '../../../store/store'
import { capitalizeFirstLetter } from '../../../services/util.service'
import { CustomInput } from '../../../CustomMui/CustomInput/CustomInput'
import { Divider } from '@mui/material'
import { CustomList } from '../../../CustomMui/CustomList/CustomList'
import { CustomButton } from '../../../CustomMui/CustomButton/CustomButton'
import { DeleteAction } from '../../../components/DeleteAction/DeleteAction'
import { Exercise } from '../../../types/exercise/Exercise'
import { Workout } from '../../../types/workout/Workout'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import { CustomAccordion } from '../../../CustomMui/CustomAccordion/CustomAccordion'

import FitnessCenterIcon from '@mui/icons-material/FitnessCenter'

interface ExercisesStageProps {
  workout: Workout
  exerciseFilter: { txt: string }
  exerciseResults: Exercise[]
  onExerciseFilterChange: (txt: string) => void
  onAddExercise: (exercise: Exercise) => void
  onDeleteExercise: (exercise: Exercise) => void
  onReorderExercises: (exercises: Exercise[]) => void
}

export function ExercisesStage({
  workout,
  exerciseFilter,
  exerciseResults,
  onExerciseFilterChange,
  onAddExercise,
  onDeleteExercise,
  onReorderExercises,
}: ExercisesStageProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const isExerciseAdded = (exercise: Exercise) => {
    return workout.exercises.some((e) => e.exerciseId === exercise.exerciseId)
  }

  return (
    <div className='edit-workout-stage exercises-stage'>
      <CustomInput
        value={exerciseFilter.txt}
        onChange={onExerciseFilterChange}
        placeholder='Search for exercises'
        isRemoveIcon={true}
      />

      <div className='exercises-lists-container'>
        <CustomList
          items={exerciseResults}
          renderPrimaryText={(exercise) => capitalizeFirstLetter(exercise.name)}
          renderSecondaryText={(exercise) => (
            <span className={`${prefs.isDarkMode ? 'dark-mode' : ''}`}>
              {capitalizeFirstLetter(exercise.muscleGroups.join(', '))}
            </span>
          )}
          renderLeft={(exercise) => (
            <img src={exercise.image} alt={exercise.name} />
          )}
          getKey={(exercise) => exercise.exerciseId}
          className={`search-exercise-list ${
            prefs.isDarkMode ? 'dark-mode' : ''
          }`}
          renderRight={(exercise) => (
            <CustomButton
              icon={isExerciseAdded(exercise) ? <RemoveIcon /> : <AddIcon />}
              onClick={() => onAddExercise(exercise)}
              className={isExerciseAdded(exercise) ? 'red' : ''}
            />
          )}
          noResultsMessage='No exercises found...'
        />
        <Divider className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`} />
        {workout.exercises.length > 0 ? (
          <CustomAccordion
            title='Selected Exercises'
            icon={<FitnessCenterIcon />}
            cmp={
              <CustomList
                items={workout.exercises}
                renderPrimaryText={(exercise) =>
                  capitalizeFirstLetter(exercise.name)
                }
                renderSecondaryText={(exercise) =>
                  capitalizeFirstLetter(exercise.muscleGroups.join(', '))
                }
                renderLeft={(exercise) => (
                  <img src={exercise.image} alt={exercise.name} />
                )}
                getKey={(exercise) => `${exercise.exerciseId}-selected`}
                className={`selected-exercise-list ${
                  prefs.isDarkMode ? 'dark-mode' : ''
                }`}
                noResultsMessage='No exercises added yet'
                isSwipeable={true}
                renderRightSwipeActions={(exercise) => (
                  <DeleteAction
                    item={exercise}
                    onDeleteItem={onDeleteExercise}
                  />
                )}
                isDragable={true}
                onReorder={onReorderExercises}
                dragOffsetY={-180}
              />
            }
          />
        ) : (
          <div className='no-exercises bold-header'>No exercises added yet</div>
        )}
      </div>
    </div>
  )
}

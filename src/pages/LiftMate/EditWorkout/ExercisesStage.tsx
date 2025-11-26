import { useSelector } from 'react-redux'
import { Divider } from '@mui/material'

import { RootState } from '../../../store/store'
import { capitalizeFirstLetter } from '../../../services/util.service'
import { CustomInput } from '../../../CustomMui/CustomInput/CustomInput'
import { CustomList } from '../../../CustomMui/CustomList/CustomList'
import { CustomButton } from '../../../CustomMui/CustomButton/CustomButton'
import { DeleteAction } from '../../../components/DeleteAction/DeleteAction'
import { Exercise } from '../../../types/exercise/Exercise'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'

interface ExercisesStageProps {
  exerciseFilter: { txt: string }
  onExerciseFilterChange: (txt: string) => void
  exerciseResults: Exercise[]
  exercises: Exercise[]
  onAddExercise: (exercise: Exercise) => void
  onDeleteExercise: (exercise: Exercise) => void
  onReorderExercises: (exercises: Exercise[]) => void
}

export function ExercisesStage({
  exerciseFilter,
  onExerciseFilterChange,
  exerciseResults,
  exercises,
  onAddExercise,
  onDeleteExercise,
  onReorderExercises,
}: ExercisesStageProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const getExerciseActionIcon = (exercise: Exercise) => {
    const addedIndex = exercises.findIndex(
      (e) => e.exerciseId === exercise.exerciseId
    )
    return addedIndex === -1 ? <AddIcon /> : <RemoveIcon />
  }

  const getExerciseActionButtonClass = (exercise: Exercise) => {
    return exercises.find((e) => e.exerciseId === exercise.exerciseId)
      ? 'red'
      : ''
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
          renderPrimaryText={(exercise) =>
            capitalizeFirstLetter(exercise.name)
          }
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
              icon={getExerciseActionIcon(exercise)}
              onClick={() => onAddExercise(exercise)}
              className={`${getExerciseActionButtonClass(exercise)}`}
            />
          )}
          noResultsMessage='No exercises found...'
        />
        <h4 className='bold-header'>Selected Exercises</h4>
        <Divider
          className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`}
        />
        {exercises.length > 0 ? (
          <CustomList
            items={exercises}
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
              <DeleteAction item={exercise} onDeleteItem={onDeleteExercise} />
            )}
            isDragable={true}
            onReorder={onReorderExercises}
            dragOffsetY={-180}
          />
        ) : (
          <div className='no-exercises bold-header'>
            No exercises added yet
          </div>
        )}
      </div>
    </div>
  )
}


import { useState } from 'react'
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
import { SlideDialog } from '../../../components/SlideDialog/SlideDialog'
import { ExerciseDetails } from '../../../components/ExerciseDetails/ExerciseDetails'

interface ExercisesStageProps {
  workout: Workout
  exerciseFilter: { txt: string }
  exerciseResults: Exercise[]
  onExerciseFilterChange: (txt: string) => void
  onAddExercise: (exercise: Exercise) => void
  onDeleteExercise: (exercise: Exercise) => void
  onReorderExercises: (exercises: Exercise[]) => void
  renderErrorImage: (exercise: Exercise) => void
}

export function ExercisesStage({
  workout,
  exerciseFilter,
  exerciseResults,
  onExerciseFilterChange,
  onAddExercise,
  onDeleteExercise,
  onReorderExercises,
  renderErrorImage,
}: ExercisesStageProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const [modalPrefs, setModalPrefs] = useState<{
    isOpen: boolean
    exercise: Exercise | null
  }>({
    isOpen: false,
    exercise: null,
  })

  const onOpenModal = (exercise: Exercise) => {
    setModalPrefs({ isOpen: true, exercise: exercise })
  }

  const onCloseModal = () => {
    setModalPrefs({ isOpen: false, exercise: null })
  }

  const isExerciseAdded = (exercise: Exercise) => {
    return workout.exercises.some((e) => e.exerciseId === exercise.exerciseId)
  }

  return (
    <>
      <div className='edit-workout-stage exercises-stage'>
        <CustomInput
          value={exerciseFilter.txt}
          onChange={onExerciseFilterChange}
          placeholder='Search for exercises'
          isRemoveIcon={true}
          className={`${prefs.favoriteColor}`}
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
              <img
                src={exercise.image}
                alt={exercise.name}
                onError={() => {
                  renderErrorImage(exercise)
                }}
              />
            )}
            getKey={(exercise) => exercise.exerciseId}
            className={`search-exercise-list ${
              prefs.isDarkMode ? 'dark-mode' : ''
            }`}
            renderRight={(exercise) => (
              <CustomButton
                icon={isExerciseAdded(exercise) ? <RemoveIcon /> : <AddIcon />}
                onClick={(ev) => {
                  ev.stopPropagation()
                  onAddExercise(exercise)
                }}
                className={isExerciseAdded(exercise) ? 'red' : ''}
              />
            )}
            noResultsMessage='No exercises found...'
            onItemClick={(exercise) => onOpenModal(exercise)}
          />
          <Divider
            className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`}
          />
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
                  onItemClick={(exercise) => onOpenModal(exercise)}
                />
              }
            />
          ) : (
            <div className='no-exercises bold-header'>
              No exercises added yet
            </div>
          )}
        </div>
      </div>
      <SlideDialog
        open={modalPrefs.isOpen}
        onClose={onCloseModal}
        component={<ExerciseDetails exercise={modalPrefs.exercise} />}
        title={capitalizeFirstLetter(modalPrefs.exercise?.name || '')}
        type='full'
      />
    </>
  )
}

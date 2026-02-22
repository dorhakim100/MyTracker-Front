import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { Exercise } from '../../types/exercise/Exercise'
import { Workout } from '../../types/workout/Workout'
import { CustomList } from '../../CustomMui/CustomList/CustomList'
import { ExercisesFilter } from '../ExercisesFilter/ExercisesFilter'
import { ExerciseFilter } from '../../types/exerciseFilter/ExerciseFilter'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'
import { capitalizeFirstLetter } from '../../services/util.service'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import { SlideDialog } from '../SlideDialog/SlideDialog'
import { ExerciseDetails } from '../ExerciseDetails/ExerciseDetails'
import { useState } from 'react'
import { exerciseImage } from '../../assets/config/exercise-image'

interface ExercisesSearchProps {
  workout?: Workout | null
  exerciseFilter: ExerciseFilter
  onExerciseFilterChange: (exerciseFilter: ExerciseFilter) => void
  placeholder?: string
  className?: string
  results: Exercise[] | []
  onAddExercise?: (exercise: Exercise) => void
  onDeleteExercise?: (exercise: Exercise) => void
  onReorderExercises?: (exercises: Exercise[]) => void
  // renderErrorImage: (exercise: Exercise) => void
  resultsMsg?: string
}

export function ExercisesSearch({
  workout,
  exerciseFilter,
  onExerciseFilterChange,
  placeholder,
  className = '',
  results,
  onAddExercise,
  // renderErrorImage,
  resultsMsg,
}: ExercisesSearchProps) {
  const { t } = useTranslation()
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )
  const isDashboard = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.isDashboard
  )

  const [openModal, setOpenModal] = useState(false)
  const [exercise, setExercise] = useState<Exercise | null>(null)

  const isExerciseAdded = (exercise: Exercise) => {
    if (!onAddExercise || !workout) return false
    return workout.exercises.some((e) => e.exerciseId === exercise.exerciseId)
  }

  const onOpenModal = (exercise: Exercise) => {
    setOpenModal(true)
    setExercise(exercise)
  }

  const onCloseModal = () => {
    setOpenModal(false)
    setExercise(null)
  }

  return (
    <>
      <div className={`exercise-search-container ${className}`}>
        <ExercisesFilter
          exerciseFilter={exerciseFilter}
          onExerciseFilterChange={onExerciseFilterChange}
          searchPlaceholder={placeholder}
          resultsMsg={resultsMsg}
        />

        <CustomList
          items={results}
          renderPrimaryText={(exercise) => capitalizeFirstLetter(exercise.name)}
          renderSecondaryText={(exercise) => (
            <span className={`${prefs.isDarkMode ? 'dark-mode' : ''}`}>
              {capitalizeFirstLetter(exercise.muscleGroups.join(', '))}
            </span>
          )}
          renderLeft={(exercise) => (
            <img
              src={exercise.image}
              alt={exercise.name}
              onError={(ev) => {
                ev.currentTarget.src = exerciseImage.ERROR_IMAGE
              }}
              className={`exercise-image ${
                isExerciseAdded(exercise) ? 'added' : ''
              }`}
            />
          )}
          itemClassName={`exercise-item exercise-item-grid ${
            prefs.isDarkMode ? 'dark-mode' : ''
          } ${prefs.favoriteColor} ${isDashboard ? 'dashboard' : ''}`}
          getKey={(exercise) => exercise.exerciseId}
          className={`exercise-list ${prefs.isDarkMode ? 'dark-mode' : ''} `}
          renderRight={(exercise) => {
            if (!onAddExercise || !workout) return null

            return <CustomButton
              icon={isExerciseAdded(exercise) ? <RemoveIcon /> : <AddIcon />}
              onClick={(ev) => {
                ev.stopPropagation()
                onAddExercise?.(exercise)
              }}
              className={isExerciseAdded(exercise) ? 'red' : ''}
            />}
          }
          noResultsMessage={t('exercise.noExercisesFound')}
          onItemClick={(exercise) => onOpenModal(exercise)}
        />
      </div>
      <SlideDialog
        open={openModal}
        onClose={onCloseModal}
        component={<ExerciseDetails exercise={exercise} />}
        title={capitalizeFirstLetter(exercise?.name || t('exercise.exerciseDetails'))}
        type="full"
      />
    </>
  )
}

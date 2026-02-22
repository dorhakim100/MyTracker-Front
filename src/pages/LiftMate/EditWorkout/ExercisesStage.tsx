import { Exercise } from '../../../types/exercise/Exercise'
import { Workout } from '../../../types/workout/Workout'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store/store'
import { ExercisesSearch } from '../../../components/ExercisesSearch/ExercisesSearch'
import { ExerciseFilter } from '../../../types/exerciseFilter/ExerciseFilter'

interface ExercisesStageProps {
  workout: Workout
  exerciseFilter: ExerciseFilter
  exerciseResults: Exercise[]
  onExerciseFilterChange: (exerciseFilter: ExerciseFilter) => void
  onAddExercise: (exercise: Exercise) => void
  onDeleteExercise: (exercise: Exercise) => void
  onReorderExercises: (exercises: Exercise[]) => void
  resultsMsg?: string
}

export function ExercisesStage({
  workout,
  exerciseFilter,
  exerciseResults,
  onExerciseFilterChange,
  onAddExercise,
  onDeleteExercise,
  onReorderExercises,
  resultsMsg,
}: ExercisesStageProps) {
  const { t } = useTranslation()
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )
  return (
    <div className="exercises-stage">
      <ExercisesSearch
        exerciseFilter={exerciseFilter}
        onExerciseFilterChange={onExerciseFilterChange}
        placeholder={t('workout.searchForExercises')}
        className={`${prefs.favoriteColor}`}
        results={exerciseResults}
        onAddExercise={onAddExercise}
        onDeleteExercise={onDeleteExercise}
        onReorderExercises={onReorderExercises}
        workout={workout}
        resultsMsg={resultsMsg}
      />
    </div>
  )
}

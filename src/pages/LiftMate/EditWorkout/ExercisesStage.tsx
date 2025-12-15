import { CustomInput } from '../../../CustomMui/CustomInput/CustomInput'
import { Exercise } from '../../../types/exercise/Exercise'
import { Workout } from '../../../types/workout/Workout'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store/store'
import { ExercisesSearch } from '../../../components/ExercisesSearch/ExercisesSearch'

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
  return (
    <div className="exercises-stage">
      <ExercisesSearch
        value={exerciseFilter.txt}
        onChange={onExerciseFilterChange}
        placeholder="Search for exercises"
        className={`${prefs.favoriteColor}`}
        results={exerciseResults}
      />
    </div>
  )
}

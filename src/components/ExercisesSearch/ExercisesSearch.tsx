import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { Exercise } from '../../types/exercise/Exercise'
import { CustomList } from '../../CustomMui/CustomList/CustomList'
import { ExercisesFilter } from '../ExercisesFilter/ExercisesFilter'
import { ExerciseFilter } from '../../types/exerciseFilter/ExerciseFilter'

interface ExercisesSearchProps {
  exerciseFilter: ExerciseFilter
  onExerciseFilterChange: (exerciseFilter: ExerciseFilter) => void
  placeholder?: string
  className?: string
  results: Exercise[] | []
}

export function ExercisesSearch({
  exerciseFilter,
  onExerciseFilterChange,
  placeholder = 'Search for exercises',
  className = '',
  results,
}: ExercisesSearchProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )
  console.log(onExerciseFilterChange)

  return (
    <div className="exercise-search-container">
      <ExercisesFilter
        exerciseFilter={exerciseFilter}
        onExerciseFilterChange={onExerciseFilterChange}
      />

      <CustomList
        items={results}
        renderPrimaryText={(exercise) => exercise.name}
        renderSecondaryText={(exercise) => exercise.muscleGroups.join(', ')}
        renderLeft={(exercise) => (
          <img src={exercise.image} alt={exercise.name} />
        )}
        className="exercise-list"
        //   renderRight={(exercise) => <CustomButton icon={<AddIcon />} onClick={() => onChange(exercise.name)} />}
      />
    </div>
  )
}

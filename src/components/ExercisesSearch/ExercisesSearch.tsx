import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { CustomInput } from '../../CustomMui/CustomInput/CustomInput'
import { Exercise } from '../../types/exercise/Exercise'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'
import { CustomList } from '../../CustomMui/CustomList/CustomList'
import { CustomSelect } from '../../CustomMui/CustomSelect/CustomSelect'
import { musclesValues, musclesImgs } from '../../assets/config/muscles'
import { ExercisesFilter } from '../ExercisesFilter/ExercisesFilter'

interface ExercisesSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  results: Exercise[] | []
}

export function ExercisesSearch({
  value,
  onChange,
  placeholder = 'Search for exercises',
  className = '',
  results,
}: ExercisesSearchProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  return (
    <div className="exercise-search-container">
      <ExercisesFilter
        searchValue={value}
        onSearchChange={onChange}
        muscleGroupValue={value}
        onMuscleGroupChange={onChange}
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

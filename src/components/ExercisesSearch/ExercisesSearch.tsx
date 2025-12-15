import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { CustomInput } from '../../CustomMui/CustomInput/CustomInput'
import { Exercise } from '../../types/exercise/Exercise'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'
import { CustomList } from '../../CustomMui/CustomList/CustomList'
import { CustomSelect } from '../../CustomMui/CustomSelect/CustomSelect'

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
      <div className="filter-container">
        <CustomInput
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          isRemoveIcon={true}
          className={`${prefs.favoriteColor} ${className}`}
        />
        <CustomSelect
          value={value}
          onChange={onChange}
          label="Muscle Group"
          values={[
            'All',
            'Chest',
            'Lats',
            'Quads',
            'Glutes',
            'Calves',
            'Hamstrings',
            'Abs',
            'Shoulders',
          ]}
          className={`${prefs.favoriteColor} ${className}`}
          imgs={[
            { value: 'All', src: '/public/muscles/all.webp' },
            { value: 'Chest', src: '/public/muscles/chest.webp' },
            { value: 'Lats', src: '/public/muscles/lats.webp' },
            { value: 'Quads', src: '/public/muscles/quads.webp' },
            { value: 'Glutes', src: '/public/muscles/glutes.webp' },
            { value: 'Calves', src: '/public/muscles/calves.webp' },
            { value: 'Hamstrings', src: '/public/muscles/hamstrings.webp' },
            { value: 'Abs', src: '/public/muscles/abs.webp' },
            { value: 'Shoulders', src: '/public/muscles/shoulders.webp' },
          ]}
        />
      </div>
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

import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { CustomInput } from '../../CustomMui/CustomInput/CustomInput'
import { CustomSelect } from '../../CustomMui/CustomSelect/CustomSelect'
import { musclesValues, musclesImgs } from '../../assets/config/muscles'
import './styles/ExercisesFilter.scss'

interface ExercisesFilterProps {
  searchValue: string
  onSearchChange: (value: string) => void
  muscleGroupValue: string
  onMuscleGroupChange: (value: string) => void
  searchPlaceholder?: string
  className?: string
}

export function ExercisesFilter({
  searchValue,
  onSearchChange,
  muscleGroupValue,
  onMuscleGroupChange,
  searchPlaceholder = 'Search for exercises',
  className = '',
}: ExercisesFilterProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  return (
    <div className={`exercises-filter-container ${className}`}>
      <CustomInput
        value={searchValue}
        onChange={onSearchChange}
        placeholder={searchPlaceholder}
        isRemoveIcon={true}
        className={`${prefs.favoriteColor}`}
      />
      <CustomSelect
        value={muscleGroupValue}
        onChange={onMuscleGroupChange}
        label="Muscle Group"
        values={musclesValues}
        className={`${prefs.favoriteColor}`}
        imgs={musclesImgs}
      />
    </div>
  )
}

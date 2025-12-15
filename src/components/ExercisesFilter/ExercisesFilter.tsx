import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { CustomInput } from '../../CustomMui/CustomInput/CustomInput'
import { CustomSelect } from '../../CustomMui/CustomSelect/CustomSelect'
import { musclesValues, musclesImgs } from '../../assets/config/muscles'

import { Barbell } from '../Icons/Barbell'
import { Dumbbell } from '../Icons/Dumbbell'
import WidgetsIcon from '@mui/icons-material/Widgets'
import { ExerciseFilter } from '../../types/exerciseFilter/ExerciseFilter'
import { equipmentsValues } from '../../assets/config/equipments'

interface ExercisesFilterProps {
  exerciseFilter: ExerciseFilter
  onExerciseFilterChange: (exerciseFilter: ExerciseFilter) => void
  searchPlaceholder?: string
  className?: string
}

const equipmentsImgs = [
  { value: 'All', icon: <WidgetsIcon /> },
  { value: 'Barbell', icon: <Barbell /> },
  { value: 'Dumbbell', icon: <Dumbbell /> },
  { value: 'Machine', src: '/public/equipments/machine.webp' },
  { value: 'Bodyweight', src: '/public/equipments/body-weight.webp' },
  { value: 'Cable', src: '/public/equipments/cable.webp' },
  { value: 'Bands', src: '/public/equipments/bands.webp' },
]

export function ExercisesFilter({
  exerciseFilter,
  onExerciseFilterChange,
  searchPlaceholder = 'Search for exercises',
  className = '',
}: ExercisesFilterProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  return (
    <div
      className={`exercises-filter-container ${className} ${
        prefs.isDarkMode ? 'dark-mode' : ''
      }`}
    >
      <CustomInput
        value={exerciseFilter.searchValue}
        onChange={(value) => {
          onExerciseFilterChange({ ...exerciseFilter, searchValue: value })
        }}
        placeholder={searchPlaceholder}
        isRemoveIcon={true}
        className={`${prefs.favoriteColor}`}
      />
      <CustomSelect
        value={exerciseFilter.muscleGroupValue}
        onChange={(value) =>
          onExerciseFilterChange({ ...exerciseFilter, muscleGroupValue: value })
        }
        label="Muscle Group"
        values={musclesValues}
        className={`${prefs.favoriteColor}`}
        imgs={musclesImgs}
      />
      <CustomSelect
        value={exerciseFilter.equipmentValue}
        onChange={(value) =>
          onExerciseFilterChange({ ...exerciseFilter, equipmentValue: value })
        }
        label="Equipment"
        values={equipmentsValues}
        className={`${prefs.favoriteColor}`}
        imgs={equipmentsImgs}
      />
    </div>
  )
}

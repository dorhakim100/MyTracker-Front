import { useSelector } from 'react-redux'
import { CustomSelect } from '../../CustomMui/CustomSelect/CustomSelect'
import { equipmentsValues } from '../../assets/config/equipments'
import { RootState } from '../../store/store'
import { ExerciseFilter } from '../../types/exerciseFilter/ExerciseFilter'
import { Barbell } from '../Icons/Barbell'
import { Dumbbell } from '../Icons/Dumbbell'
import WidgetsIcon from '@mui/icons-material/Widgets'

interface EquipmentSelectProps {
  exerciseFilter: ExerciseFilter
  onExerciseFilterChange: (exerciseFilter: ExerciseFilter) => void
}

const equipmentsImgs = [
  { value: 'All', icon: <WidgetsIcon /> },
  { value: 'Barbell', icon: <Barbell /> },
  { value: 'Dumbbell', icon: <Dumbbell /> },
  { value: 'Machine', src: '/equipments/machine.webp' },
  { value: 'Bodyweight', src: '/equipments/body-weight.webp' },
  { value: 'Cable', src: '/equipments/cable.webp' },
  { value: 'Bands', src: '/equipments/bands.webp' },
]

export function EquipmentSelect({
  exerciseFilter,
  onExerciseFilterChange,
}: EquipmentSelectProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  return (
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
  )
}

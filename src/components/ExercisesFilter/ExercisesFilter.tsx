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
import { workoutService } from '../../services/workout/workout.service'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff'
import { Typography } from '@mui/material'

interface ExercisesFilterProps {
  exerciseFilter: ExerciseFilter
  onExerciseFilterChange: (exerciseFilter: ExerciseFilter) => void
  searchPlaceholder?: string
  className?: string
  resultsMsg?: string
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
  resultsMsg,
}: ExercisesFilterProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const getIsDisabled = () => {
    return (
      JSON.stringify(exerciseFilter) ===
      JSON.stringify(workoutService.getEmptyExerciseFilter())
    )
  }

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
      <div className="results-msg-container">
        <Typography variant="h6" className="bold-header">
          {resultsMsg}
        </Typography>
        <CustomButton
          icon={<FilterAltOffIcon />}
          isIcon={true}
          onClick={() => {
            onExerciseFilterChange(workoutService.getEmptyExerciseFilter())
          }}
          disabled={getIsDisabled()}
        />
      </div>
    </div>
  )
}
